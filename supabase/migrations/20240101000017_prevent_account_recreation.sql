-- Create table to track deleted email addresses to prevent account recreation
CREATE TABLE IF NOT EXISTS deleted_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  original_user_id UUID, -- Keep reference to original user for audit purposes
  deletion_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for efficient email lookups
CREATE INDEX IF NOT EXISTS idx_deleted_emails_email ON deleted_emails(email);
CREATE INDEX IF NOT EXISTS idx_deleted_emails_deleted_at ON deleted_emails(deleted_at);

-- Enable Row Level Security
ALTER TABLE deleted_emails ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (only admins can view/manage deleted emails)
CREATE POLICY "Only admins can view deleted emails" ON deleted_emails
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert deleted emails" ON deleted_emails
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create function to check if email was previously deleted
CREATE OR REPLACE FUNCTION is_email_deleted(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM deleted_emails 
    WHERE email = LOWER(TRIM(check_email))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to prevent recreation of deleted accounts
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this email was previously deleted
  IF is_email_deleted(NEW.email) THEN
    RAISE EXCEPTION 'Account creation blocked: This email address was previously deleted and cannot be used to create a new account.';
  END IF;

  -- If email is not deleted, proceed with normal profile creation
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to record deleted email when account is deleted
CREATE OR REPLACE FUNCTION record_deleted_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only record if this is a completed deletion (not cancelled)
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get the user's email before deletion
    INSERT INTO deleted_emails (email, original_user_id, deletion_reason)
    SELECT 
      p.email,
      OLD.user_id,
      OLD.reason
    FROM profiles p
    WHERE p.id = OLD.user_id
    ON CONFLICT (email) DO NOTHING; -- Don't error if email already exists
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to record deleted emails when deletion requests are completed
CREATE OR REPLACE TRIGGER on_deletion_completed_record_email
  AFTER UPDATE ON account_deletion_requests
  FOR EACH ROW EXECUTE FUNCTION record_deleted_email();

-- Add comment explaining the system
COMMENT ON TABLE deleted_emails IS 'Tracks email addresses of deleted accounts to prevent recreation';
COMMENT ON FUNCTION is_email_deleted(TEXT) IS 'Checks if an email address was previously deleted and cannot be reused';
COMMENT ON FUNCTION record_deleted_email() IS 'Records email addresses when accounts are deleted to prevent recreation';
