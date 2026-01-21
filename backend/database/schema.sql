-- ===========================================
-- IntrnPath Database Schema
-- Run this in Supabase SQL Editor
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- Table: user_profiles
-- ===========================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  year INTEGER CHECK (year >= 1 AND year <= 4),
  branch TEXT,
  goal TEXT,
  avatar TEXT DEFAULT '👤',
  bio TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  is_pro BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ===========================================
-- Table: user_skills
-- ===========================================
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_id TEXT NOT NULL,
  proficiency TEXT CHECK (proficiency IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  is_completed BOOLEAN DEFAULT FALSE,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- RLS for user_skills
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own skills" ON user_skills
  FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- Table: user_progress
-- ===========================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  skills_completed TEXT[] DEFAULT '{}',
  tasks_count INTEGER DEFAULT 0,
  time_spent_mins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- RLS for user_progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- Table: user_streaks
-- ===========================================
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  freeze_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for user_streaks
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own streaks" ON user_streaks
  FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- Table: user_platform_links
-- ===========================================
CREATE TABLE IF NOT EXISTS user_platform_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT TRUE,
  stats JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- RLS for user_platform_links
ALTER TABLE user_platform_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own links" ON user_platform_links
  FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- Table: user_projects
-- ===========================================
CREATE TABLE IF NOT EXISTS user_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for user_projects
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects" ON user_projects
  FOR ALL USING (auth.uid() = user_id);

-- ===========================================
-- Table: subscriptions
-- ===========================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  razorpay_subscription_id TEXT,
  razorpay_customer_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  amount_paid INTEGER,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ===========================================
-- Table: payment_history
-- ===========================================
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  amount INTEGER,
  status TEXT DEFAULT 'pending',
  receipt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for payment_history
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- ===========================================
-- Indexes for performance
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_date ON user_progress(date);
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);

-- ===========================================
-- Success message
-- ===========================================
SELECT 'IntrnPath database schema created successfully!' AS message;
