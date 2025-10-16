/*
  # Create Profiles Table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - References auth.users(id)
      - `name` (text) - User's full name
      - `email` (text, unique) - User's email address
      - `role` (text) - User role: 'student' or 'teacher'
      - `created_at` (timestamptz) - Account creation timestamp

  2. Security
    - Enable RLS on `profiles` table
    - Add policy for users to read their own profile
    - Add policy for users to update their own profile
    - Add policy for authenticated users to view other profiles (for teacher-student interactions)
    
  3. Important Notes
    - The id column references auth.users(id) to link with Supabase Auth
    - Email verification is required before users can log in (handled at application level)
    - Role determines dashboard access (teacher vs student)
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'teacher')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can view other profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);