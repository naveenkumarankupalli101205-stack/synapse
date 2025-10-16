import React from 'react';
import { Course } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  onView?: (courseId: string) => void;
  isEnrolled?: boolean;
  showEnrollButton?: boolean;
  isTeacher?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  onView,
  isEnrolled = false,
  showEnrollButton = false,
  isTeacher = false
}) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          {course.teacher_name && (
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{course.teacher_name}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex space-x-2 w-full">
          {showEnrollButton && !isEnrolled && onEnroll && (
            <Button 
              onClick={() => onEnroll(course.id)}
              className="flex-1"
            >
              Enroll
            </Button>
          )}
          
          {isEnrolled && (
            <span className="text-sm text-green-600 font-medium py-2">
              ✓ Enrolled
            </span>
          )}
          
          {onView && (
            <Button 
              variant={showEnrollButton && !isEnrolled ? "outline" : "default"}
              onClick={() => onView(course.id)}
              className="flex-1"
            >
              {isTeacher ? 'Manage' : 'View'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;