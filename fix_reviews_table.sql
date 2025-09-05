-- Fix the reviews table structure to match the expected schema
-- This script will ensure the reviews table has all the required columns

-- First, let's check if the comment column exists and add it if it doesn't
DO $$ 
BEGIN
    -- Add comment column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reviews' AND column_name = 'comment') THEN
        ALTER TABLE reviews ADD COLUMN comment TEXT;
    END IF;
    
    -- Add meeting_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reviews' AND column_name = 'meeting_id') THEN
        ALTER TABLE reviews ADD COLUMN meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reviews' AND column_name = 'updated_at') THEN
        ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Make comment column NOT NULL if it isn't already
ALTER TABLE reviews ALTER COLUMN comment SET NOT NULL;

-- Drop any existing comment constraints
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_comment_check;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_comment_word_count_check;

-- Create the word counting function
CREATE OR REPLACE FUNCTION count_words(text_input TEXT)
RETURNS INTEGER AS $$
BEGIN
  IF text_input IS NULL OR trim(text_input) = '' THEN
    RETURN 0;
  END IF;
  RETURN array_length(string_to_array(trim(text_input), ' '), 1);
END;
$$ LANGUAGE plpgsql;

-- Add the new word count constraint
ALTER TABLE reviews ADD CONSTRAINT reviews_comment_word_count_check 
CHECK (count_words(comment) >= 5);

-- Add unique constraint for meeting_id and reviewer_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'unique_meeting_reviewer') THEN
        ALTER TABLE reviews ADD CONSTRAINT unique_meeting_reviewer UNIQUE (meeting_id, reviewer_id);
    END IF;
END $$;

-- Add constraint to ensure reviewer and reviewee are different
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'different_reviewer_reviewee') THEN
        ALTER TABLE reviews ADD CONSTRAINT different_reviewer_reviewee CHECK (reviewer_id != reviewee_id);
    END IF;
END $$;
