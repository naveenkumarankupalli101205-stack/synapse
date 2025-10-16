import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/mockAuth';
import { getCourses, enrollInCourse, getEnrollments } from '../lib/mockSupabase';
import { Course } from '../types';
import Navbar from '../components/Navbar';
import CourseCard from '../components/CourseCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    try {
      // Load all courses
      const { data: coursesData, error: coursesError } = await getCourses();
      if (coursesError) throw coursesError;

      // Load student's enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await getEnrollments(user.id);
      if (enrollmentsError) throw enrollmentsError;

      const enrolledIds = new Set(enrollmentsData?.map(e => e.course_id) || []);
      const enrolledCoursesData = enrollmentsData?.map(e => e.courses).filter(Boolean) || [];

      setAllCourses(coursesData || []);
      setEnrolledCourses(enrolledCoursesData);
      setEnrolledCourseIds(enrolledIds);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) return;

    try {
      const { error } = await enrollInCourse(user.id, courseId);
      if (error) throw error;

      toast.success('Successfully enrolled in course!');
      loadData(); // Reload data to update enrollment status
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll in course');
    }
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="mt-2 text-gray-600">Explore courses and manage your learning</p>
        </div>

        <Tabs defaultValue="all-courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all-courses">All Courses</TabsTrigger>
            <TabsTrigger value="my-courses">My Courses ({enrolledCourses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all-courses">
            {allCourses.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Courses Available</CardTitle>
                  <CardDescription>
                    Check back later for new courses
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={handleEnroll}
                    onView={handleViewCourse}
                    isEnrolled={enrolledCourseIds.has(course.id)}
                    showEnrollButton={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-courses">
            {enrolledCourses.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Enrolled Courses</CardTitle>
                  <CardDescription>
                    Browse all courses to find something interesting to learn
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onView={handleViewCourse}
                    isEnrolled={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;