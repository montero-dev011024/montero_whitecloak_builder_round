    -- Enable necessary extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- =====================================================
    -- ENUMS
    -- =====================================================

    CREATE TYPE gender_enum AS ENUM ('male', 'female', 'non-binary', 'prefer_not_to_say');
    CREATE TYPE relationship_goal_enum AS ENUM ('something_casual', 'something_serious', 'not_sure', 'just_exploring');

    -- =====================================================
    -- TABLES
    -- =====================================================

    -- Users table that extends the Supabase auth.users
    -- NOTE: Table partitioning deferred until scale phase (100K+ users)
    --       See: DATABASE_OPTIMIZATION_REPORT.md Phase 3 for migration guide
    CREATE TABLE public.users (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        gender gender_enum NOT NULL,
        birthdate DATE NOT NULL,
        bio TEXT,
        profile_picture_url TEXT,
        
        -- Preferences stored as JSONB (flexible for future enhancements)
        preferences JSONB DEFAULT '{
            "age_range": {"min": 18, "max": 50},
            "distance_miles": 25,
            "gender_preferences": [],
            "relationship_goal": "not_sure"
        }'::jsonb,
        
        -- Location stored as simple lat/lng
        location_lat DECIMAL(10, 8),
        location_lng DECIMAL(11, 8),
        
        -- User status tracking
        is_online BOOLEAN DEFAULT FALSE,
        last_active_at TIMESTAMP WITH TIME ZONE,
        verified_at TIMESTAMP WITH TIME ZONE,  -- Email verification timestamp
        
        -- Audit fields
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- Constraints
        CONSTRAINT valid_birthdate CHECK (birthdate <= CURRENT_DATE - INTERVAL '18 years'),
        CONSTRAINT non_empty_full_name CHECK (full_name ~ '\S')
    );

    -- Profiles table for additional user information (normalized design)
    CREATE TABLE public.profiles (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
        profile_picture_url TEXT,  -- Single profile picture for MVP
        profile_picture_uploaded_at TIMESTAMP WITH TIME ZONE,  -- When profile picture was uploaded
        height_cm INTEGER CHECK (height_cm > 0 AND height_cm < 300),
        education TEXT,
        occupation TEXT,
        relationship_goal relationship_goal_enum DEFAULT 'not_sure',
        smoking BOOLEAN,
        drinking BOOLEAN,
        children TEXT,  -- e.g., "none", "want_someday", "have_kids"
        visibility BOOLEAN DEFAULT TRUE,  -- Soft delete alternative
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Interests table (normalized for flexible tagging)
    CREATE TABLE public.interests (
        id SMALLSERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- User interests junction table (many-to-many)
    CREATE TABLE public.user_interests (
        user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        interest_id SMALLINT REFERENCES public.interests(id) ON DELETE CASCADE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (user_id, interest_id)
    );

    -- Likes table with additional metadata
    CREATE TABLE public.likes (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,  -- Allows "unlike" functionality
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        unliked_at TIMESTAMP WITH TIME ZONE,  -- When user unliked (if applicable)
        UNIQUE(from_user_id, to_user_id),
        CONSTRAINT no_self_like CHECK (from_user_id != to_user_id)
    );

    -- Matches table (mutual likes)
    CREATE TABLE public.matches (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user1_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        user2_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ended_at TIMESTAMP WITH TIME ZONE,  -- When match was ended/blocked
        UNIQUE(user1_id, user2_id)
    );

    -- Blocks table (prevent unwanted interactions)
    CREATE TABLE public.blocks (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        blocker_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        blocked_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
        reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(blocker_id, blocked_id),
        CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
    );


    -- =====================================================
    -- INDEXES
    -- =====================================================

    -- Users table indexes
    CREATE INDEX idx_users_email ON public.users(email);
    CREATE INDEX idx_users_gender ON public.users(gender);
    CREATE INDEX idx_users_birthdate ON public.users(birthdate);
    CREATE INDEX idx_users_is_online ON public.users(is_online) WHERE is_online = TRUE;  -- Partial index
    CREATE INDEX idx_users_last_active_at ON public.users(last_active_at DESC);  -- DESC for recent activity
    CREATE INDEX idx_users_verified_at ON public.users(verified_at) WHERE verified_at IS NOT NULL;  -- Only verified users
    CREATE INDEX idx_users_location ON public.users(location_lat, location_lng);

    -- Profiles table indexes
    CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
    CREATE INDEX idx_profiles_visibility ON public.profiles(visibility) WHERE visibility = TRUE;

    -- User interests indexes
    CREATE INDEX idx_user_interests_user_id ON public.user_interests(user_id);
    CREATE INDEX idx_user_interests_interest_id ON public.user_interests(interest_id);

    -- Likes table indexes
    CREATE INDEX idx_likes_from_user ON public.likes(from_user_id);
    CREATE INDEX idx_likes_to_user ON public.likes(to_user_id);
    CREATE INDEX idx_likes_active ON public.likes(is_active) WHERE is_active = TRUE;  -- Partial index
    CREATE INDEX idx_likes_created_at ON public.likes(created_at DESC);

    -- Matches table indexes
    CREATE INDEX idx_matches_user1 ON public.matches(user1_id);
    CREATE INDEX idx_matches_user2 ON public.matches(user2_id);
    CREATE INDEX idx_matches_active ON public.matches(is_active) WHERE is_active = TRUE;  -- Partial index
    CREATE INDEX idx_matches_created_at ON public.matches(created_at DESC);

    -- Blocks table indexes
    CREATE INDEX idx_blocks_blocker_id ON public.blocks(blocker_id);
    CREATE INDEX idx_blocks_blocked_id ON public.blocks(blocked_id);
    CREATE INDEX idx_blocks_created_at ON public.blocks(created_at DESC);

    -- =====================================================
    -- TRIGGERS & FUNCTIONS (Business Logic)
    -- =====================================================

    -- ===== UTILITY FUNCTIONS =====

    -- Function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql IMMUTABLE;

    -- Trigger for users table
    CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON public.users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- Trigger for profiles table
    CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- ===== MATCH CREATION LOGIC =====

    -- Function to create match when both users like each other (mutual match)
    CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Only process if the like is active
        IF NEW.is_active = TRUE THEN
            -- Check if the other user has also liked this user
            IF EXISTS (
                SELECT 1 FROM public.likes 
                WHERE from_user_id = NEW.to_user_id 
                AND to_user_id = NEW.from_user_id
                AND is_active = TRUE
            ) THEN
                -- Create a match with normalized user IDs (lower ID first)
                INSERT INTO public.matches (user1_id, user2_id)
                VALUES (
                    LEAST(NEW.from_user_id, NEW.to_user_id),
                    GREATEST(NEW.from_user_id, NEW.to_user_id)
                )
                ON CONFLICT (user1_id, user2_id) DO UPDATE 
                SET is_active = TRUE, ended_at = NULL;  -- Reactivate if previously ended
            END IF;
        END IF;
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Trigger for creating/updating matches on like
    CREATE TRIGGER create_match_trigger
        AFTER INSERT OR UPDATE ON public.likes
        FOR EACH ROW
        EXECUTE FUNCTION create_match_on_mutual_like();

    -- ===== USER ACTIVITY TRACKING =====

    -- Function to update user's last_active_at timestamp
    CREATE OR REPLACE FUNCTION update_last_active()
    RETURNS TRIGGER AS $$
    BEGIN
        UPDATE public.users 
        SET last_active_at = NOW() 
        WHERE id = NEW.from_user_id;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Trigger for updating last_active when user interacts (likes)
    CREATE TRIGGER update_last_active_on_like_trigger
        AFTER INSERT ON public.likes
        FOR EACH ROW
        EXECUTE FUNCTION update_last_active();

    -- ===== NEW USER SETUP =====

    -- Function to create user profile when user signs up
    CREATE OR REPLACE FUNCTION handle_new_user()
    RETURNS TRIGGER AS $$
    DECLARE
        v_full_name TEXT;
        v_email TEXT;
    BEGIN
        v_email := NEW.email;
        v_full_name := COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            split_part(v_email, '@', 1),
            'User'
        );
        
        -- Insert into users table
        INSERT INTO public.users (
            id,
            full_name,
            email,
            gender,
            birthdate,
            bio,
            profile_picture_url,
            preferences
        ) VALUES (
            NEW.id,
            v_full_name,
            v_email,
            'prefer_not_to_say',  -- Use enum value
            CURRENT_DATE - INTERVAL '25 years',  -- Default: 25 years old
            '',
            NULL,
            '{
                "age_range": {"min": 18, "max": 50},
                "distance_miles": 25,
                "gender_preferences": [],
                "relationship_goal": "not_sure"
            }'::jsonb
        );
        
        -- Create associated profile
        INSERT INTO public.profiles (
            user_id,
            relationship_goal,
            visibility
        ) VALUES (
            NEW.id,
            'not_sure',
            TRUE
        );
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Trigger to create user profile on signup
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION handle_new_user();

    -- ===== CLEANUP ON UNLIKE =====

    -- Function to remove match if user unlikes
    CREATE OR REPLACE FUNCTION handle_unlike()
    RETURNS TRIGGER AS $$
    BEGIN
        IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
            -- Soft delete the match (mark as inactive) if it exists
            UPDATE public.matches
            SET is_active = FALSE, ended_at = NOW()
            WHERE (user1_id = OLD.from_user_id AND user2_id = OLD.to_user_id)
            OR (user1_id = OLD.to_user_id AND user2_id = OLD.from_user_id);
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Trigger for handling unlikes
    CREATE TRIGGER handle_unlike_trigger
        BEFORE UPDATE ON public.likes
        FOR EACH ROW
        WHEN (OLD.is_active IS DISTINCT FROM NEW.is_active)
        EXECUTE FUNCTION handle_unlike();


    -- =====================================================
    -- ROW LEVEL SECURITY (RLS) POLICIES
    -- =====================================================

    -- Enable RLS on all tables
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

    -- ===== USERS TABLE POLICIES =====

    CREATE POLICY "Users can view their own profile"
        ON public.users FOR SELECT
        USING (auth.uid() = id);

    CREATE POLICY "Users can view public profiles (not blocked)"
        ON public.users FOR SELECT
        USING (
            auth.uid() IS NOT NULL 
            AND id != auth.uid()
            AND NOT EXISTS (
                SELECT 1 FROM public.blocks 
                WHERE (blocker_id = auth.uid() AND blocked_id = id)
                OR (blocker_id = id AND blocked_id = auth.uid())
            )
        );

    CREATE POLICY "Users can update their own profile"
        ON public.users FOR UPDATE
        USING (auth.uid() = id);

    -- ===== PROFILES TABLE POLICIES =====

    CREATE POLICY "Users can view their own profile details"
        ON public.profiles FOR SELECT
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can view public profile details"
        ON public.profiles FOR SELECT
        USING (
            visibility = TRUE 
            AND EXISTS (
                SELECT 1 FROM public.users u 
                WHERE u.id = user_id 
                AND NOT EXISTS (
                    SELECT 1 FROM public.blocks 
                    WHERE (blocker_id = auth.uid() AND blocked_id = u.id)
                    OR (blocker_id = u.id AND blocked_id = auth.uid())
                )
            )
        );

    CREATE POLICY "Users can update their own profile details"
        ON public.profiles FOR UPDATE
        USING (auth.uid() = user_id);

    -- ===== INTERESTS TABLE POLICIES =====

    CREATE POLICY "Anyone can view interests"
        ON public.interests FOR SELECT
        USING (TRUE);

    -- ===== USER INTERESTS TABLE POLICIES =====

    CREATE POLICY "Users can view their own interests"
        ON public.user_interests FOR SELECT
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can view others' interests"
        ON public.user_interests FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.users u 
                WHERE u.id = user_id 
                AND NOT EXISTS (
                    SELECT 1 FROM public.blocks 
                    WHERE (blocker_id = auth.uid() AND blocked_id = u.id)
                    OR (blocker_id = u.id AND blocked_id = auth.uid())
                )
            )
        );

    CREATE POLICY "Users can insert their own interests"
        ON public.user_interests FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own interests"
        ON public.user_interests FOR DELETE
        USING (auth.uid() = user_id);

    -- ===== LIKES TABLE POLICIES =====

    CREATE POLICY "Users can view their own likes"
        ON public.likes FOR SELECT
        USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

    CREATE POLICY "Users can create their own likes"
        ON public.likes FOR INSERT
        WITH CHECK (auth.uid() = from_user_id);

    CREATE POLICY "Users can update their own likes"
        ON public.likes FOR UPDATE
        USING (auth.uid() = from_user_id);

    CREATE POLICY "Users can delete their own likes"
        ON public.likes FOR DELETE
        USING (auth.uid() = from_user_id);

    -- ===== MATCHES TABLE POLICIES =====

    CREATE POLICY "Users can view their own matches"
        ON public.matches FOR SELECT
        USING (auth.uid() = user1_id OR auth.uid() = user2_id);

    CREATE POLICY "Matches are auto-created (no insert by users)"
        ON public.matches FOR INSERT
        WITH CHECK (FALSE);

    CREATE POLICY "Matches are auto-created (no update by users)"
        ON public.matches FOR UPDATE
        USING (FALSE);

    CREATE POLICY "Matches are auto-created (no delete by users)"
        ON public.matches FOR DELETE
        USING (FALSE);

    -- ===== BLOCKS TABLE POLICIES =====

    CREATE POLICY "Users can view their own blocks"
        ON public.blocks FOR SELECT
        USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

    CREATE POLICY "Users can create their own blocks"
        ON public.blocks FOR INSERT
        WITH CHECK (auth.uid() = blocker_id);

    CREATE POLICY "Users can delete their own blocks"
        ON public.blocks FOR DELETE
        USING (auth.uid() = blocker_id);

    -- =====================================================
    -- HELPER VIEWS (For simplified queries)
    -- =====================================================

    -- View for getting user profiles with match status
    CREATE VIEW public.user_discovery_view AS
    SELECT 
        u.id,
        u.full_name,
        u.gender,
        EXTRACT(YEAR FROM AGE(u.birthdate))::INT as age,
        u.bio,
        u.location_lat,
        u.location_lng,
        p.profile_picture_url,
        p.height_cm,
        p.education,
        p.occupation,
        p.relationship_goal,
        COUNT(DISTINCT ui.interest_id) as interest_count,
        u.created_at
    FROM public.users u
    LEFT JOIN public.profiles p ON u.id = p.user_id
    LEFT JOIN public.user_interests ui ON u.id = ui.user_id
    WHERE p.visibility = TRUE
    GROUP BY u.id, u.full_name, u.gender, u.birthdate, u.bio, u.location_lat, u.location_lng,
            p.profile_picture_url, p.height_cm, p.education, p.occupation, p.relationship_goal, u.created_at;

    -- NOTE: active_conversations_view removed - using Stream.io for messaging
    -- Stream provides real-time conversation management and handles unread counts
