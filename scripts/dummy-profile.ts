import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import "dotenv/config";

// Configuration
const SUPABASE_URL ="";
const SUPABASE_SERVICE_ROLE_KEY = "";
const PASSWORD = "password";

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Fake profile data
const fakeProfiles = [
  {
    full_name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    gender: "female" as const,
    birthdate: "1995-03-15",
    bio: "Love hiking, coffee, and good conversations. Looking for someone to explore the world with.",
    profile_picture_url: "",
    preferences: {
      age_range: { min: 25, max: 35 },
      distance_miles: 50,
      gender_preferences: ["male"],
      relationship_goal: "not_sure" as const,
    },
    profile_details: {
      height_cm: 168,
      education: "Bachelor's Degree",
      occupation: "Marketing Specialist",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: true,
      children: "none",
    },
  },
  {
    full_name: "Alex Chen",
    email: "alex.chen@example.com",
    gender: "female" as const,
    birthdate: "1992-07-22",
    bio: "Passionate about photography and travel. Always up for an adventure.",
    profile_picture_url:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    preferences: {
      age_range: { min: 28, max: 38 },
      distance_miles: 30,
      gender_preferences: ["male"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 165,
      education: "Master's Degree",
      occupation: "Photographer",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: true,
      children: "none",
    },
  },
  {
    full_name: "Emma Wilson",
    email: "emma.wilson@example.com",
    gender: "female" as const,
    birthdate: "1990-11-08",
    bio: "Book lover and yoga enthusiast. Seeking someone who values personal growth and meaningful conversations.",
    profile_picture_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    preferences: {
      age_range: { min: 30, max: 40 },
      distance_miles: 25,
      gender_preferences: ["male"],
      relationship_goal: "not_sure" as const,
    },
    profile_details: {
      height_cm: 170,
      education: "Bachelor's Degree",
      occupation: "Yoga Instructor",
      relationship_goal: "not_sure" as const,
      smoking: false,
      drinking: true,
      children: "none",
    },
  },
  {
    full_name: "Michael Rodriguez",
    email: "michael.rodriguez@example.com",
    gender: "male" as const,
    birthdate: "1988-05-12",
    bio: "Tech enthusiast and fitness lover. Looking for someone to share adventures and good food.",
    profile_picture_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    preferences: {
      age_range: { min: 25, max: 35 },
      distance_miles: 40,
      gender_preferences: ["female"],
      relationship_goal: "something_casual" as const,
    },
    profile_details: {
      height_cm: 180,
      education: "Bachelor's Degree",
      occupation: "Software Engineer",
      relationship_goal: "something_casual" as const,
      smoking: false,
      drinking: true,
      children: "want_someday",
    },
  },
  {
    full_name: "Jessica Kim",
    email: "jessica.kim@example.com",
    gender: "female" as const,
    birthdate: "1993-09-18",
    bio: "Artist and coffee addict. Love exploring new places and meeting interesting people.",
    profile_picture_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    preferences: {
      age_range: { min: 26, max: 36 },
      distance_miles: 35,
      gender_preferences: ["male"],
      relationship_goal: "just_exploring" as const,
    },
    profile_details: {
      height_cm: 162,
      education: "Bachelor's Degree",
      occupation: "Graphic Designer",
      relationship_goal: "just_exploring" as const,
      smoking: false,
      drinking: true,
      children: "none",
    },
  },
  {
    full_name: "David Thompson",
    email: "david.thompson@example.com",
    gender: "male" as const,
    birthdate: "1989-12-03",
    bio: "Musician and outdoor enthusiast. Guitar, hiking, and good vibes only.",
    profile_picture_url:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    preferences: {
      age_range: { min: 24, max: 34 },
      distance_miles: 45,
      gender_preferences: ["female"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 178,
      education: "Bachelor's Degree",
      occupation: "Music Producer",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: true,
      children: "want_someday",
    },
  },
  {
    full_name: "Sophie Martin",
    email: "sophie.martin@example.com",
    gender: "female" as const,
    birthdate: "1994-02-28",
    bio: "Foodie and travel blogger. Always on the hunt for the best restaurants and hidden gems.",
    profile_picture_url:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face",
    preferences: {
      age_range: { min: 27, max: 37 },
      distance_miles: 30,
      gender_preferences: ["male"],
      relationship_goal: "just_exploring" as const,
    },
    profile_details: {
      height_cm: 167,
      education: "Bachelor's Degree",
      occupation: "Travel Blogger",
      relationship_goal: "just_exploring" as const,
      smoking: false,
      drinking: true,
      children: "none",
    },
  },
  {
    full_name: "Ryan Park",
    email: "ryan.park@example.com",
    gender: "male" as const,
    birthdate: "1991-06-14",
    bio: "Entrepreneur and fitness coach. Passionate about helping others achieve their goals.",
    profile_picture_url:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    preferences: {
      age_range: { min: 25, max: 35 },
      distance_miles: 50,
      gender_preferences: ["female"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 182,
      education: "Bachelor's Degree",
      occupation: "Fitness Coach",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: true,
      children: "none",
    },
  },
  {
    full_name: "Isabella Garcia",
    email: "isabella.garcia@example.com",
    gender: "female" as const,
    birthdate: "1996-08-07",
    bio: "Dance instructor and fitness enthusiast. Love spreading positivity and good energy.",
    profile_picture_url:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face",
    preferences: {
      age_range: { min: 23, max: 33 },
      distance_miles: 25,
      gender_preferences: ["male"],
      relationship_goal: "not_sure" as const,
    },
    profile_details: {
      height_cm: 164,
      education: "Associate Degree",
      occupation: "Dance Instructor",
      relationship_goal: "not_sure" as const,
      smoking: false,
      drinking: true,
      children: "none",
    },
  },
  {
    full_name: "James Anderson",
    email: "james.anderson@example.com",
    gender: "male" as const,
    birthdate: "1987-04-25",
    bio: "Software engineer and board game enthusiast. Looking for someone to share nerdy adventures with.",
    profile_picture_url:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
    preferences: {
      age_range: { min: 26, max: 36 },
      distance_miles: 40,
      gender_preferences: ["female"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 175,
      education: "Bachelor's Degree",
      occupation: "Software Engineer",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: true,
      children: "have_kids",
    },
  },
];

async function createFakeProfiles() {
  console.log("🚀 Starting to create fake profiles...");

  for (let i = 0; i < fakeProfiles.length; i++) {
    const profile = fakeProfiles[i];

    try {
      console.log(`\n📝 Creating profile ${i + 1}/10: ${profile.full_name}`);

      // 1. Check if auth user already exists
      const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
      const existingAuthUser = existingAuthUsers.users.find(
        (u) => u.email === profile.email
      );

      let userId: string;

      if (existingAuthUser) {
        console.log(
          `⚠️ Auth user already exists for ${profile.full_name}, using existing...`
        );
        userId = existingAuthUser.id;
      } else {
        // Create new auth user
        const { data: authData, error: authError } =
          await supabase.auth.admin.createUser({
            email: profile.email,
            password: PASSWORD,
            email_confirm: true,
            user_metadata: {
              full_name: profile.full_name,
            },
          });

        if (authError) {
          console.error(
            `❌ Error creating auth user for ${profile.full_name}:`,
            authError
          );
          continue;
        }

        userId = authData.user.id;
        console.log(`✅ Auth user created: ${userId}`);
      }

      // 2. Check if user profile already exists
      const { data: existingProfile } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (existingProfile) {
        console.log(
          `⚠️ Profile already exists for ${profile.full_name}, updating...`
        );

        // Update existing profile with new data
        const userUpdatePayload = {
          full_name: profile.full_name,
          email: profile.email,
          gender: profile.gender,
          birthdate: profile.birthdate,
          bio: profile.bio,
          preferences: profile.preferences,
          location_lat: faker.location.latitude({ min: 37.7, max: 37.8 }),
          location_lng: faker.location.longitude({
            min: -122.5,
            max: -122.4,
          }),
          is_online: Math.random() > 0.5,
          last_active_at: faker.date.recent({ days: 7 }).toISOString(),
          verified_at: faker.date.recent({ days: 30 }).toISOString(),
        };

        const { error: updateError } = await supabase
          .from("users")
          .update(userUpdatePayload)
          .eq("id", userId);

        if (updateError) {
          console.error(
            `❌ Error updating profile for ${profile.full_name}:`,
            updateError
          );
          continue;
        }
      } else {
        // Insert new user profile data
        const userInsertPayload = {
          id: userId,
          full_name: profile.full_name,
          email: profile.email,
          gender: profile.gender,
          birthdate: profile.birthdate,
          bio: profile.bio,
          preferences: profile.preferences,
          location_lat: faker.location.latitude({ min: 37.7, max: 37.8 }),
          location_lng: faker.location.longitude({ min: -122.5, max: -122.4 }),
          is_online: Math.random() > 0.5,
          last_active_at: faker.date.recent({ days: 7 }).toISOString(),
          verified_at: faker.date.recent({ days: 30 }).toISOString(),
        };

        const { error: profileError } = await supabase
          .from("users")
          .insert(userInsertPayload);

        if (profileError) {
          console.error(
            `❌ Error creating profile for ${profile.full_name}:`,
            profileError
          );
          // Try to clean up the auth user if profile creation fails
          await supabase.auth.admin.deleteUser(userId);
          continue;
        }
      }

      const profileDetailsPayload = {
        user_id: userId,
        profile_picture_url: profile.profile_picture_url || null,
        profile_picture_uploaded_at: new Date().toISOString(),
        height_cm: profile.profile_details.height_cm,
        education: profile.profile_details.education,
        occupation: profile.profile_details.occupation,
        relationship_goal: profile.profile_details.relationship_goal,
        smoking: profile.profile_details.smoking,
        drinking: profile.profile_details.drinking,
        children: profile.profile_details.children,
        visibility: true,
      };

      const { error: profileUpsertError } = await supabase
        .from("profiles")
        .upsert(profileDetailsPayload, { onConflict: "user_id" });

      if (profileUpsertError) {
        console.error(
          `❌ Error upserting profile details for ${profile.full_name}:`,
          profileUpsertError
        );
        continue;
      }

      console.log(`✅ Profile created successfully for ${profile.full_name}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Password: ${PASSWORD}`);
    } catch (error) {
      console.error(
        `❌ Unexpected error creating profile for ${profile.full_name}:`,
        error
      );
    }
  }

  console.log("\n🎉 Fake profile creation completed!");
  console.log("\n📋 Summary:");
  console.log(`All accounts use password: "${PASSWORD}"`);
  console.log("All emails are auto-confirmed");
  console.log("Profiles include random location data in San Francisco area");
  console.log("Some users are marked as online for testing");
}

// Run the script
createFakeProfiles().catch(console.error);