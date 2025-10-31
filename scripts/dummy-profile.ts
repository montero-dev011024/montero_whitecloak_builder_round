import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import "dotenv/config";

// Configuration
const SUPABASE_URL ="https://zaapfmqalxktcshrxott.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphYXBmbXFhbHhrdGNzaHJ4b3R0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ0OTg4OSwiZXhwIjoyMDc3MDI1ODg5fQ.5lEWsc8_4g_6gYWl-WBshpZ5IUeXw96x7x3CGjQyIuA";
const PASSWORD = "password";

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Fake profile data - Top 15 NBA Players of All Time
const fakeProfiles = [
  {
    full_name: "Michael Jordan",
    email: "michael.jordan@example.com",
    gender: "male" as const,
    birthdate: "1990-02-17",
    bio: "Competitive spirit, love winning and basketball. Always striving for greatness in everything I do.",
    profile_picture_url: "https://i.pravatar.cc/300?img=12",
    preferences: {
      age_range: { min: 28, max: 38 },
      distance_miles: 100,
      gender_preferences: ["female"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 198,
      education: "Bachelor's Degree",
      occupation: "Business Executive",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: true,
      children: "have_children",
    },
  },
  {
    full_name: "LeBron James",
    email: "lebron.james@example.com",
    gender: "male" as const,
    birthdate: "1992-12-30",
    bio: "Family first, basketball second. Looking for someone who shares my values and passion for life.",
    profile_picture_url: "https://i.pravatar.cc/300?img=15",
    preferences: {
      age_range: { min: 27, max: 37 },
      distance_miles: 75,
      gender_preferences: ["female"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 206,
      education: "High School",
      occupation: "Entrepreneur",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: false,
      children: "have_children",
    },
  },
  {
    full_name: "Kareem Abdul-Jabbar",
    email: "kareem.abdulJabbar@example.com",
    gender: "male" as const,
    birthdate: "1985-04-16",
    bio: "Writer, historian, and life-long learner. Seeking intellectual conversations and meaningful connections.",
    profile_picture_url: "https://i.pravatar.cc/300?img=33",
    preferences: {
      age_range: { min: 32, max: 45 },
      distance_miles: 50,
      gender_preferences: ["female"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 218,
      education: "Master's Degree",
      occupation: "Author & Speaker",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: false,
      children: "have_children",
    },
  },
  {
    full_name: "Magic Johnson",
    email: "magic.johnson@example.com",
    gender: "male" as const,
    birthdate: "1988-08-14",
    bio: "Entrepreneur with a smile. Love bringing joy to people's lives and making every moment count.",
    profile_picture_url: "https://i.pravatar.cc/300?img=51",
    preferences: {
      age_range: { min: 30, max: 42 },
      distance_miles: 100,
      gender_preferences: ["female"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 206,
      education: "Bachelor's Degree",
      occupation: "Business Owner",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: true,
      children: "have_children",
    },
  },
  {
    full_name: "Larry Bird",
    email: "larry.bird@example.com",
    gender: "male" as const,
    birthdate: "1987-12-07",
    bio: "Down-to-earth and hardworking. Value loyalty, honesty, and a good work ethic.",
    profile_picture_url: "https://i.pravatar.cc/300?img=13",
    preferences: {
      age_range: { min: 31, max: 43 },
      distance_miles: 50,
      gender_preferences: ["female"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 206,
      education: "Bachelor's Degree",
      occupation: "Sports Executive",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: true,
      children: "have_children",
    },
  },
  {
    full_name: "Bill Russell",
    email: "bill.russell@example.com",
    gender: "male" as const,
    birthdate: "1982-02-12",
    bio: "Leader, mentor, and champion. Believe in teamwork and lifting others up.",
    profile_picture_url: "https://i.pravatar.cc/300?img=60",
    preferences: {
      age_range: { min: 35, max: 48 },
      distance_miles: 75,
      gender_preferences: ["female"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 208,
      education: "Bachelor's Degree",
      occupation: "Motivational Speaker",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: false,
      children: "have_children",
    },
  },
  {
    full_name: "Wilt Chamberlain",
    email: "wilt.chamberlain@example.com",
    gender: "male" as const,
    birthdate: "1984-08-21",
    bio: "Living life to the fullest. Athletic, adventurous, and always up for a good time.",
    profile_picture_url: "https://i.pravatar.cc/300?img=17",
    preferences: {
      age_range: { min: 25, max: 40 },
      distance_miles: 100,
      gender_preferences: ["female"],
      relationship_goal: "just_exploring" as const,
    },
    profile_details: {
      height_cm: 216,
      education: "Bachelor's Degree",
      occupation: "Real Estate Investor",
      relationship_goal: "just_exploring" as const,
      smoking: false,
      drinking: true,
      children: "none",
    },
  },
  {
    full_name: "Tim Duncan",
    email: "tim.duncan@example.com",
    gender: "male" as const,
    birthdate: "1989-04-25",
    bio: "Quiet, reserved, but passionate about what I do. Love gaming, cars, and deep conversations.",
    profile_picture_url: "https://i.pravatar.cc/300?img=52",
    preferences: {
      age_range: { min: 29, max: 39 },
      distance_miles: 50,
      gender_preferences: ["female"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 211,
      education: "Bachelor's Degree",
      occupation: "Financial Advisor",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: false,
      children: "have_children",
    },
  },
  {
    full_name: "Kobe Bryant",
    email: "kobe.bryant@example.com",
    gender: "male" as const,
    birthdate: "1991-08-23",
    bio: "Mamba mentality in everything. Dedicated, focused, and always striving to be better than yesterday.",
    profile_picture_url: "https://i.pravatar.cc/300?img=14",
    preferences: {
      age_range: { min: 27, max: 37 },
      distance_miles: 75,
      gender_preferences: ["female"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 198,
      education: "High School",
      occupation: "Creative Director",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: false,
      children: "have_children",
    },
  },
  {
    full_name: "Shaquille O'Neal",
    email: "shaquille.oneal@example.com",
    gender: "male" as const,
    birthdate: "1990-03-06",
    bio: "Big personality, bigger heart. Love making people laugh and having a good time. DJ, actor, and more.",
    profile_picture_url: "https://i.pravatar.cc/300?img=59",
    preferences: {
      age_range: { min: 28, max: 40 },
      distance_miles: 100,
      gender_preferences: ["female"],
      relationship_goal: "not_sure" as const,
    },
    profile_details: {
      height_cm: 216,
      education: "Doctorate Degree",
      occupation: "Media Personality",
      relationship_goal: "not_sure" as const,
      smoking: false,
      drinking: true,
      children: "have_children",
    },
  },
  {
    full_name: "Hakeem Olajuwon",
    email: "hakeem.olajuwon@example.com",
    gender: "male" as const,
    birthdate: "1986-01-21",
    bio: "Spiritual, disciplined, and grounded. Value family, faith, and personal growth.",
    profile_picture_url: "https://i.pravatar.cc/300?img=68",
    preferences: {
      age_range: { min: 32, max: 44 },
      distance_miles: 50,
      gender_preferences: ["female"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 213,
      education: "Bachelor's Degree",
      occupation: "Business Consultant",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: false,
      children: "have_children",
    },
  },
  {
    full_name: "Oscar Robertson",
    email: "oscar.robertson@example.com",
    gender: "male" as const,
    birthdate: "1983-11-24",
    bio: "Advocate for change and equality. Looking for someone who cares about making a difference.",
    profile_picture_url: "https://i.pravatar.cc/300?img=56",
    preferences: {
      age_range: { min: 35, max: 47 },
      distance_miles: 75,
      gender_preferences: ["female"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 196,
      education: "Bachelor's Degree",
      occupation: "Civil Rights Advocate",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: false,
      children: "have_children",
    },
  },
  {
    full_name: "Jerry West",
    email: "jerry.west@example.com",
    gender: "male" as const,
    birthdate: "1983-05-28",
    bio: "Perfectionist with an eye for talent. Love strategy, planning, and building something great.",
    profile_picture_url: "https://i.pravatar.cc/300?img=58",
    preferences: {
      age_range: { min: 35, max: 48 },
      distance_miles: 50,
      gender_preferences: ["female"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 188,
      education: "Bachelor's Degree",
      occupation: "Sports Consultant",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: true,
      children: "have_children",
    },
  },
  {
    full_name: "Stephen Curry",
    email: "stephen.curry@example.com",
    gender: "male" as const,
    birthdate: "1993-03-14",
    bio: "Faith, family, and fun. Love golf, cooking, and spending quality time with loved ones.",
    profile_picture_url: "https://i.pravatar.cc/300?img=11",
    preferences: {
      age_range: { min: 26, max: 36 },
      distance_miles: 75,
      gender_preferences: ["female"],
      relationship_goal: "something_serious" as const,
    },
    profile_details: {
      height_cm: 191,
      education: "Bachelor's Degree",
      occupation: "Tech Investor",
      relationship_goal: "something_serious" as const,
      smoking: false,
      drinking: false,
      children: "have_children",
    },
  },
  {
    full_name: "Kevin Durant",
    email: "kevin.durant@example.com",
    gender: "male" as const,
    birthdate: "1993-09-29",
    bio: "Quiet warrior. Love basketball, tech, and real conversations. No drama, just vibes.",
    profile_picture_url: "https://i.pravatar.cc/300?img=57",
    preferences: {
      age_range: { min: 26, max: 36 },
      distance_miles: 100,
      gender_preferences: ["female"],
      relationship_goal: "not_sure" as const,
    },
    profile_details: {
      height_cm: 211,
      education: "Some College",
      occupation: "Investor",
      relationship_goal: "not_sure" as const,
      smoking: false,
      drinking: true,
      children: "none",
    },
  },
];

async function createFakeProfiles() {
  console.log("🚀 Starting to create fake profiles...");

  for (let i = 0; i < fakeProfiles.length; i++) {
    const profile = fakeProfiles[i];

    try {
      console.log(`\n📝 Creating profile ${i + 1}/15: ${profile.full_name}`);

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