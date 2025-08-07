'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, Upload, GraduationCap, Calendar, Clock, User, FileText,
  Camera, Trash2, Edit, Eye, EyeOff, CheckCircle, AlertCircle, Target,
  TrendingUp, Award, PieChart, BarChart3, Download, Search, Filter,
  MoreHorizontal, X, ChevronDown, ChevronRight, Star, Users, MapPin,
  Link, Zap, Brain, Image as ImageIcon, Loader2, RefreshCw
} from 'lucide-react';

import { useScheduleStore } from '@/lib/store/schedule-store';
import { ScheduleEvent, EventType, Priority } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Interfaces
interface MeetingTime {
  day: string;
  startTime: string;
  endTime: string;
  location?: string;
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  type: 'homework' | 'exam' | 'project' | 'quiz' | 'paper';
  points: number;
  completed: boolean;
  grade?: number;
  extractedFromSyllabus: boolean;
  confidence?: number;
}

interface Grade {
  id: string;
  assignmentId: string;
  score: number;
  maxScore: number;
  date: Date;
  feedback?: string;
}

interface SyllabusData {
  id: string;
  fileName: string;
  uploadDate: Date;
  extractedText: string;
  assignments: Assignment[];
  processingStatus: 'uploading' | 'processing' | 'completed' | 'error';
  confidence: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  professor: string;
  credits: number;
  semester: string;
  color: string;
  location?: string;
  meetingTimes: MeetingTime[];
  syllabus?: SyllabusData;
  assignments: Assignment[];
  grades: Grade[];
  createdAt: Date;
  updatedAt: Date;
}

interface OCRResult {
  text: string;
  assignments: Assignment[];
  confidence: number;
}

// Utility Functions
const processImageOCR = async (file: File): Promise<OCRResult> => {
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return {
    text: "CS 461 Software Engineering\nInstructor: Dr. Smith\nAssignment 1: Project Proposal - Due September 15, 2024\nMidterm Exam - October 20, 2024\nFinal Project - Due December 10, 2024\nFinal Exam - December 18, 2024",
    assignments: [
      {
        id: Date.now().toString(),
        title: "Project Proposal",
        dueDate: new Date('2024-09-15'),
        type: 'homework',
        points: 100,
        completed: false,
        extractedFromSyllabus: true,
        confidence: 0.95
      },
      {
        id: (Date.now() + 1).toString(),
        title: "Midterm Exam",
        dueDate: new Date('2024-10-20'),
        type: 'exam',
        points: 200,
        completed: false,
        extractedFromSyllabus: true,
        confidence: 0.88
      },
      {
        id: (Date.now() + 2).toString(),
        title: "Final Project",
        dueDate: new Date('2024-12-10'),
        type: 'project',
        points: 300,
        completed: false,
        extractedFromSyllabus: true,
        confidence: 0.92
      }
    ],
    confidence: 0.91
  };
};

const extractCourseInfoFromText = (text: string) => {
  const lines = text.split('\n');
  let courseInfo: any = {};
  
  for (const line of lines.slice(0, 10)) {
    const courseMatch = line.match(/([A-Z]{2,4}\s*\d{3}[A-Z]?)\s*[:\-]?\s*(.+)/);
    if (courseMatch) {
      courseInfo.code = courseMatch[1].replace(/\s+/g, ' ');
      courseInfo.name = courseMatch[2].trim();
      break;
    }
  }
  
  const profMatch = text.match(/(?:instructor|professor|prof|taught by)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]*)*)/i);
  if (profMatch) {
    courseInfo.professor = profMatch[1];
  }
  
  const creditsMatch = text.match(/(\d+)\s*credit/i);
  if (creditsMatch) {
    courseInfo.credits = parseInt(creditsMatch[1]);
  }
  
  const locationMatch = text.match(/(?:room|location|meets in)[:\s]+([A-Z0-9\s]+\d+)/i);
  if (locationMatch) {
    courseInfo.location = locationMatch[1].trim();
  }
  
  return courseInfo;
};

