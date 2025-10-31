import { NextResponse } from "next/server";
import { Buffer } from "buffer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: "You must be signed in to update your photo." },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const profilePicture = formData.get("profilePicture");

        if (!(profilePicture instanceof File)) {
            return NextResponse.json(
                { success: false, error: "Profile picture file is required." },
                { status: 400 }
            );
        }

        if (!profilePicture.type.startsWith("image/")) {
            return NextResponse.json(
                { success: false, error: "Profile picture must be an image file." },
                { status: 400 }
            );
        }

        if (profilePicture.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: "Profile picture must be smaller than 5MB." },
                { status: 400 }
            );
        }

        const adminSupabase = createAdminClient();
        const fileExtension =
            profilePicture.name.split(".").pop() ?? profilePicture.type.split("/").pop() ?? "jpg";
        const fileName = `${user.id}/${user.id}-${Date.now()}.${fileExtension}`;
        const fileBuffer = Buffer.from(await profilePicture.arrayBuffer());

        const { error: uploadError } = await adminSupabase.storage
            .from("profile-photos")
            .upload(fileName, fileBuffer, {
                contentType: profilePicture.type,
                upsert: false,
                cacheControl: "3600",
            });

        if (uploadError) {
            throw new Error(uploadError.message);
        }

        const {
            data: { publicUrl },
        } = adminSupabase.storage.from("profile-photos").getPublicUrl(fileName);

        const { error: profileError } = await adminSupabase
            .from("profiles")
            .upsert(
                {
                    user_id: user.id,
                    profile_picture_url: publicUrl,
                    profile_picture_uploaded_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
            );

        if (profileError) {
            throw new Error(profileError.message);
        }

        return NextResponse.json({ success: true, profilePictureUrl: publicUrl });
    } catch (error) {
        console.error("Error updating profile photo:", error);
        const message = error instanceof Error ? error.message : "Unexpected error updating profile photo.";
        const statusCode = message.includes("required") || message.includes("must") ? 400 : 500;

        return NextResponse.json({ success: false, error: message }, { status: statusCode });
    }
}

