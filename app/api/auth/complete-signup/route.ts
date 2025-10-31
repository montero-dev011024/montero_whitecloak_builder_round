import { NextResponse } from "next/server";
import { Buffer } from "buffer";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function parseStringValue(value: FormDataEntryValue | null, fieldName: string) {
    if (typeof value !== "string") {
        throw new Error(`${fieldName} is required.`);
    }

    const trimmed = value.trim();

    if (!trimmed) {
        throw new Error(`${fieldName} cannot be empty.`);
    }

    return trimmed;
}

function validateBirthdate(value: string) {
    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Invalid birthdate provided.");
    }

    const today = new Date();
    const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
    );

    if (parsedDate > eighteenYearsAgo) {
        throw new Error("User must be at least 18 years old.");
    }

    return parsedDate.toISOString().split("T")[0];
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const userId = parseStringValue(formData.get("userId"), "User ID");
        const fullName = parseStringValue(formData.get("fullName"), "Full name");
        const birthdate = validateBirthdate(parseStringValue(formData.get("birthdate"), "Birthdate"));
        const bio = parseStringValue(formData.get("bio"), "Bio");
        if (fullName.length > 150) {
            throw new Error("Full name must be 150 characters or less.");
        }

        if (bio.length > 500) {
            throw new Error("Bio must be 500 characters or less.");
        }
        const profilePicture = formData.get("profilePicture");

        const adminSupabase = createAdminClient();

        const { error: userUpdateError } = await adminSupabase
            .from("users")
            .update({
                full_name: fullName,
                birthdate,
                bio,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

        if (userUpdateError) {
            throw new Error(userUpdateError.message);
        }

        let profilePictureUrl: string | null = null;

        if (profilePicture instanceof File) {
            if (!profilePicture.type.startsWith("image/")) {
                throw new Error("Profile picture must be an image file.");
            }

            if (profilePicture.size > MAX_FILE_SIZE) {
                throw new Error("Profile picture must be smaller than 5MB.");
            }

            const fileExtension = profilePicture.name.split(".").pop() ?? profilePicture.type.split("/").pop() ?? "jpg";
            const fileName = `${userId}/${userId}-${Date.now()}.${fileExtension}`;
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

            profilePictureUrl = publicUrl;

            const { error: profileError } = await adminSupabase
                .from("profiles")
                .upsert(
                    {
                        user_id: userId,
                        profile_picture_url: profilePictureUrl,
                        profile_picture_uploaded_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "user_id" }
                );

            if (profileError) {
                throw new Error(profileError.message);
            }
        }

        return NextResponse.json({ success: true, profilePictureUrl });
    } catch (error) {
        console.error("Error completing signup:", error);
        const message = error instanceof Error ? error.message : "Unexpected error completing signup.";
        const statusCode = message.includes("required") || message.includes("Invalid") || message.includes("must")
            ? 400
            : 500;

        return NextResponse.json({ success: false, error: message }, { status: statusCode });
    }
}

