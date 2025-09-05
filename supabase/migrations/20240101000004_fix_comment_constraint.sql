-- Fix the comment constraint to check word count instead of character count
-- This allows comments with at least 5 words instead of 5 characters

-- First, drop the existing constraint
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_comment_check;

-- Add a new constraint that checks for word count
-- We'll use a function to count words properly
CREATE OR REPLACE FUNCTION count_words(text_input TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN array_length(string_to_array(trim(text_input), ' '), 1);
END;
$$ LANGUAGE plpgsql;

-- Add the new constraint
ALTER TABLE reviews ADD CONSTRAINT reviews_comment_word_count_check 
CHECK (count_words(comment) >= 5);
