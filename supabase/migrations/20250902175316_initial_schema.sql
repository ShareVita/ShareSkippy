-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  role TEXT,
  emergency_contact_name TEXT,
  emergency_contact_number TEXT,
  emergency_contact_email TEXT,
  bio TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  airbnb_url TEXT,
  other_social_url TEXT,
  community_support_badge TEXT,
  support_preferences TEXT[],
  support_story TEXT,
  other_support_description TEXT,
  profile_photo_url TEXT,
  display_lat DECIMAL,
  display_lng DECIMAL,
  neighborhood TEXT,
  city TEXT,
  street_address TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add a more permissive policy for upsert operations
CREATE POLICY "Users can upsert their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);
