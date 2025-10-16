import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const createProfile = async (userId: string, name: string, email: string, role: 'student' | 'teacher') => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ id: userId, name, email, role }]);
  return { data, error };
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const getCourses = async () => {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      profiles:created_by (name)
    `)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createCourse = async (title: string, description: string, duration: string, createdBy: string) => {
  const { data, error } = await supabase
    .from('courses')
    .insert([{ title, description, duration, created_by: createdBy }]);
  return { data, error };
};

export const enrollInCourse = async (studentId: string, courseId: string) => {
  const { data, error } = await supabase
    .from('enrollments')
    .insert([{ student_id: studentId, course_id: courseId }]);
  return { data, error };
};

export const getEnrollments = async (studentId: string) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      courses (*)
    `)
    .eq('student_id', studentId);
  return { data, error };
};

export const getAssignments = async (courseId: string) => {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('course_id', courseId)
    .order('due_date', { ascending: true });
  return { data, error };
};

export const createAssignment = async (courseId: string, title: string, description: string, dueDate: string, createdBy: string) => {
  const { data, error } = await supabase
    .from('assignments')
    .insert([{ 
      course_id: courseId, 
      title, 
      description, 
      due_date: dueDate, 
      created_by: createdBy 
    }]);
  return { data, error };
};

export const submitAssignment = async (assignmentId: string, studentId: string, content: string) => {
  const { data, error } = await supabase
    .from('submissions')
    .insert([{ 
      assignment_id: assignmentId, 
      student_id: studentId, 
      content 
    }]);
  return { data, error };
};

export const getSubmissions = async (assignmentId: string) => {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      profiles:student_id (name)
    `)
    .eq('assignment_id', assignmentId);
  return { data, error };
};

export const gradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
  const { data, error } = await supabase
    .from('submissions')
    .update({ grade, feedback })
    .eq('id', submissionId);
  return { data, error };
};