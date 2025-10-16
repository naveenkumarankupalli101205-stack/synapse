Supabase Database Setup for EduLMS
This document provides the SQL commands needed to set up the database schema for the Learning Management System.

Database Tables
Run the following SQL commands in your Supabase SQL editor:

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) NOT NULL,
  course_id UUID REFERENCES courses(id) NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, course_id)
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) NOT NULL,
  student_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  grade INTEGER CHECK (grade >= 0 AND grade <= 100),
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(assignment_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS courses_created_by_idx ON courses(created_by);
CREATE INDEX IF NOT EXISTS enrollments_student_idx ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS enrollments_course_idx ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS assignments_course_idx ON assignments(course_id);
CREATE INDEX IF NOT EXISTS submissions_assignment_idx ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS submissions_student_idx ON submissions(student_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for courses
CREATE POLICY "Anyone can view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Teachers can create courses" ON courses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
);
CREATE POLICY "Teachers can update own courses" ON courses FOR UPDATE USING (
  created_by = auth.uid() AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
);

-- RLS Policies for enrollments
CREATE POLICY "Users can view enrollments" ON enrollments FOR SELECT USING (
  student_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM courses WHERE id = course_id AND created_by = auth.uid())
);
CREATE POLICY "Students can enroll themselves" ON enrollments FOR INSERT WITH CHECK (
  student_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student')
);

-- RLS Policies for assignments
CREATE POLICY "Users can view course assignments" ON assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE id = course_id AND created_by = auth.uid()) OR
  EXISTS (SELECT 1 FROM enrollments WHERE course_id = assignments.course_id AND student_id = auth.uid())
);
CREATE POLICY "Teachers can create assignments for their courses" ON assignments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM courses WHERE id = course_id AND created_by = auth.uid())
);

-- RLS Policies for submissions
CREATE POLICY "Users can view relevant submissions" ON submissions FOR SELECT USING (
  student_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM assignments a JOIN courses c ON a.course_id = c.id WHERE a.id = assignment_id AND c.created_by = auth.uid())
);
CREATE POLICY "Students can submit assignments" ON submissions FOR INSERT WITH CHECK (
  student_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student') AND
  EXISTS (SELECT 1 FROM enrollments e JOIN assignments a ON e.course_id = a.course_id WHERE a.id = assignment_id AND e.student_id = auth.uid())
);
CREATE POLICY "Teachers can update submissions for grading" ON submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM assignments a JOIN courses c ON a.course_id = c.id WHERE a.id = assignment_id AND c.created_by = auth.uid())
);
Setup Instructions
Create a new Supabase project at https://supabase.com
Go to the SQL Editor in your Supabase dashboard
Copy and paste the above SQL commands
Execute the commands to create the database schema
Update the src/lib/supabase.ts file with your Supabase URL and anon key
Enable email authentication in your Supabase Auth settings
Environment Variables
Create a .env.local file in your project root with:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Then update src/lib/supabase.ts to use these environment variables:

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE