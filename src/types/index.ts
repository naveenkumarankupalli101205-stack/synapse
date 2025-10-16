export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  created_by: string;
  created_at: string;
  teacher_name?: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  created_by: string;
  created_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;
  file_url?: string;
  grade?: number;
  feedback?: string;
  submitted_at: string;
  student_name?: string;
}