const calculateCourseStats = (course: Course) => {
  const totalAssignments = course.assignments.length;
  const completedAssignments = course.assignments.filter(a => a.completed).length;
  const totalPoints = course.assignments.reduce((sum, a) => sum + a.points, 0);
  const earnedPoints = course.grades.reduce((sum, g) => sum + g.score, 0);
  const currentGrade = totalPoints > 0 ? (earnedPoints / course.grades.reduce((sum, g) => sum + g.maxScore, 0)) * 100 : 0;
  
  return {
    totalAssignments,
    completedAssignments,
    completionRate: totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0,
    currentGrade: isNaN(currentGrade) ? 0 : currentGrade,
    upcomingDeadlines: course.assignments.filter(a => !a.completed && new Date(a.dueDate) > new Date()).length
  };
};

// Main Component
export function CoursesSection() {
  const { addEvent } = useScheduleStore();
  
  // State Management
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showSyllabusUpload, setShowSyllabusUpload] = useState(false);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [showExtractedData, setShowExtractedData] = useState(false);
  const [currentView, setCurrentView] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  
  // Form States
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    name: '',
    code: '',
    professor: '',
    credits: 3,
    semester: 'Fall 2024',
    color: '#3b82f6',
    location: '',
    meetingTimes: [],
    assignments: [],
    grades: []
  });
  
  // Syllabus Processing States
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<OCRResult | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Sample Data
  useEffect(() => {
    const sampleCourses: Course[] = [
      {
        id: '1',
        name: 'Software Engineering',
        code: 'CS 461',
        professor: 'Dr. Smith',
        credits: 4,
        semester: 'Fall 2024',
        color: '#3b82f6',
        location: 'Engineering Building 101',
        meetingTimes: [
          { day: 'Monday', startTime: '10:00', endTime: '11:30', location: 'EB 101' },
          { day: 'Wednesday', startTime: '10:00', endTime: '11:30', location: 'EB 101' },
          { day: 'Friday', startTime: '10:00', endTime: '11:30', location: 'EB 101' }
        ],
        assignments: [
          {
            id: 'a1',
            title: 'Project Proposal',
            description: 'Initial project proposal and team formation',
            dueDate: new Date('2024-09-15'),
            type: 'homework',
            points: 100,
            completed: true,
            grade: 95,
            extractedFromSyllabus: false
          },
          {
            id: 'a2',
            title: 'Midterm Exam',
            dueDate: new Date('2024-10-20'),
            type: 'exam',
            points: 200,
            completed: false,
            extractedFromSyllabus: false
          }
        ],
        grades: [
          {
            id: 'g1',
            assignmentId: 'a1',
            score: 95,
            maxScore: 100,
            date: new Date('2024-09-18'),
            feedback: 'Excellent work on the proposal'
          }
        ],
        createdAt: new Date('2024-08-20'),
        updatedAt: new Date('2024-09-18')
      },
      {
        id: '2',
        name: 'Data Structures',
        code: 'CS 302',
        professor: 'Dr. Johnson',
        credits: 3,
        semester: 'Fall 2024',
        color: '#10b981',
        location: 'Computer Science Building 205',
        meetingTimes: [
          { day: 'Tuesday', startTime: '14:00', endTime: '15:30', location: 'CS 205' },
          { day: 'Thursday', startTime: '14:00', endTime: '15:30', location: 'CS 205' }
        ],
        assignments: [
          {
            id: 'a3',
            title: 'Binary Tree Implementation',
            dueDate: new Date('2024-09-25'),
            type: 'homework',
            points: 150,
            completed: true,
            grade: 142,
            extractedFromSyllabus: false
          },
          {
            id: 'a4',
            title: 'Hash Table Quiz',
            dueDate: new Date('2024-10-05'),
            type: 'quiz',
            points: 50,
            completed: false,
            extractedFromSyllabus: false
          }
        ],
        grades: [
          {
            id: 'g2',
            assignmentId: 'a3',
            score: 142,
            maxScore: 150,
            date: new Date('2024-09-28'),
            feedback: 'Good implementation, minor optimization issues'
          }
        ],
        createdAt: new Date('2024-08-20'),
        updatedAt: new Date('2024-09-28')
      }
    ];
    setCourses(sampleCourses);
  }, []);

  // Event Handlers
  const handleAddCourse = () => {
    if (!newCourse.name || !newCourse.code || !newCourse.professor) {
      console.log('Missing required fields');
      return;
    }
    
    const course: Course = {
      id: Date.now().toString(),
      name: newCourse.name,
      code: newCourse.code,
      professor: newCourse.professor,
      credits: newCourse.credits || 3,
      semester: newCourse.semester || 'Fall 2024',
      color: newCourse.color || '#3b82f6',
      location: newCourse.location,
      meetingTimes: newCourse.meetingTimes || [],
      assignments: [],
      grades: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setCourses([...courses, course]);
    setNewCourse({
      name: '',
      code: '',
      professor: '',
      credits: 3,
      semester: 'Fall 2024',
      color: '#3b82f6',
      location: '',
      meetingTimes: [],
      assignments: [],
      grades: []
    });
    setShowAddCourse(false);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter(c => c.id !== courseId));
    if (selectedCourse?.id === courseId) {
      setSelectedCourse(null);
    }
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  };

  const handleAssignmentToggle = (assignmentId: string) => {
    if (!selectedCourse) return;
    
    const updatedCourse = {
      ...selectedCourse,
      assignments: selectedCourse.assignments.map(assignment =>
        assignment.id === assignmentId 
          ? { ...assignment, completed: !assignment.completed }
          : assignment
      )
    };
    
    setCourses(courses.map(c => c.id === selectedCourse.id ? updatedCourse : c));
    setSelectedCourse(updatedCourse);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSyllabusFile(file);
    }
  };

  const processSyllabus = async () => {
    if (!syllabusFile) return;
    
    setIsProcessing(true);
    try {
      const result = await processImageOCR(syllabusFile);
      setExtractedData(result);
      setShowExtractedData(true);
    } catch (error) {
      console.error('OCR processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmExtractedAssignments = () => {
    if (!extractedData) return;
    
    if (selectedCourse) {
      // Adding to existing course
      const updatedCourse = {
        ...selectedCourse,
        assignments: [...selectedCourse.assignments, ...extractedData.assignments],
        syllabus: {
          id: Date.now().toString(),
          fileName: syllabusFile?.name || '',
          uploadDate: new Date(),
          extractedText: extractedData.text,
          assignments: extractedData.assignments,
          processingStatus: 'completed' as const,
          confidence: extractedData.confidence
        }
      };
      
      setCourses(courses.map(c => c.id === selectedCourse.id ? updatedCourse : c));
      setSelectedCourse(updatedCourse);
    } else {
      // Creating new course from syllabus
      const extractedCourseInfo = extractCourseInfoFromText(extractedData.text);
      
      const newCourseFromSyllabus: Course = {
        id: Date.now().toString(),
        name: extractedCourseInfo.name || 'Extracted Course',
        code: extractedCourseInfo.code || 'COURSE',
        professor: extractedCourseInfo.professor || 'Professor',
        credits: extractedCourseInfo.credits || 3,
        semester: 'Fall 2024',
        color: '#3b82f6',
        location: extractedCourseInfo.location,
        meetingTimes: extractedCourseInfo.meetingTimes || [],
        assignments: extractedData.assignments,
        grades: [],
        syllabus: {
          id: Date.now().toString(),
          fileName: syllabusFile?.name || '',
          uploadDate: new Date(),
          extractedText: extractedData.text,
          assignments: extractedData.assignments,
          processingStatus: 'completed' as const,
          confidence: extractedData.confidence
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCourses([...courses, newCourseFromSyllabus]);
    }
    
    // Create calendar events for assignments
    extractedData.assignments.forEach(assignment => {
      const event: ScheduleEvent = {
        id: `assignment-${assignment.id}`,
        title: `${selectedCourse?.code || 'Course'}: ${assignment.title}`,
        type: assignment.type === 'exam' ? EventType.ASSIGNMENT : EventType.STUDY,
        startTime: new Date(assignment.dueDate),
        endTime: new Date(assignment.dueDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours
        duration: 120,
        color: selectedCourse?.color || '#3b82f6',
        emoji: assignment.type === 'exam' ? '📝' : '📚',
        course: selectedCourse?.code || 'Course',
        priority: assignment.type === 'exam' ? Priority.HIGH : Priority.MEDIUM,
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][assignment.dueDate.getDay()],
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      addEvent(event);
    });
    
    // Reset states
    setShowExtractedData(false);
    setShowSyllabusUpload(false);
    setSyllabusFile(null);
    setExtractedData(null);
  };

  const handleManualAssignmentAdd = () => {
    // TODO: Implement manual assignment creation
    console.log('Add manual assignment');
  };

  const handleAssignmentEdit = (assignmentId: string) => {
    // TODO: Implement assignment editing
    console.log('Edit assignment:', assignmentId);
  };

  const handleAssignmentDelete = (assignmentId: string) => {
    // TODO: Implement assignment deletion
    console.log('Delete assignment:', assignmentId);
  };

  // Computed Values
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.professor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester = filterSemester === 'all' || course.semester === filterSemester;
    return matchesSearch && matchesSemester;
  });

  const semesters = Array.from(new Set(courses.map(c => c.semester)));

  // Sub-Components
  const CourseCard = ({ course }: { course: Course }) => {
    const stats = calculateCourseStats(course);
    const isExpanded = expandedCourse === course.id;
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="course-card-clockwyz"
        style={{ borderLeftColor: course.color }}
        onClick={() => handleCourseClick(course)}
      >
        <div className="course-card-header-clockwyz">
          <div className="course-info-clockwyz">
            <div className="course-title-row-clockwyz">
              <h3 className="course-name-clockwyz">{course.name}</h3>
              <Badge 
                className="course-code-badge-clockwyz"
                style={{ backgroundColor: course.color + '20', color: course.color }}
              >
                {course.code}
              </Badge>
            </div>
            <div className="course-meta-clockwyz">
              <div className="professor-info-clockwyz">
                <User className="w-3 h-3" />
                <span>{course.professor}</span>
              </div>
              <div className="credits-info-clockwyz">
                <GraduationCap className="w-3 h-3" />
                <span>{course.credits} credits</span>
              </div>
              {course.location && (
                <div className="location-info-clockwyz">
                  <MapPin className="w-3 h-3" />
                  <span>{course.location}</span>
                </div>
              )}
            </div>
          </div>
          <div className="course-actions-clockwyz">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedCourse(isExpanded ? null : course.id);
              }}
              className="expand-btn-clockwyz"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCourse(course);
                setShowSyllabusUpload(true);
              }}
              className="upload-btn-clockwyz"
            >
              <Upload className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="course-stats-clockwyz">
          <div className="stat-item-courses-clockwyz">
            <span className="stat-label-courses-clockwyz">Progress</span>
            <div className="progress-container-clockwyz">
              <div className="progress-bar-courses-clockwyz">
                <div 
                  className="progress-fill-courses-clockwyz"
                  style={{ width: `${stats.completionRate}%`, backgroundColor: course.color }}
                />
              </div>
              <span className="progress-text-clockwyz">{stats.completionRate.toFixed(0)}%</span>
            </div>
          </div>
          
          <div className="quick-stats-clockwyz">
            <div className="quick-stat-clockwyz">
              <Target className="w-3 h-3" />
              <span>{stats.completedAssignments}/{stats.totalAssignments}</span>
            </div>
            <div className="quick-stat-clockwyz">
              <TrendingUp className="w-3 h-3" />
              <span>{stats.currentGrade.toFixed(1)}%</span>
            </div>
            <div className="quick-stat-clockwyz">
              <Clock className="w-3 h-3" />
              <span>{stats.upcomingDeadlines} due</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="course-details-expanded-clockwyz"
            >
              <div className="meeting-times-clockwyz">
                <h4 className="section-title-clockwyz">Meeting Times</h4>
                {course.meetingTimes.map((time, index) => (
                  <div key={index} className="meeting-time-clockwyz">
                    <span className="day-clockwyz">{time.day}</span>
                    <span className="time-clockwyz">{time.startTime} - {time.endTime}</span>
                    {time.location && <span className="location-clockwyz">{time.location}</span>}
                  </div>
                ))}
              </div>
              
              <div className="upcoming-assignments-clockwyz">
                <h4 className="section-title-clockwyz">Upcoming Assignments</h4>
                {course.assignments
                  .filter(a => !a.completed && new Date(a.dueDate) > new Date())
                  .slice(0, 3)
                  .map(assignment => (
                    <div key={assignment.id} className="mini-assignment-clockwyz">
                      <span className="assignment-title-mini-clockwyz">{assignment.title}</span>
                      <span className="assignment-due-mini-clockwyz">
                        Due {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="courses-section-clockwyz">
      {/* Header */}
      <div className="courses-header-clockwyz">
        <div className="courses-title-section-clockwyz">
          <h1 className="courses-main-title-clockwyz">Courses</h1>
          <p className="courses-subtitle-clockwyz">Manage your academic schedule and assignments</p>
        </div>
        <div className="courses-controls-clockwyz">
          <div className="search-filter-group-clockwyz">
            <div className="search-input-wrapper-clockwyz">
              <Search className="w-4 h-4 search-icon-clockwyz" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-clockwyz"
              />
            </div>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="semester-filter-clockwyz"
            >
              <option value="all">All Semesters</option>
              {semesters.map(semester => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>
          <div className="view-controls-clockwyz">
            <Button
              variant={currentView === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('grid')}
              className="view-btn-clockwyz"
            >
              Grid
            </Button>
            <Button
              variant={currentView === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('list')}
              className="view-btn-clockwyz"
            >
              List
            </Button>
          </div>
          <Button 
            onClick={() => setShowAddOptions(true)} 
            className="add-course-btn-clockwyz"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Courses Grid/List */}
      <div className={cn(
        "courses-container-clockwyz",
        currentView === 'grid' ? 'grid-view' : 'list-view'
      )}>
        <AnimatePresence>
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </AnimatePresence>
        
        {filteredCourses.length === 0 && (
          <div className="empty-courses-clockwyz">
            <BookOpen className="empty-icon-clockwyz" />
            <h3>No courses found</h3>
            <p>Add your first course to get started</p>
          </div>
        )}
      </div>

      {/* Add Course Options Modal */}
      <Dialog open={showAddOptions} onOpenChange={setShowAddOptions}>
        <DialogContent className="add-options-modal-clockwyz">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription className="options-description-clockwyz">
              Choose how you'd like to add your course information:
            </DialogDescription>
          </DialogHeader>
          
          <div className="options-grid-clockwyz space-y-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="option-card-clockwyz p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => {
                setShowAddOptions(false);
                setSelectedCourse(null);
                setShowSyllabusUpload(true);
              }}
            >
              <div className="option-icon-clockwyz flex items-center gap-3 mb-2">
                <Upload className="w-6 h-6 text-blue-600" />
                <h3 className="option-title-clockwyz font-medium">Upload Syllabus</h3>
              </div>
              <p className="option-description-clockwyz text-sm text-gray-600">
                Upload a syllabus image and let AI extract course information automatically
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="option-card-clockwyz p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => {
                setShowAddOptions(false);
                setShowAddCourse(true);
              }}
            >
              <div className="option-icon-clockwyz flex items-center gap-3 mb-2">
                <Edit className="w-6 h-6 text-green-600" />
                <h3 className="option-title-clockwyz font-medium">Manual Entry</h3>
              </div>
              <p className="option-description-clockwyz text-sm text-gray-600">
                Enter course information manually and add assignments as you go
              </p>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Add Course Modal */}
      <Dialog open={showAddCourse} onOpenChange={setShowAddCourse}>
        <DialogContent className="add-course-modal-clockwyz">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          
          <div className="course-form-clockwyz">
            <div className="form-row-clockwyz">
              <div className="form-field-clockwyz">
                <Label htmlFor="course-name">Course Name</Label>
                <Input
                  id="course-name"
                  placeholder="Software Engineering"
                  value={newCourse.name || ''}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                />
              </div>
              <div className="form-field-clockwyz">
                <Label htmlFor="course-code">Course Code</Label>
                <Input
                  id="course-code"
                  placeholder="CS 461"
                  value={newCourse.code || ''}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                />
              </div>
            </div>
            
            <div className="form-row-clockwyz">
              <div className="form-field-clockwyz">
                <Label htmlFor="professor">Professor</Label>
                <Input
                  id="professor"
                  placeholder="Dr. Smith"
                  value={newCourse.professor || ''}
                  onChange={(e) => setNewCourse({ ...newCourse, professor: e.target.value })}
                />
              </div>
              <div className="form-field-clockwyz">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min="1"
                  max="6"
                  value={newCourse.credits || 3}
                  onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="form-row-clockwyz">
              <div className="form-field-clockwyz">
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  placeholder="Fall 2024"
                  value={newCourse.semester || ''}
                  onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
                />
              </div>
              <div className="form-field-clockwyz">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Engineering Building 101"
                  value={newCourse.location || ''}
                  onChange={(e) => setNewCourse({ ...newCourse, location: e.target.value })}
                />
              </div>
            </div>
            
            <div className="form-actions-clockwyz">
              <Button variant="outline" onClick={() => setShowAddCourse(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCourse}>
                Add Course
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Course Details Modal - Assignment Checklist */}
      <Dialog open={showCourseDetails} onOpenChange={setShowCourseDetails}>
        {selectedCourse && (
          <DialogContent className="course-checklist-modal-clockwyz">
            <DialogHeader>
              <DialogTitle className="checklist-modal-title-clockwyz">
                <div className="checklist-header-info-clockwyz">
                  <div className="course-badge-large-clockwyz" style={{ backgroundColor: selectedCourse.color }}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="course-title-info-clockwyz">
                    <h2>{selectedCourse.name}</h2>
                    <span>{selectedCourse.code} • {selectedCourse.professor}</span>
                  </div>
                </div>
                <div className="checklist-stats-clockwyz">
                  {(() => {
                    const stats = calculateCourseStats(selectedCourse);
                    return (
                      <div className="stats-summary-clockwyz">
                        <div className="stat-item-summary-clockwyz">
                          <span className="stat-number-summary-clockwyz">{stats.completedAssignments}</span>
                          <span className="stat-label-summary-clockwyz">Completed</span>
                        </div>
                        <div className="stat-item-summary-clockwyz">
                          <span className="stat-number-summary-clockwyz">{stats.upcomingDeadlines}</span>
                          <span className="stat-label-summary-clockwyz">Upcoming</span>
                        </div>
                        <div className="stat-item-summary-clockwyz">
                          <span className="stat-number-summary-clockwyz">{stats.currentGrade.toFixed(0)}%</span>
                          <span className="stat-label-summary-clockwyz">Grade</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="checklist-content-clockwyz">
              {/* Progress Overview */}
              <div className="progress-overview-clockwyz">
                {(() => {
                  const stats = calculateCourseStats(selectedCourse);
                  return (
                    <div className="progress-bar-container-clockwyz">
                      <div className="progress-info-clockwyz">
                        <span className="progress-label-clockwyz">Course Progress</span>
                        <span className="progress-percentage-clockwyz">{stats.completionRate.toFixed(0)}%</span>
                      </div>
                      <div className="progress-bar-large-clockwyz">
                        <div 
                          className="progress-fill-large-clockwyz"
                          style={{ 
                            width: `${stats.completionRate}%`,
                            backgroundColor: selectedCourse.color 
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Course Information */}
              <div className="course-info-section-clockwyz">
                <h3>Course Information</h3>
                <div className="info-grid-clockwyz">
                  <div className="info-item-clockwyz">
                    <User className="w-4 h-4" />
                    <span>{selectedCourse.professor}</span>
                  </div>
                  <div className="info-item-clockwyz">
                    <GraduationCap className="w-4 h-4" />
                    <span>{selectedCourse.credits} credits</span>
                  </div>
                  {selectedCourse.location && (
                    <div className="info-item-clockwyz">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedCourse.location}</span>
                    </div>
                  )}
                  <div className="info-item-clockwyz">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedCourse.semester}</span>
                  </div>
                </div>
                
                {selectedCourse.meetingTimes.length > 0 && (
                  <div className="meeting-times-clockwyz">
                    <h4 className="section-title-clockwyz">Meeting Times</h4>
                    {selectedCourse.meetingTimes.map((time, index) => (
                      <div key={index} className="meeting-time-clockwyz">
                        <span className="day-clockwyz">{time.day}</span>
                        <span className="time-clockwyz">{time.startTime} - {time.endTime}</span>
                        {time.location && <span className="location-clockwyz">{time.location}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignment Checklist */}
              <div className="assignments-checklist-clockwyz">
                <div className="checklist-header-clockwyz">
                  <h3>Assignments & Tasks</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSyllabusUpload(true)}
                      className="upload-syllabus-small-btn-clockwyz"
                    >
                      <Upload className="w-4 h-4" />
                      {selectedCourse.assignments.length === 0 ? 'Upload Syllabus' : 'Add from Syllabus'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManualAssignmentAdd}
                      className="manual-add-btn-clockwyz"
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </Button>
                  </div>
                </div>
                
                {selectedCourse.assignments.length > 0 ? (
                  <div className="checklist-items-clockwyz">
                    {selectedCourse.assignments
                      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                      .map((assignment) => (
                        <motion.div
                          key={assignment.id}
                          layout
                          className={cn(
                            "checklist-item-clockwyz",
                            assignment.completed && "completed"
                          )}
                        >
                          <div className="checklist-checkbox-wrapper-clockwyz">
                            <input
                              type="checkbox"
                              id={`assignment-${assignment.id}`}
                              checked={assignment.completed}
                              onChange={() => handleAssignmentToggle(assignment.id)}
                              className="checklist-checkbox-clockwyz"
                            />
                            <label 
                              htmlFor={`assignment-${assignment.id}`}
                              className="checkbox-custom-clockwyz"
                            >
                              {assignment.completed && <CheckCircle className="w-4 h-4" />}
                            </label>
                          </div>
                          
                          <div className="checklist-item-content-clockwyz">
                            <div className="assignment-main-info-clockwyz">
                              <h4 className={cn(
                                "assignment-title-checklist-clockwyz",
                                assignment.completed && "completed"
                              )}>
                                {assignment.title}
                              </h4>
                              <div className="assignment-badges-clockwyz">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "assignment-type-badge-clockwyz",
                                    assignment.type === 'exam' && "exam",
                                    assignment.type === 'project' && "project"
                                  )}
                                >
                                  {assignment.type}
                                </Badge>
                                {assignment.extractedFromSyllabus && (
                                  <Badge variant="secondary" className="ai-extracted-badge-clockwyz">
                                    <Brain className="w-3 h-3" />
                                    AI
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="assignment-meta-info-clockwyz">
                              <div className="due-date-info-clockwyz">
                                <Calendar className="w-4 h-4" />
                                <span className={cn(
                                  "due-date-text-clockwyz",
                                  new Date(assignment.dueDate) < new Date() && !assignment.completed && "overdue"
                                )}>
                                  Due {new Date(assignment.dueDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: new Date(assignment.dueDate).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                  })}
                                </span>
                              </div>
                              <div className="points-info-clockwyz">
                                <Target className="w-4 h-4" />
                                <span>{assignment.points} points</span>
                              </div>
                              {assignment.grade && (
                                <div className="grade-info-clockwyz">
                                  <Award className="w-4 h-4" />
                                  <span>{assignment.grade}/{assignment.points}</span>
                                </div>
                              )}
                            </div>
                            
                            {assignment.description && (
                              <p className="assignment-description-checklist-clockwyz">
                                {assignment.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="checklist-item-actions-clockwyz">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignmentEdit(assignment.id);
                              }}
                              className="assignment-action-btn-clockwyz"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignmentDelete(assignment.id);
                              }}
                              className="assignment-action-btn-clockwyz delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="empty-checklist-clockwyz">
                    <FileText className="empty-checklist-icon-clockwyz" />
                    <h4>No assignments or tasks yet</h4>
                    <p>Upload a syllabus to automatically extract assignments, or add them manually.</p>
                    <div className="empty-checklist-actions-clockwyz">
                      <Button
                        onClick={() => setShowSyllabusUpload(true)}
                        className="upload-empty-btn-clockwyz"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Syllabus
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleManualAssignmentAdd}
                        className="manual-add-btn-clockwyz"
                      >
                        <Plus className="w-4 h-4" />
                        Add Task
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Syllabus Upload Modal */}
      <Dialog open={showSyllabusUpload} onOpenChange={setShowSyllabusUpload}>
        <DialogContent className="syllabus-upload-modal-clockwyz">
          <DialogHeader>
            <DialogTitle>Upload Course Syllabus</DialogTitle>
          </DialogHeader>
          
          <div className="upload-content-clockwyz">
            {!syllabusFile ? (
              <div className="upload-area-clockwyz border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <div className="upload-placeholder-clockwyz">
                  <ImageIcon className="upload-icon-clockwyz w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Syllabus Image</h3>
                  <p className="text-gray-600 mb-4">Upload a photo or screenshot of your syllabus to automatically extract course information and assignments.</p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="upload-trigger-btn-clockwyz"
                  >
                    <Camera className="w-4 h-4" />
                    Select Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="file-preview-clockwyz space-y-4">
                <div className="file-info-clockwyz flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-gray-600" />
                  <div className="file-details-clockwyz">
                    <span className="file-name-clockwyz text-sm font-medium text-gray-900">{syllabusFile.name}</span>
                    <span className="file-size-clockwyz text-xs text-gray-600">
                      {(syllabusFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                
                {!isProcessing && !extractedData && (
                  <div className="process-actions-clockwyz flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSyllabusFile(null);
                        setExtractedData(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </Button>
                    <Button onClick={processSyllabus}>
                      <Brain className="w-4 h-4" />
                      Extract Information
                    </Button>
                  </div>
                )}
                
                {isProcessing && (
                  <div className="processing-state-clockwyz flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <div className="processing-text-clockwyz">
                      <span className="text-sm font-medium text-blue-900">Processing syllabus...</span>
                      <p className="text-xs text-blue-700 mt-1">Using AI to extract course and assignment information</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Extracted Data Review Modal */}
      <Dialog open={showExtractedData} onOpenChange={setShowExtractedData}>
        <DialogContent className="extracted-data-modal-clockwyz max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Extracted Information</DialogTitle>
          </DialogHeader>
          
          {extractedData && (
            <div className="extraction-results-clockwyz space-y-6">
              <div className="confidence-score-clockwyz p-4 bg-gray-50 rounded-lg">
                <div className="confidence-header-clockwyz flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 flex-1">AI Confidence Score</span>
                  <Badge 
                    variant={extractedData.confidence > 0.8 ? 'default' : 'secondary'}
                    className="confidence-badge-clockwyz text-xs font-semibold"
                  >
                    {(extractedData.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="confidence-bar-clockwyz w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="confidence-fill-clockwyz h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                    style={{ width: `${extractedData.confidence * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="extracted-assignments-clockwyz">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Found {extractedData.assignments.length} assignments:</h3>
                <div className="assignments-preview-clockwyz space-y-3">
                  {extractedData.assignments.map((assignment, index) => (
                    <div key={index} className="assignment-preview-clockwyz p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <div className="assignment-preview-header-clockwyz flex justify-between items-center mb-2">
                        <span className="assignment-preview-title-clockwyz text-sm font-medium text-gray-900">{assignment.title}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "confidence-indicator-clockwyz text-xs",
                            assignment.confidence && assignment.confidence > 0.8 ? 'border-green-200 text-green-700' : 'border-yellow-200 text-yellow-700'
                          )}
                        >
                          {assignment.confidence ? `${(assignment.confidence * 100).toFixed(0)}%` : 'Unknown'}
                        </Badge>
                      </div>
                      <div className="assignment-preview-details-clockwyz flex items-center gap-3 text-xs text-gray-600">
                        <span className="assignment-preview-type-clockwyz capitalize font-medium">{assignment.type}</span>
                        <span className="assignment-preview-due-clockwyz">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        <span className="assignment-preview-points-clockwyz">{assignment.points} points</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="extracted-text-preview-clockwyz p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Extracted Text Preview:</h4>
                <div className="text-preview-clockwyz text-xs text-gray-600 font-mono bg-white p-3 border rounded max-h-32 overflow-y-auto">
                  {extractedData.text.substring(0, 300)}
                  {extractedData.text.length > 300 && '...'}
                </div>
              </div>
              
              <div className="extraction-actions-clockwyz flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowExtractedData(false);
                    setExtractedData(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={confirmExtractedAssignments}>
                  <CheckCircle className="w-4 h-4" />
                  {selectedCourse ? 'Add Assignments' : 'Create Course'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}