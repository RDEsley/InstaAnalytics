/*
  # Create search history table

  1. New Tables
    - `search_history`
      - `id` (uuid, primary key)
      - `username` (text)
      - `result` (jsonb)
      - `status` (text)
      - `error_message` (text)
      - `timestamp` (timestamptz)

  2. Security
    - Enable RLS on `search_history` table
    - Add policies for authenticated users to manage their own search history

  3. Performance
    - Add indexes for username and timestamp columns
*/

-- Create the search_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  result jsonb,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  timestamp timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to search history" ON search_history;
DROP POLICY IF EXISTS "Allow insert to search history" ON search_history;
DROP POLICY IF EXISTS "Users can read own search history" ON search_history;
DROP POLICY IF EXISTS "Users can insert own search history" ON search_history;

-- Create policies for authenticated users to manage their own data
CREATE POLICY "Users can read own search history"
  ON search_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history"
  ON search_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_search_history_username ON search_history(username);
CREATE INDEX IF NOT EXISTS idx_search_history_timestamp ON search_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);