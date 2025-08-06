'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  Flag,
  Zap,
  Brain,
  Users,
  BookOpen,
  Star,
  ArrowRight,
  Filter,
  SortAsc,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  Flame,
  Trophy,
  TrendingUp
} from 'lucide-react';

import { useScheduleStore } from '@/lib/store/schedule-store';
import { ScheduleEvent, EventType, Priority } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  urgency: 'high' | 'medium' | 'low';
  importance: 'high' | 'medium' | 'low';
  deadline?: Date;
  estimatedTime: number; // in minutes
  category: TaskCategory;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  tags: string[];
  createdAt: Date;
  completedAt?: Date;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'personal' | 'career';
  targetDate: Date;
  progress: number; // 0-100
  tasks: string[]; // task IDs
  priority: Priority;
}

type TaskCategory = 'academic' | 'personal' | 'work' | 'health' | 'social';
type ViewMode = 'matrix' | 'list' | 'goals' | 'deadlines';
type FilterMode = 'all' | 'pending' | 'in-progress' | 'completed' | 'overdue';

export function PrioritiesSection() {
  const { events, addEvent, updateEvent } = useScheduleStore();
  const [viewMode, setViewMode] = useState<ViewMode>('matrix');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  // Mock tasks data (replace with real data from store)
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete CS Assignment #3',
      description: 'Implement binary search tree with AVL balancing',
      priority: Priority.HIGH,
      urgency: 'high',
      importance: 'high',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      estimatedTime: 180,
      category: 'academic',
      status: 'in-progress',
      tags: ['programming', 'data-structures'],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Study for Physics Midterm',
      description: 'Review chapters 8-12, practice problems',
      priority: Priority.HIGH,
      urgency: 'medium',
      importance: 'high',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      estimatedTime: 240,
      category: 'academic',
      status: 'pending',
      tags: ['physics', 'exam'],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      title: 'Plan birthday party',
      description: 'Book venue, send invitations, order cake',
      priority: Priority.MEDIUM,
      urgency: 'medium',
      importance: 'medium',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estimatedTime: 120,
      category: 'personal',
      status: 'pending',
      tags: ['social', 'planning'],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '4',
      title: 'Update resume',
      description: 'Add recent projects and internship experience',
      priority: Priority.LOW,
      urgency: 'low',
      importance: 'high',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      estimatedTime: 60,
      category: 'work',
      status: 'pending',
      tags: ['career', 'documentation'],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '5',
      title: 'Weekly grocery shopping',
      description: 'Buy ingredients for meal prep',
      priority: Priority.MEDIUM,
      urgency: 'high',
      importance: 'low',
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      estimatedTime: 45,
      category: 'personal',
      status: 'pending',
      tags: ['shopping', 'routine'],
      createdAt: new Date()
    },
    {
      id: '6',
      title: 'Organize digital photos',
      description: 'Sort and backup photos from last semester',
      priority: Priority.LOW,
      urgency: 'low',
      importance: 'low',
      deadline: undefined,
      estimatedTime: 90,
      category: 'personal',
      status: 'pending',
      tags: ['organization', 'digital'],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  ]);

  // Mock goals data
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Maintain 3.8+ GPA this semester',
      description: 'Focus on consistent study habits and assignment completion',
      category: 'academic',
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      progress: 78,
      tasks: ['1', '2'],
      priority: Priority.HIGH
    },
    {
      id: '2',
      title: 'Land summer internship',
      description: 'Apply to 20+ companies, prepare for technical interviews',
      category: 'career',
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      progress: 45,
      tasks: ['4'],
      priority: Priority.HIGH
    },
    {
      id: '3',
      title: 'Build healthy morning routine',
      description: 'Exercise 4x/week, consistent sleep schedule, healthy breakfast',
      category: 'personal',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      progress: 62,
      tasks: [],
      priority: Priority.MEDIUM
    }
  ]);

  // Filter tasks based on current filter
  const filteredTasks = tasks.filter(task => {
    switch (filterMode) {
      case 'pending':
        return task.status === 'pending';
      case 'in-progress':
        return task.status === 'in-progress';
      case 'completed':
        return task.status === 'completed';
      case 'overdue':
        return task.deadline && task.deadline < new Date() && task.status !== 'completed';
      default:
        return true;
    }
  });

  // Eisenhower Matrix categorization
  const getMatrixQuadrant = (task: Task) => {
    const isUrgent = task.urgency === 'high';
    const isImportant = task.importance === 'high';
    
    if (isUrgent && isImportant) return 'do-first';
    if (!isUrgent && isImportant) return 'schedule';
    if (isUrgent && !isImportant) return 'delegate';
    return 'eliminate';
  };

  const matrixQuadrants = {
    'do-first': filteredTasks.filter(task => getMatrixQuadrant(task) === 'do-first'),
    'schedule': filteredTasks.filter(task => getMatrixQuadrant(task) === 'schedule'),
    'delegate': filteredTasks.filter(task => getMatrixQuadrant(task) === 'delegate'),
    'eliminate': filteredTasks.filter(task => getMatrixQuadrant(task) === 'eliminate')
  };

  // Upcoming deadlines
  const upcomingDeadlines = tasks
    .filter(task => task.deadline && task.status !== 'completed')
    .sort((a, b) => (a.deadline!.getTime() - b.deadline!.getTime()))
    .slice(0, 5);

  // Task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue: tasks.filter(t => t.deadline && t.deadline < new Date() && t.status !== 'completed').length,
    completionRate: Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
  };

  const handleTaskStatusChange = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status, completedAt: status === 'completed' ? new Date() : undefined }
        : task
    ));
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      priority: Priority.MEDIUM,
      urgency: 'medium',
      importance: 'medium',
      estimatedTime: 60,
      category: 'personal',
      status: 'pending',
      tags: [],
      createdAt: new Date()
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setShowNewTaskForm(false);
  };

  const formatTimeEstimate = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const formatDeadline = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
      case Priority.URGENT:
        return 'text-red-600 bg-red-50 border-red-200';
      case Priority.MEDIUM:
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case Priority.LOW:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'academic': return BookOpen;
      case 'work': return Users;
      case 'personal': return Star;
      case 'health': return Zap;
      case 'social': return Users;
      default: return Circle;
    }
  };

  return (
    <div className="priorities-section-clockwyz">
      {/* Header */}
      <div className="priorities-header-clockwyz">
        <div className="priorities-title-section-clockwyz">
          <h1 className="priorities-main-title-clockwyz">Priorities & Goals</h1>
          <p className="priorities-subtitle-clockwyz">Organize tasks by importance and urgency</p>
        </div>
        <div className="priorities-controls-clockwyz">
          <div className="view-selector-clockwyz">
            {(['matrix', 'list', 'goals', 'deadlines'] as ViewMode[]).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "outline"}
                onClick={() => setViewMode(mode)}
                className="view-btn-clockwyz"
                size="sm"
              >
                {mode === 'matrix' ? 'Matrix' :
                 mode === 'list' ? 'List' :
                 mode === 'goals' ? 'Goals' : 'Deadlines'}
              </Button>
            ))}
          </div>
          <Button 
            onClick={() => setShowNewTaskForm(true)}
            className="add-task-btn-priorities-clockwyz"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats-priorities-clockwyz">
        <div className="stat-item-priorities-clockwyz">
          <div className="stat-icon-priorities-clockwyz completed">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="stat-content-priorities-clockwyz">
            <span className="stat-number-priorities-clockwyz">{taskStats.completed}</span>
            <span className="stat-label-priorities-clockwyz">Completed</span>
          </div>
        </div>
        <div className="stat-item-priorities-clockwyz">
          <div className="stat-icon-priorities-clockwyz progress">
            <Clock className="w-4 h-4" />
          </div>
          <div className="stat-content-priorities-clockwyz">
            <span className="stat-number-priorities-clockwyz">{taskStats.inProgress}</span>
            <span className="stat-label-priorities-clockwyz">In Progress</span>
          </div>
        </div>
        <div className="stat-item-priorities-clockwyz">
          <div className="stat-icon-priorities-clockwyz overdue">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="stat-content-priorities-clockwyz">
            <span className="stat-number-priorities-clockwyz">{taskStats.overdue}</span>
            <span className="stat-label-priorities-clockwyz">Overdue</span>
          </div>
        </div>
        <div className="stat-item-priorities-clockwyz">
          <div className="stat-icon-priorities-clockwyz rate">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="stat-content-priorities-clockwyz">
            <span className="stat-number-priorities-clockwyz">{taskStats.completionRate}%</span>
            <span className="stat-label-priorities-clockwyz">Success Rate</span>
          </div>
        </div>
      </div>

      {/* Eisenhower Matrix View */}
      {viewMode === 'matrix' && (
        <div className="matrix-container-clockwyz">
          <div className="matrix-grid-clockwyz">
            {/* Do First - Urgent & Important */}
            <Card className="matrix-quadrant-clockwyz do-first">
              <CardHeader className="matrix-header-clockwyz">
                <CardTitle className="matrix-title-clockwyz">
                  <Flag className="w-4 h-4 text-red-600" />
                  Do First
                  <Badge variant="secondary">{matrixQuadrants['do-first'].length}</Badge>
                </CardTitle>
                <p className="matrix-subtitle-clockwyz">Urgent & Important</p>
              </CardHeader>
              <CardContent className="matrix-content-clockwyz">
                {matrixQuadrants['do-first'].map(task => (
                  <TaskCard key={task.id} task={task} onStatusChange={handleTaskStatusChange} />
                ))}
                {matrixQuadrants['do-first'].length === 0 && (
                  <div className="empty-quadrant-clockwyz">
                    <CheckCircle className="w-6 h-6" />
                    <span>Great! No urgent tasks</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule - Not Urgent & Important */}
            <Card className="matrix-quadrant-clockwyz schedule">
              <CardHeader className="matrix-header-clockwyz">
                <CardTitle className="matrix-title-clockwyz">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Schedule
                  <Badge variant="secondary">{matrixQuadrants['schedule'].length}</Badge>
                </CardTitle>
                <p className="matrix-subtitle-clockwyz">Not Urgent & Important</p>
              </CardHeader>
              <CardContent className="matrix-content-clockwyz">
                {matrixQuadrants['schedule'].map(task => (
                  <TaskCard key={task.id} task={task} onStatusChange={handleTaskStatusChange} />
                ))}
                {matrixQuadrants['schedule'].length === 0 && (
                  <div className="empty-quadrant-clockwyz">
                    <Target className="w-6 h-6" />
                    <span>Plan important tasks</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delegate - Urgent & Not Important */}
            <Card className="matrix-quadrant-clockwyz delegate">
              <CardHeader className="matrix-header-clockwyz">
                <CardTitle className="matrix-title-clockwyz">
                  <Users className="w-4 h-4 text-orange-600" />
                  Delegate
                  <Badge variant="secondary">{matrixQuadrants['delegate'].length}</Badge>
                </CardTitle>
                <p className="matrix-subtitle-clockwyz">Urgent & Not Important</p>
              </CardHeader>
              <CardContent className="matrix-content-clockwyz">
                {matrixQuadrants['delegate'].map(task => (
                  <TaskCard key={task.id} task={task} onStatusChange={handleTaskStatusChange} />
                ))}
                {matrixQuadrants['delegate'].length === 0 && (
                  <div className="empty-quadrant-clockwyz">
                    <Users className="w-6 h-6" />
                    <span>No delegation needed</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Eliminate - Not Urgent & Not Important */}
            <Card className="matrix-quadrant-clockwyz eliminate">
              <CardHeader className="matrix-header-clockwyz">
                <CardTitle className="matrix-title-clockwyz">
                  <Trash2 className="w-4 h-4 text-gray-600" />
                  Eliminate
                  <Badge variant="secondary">{matrixQuadrants['eliminate'].length}</Badge>
                </CardTitle>
                <p className="matrix-subtitle-clockwyz">Not Urgent & Not Important</p>
              </CardHeader>
              <CardContent className="matrix-content-clockwyz">
                {matrixQuadrants['eliminate'].map(task => (
                  <TaskCard key={task.id} task={task} onStatusChange={handleTaskStatusChange} />
                ))}
                {matrixQuadrants['eliminate'].length === 0 && (
                  <div className="empty-quadrant-clockwyz">
                    <CheckCircle className="w-6 h-6" />
                    <span>No time wasters!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Goals View */}
      {viewMode === 'goals' && (
        <div className="goals-container-clockwyz">
          <div className="goals-grid-clockwyz">
            {goals.map(goal => (
              <Card key={goal.id} className="goal-card-clockwyz">
                <CardHeader className="goal-header-clockwyz">
                  <div className="goal-title-row-clockwyz">
                    <CardTitle className="goal-title-clockwyz">{goal.title}</CardTitle>
                    <Badge className={getPriorityColor(goal.priority)}>
                      {goal.priority}
                    </Badge>
                  </div>
                  <p className="goal-description-clockwyz">{goal.description}</p>
                </CardHeader>
                <CardContent className="goal-content-clockwyz">
                  <div className="goal-progress-section-clockwyz">
                    <div className="progress-header-clockwyz">
                      <span className="progress-label-clockwyz">Progress</span>
                      <span className="progress-percentage-clockwyz">{goal.progress}%</span>
                    </div>
                    <div className="progress-bar-goal-clockwyz">
                      <div 
                        className="progress-fill-goal-clockwyz"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="goal-meta-clockwyz">
                    <div className="goal-deadline-clockwyz">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDeadline(goal.targetDate)}</span>
                    </div>
                    <div className="goal-tasks-clockwyz">
                      <Target className="w-4 h-4" />
                      <span>{goal.tasks.length} tasks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Deadlines View */}
      {viewMode === 'deadlines' && (
        <Card className="deadlines-card-clockwyz">
          <CardHeader>
            <CardTitle className="deadlines-title-clockwyz">
              <AlertTriangle className="w-5 h-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="deadlines-list-clockwyz">
              {upcomingDeadlines.map(task => (
                <div key={task.id} className="deadline-item-clockwyz">
                  <div className="deadline-task-info-clockwyz">
                    <span className="deadline-task-title-clockwyz">{task.title}</span>
                    <div className="deadline-task-meta-clockwyz">
                      <Badge className={getPriorityColor(task.priority)} >
                        {task.priority}
                      </Badge>
                      <span className="deadline-category-clockwyz">{task.category}</span>
                      <span className="deadline-estimate-clockwyz">
                        {formatTimeEstimate(task.estimatedTime)}
                      </span>
                    </div>
                  </div>
                  <div className={cn(
                    "deadline-time-clockwyz",
                    task.deadline && task.deadline.getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 ? 'urgent' : ''
                  )}>
                    {task.deadline && formatDeadline(task.deadline)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Task Form Modal */}
      <AnimatePresence>
        {showNewTaskForm && (
          <>
            <motion.div
              className="task-form-backdrop-clockwyz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewTaskForm(false)}
            />
            <motion.div
              className="task-form-modal-clockwyz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Add New Task</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="task-form-content-clockwyz">
                    <Input
                      placeholder="Task title"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                      className="task-title-input-clockwyz"
                    />
                    <div className="task-form-actions-clockwyz">
                      <Button variant="outline" onClick={() => setShowNewTaskForm(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
                        Add Task
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Task Card Component
function TaskCard({ 
  task, 
  onStatusChange 
}: { 
  task: Task; 
  onStatusChange: (taskId: string, status: Task['status']) => void; 
}) {
  const [isCompleted, setIsCompleted] = useState(task.status === 'completed');
  
  const handleToggle = () => {
    const newStatus = isCompleted ? 'pending' : 'completed';
    setIsCompleted(!isCompleted);
    onStatusChange(task.id, newStatus);
  };

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'academic': return BookOpen;
      case 'work': return Users;
      case 'personal': return Star;
      case 'health': return Zap;
      case 'social': return Users;
      default: return Circle;
    }
  };

  const CategoryIcon = getCategoryIcon(task.category);

  return (
    <div className={cn("task-card-clockwyz", isCompleted && "completed")}>
      <div className="task-card-header-clockwyz">
        <div className="task-checkbox-priorities-clockwyz">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={handleToggle}
            className="checkbox-priorities-clockwyz"
          />
        </div>
        <div className="task-card-content-clockwyz">
          <h4 className={cn("task-card-title-clockwyz", isCompleted && "line-through")}>
            {task.title}
          </h4>
          {task.description && (
            <p className="task-card-description-clockwyz">{task.description}</p>
          )}
        </div>
      </div>
      <div className="task-card-footer-clockwyz">
        <div className="task-card-meta-clockwyz">
          <div className="task-category-clockwyz">
            <CategoryIcon className="w-3 h-3" />
            <span>{task.category}</span>
          </div>
          {task.deadline && (
            <div className="task-deadline-clockwyz">
              <Clock className="w-3 h-3" />
              <span>{new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          <div className="task-estimate-clockwyz">
            {Math.floor(task.estimatedTime / 60) > 0 && `${Math.floor(task.estimatedTime / 60)}h `}
            {task.estimatedTime % 60 > 0 && `${task.estimatedTime % 60}m`}
          </div>
        </div>
      </div>
    </div>
  );
}