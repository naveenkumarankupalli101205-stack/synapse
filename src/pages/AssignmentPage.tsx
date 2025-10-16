import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../lib/mockAuth';
import { getAssignmentById, getSubmissions, submitAssignment, gradeSubmission, getStudentSubmission } from '../lib/mockSupabase';
import { Assignment, Submission } from '../types';
import Navbar from '../components/Navbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, User } from 'lucide-react';
import toast from 'react-hot-toast';

const AssignmentPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userSubmission, setUserSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<string | null>(null);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    if (assignmentId) {
      loadAssignmentData();
    }
  }, [assignmentId]);

  const loadAssignmentData = async () => {
    if (!assignmentId || !user) return;

    try {
      // Load assignment details
      const { data: assignmentData, error: assignmentError } = await getAssignmentById(assignmentId);
      if (assignmentError) throw assignmentError;

      setAssignment(assignmentData);

      // Load submissions
      const { data: submissionsData, error: submissionsError } = await getSubmissions(assignmentId);
      if (submissionsError) throw submissionsError;

      setSubmissions(submissionsData || []);
      
      // Find user's submission if they're a student
      if (!isTeacher) {
        const { data: userSub } = await getStudentSubmission(assignmentId, user.id);
        setUserSubmission(userSub || null);
      }

    } catch (error) {
      toast.error('Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !assignmentId) return;

    setSubmitting(true);
    try {
      const { error } = await submitAssignment(assignmentId, user.id, submissionContent);
      if (error) throw error;

      toast.success('Assignment submitted successfully!');
      setSubmissionContent('');
      loadAssignmentData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    try {
      const grade = parseFloat(gradeData.grade);
      if (isNaN(grade) || grade < 0 || grade > 100) {
        toast.error('Please enter a valid grade (0-100)');
        return;
      }

      const { error } = await gradeSubmission(submissionId, grade, gradeData.feedback);
      if (error) throw error;

      toast.success('Grade submitted successfully!');
      setGradingSubmission(null);
      setGradeData({ grade: '', feedback: '' });
      loadAssignmentData();
    } catch (error) {
      toast.error('Failed to grade submission');
    }
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

  if (!assignment) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Not Found</CardTitle>
              <CardDescription>The assignment you're looking for doesn't exist.</CardDescription>
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
        {/* Assignment Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
          </div>
          <p className="text-gray-600 mb-4">{assignment.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
            </div>
            <Badge variant={new Date(assignment.due_date) > new Date() ? "default" : "destructive"}>
              {new Date(assignment.due_date) > new Date() ? "Open" : "Overdue"}
            </Badge>
          </div>
        </div>

        {isTeacher ? (
          // Teacher View - Manage Submissions
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Submissions</h2>
            
            {submissions.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Submissions Yet</CardTitle>
                  <CardDescription>Students haven't submitted their work yet.</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card key={submission.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span>{submission.student_name || 'Student'}</span>
                          </CardTitle>
                          <CardDescription>
                            Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {submission.grade !== null && submission.grade !== undefined && (
                          <Badge variant="secondary">
                            Grade: {submission.grade}/100
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label>Submission Content:</Label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md">
                            {submission.content}
                          </div>
                        </div>
                        
                        {submission.feedback && (
                          <div>
                            <Label>Feedback:</Label>
                            <div className="mt-1 p-3 bg-blue-50 rounded-md">
                              {submission.feedback}
                            </div>
                          </div>
                        )}
                        
                        {gradingSubmission === submission.id ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="grade">Grade (0-100)</Label>
                              <Input
                                id="grade"
                                type="number"
                                min="0"
                                max="100"
                                value={gradeData.grade}
                                onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                                placeholder="Enter grade"
                              />
                            </div>
                            <div>
                              <Label htmlFor="feedback">Feedback</Label>
                              <Textarea
                                id="feedback"
                                value={gradeData.feedback}
                                onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                placeholder="Enter feedback for the student"
                                rows={3}
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button onClick={() => handleGradeSubmission(submission.id)}>
                                Submit Grade
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setGradingSubmission(null);
                                  setGradeData({ grade: '', feedback: '' });
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => {
                              setGradingSubmission(submission.id);
                              setGradeData({ 
                                grade: submission.grade?.toString() || '', 
                                feedback: submission.feedback || '' 
                              });
                            }}
                          >
                            {submission.grade !== null && submission.grade !== undefined ? 'Update Grade' : 'Grade Submission'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Student View - Submit Assignment
          <div className="space-y-6">
            {userSubmission ? (
              <Card>
                <CardHeader>
                  <CardTitle>Your Submission</CardTitle>
                  <CardDescription>
                    Submitted on {new Date(userSubmission.submitted_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Your Answer:</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        {userSubmission.content}
                      </div>
                    </div>
                    
                    {userSubmission.grade !== null && userSubmission.grade !== undefined && (
                      <div>
                        <Label>Grade:</Label>
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-lg">
                            {userSubmission.grade}/100
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    {userSubmission.feedback && (
                      <div>
                        <Label>Teacher Feedback:</Label>
                        <div className="mt-1 p-3 bg-blue-50 rounded-md">
                          {userSubmission.feedback}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Assignment</CardTitle>
                  <CardDescription>
                    Complete your assignment and submit it below
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitAssignment} className="space-y-4">
                    <div>
                      <Label htmlFor="content">Your Answer</Label>
                      <Textarea
                        id="content"
                        value={submissionContent}
                        onChange={(e) => setSubmissionContent(e.target.value)}
                        required
                        placeholder="Enter your assignment solution here..."
                        rows={8}
                      />
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting ? 'Submitting...' : 'Submit Assignment'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentPage;