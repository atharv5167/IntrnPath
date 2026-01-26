-- Migration: Add user_roadmaps table for storing custom roadmap modifications
-- Run this in your Supabase SQL Editor (https://app.supabase.com)

-- Create user_roadmaps table
CREATE TABLE IF NOT EXISTS user_roadmaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    modified_template JSONB,                    -- User's customized roadmap structure
    schedule JSONB,                             -- Calculated schedule with weeks
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_roadmaps_user_id_unique UNIQUE (user_id)
);

-- Enable Row Level Security
ALTER TABLE user_roadmaps ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own roadmaps
CREATE POLICY "Users can view own roadmap"
    ON user_roadmaps FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmap"
    ON user_roadmaps FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmap"
    ON user_roadmaps FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own roadmap"
    ON user_roadmaps FOR DELETE
    USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roadmaps_user_id ON user_roadmaps(user_id);

-- Grant access to authenticated users
GRANT ALL ON user_roadmaps TO authenticated;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_roadmaps_updated_at
    BEFORE UPDATE ON user_roadmaps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created
SELECT 'user_roadmaps table created successfully!' as status;
