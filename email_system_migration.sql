-- Email System Migration for ShareSkippy
-- Copy and paste this into your Supabase SQL Editor

-- Create user_settings table for email preferences
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  email_notifications BOOLEAN DEFAULT true NOT NULL,
  follow_up_email_sent BOOLEAN DEFAULT false NOT NULL,
  follow_up_email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile_views table for tracking profile views (used in follow-up email stats)
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add reminder_sent column to meetings table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'meetings' 
    AND column_name = 'reminder_sent'
  ) THEN
    ALTER TABLE meetings ADD COLUMN reminder_sent BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_email_notifications ON user_settings(email_notifications);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_user_id ON profile_views(viewed_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_created_at ON profile_views(created_at);
CREATE INDEX IF NOT EXISTS idx_meetings_reminder_sent ON meetings(reminder_sent);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for profile_views
CREATE POLICY "Users can view their own profile views" ON profile_views
  FOR SELECT USING (auth.uid() = viewed_user_id);

CREATE POLICY "Users can create profile views" ON profile_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- Create function to automatically update updated_at timestamp for user_settings
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_settings updated_at
CREATE OR REPLACE TRIGGER on_user_settings_update
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_user_settings_updated_at();

-- Create function to automatically create user_settings when a profile is created
CREATE OR REPLACE FUNCTION create_user_settings_on_profile_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id, email_notifications, follow_up_email_sent)
  VALUES (NEW.id, true, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create user_settings for new profiles
CREATE OR REPLACE TRIGGER on_profile_insert_create_settings
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_user_settings_on_profile_insert();

-- Insert default settings for existing users (if any)
INSERT INTO user_settings (user_id, email_notifications, follow_up_email_sent)
SELECT id, true, false
FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_settings)
ON CONFLICT (user_id) DO NOTHING;

