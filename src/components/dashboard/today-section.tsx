'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Target,
  Zap,
  Coffee,
  Brain,
  CheckCircle,
  Plus,
  TrendingUp,
  Users,
  BookOpen,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  Sun,
  Moon,
  Sunrise,
  ArrowRight,
  ChevronRight,
  BarChart3,
  Award,
  Activity
} from 'lucide-react';

import { useScheduleStore } from '@/lib/store/schedule-store';
import { ScheduleEvent, EventType, Priority } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface MoodLevel {
  id: 'high' | 'medium' | 'low';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

interface QuickTask {
  id: string;
  title: string;
  duration: string;
  type: EventType;
  estimatedMinutes: number;
}

const moodLevels: MoodLevel[] = [
  {
    id: 'high',
    label: 'High Energy',
    icon: Zap,
    color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    description: 'Ready for deep work!'
  },
  {
    id: 'medium',
    label: 'Medium Energy',
    icon: Smile,
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    description: 'Good for regular tasks'
  },
  {
    id: 'low',
    label: 'Low Energy',
    icon: Coffee,
    color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    description: 'Time for quick wins'
  }
];

const quickTasksByMood = {
  high: [
    { id: '1', title: 'Work on CS project (deep focus)', duration: '2 hours', type: EventType.ASSIGNMENT, estimatedMinutes: 120 },
    { id: '2', title: 'Study for Physics exam', duration: '90 min', type: EventType.STUDY, estimatedMinutes: 90 },
    { id: '3', title: 'Write research paper outline', duration: '1 hour', type: EventType.ASSIGNMENT, estimatedMinutes: 60 },
  ],
  medium: [
    { id: '4', title: 'Review class notes', duration: '30 min', type: EventType.STUDY, estimatedMinutes: 30 },
    { id: '5', title: 'Organize project files', duration: '20 min', type: EventType.PERSONAL, estimatedMinutes: 20 },
    { id: '6', title: 'Respond to group chat', duration: '10 min', type: EventType.PERSONAL, estimatedMinutes: 10 },
  ],
  low: [
    { id: '7', title: 'Check and reply to emails', duration: '5 min', type: EventType.PERSONAL, estimatedMinutes: 5 },
    { id: '8', title: 'Update calendar for tomorrow', duration: '3 min', type: EventType.PERSONAL, estimatedMinutes: 3 },
    { id: '9', title: 'Tidy up workspace', duration: '8 min', type: EventType.PERSONAL, estimatedMinutes: 8 },
  ]
};

export function TodaySection() {
  const { events, updateEvent, addEvent } = useScheduleStore();
  const [selectedMood, setSelectedMood] = useState<'high' | 'medium' | 'low' | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Get today's events
  const today = new Date();
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate.toDateString() === today.toDateString();
  }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Handle task completion toggle
  const handleTaskToggle = (eventId: string, completed: boolean) => {
    updateEvent(eventId, { isCompleted: completed });
  };

  // Handle new task creation
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newEvent: ScheduleEvent = {
      id: Date.now().toString(),
      title: newTaskTitle,
      type: EventType.PERSONAL,
      startTime: new Date(),
      endTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour duration
      duration: 60,
      color: '#64748b',
      emoji: '📋',
      day: 'Today',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    addEvent(newEvent);
    setNewTaskTitle('');
  };

  // Categorize tasks
  const mainTasks = todayEvents.filter(e => 
    e.type === EventType.CLASS || 
    e.type === EventType.ASSIGNMENT || 
    e.type === EventType.FOCUS ||
    (e.priority && [Priority.HIGH, Priority.URGENT].includes(e.priority))
  );
  
  const secondaryTasks = todayEvents.filter(e => 
    !mainTasks.includes(e)
  );

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return { text: 'Good morning', icon: Sunrise };
    if (hour < 17) return { text: 'Good afternoon', icon: Sun };
    return { text: 'Good evening', icon: Moon };
  };

  const greeting = getGreeting();

  // Mock analytics data (replace with real data later)
  const yesterdayStats = {
    tasksCompleted: 7,
    totalTasks: 10,
    focusTime: 4.5,
    productivity: 85
  };

  const todayStats = {
    tasksCompleted: todayEvents.filter(e => e.isCompleted).length,
    totalTasks: todayEvents.length,
    focusTime: todayEvents.filter(e => e.type === EventType.FOCUS).reduce((acc, e) => acc + (e.duration / 60), 0),
    plannedFocus: 6
  };

  const handleMoodSelect = (mood: 'high' | 'medium' | 'low') => {
    setSelectedMood(selectedMood === mood ? null : mood);
  };

  const handleQuickTaskAdd = (task: QuickTask) => {
    const newEvent: ScheduleEvent = {
      id: Date.now().toString(),
      title: task.title,
      type: task.type,
      startTime: new Date(),
      endTime: new Date(Date.now() + task.estimatedMinutes * 60 * 1000),
      duration: task.estimatedMinutes,
      color: '#64748b',
      emoji: '⚡',
      day: 'Today',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    addEvent(newEvent);
  };

  return (
    <div className="today-section-flow-clockwyz">
      {/* Greeting & Motivation */}
      <div className="greeting-section-flow-clockwyz">
        <greeting.icon className="greeting-icon-flow-clockwyz" />
        <div className="greeting-content-flow-clockwyz">
          <h1 className="greeting-title-flow-clockwyz">{greeting.text}, Jane</h1>
          <p className="greeting-subtitle-flow-clockwyz">Let's get started on your tasks</p>
        </div>
      </div>

      {/* New Task Input */}
      <Card className="new-task-card-flow-clockwyz">
        <CardContent className="new-task-content-flow-clockwyz">
          <div className="new-task-input-wrapper-flow-clockwyz">
            <Input
              placeholder="Task title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              className="new-task-input-flow-clockwyz"
            />
            <Button 
              onClick={handleAddTask}
              className="new-task-btn-flow-clockwyz"
              disabled={!newTaskTitle.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Grid */}
      <div className="analytics-grid-flow-clockwyz">
        {/* Yesterday's Progress */}
        <Card className="analytics-card-flow-clockwyz yesterday">
          <CardHeader className="analytics-header-flow-clockwyz">
            <CardTitle className="analytics-title-flow-clockwyz">
              <BarChart3 className="w-4 h-4" />
              Yesterday's Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="analytics-content-flow-clockwyz">
            <div className="analytics-stat-flow-clockwyz">
              <div className="stat-main-flow-clockwyz">
                <span className="stat-number-flow-clockwyz">{yesterdayStats.tasksCompleted}</span>
                <span className="stat-total-flow-clockwyz">/{yesterdayStats.totalTasks}</span>
              </div>
              <span className="stat-label-flow-clockwyz">Tasks Completed</span>
            </div>
            <div className="analytics-metrics-flow-clockwyz">
              <div className="metric-item-flow-clockwyz">
                <Activity className="w-3 h-3" />
                <span>{yesterdayStats.focusTime}h Focus</span>
              </div>
              <div className="metric-item-flow-clockwyz">
                <Award className="w-3 h-3" />
                <span>{yesterdayStats.productivity}% Productive</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Progress */}
        <Card className="analytics-card-flow-clockwyz today">
          <CardHeader className="analytics-header-flow-clockwyz">
            <CardTitle className="analytics-title-flow-clockwyz">
              <Target className="w-4 h-4" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="analytics-content-flow-clockwyz">
            <div className="analytics-stat-flow-clockwyz">
              <div className="stat-main-flow-clockwyz">
                <span className="stat-number-flow-clockwyz">{todayStats.tasksCompleted}</span>
                <span className="stat-total-flow-clockwyz">/{todayStats.totalTasks}</span>
              </div>
              <span className="stat-label-flow-clockwyz">Tasks Completed</span>
            </div>
            <div className="analytics-metrics-flow-clockwyz">
              <div className="metric-item-flow-clockwyz">
                <Brain className="w-3 h-3" />
                <span>{todayStats.focusTime.toFixed(1)}h/{todayStats.plannedFocus}h Focus</span>
              </div>
              <div className="metric-item-flow-clockwyz">
                <Clock className="w-3 h-3" />
                <span>{Math.round((todayStats.tasksCompleted / Math.max(todayStats.totalTasks, 1)) * 100)}% Complete</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Lists */}
      <div className="tasks-section-flow-clockwyz">
        {/* Main Tasks */}
        <Card className="tasks-card-flow-clockwyz main">
          <CardHeader className="tasks-header-flow-clockwyz">
            <CardTitle className="tasks-title-flow-clockwyz">
              <Target className="w-4 h-4" />
              Main Tasks
              <Badge variant="secondary" className="tasks-count-badge-flow-clockwyz">
                {mainTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="tasks-content-flow-clockwyz">
            {mainTasks.length > 0 ? (
              <div className="tasks-list-flow-clockwyz">
                {mainTasks.map((task) => (
                  <div key={task.id} className="task-item-flow-clockwyz main">
                    <div className="task-checkbox-wrapper-flow-clockwyz">
                      <input
                        type="checkbox"
                        id={`main-task-${task.id}`}
                        checked={task.isCompleted || false}
                        onChange={(e) => handleTaskToggle(task.id, e.target.checked)}
                        className="task-checkbox-flow-clockwyz"
                      />
                      <label htmlFor={`main-task-${task.id}`} className="checkbox-label-flow-clockwyz"></label>
                    </div>
                    <div className="task-content-wrapper-flow-clockwyz">
                      <div className="task-title-row-flow-clockwyz">
                        <span className="task-emoji-flow-clockwyz">{task.emoji || '📋'}</span>
                        <span className={cn("task-title-flow-clockwyz", task.isCompleted && "completed")}>
                          {task.title}
                        </span>
                        {task.priority === Priority.HIGH && (
                          <Badge variant="destructive" className="priority-badge-flow-clockwyz">High</Badge>
                        )}
                      </div>
                      <div className="task-meta-flow-clockwyz">
                        <span className="task-time-flow-clockwyz">
                          {task.startTime.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                          })}
                        </span>
                        {task.location && (
                          <span className="task-location-flow-clockwyz">• {task.location}</span>
                        )}
                        {task.course && (
                          <span className="task-course-flow-clockwyz">• {task.course}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-tasks-flow-clockwyz">
                <Target className="empty-icon-flow-clockwyz" />
                <span>No main tasks for today</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Secondary Tasks */}
        <Card className="tasks-card-flow-clockwyz secondary">
          <CardHeader className="tasks-header-flow-clockwyz">
            <CardTitle className="tasks-title-flow-clockwyz">
              <CheckCircle className="w-4 h-4" />
              Secondary Tasks
              <Badge variant="outline" className="tasks-count-badge-flow-clockwyz">
                {secondaryTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="tasks-content-flow-clockwyz">
            {secondaryTasks.length > 0 ? (
              <div className="tasks-list-flow-clockwyz">
                {secondaryTasks.map((task) => (
                  <div key={task.id} className="task-item-flow-clockwyz secondary">
                    <div className="task-checkbox-wrapper-flow-clockwyz">
                      <input
                        type="checkbox"
                        id={`secondary-task-${task.id}`}
                        checked={task.isCompleted || false}
                        onChange={(e) => handleTaskToggle(task.id, e.target.checked)}
                        className="task-checkbox-flow-clockwyz secondary"
                      />
                      <label htmlFor={`secondary-task-${task.id}`} className="checkbox-label-flow-clockwyz"></label>
                    </div>
                    <div className="task-content-wrapper-flow-clockwyz">
                      <div className="task-title-row-flow-clockwyz">
                        <span className="task-emoji-flow-clockwyz">{task.emoji || '📝'}</span>
                        <span className={cn("task-title-flow-clockwyz", task.isCompleted && "completed")}>
                          {task.title}
                        </span>
                      </div>
                      <div className="task-meta-flow-clockwyz">
                        <span className="task-time-flow-clockwyz">
                          {task.startTime.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                          })}
                        </span>
                        {task.location && (
                          <span className="task-location-flow-clockwyz">• {task.location}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-tasks-flow-clockwyz">
                <CheckCircle className="empty-icon-flow-clockwyz" />
                <span>No secondary tasks for today</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mood-Based Task Suggestions */}
      <Card className="mood-tasks-card-flow-clockwyz">
        <CardHeader className="mood-header-flow-clockwyz">
          <CardTitle className="mood-title-flow-clockwyz">
            <Smile className="w-4 h-4" />
            How are you feeling?
          </CardTitle>
        </CardHeader>
        <CardContent className="mood-content-flow-clockwyz">
          <div className="mood-selector-flow-clockwyz">
            {moodLevels.map((mood) => (
              <Button
                key={mood.id}
                variant={selectedMood === mood.id ? "default" : "outline"}
                className={cn(
                  "mood-button-flow-clockwyz",
                  selectedMood === mood.id && mood.color
                )}
                onClick={() => handleMoodSelect(mood.id)}
              >
                <mood.icon className="w-4 h-4" />
                <span>{mood.label}</span>
              </Button>
            ))}
          </div>

          <AnimatePresence>
            {selectedMood && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mood-suggestions-flow-clockwyz"
              >
                <div className="suggestions-header-flow-clockwyz">
                  <span className="suggestions-title-flow-clockwyz">
                    {selectedMood === 'low' ? '😴 Quick wins to get started:' :
                     selectedMood === 'medium' ? '😊 Good energy for these:' :
                     '⚡ Perfect for deep work:'}
                  </span>
                </div>
                <div className="quick-tasks-list-flow-clockwyz">
                  {quickTasksByMood[selectedMood].map((task) => (
                    <div key={task.id} className="quick-task-item-flow-clockwyz">
                      <div className="quick-task-info-flow-clockwyz">
                        <span className="quick-task-title-flow-clockwyz">{task.title}</span>
                        <span className="quick-task-duration-flow-clockwyz">{task.duration}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleQuickTaskAdd(task)}
                        className="add-quick-task-btn-flow-clockwyz"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}