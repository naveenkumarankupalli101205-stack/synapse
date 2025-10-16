Learning Management System (LMS) - Development Plan
MVP Implementation Plan
1. Core Setup & Configuration
[x] Template setup with shadcn-ui
[ ] Configure Supabase client
[ ] Update package.json with required dependencies
[ ] Setup authentication context
2. Database Schema & Supabase Setup
[ ] Create profiles table
[ ] Create courses table
[ ] Create enrollments table
[ ] Create assignments table
[ ] Create submissions table
[ ] Setup Row Level Security (RLS) policies
3. Authentication System
[ ] Create Login component
[ ] Create Register component
[ ] Create AuthContext for state management
[ ] Implement role-based routing
4. Core Components
[ ] Create Navbar component
[ ] Create CourseCard component
[ ] Create ProtectedRoute component
5. Pages Implementation
[ ] Update App.tsx with routing
[ ] Create TeacherDashboard page
[ ] Create StudentDashboard page
[ ] Create CourseDetail page
[ ] Create AssignmentPage component
6. Core Features
[ ] Course management (CRUD operations)
[ ] Enrollment system
[ ] Assignment creation and submission
[ ] Basic grading system
7. UI/UX Polish
[ ] Update index.html title
[ ] Responsive design implementation
[ ] Loading states and error handling
File Structure
src/
├── components/
│   ├── Navbar.tsx
│   ├── CourseCard.tsx
│   └── ProtectedRoute.tsx
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── TeacherDashboard.tsx
│   ├── StudentDashboard.tsx
│   ├── CourseDetail.tsx
│   └── AssignmentPage.tsx
├── lib/
│   ├── supabase.ts
│   └── auth.tsx
├── types/
│   └── index.ts
└── App.tsx
Database Tables
profiles:
courses:
enrollments:
assignments:
submissions: