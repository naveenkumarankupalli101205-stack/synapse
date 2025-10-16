import { User, Course, Assignment, Submission } from '../types';

// Mock users
export const mockUsers: User[] = [
  {
    id: 'teacher-1',
    email: 'teacher@demo.com',
    name: 'Dr. Sarah Johnson',
    role: 'teacher'
  },
  {
    id: 'student-1',
    email: 'student@demo.com',
    name: 'John Smith',
    role: 'student'
  }
];

// Mock courses
export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern web applications.',
    duration: '8 weeks',
    created_by: 'teacher-1',
    created_at: '2024-01-15T10:00:00Z',
    teacher_name: 'Dr. Sarah Johnson'
  },
  {
    id: 'course-2',
    title: 'React.js Fundamentals',
    description: 'Master React.js concepts including components, state management, and hooks.',
    duration: '6 weeks',
    created_by: 'teacher-1',
    created_at: '2024-01-20T10:00:00Z',
    teacher_name: 'Dr. Sarah Johnson'
  },
  {
    id: 'course-3',
    title: 'Database Design',
    description: 'Learn how to design efficient and scalable database systems.',
    duration: '10 weeks',
    created_by: 'teacher-1',
    created_at: '2024-01-25T10:00:00Z',
    teacher_name: 'Dr. Sarah Johnson'
  }
];

// Mock assignments
export const mockAssignments: Assignment[] = [
  {
    id: 'assignment-1',
    course_id: 'course-1',
    title: 'Build a Personal Portfolio',
    description: 'Create a responsive personal portfolio website using HTML, CSS, and JavaScript.',
    due_date: '2024-12-30T23:59:00Z',
    created_by: 'teacher-1',
    created_at: '2024-01-16T10:00:00Z'
  },
  {
    id: 'assignment-2',
    course_id: 'course-1',
    title: 'JavaScript Calculator',
    description: 'Build a functional calculator using vanilla JavaScript.',
    due_date: '2024-12-25T23:59:00Z',
    created_by: 'teacher-1',
    created_at: '2024-01-18T10:00:00Z'
  },
  {
    id: 'assignment-3',
    course_id: 'course-2',
    title: 'React Todo App',
    description: 'Create a todo application using React with add, edit, and delete functionality.',
    due_date: '2024-12-28T23:59:00Z',
    created_by: 'teacher-1',
    created_at: '2024-01-22T10:00:00Z'
  }
];

// Mock submissions
export const mockSubmissions: Submission[] = [
  {
    id: 'submission-1',
    assignment_id: 'assignment-1',
    student_id: 'student-1',
    content: 'I have created a responsive portfolio website with sections for about, projects, and contact. The site uses modern CSS Grid and Flexbox for layout.',
    grade: 85,
    feedback: 'Great work! Your portfolio looks professional and is well-structured. Consider adding more interactive elements.',
    submitted_at: '2024-01-20T15:30:00Z',
    student_name: 'John Smith'
  }
];

// Local storage keys
const STORAGE_KEYS = {
  CURRENT_USER: 'lms_current_user',
  USERS: 'lms_users',
  COURSES: 'lms_courses',
  ASSIGNMENTS: 'lms_assignments',
  SUBMISSIONS: 'lms_submissions',
  ENROLLMENTS: 'lms_enrollments'
};

// Initialize local storage with mock data
export const initializeMockData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(mockCourses));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(mockAssignments));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(mockSubmissions));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ENROLLMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify([
      { id: 'enrollment-1', student_id: 'student-1', course_id: 'course-1', enrolled_at: '2024-01-16T10:00:00Z' }
    ]));
  }
};

// Helper functions for local storage operations
export const getFromStorage = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const setToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const MOCK_STORAGE_KEYS = STORAGE_KEYS;