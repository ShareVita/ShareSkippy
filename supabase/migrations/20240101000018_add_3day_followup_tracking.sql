-- Add 3-day follow-up email tracking fields to user_settings table
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS follow_up_3day_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS follow_up_3day_sent_at TIMESTAMP WITH TIME ZONE;

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_settings_3day_followup 
ON user_settings (follow_up_3day_sent, follow_up_3day_sent_at);

-- Add comment for documentation
COMMENT ON COLUMN user_settings.follow_up_3day_sent IS 'Tracks if 3-day follow-up email has been sent to user';
COMMENT ON COLUMN user_settings.follow_up_3day_sent_at IS 'Timestamp when 3-day follow-up email was sent';
