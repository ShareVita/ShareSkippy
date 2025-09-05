-- Quick setup for meetings table
-- Run this in your Supabase SQL Editor

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  availability_id UUID REFERENCES availability(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  
  -- Meeting details
  title TEXT NOT NULL,
  description TEXT,
  meeting_place TEXT,
  
  -- Scheduling
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'cancelled', 'completed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_meeting_times CHECK (end_datetime > start_datetime),
  CONSTRAINT different_participants CHECK (requester_id != recipient_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meetings_requester_id ON meetings(requester_id);
CREATE INDEX IF NOT EXISTS idx_meetings_recipient_id ON meetings(recipient_id);
CREATE INDEX IF NOT EXISTS idx_meetings_availability_id ON meetings(availability_id);
CREATE INDEX IF NOT EXISTS idx_meetings_conversation_id ON meetings(conversation_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_start_datetime ON meetings(start_datetime);
CREATE INDEX IF NOT EXISTS idx_meetings_end_datetime ON meetings(end_datetime);

-- Enable RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view meetings they are involved in" ON meetings
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create meeting requests" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update meetings they are involved in" ON meetings
  FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can delete meetings they created" ON meetings
  FOR DELETE USING (auth.uid() = requester_id);

-- Create functions
CREATE OR REPLACE FUNCTION handle_meeting_status_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  IF NEW.status = 'scheduled' AND OLD.status != 'pending' THEN
    RAISE EXCEPTION 'Meeting can only be scheduled if it was previously pending';
  END IF;
  
  IF NEW.status = 'completed' AND OLD.status != 'scheduled' THEN
    RAISE EXCEPTION 'Meeting can only be completed if it was previously scheduled';
  END IF;
  
  -- Allow cancellation from any status except completed
  IF NEW.status = 'cancelled' AND OLD.status = 'completed' THEN
    RAISE EXCEPTION 'Cannot cancel completed meetings';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE OR REPLACE TRIGGER on_meeting_status_update
  BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION handle_meeting_status_update();

-- Success message
SELECT 'Meetings table created successfully!' as message;
