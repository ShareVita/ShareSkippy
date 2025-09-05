-- Fix the 24-hour delay in the get_pending_reviews_for_user function
-- This allows users to leave reviews immediately after a meeting ends

CREATE OR REPLACE FUNCTION get_pending_reviews_for_user(user_id UUID)
RETURNS TABLE (
  meeting_id UUID,
  meeting_title TEXT,
  other_participant_id UUID,
  other_participant_name TEXT,
  meeting_end_datetime TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as meeting_id,
    m.title as meeting_title,
    CASE 
      WHEN m.requester_id = user_id THEN m.recipient_id
      ELSE m.requester_id
    END as other_participant_id,
    CASE 
      WHEN m.requester_id = user_id THEN COALESCE(p_recipient.first_name || ' ' || p_recipient.last_name, p_recipient.email)
      ELSE COALESCE(p_requester.first_name || ' ' || p_requester.last_name, p_requester.email)
    END as other_participant_name,
    m.end_datetime as meeting_end_datetime
  FROM meetings m
  LEFT JOIN profiles p_requester ON m.requester_id = p_requester.id
  LEFT JOIN profiles p_recipient ON m.recipient_id = p_recipient.id
  WHERE m.status = 'completed'
    AND (m.requester_id = user_id OR m.recipient_id = user_id)
    AND m.end_datetime < NOW()  -- Removed 24-hour delay, now just check if meeting has ended
    AND NOT EXISTS (
      SELECT 1 FROM reviews r 
      WHERE r.meeting_id = m.id 
      AND r.reviewer_id = user_id
    );
END;
$$ LANGUAGE plpgsql;
