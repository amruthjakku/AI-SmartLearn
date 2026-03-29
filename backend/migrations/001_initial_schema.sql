-- SQL Schema for AI-SmartLearn Supabase Database

-- 1. Create profiles table (Extend default auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    goal TEXT,
    target_date TEXT,
    daily_available_time INTEGER, -- in minutes
    skill_level TEXT, -- beginner, intermediate, advanced
    strengths TEXT[],
    weaknesses TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Create study_plans table
CREATE TABLE IF NOT EXISTS public.study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    generated_plan JSONB NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on study_plans
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own study plans" ON public.study_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study plans" ON public.study_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study plans" ON public.study_plans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study plans" ON public.study_plans
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    study_plan_id UUID REFERENCES public.study_plans ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_time TIMESTAMPTZ,
    duration_minutes INTEGER DEFAULT 30,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks" ON public.tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON public.tasks
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Create trigger for automatic profile creation
-- This ensures a profile is created whenever a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name)
    VALUES (new.id, new.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
