-- RLS fix to ensure availability posts and relations are visible.

-- 1. Public Access: Allow anyone (including anon) to view active posts.
DROP POLICY IF EXISTS "Users can view all active availability posts" ON availability;
CREATE POLICY "Users can view all active availability posts" 
  ON availability
  FOR SELECT 
  TO authenticated
  USING (status = 'active');

-- 2. Owner Access: Allow authenticated users to view their own posts regardless of status.
DROP POLICY IF EXISTS "Users can view their own availability posts" ON availability;
CREATE POLICY "Users can view their own availability posts" 
  ON availability
  FOR SELECT 
  TO authenticated
  USING (((auth.uid()) = owner_id));