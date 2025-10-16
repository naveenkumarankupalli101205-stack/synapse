import { User, Course, Assignment, Submission } from '../types';
import { getFromStorage, setToStorage, MOCK_STORAGE_KEYS } from './mockData';

// Mock Supabase client
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: () => Promise.resolve({ data: null, error: null }),
    signInWithPassword: () => Promise.resolve({ error: null }),
    signOut: () => Promise.resolve()
  }
};

// Database helper functions with local storage
export const createProfile = async (userId: string, name: string, email: string, role: 'student' | 'teacher') => {
  const users = getFromStorage(MOCK_STORAGE_KEYS.USERS) || [];
  const newUser = { id: userId, name, email, role };
  users.push(newUser);
  setToStorage(MOCK_STORAGE_KEYS.USERS, users);
  return { data: newUser, error: null };
};

export const getProfile = async (userId: string) => {
  const users = getFromStorage(MOCK_STORAGE_KEYS.USERS) || [];
  const user = users.find((u: User) => u.id === userId);
  return { data: user, error: user ? null : { message: 'User not found' } };
};

export const getCourses = async () => {
  const courses = getFromStorage(MOCK_STORAGE_KEYS.COURSES) || [];
  // Add teacher names to courses
  const users = getFromStorage(MOCK_STORAGE_KEYS.USERS) || [];
  const coursesWithTeachers = courses.map((course: Course) => {
    const teacher = users.find((u: User) => u.id === course.created_by);
    return {
      ...course,
      profiles: teacher ? { name: teacher.name } : null,
      teacher_name: teacher?.name
    };
  });
  return { data: coursesWithTeachers, error: null };
};

export const createCourse = async (title: string, description: string, duration: string, createdBy: string) => {
  const courses = getFromStorage(MOCK_STORAGE_KEYS.COURSES) || [];
  const newCourse: Course = {
    id: `course-${Date.now()}`,
    title,
    description,
    duration,
    created_by: createdBy,
    created_at: new Date().toISOString()
  };
  courses.push(newCourse);
  setToStorage(MOCK_STORAGE_KEYS.COURSES, courses);
  return { data: newCourse, error: null };
};

export const enrollInCourse = async (studentId: string, courseId: string) => {
  const enrollments = getFromStorage(MOCK_STORAGE_KEYS.ENROLLMENTS) || [];
  
  // Check if already enrolled
  const existingEnrollment = enrollments.find((e: any) => 
    e.student_id === studentId && e.course_id === courseId
  );
  
  if (existingEnrollment) {
    return { data: null, error: { message: 'Already enrolled in this course' } };
  }

  const newEnrollment = {
    id: `enrollment-${Date.now()}`,
    student_id: studentId,
    course_id: courseId,
    enrolled_at: new Date().toISOString()
  };
  
  enrollments.push(newEnrollment);
  setToStorage(MOCK_STORAGE_KEYS.ENROLLMENTS, enrollments);
  return { data: newEnrollment, error: null };
};

export const getEnrollments = async (studentId: string) => {
  const enrollments = getFromStorage(MOCK_STORAGE_KEYS.ENROLLMENTS) || [];
  const courses = getFromStorage(MOCK_STORAGE_KEYS.COURSES) || [];
  
  const studentEnrollments = enrollments.filter((e: any) => e.student_id === studentId);
  const enrollmentsWithCourses = studentEnrollments.map((enrollment: any) => {
    const course = courses.find((c: Course) => c.id === enrollment.course_id);
    return {
      ...enrollment,
      courses: course
    };
  });
  
  return { data: enrollmentsWithCourses, error: null };
};

export const getAssignments = async (courseId: string) => {
  const assignments = getFromStorage(MOCK_STORAGE_KEYS.ASSIGNMENTS) || [];
  const courseAssignments = assignments.filter((a: Assignment) => a.course_id === courseId);
  return { data: courseAssignments, error: null };
};

export const getAssignmentById = async (assignmentId: string) => {
  const assignments = getFromStorage(MOCK_STORAGE_KEYS.ASSIGNMENTS) || [];
  const assignment = assignments.find((a: Assignment) => a.id === assignmentId);
  return { data: assignment, error: assignment ? null : { message: 'Assignment not found' } };
};

export const createAssignment = async (courseId: string, title: string, description: string, dueDate: string, createdBy: string) => {
  const assignments = getFromStorage(MOCK_STORAGE_KEYS.ASSIGNMENTS) || [];
  const newAssignment: Assignment = {
    id: `assignment-${Date.now()}`,
    course_id: courseId,
    title,
    description,
    due_date: dueDate,
    created_by: createdBy,
    created_at: new Date().toISOString()
  };
  assignments.push(newAssignment);
  setToStorage(MOCK_STORAGE_KEYS.ASSIGNMENTS, assignments);
  return { data: newAssignment, error: null };
};

export const submitAssignment = async (assignmentId: string, studentId: string, content: string) => {
  const submissions = getFromStorage(MOCK_STORAGE_KEYS.SUBMISSIONS) || [];
  
  // Check if already submitted
  const existingSubmission = submissions.find((s: Submission) => 
    s.assignment_id === assignmentId && s.student_id === studentId
  );
  
  if (existingSubmission) {
    return { data: null, error: { message: 'Assignment already submitted' } };
  }

  const users = getFromStorage(MOCK_STORAGE_KEYS.USERS) || [];
  const student = users.find((u: User) => u.id === studentId);

  const newSubmission: Submission = {
    id: `submission-${Date.now()}`,
    assignment_id: assignmentId,
    student_id: studentId,
    content,
    submitted_at: new Date().toISOString(),
    student_name: student?.name
  };
  
  submissions.push(newSubmission);
  setToStorage(MOCK_STORAGE_KEYS.SUBMISSIONS, submissions);
  return { data: newSubmission, error: null };
};

export const getSubmissions = async (assignmentId: string) => {
  const submissions = getFromStorage(MOCK_STORAGE_KEYS.SUBMISSIONS) || [];
  const users = getFromStorage(MOCK_STORAGE_KEYS.USERS) || [];
  
  const assignmentSubmissions = submissions.filter((s: Submission) => s.assignment_id === assignmentId);
  const submissionsWithStudents = assignmentSubmissions.map((submission: Submission) => {
    const student = users.find((u: User) => u.id === submission.student_id);
    return {
      ...submission,
      profiles: student ? { name: student.name } : null,
      student_name: student?.name
    };
  });
  
  return { data: submissionsWithStudents, error: null };
};

export const gradeSubmission = async (submissionId: string, grade: number, feedback: string) => {
  const submissions = getFromStorage(MOCK_STORAGE_KEYS.SUBMISSIONS) || [];
  const submissionIndex = submissions.findIndex((s: Submission) => s.id === submissionId);
  
  if (submissionIndex === -1) {
    return { data: null, error: { message: 'Submission not found' } };
  }

  submissions[submissionIndex] = {
    ...submissions[submissionIndex],
    grade,
    feedback
  };
  
  setToStorage(MOCK_STORAGE_KEYS.SUBMISSIONS, submissions);
  return { data: submissions[submissionIndex], error: null };
};

export const getStudentSubmission = async (assignmentId: string, studentId: string) => {
  const submissions = getFromStorage(MOCK_STORAGE_KEYS.SUBMISSIONS) || [];
  const submission = submissions.find((s: Submission) => 
    s.assignment_id === assignmentId && s.student_id === studentId
  );
  return { data: submission, error: null };
};