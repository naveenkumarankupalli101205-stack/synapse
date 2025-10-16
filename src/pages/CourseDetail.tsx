import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/mockAuth';
import { getCourses, getAssignments, createAssignment } from '../lib/mockSupabase';
import { Course, Assignment } from '../types';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    due_date: ''
  });

  const isTeacher = user?.role === 'teacher';
  const isOwner = course?.created_by === user?.id;

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    if (!courseId) return;

    try {
      // Load course details
      const { data: coursesData, error: courseError } = await getCourses();
      if (courseError) throw courseError;

      const courseData = coursesData?.find(c => c.id === courseId);
      if (!courseData) {
        toast.error('Course not found');
        navigate('/');
        return;
      }

      setCourse(courseData);

      // Load assignments
      const { data: assignmentsData, error: assignmentsError } = await getAssignments(courseId);
      if (assignmentsError) throw assignmentsError;

      setAssignments(assignmentsData || []);
    } catch (error) {
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !courseId) return;

    try {
      const { error } = await createAssignment(
        courseId,
        newAssignment.title,
        newAssignment.description,
        newAssignment.due_date,
        user.id
      );

      if (error) throw error;

      toast.success('Assignment created successfully!');
      setIsCreateDialogOpen(false);
      setNewAssignment({ title: '', description: '', due_date: '' });
      loadCourseData();
    } catch (error) {
      toast.error('Failed to create assignment');
    }
  };

  const handleViewAssignment = (assignmentId: string) => {
    navigate(`/assignment/${assignmentId}`);
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

  if (!course) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Course Not Found</CardTitle>
              <CardDescription>The course you're looking for doesn't exist.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="mt-2 text-gray-600">{course.description}</p>
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                <span>Duration: {course.duration}</span>
                {course.teacher_name && <span>Instructor: {course.teacher_name}</span>}
              </div>
            </div>
            
            {isTeacher && isOwner && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Create Assignment</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Assignment</DialogTitle>
                    <DialogDescription>
                      Create a new assignment for this course
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateAssignment} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Assignment Title</Label>
                      <Input
                        id="title"
                        value={newAssignment.title}
                        onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                        required
                        placeholder="Enter assignment title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newAssignment.description}
                        onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                        required
                        placeholder="Enter assignment description"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        type="datetime-local"
                        value={newAssignment.due_date}
                        onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Create Assignment
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Assignments Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Assignments</h2>
          
          {assignments.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Assignments Yet</CardTitle>
                <CardDescription>
                  {isTeacher && isOwner 
                    ? 'Create your first assignment to get started'
                    : 'Check back later for new assignments'
                  }
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>{assignment.title}</span>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {assignment.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                    </div>
                    <Button 
                      onClick={() => handleViewAssignment(assignment.id)}
                      className="w-full"
                      variant="outline"
                    >
                      {isTeacher ? 'Manage' : 'View Assignment'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;