/*
  # Add search history table

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
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  result jsonb,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to search history"
  ON search_history
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert to search history"
  ON search_history
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_search_history_username ON search_history(username);
CREATE INDEX IF NOT EXISTS idx_search_history_timestamp ON search_history(timestamp);