'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  Settings,
  Filter,
  MoreHorizontal,
  Target,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Search,
  Bell,
  User,
  Zap,
  BookOpen,
  Brain,
  Coffee,
  Users,
  Edit,
  Trash2,
  Copy,
  Move,
  RotateCcw,
  CheckCircle,
  XCircle,
  Home,
  BarChart3,
  GraduationCap,
  Save,
  Scale,
  Sun,
  X
} from 'lucide-react';



// Import store and types
import { useScheduleStore } from '@/lib/store/schedule-store';
import { ScheduleEvent, EventType, Priority, TimeSlot, DragState, PlanWorkData,
    DayOption,
    RecurrenceOption } from '@/types/schedule';
import { cn, formatTime, parseTime, timeToPixels, pixelsToTime } from '@/lib/utils/index';

// Import UI components
import { useAIContext } from '@/hooks/use-ai-context';
import { AIAssistantButton } from '@/components/ai/ai-assistant-button';
import { AIChatInterface } from '@/components/ai/ai-chat-interface';
import { TodaySection } from '@/components/dashboard/today-section';
import { StatsSection } from '@/components/dashboard/stats-section';
import { PrioritiesSection } from "@/components/dashboard/priorities-section";
import { CoursesSection } from '@/components/dashboard/courses-section';
import { HabitsSection } from '@/components/dashboard/habits-section';
import { MeetingsSection } from '@/components/dashboard/meetings-section';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import '@/styles/clockwyz.css';

interface QuickEventData {
  title: string;
  type: EventType;
  startTime: string;
  endTime: string;
  day: string;
}

export function EnhancedScheduleGrid() {
  // Store state
  const {
    events,
    selectedEvent,
    dragState,
    currentWeek,
    viewMode,
    filterType,
    addEvent,
    updateEvent,
    deleteEvent,
    setSelectedEvent,
    setDragState,
    setCurrentWeek,
    setViewMode,
    setFilterType,
  } = useScheduleStore();

  // Local state for UI interactions
  const [currentView, setCurrentView] = useState('today'); // Changed from 'planner' to 'today'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isHologramMode, setIsHologramMode] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [showEventMenu, setShowEventMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const { setCurrentSection, trackAction, setSelectedItems } = useAIContext()

// Simple effect without function dependencies
useEffect(() => {
  setCurrentSection(currentView);
}, [currentView]); // Remove function dependencies

// Separate effect for tracking (optional)
useEffect(() => {
  trackAction('section_changed', { section: currentView });
}, [currentView]); 
  

  const [isDragInitiated, setIsDragInitiated] = useState(false);
    const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });

  // Quick event form state
  const [selectedSlot, setSelectedSlot] = useState<{ 
    day: string; 
    startTime: string; 
    endTime: string; 
    x: number; 
    y: number 
  } | null>(null);
  const [showQuickEventForm, setShowQuickEventForm] = useState(false);
  const [quickEventData, setQuickEventData] = useState<QuickEventData>({
    title: '',
    type: EventType.FOCUS,
    startTime: '',
    endTime: '',
    day: ''
  });
  const [previewEvent, setPreviewEvent] = useState<ScheduleEvent | null>(null);
  const [eventDuration, setEventDuration] = useState(15);

  // Navigation items
  const navigationItems = [
    { id: 'today', label: 'Today', icon: Sun },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'priorities', label: 'Priorities', icon: Scale },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    // { id: 'focus', label: 'Focus', icon: Brain, badge: 'New' },
    { id: 'habits', label: 'Habits', icon: CheckCircle },
    { id: 'courses', label: 'Courses', icon: GraduationCap },
    { id: 'meetings', label: 'Meetings', icon: Users }
  ];

  // Generate time slots (6 AM to 11 PM)
  const timeSlots: TimeSlot[] = Array.from({ length: 24 }, (_, i) => {
    const hour = i; // 0 to 23
    return {
      hour,
      label: hour === 0 ? '12am' : 
             hour < 12 ? `${hour}am` : 
             hour === 12 ? '12pm' : 
             `${hour - 12}pm`,
      height: 64
    };
  });

  // Days of the week
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const getWeekDates = () => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
    
    return weekDays.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return {
        day,
        date: date.getDate(),
        fullDate: date,
        isToday: date.toDateString() === new Date().toDateString(),
        isWeekend: index >= 5
      };
    });
  };

  const weekDates = getWeekDates();

  // Initialize with sample events
  useEffect(() => {
    if (events.length === 0) {
      const sampleEvents: ScheduleEvent[] = [
        {
          id: '1',
          title: 'Calculus II Lecture',
          type: EventType.CLASS,
          startTime: new Date('2024-01-15T09:00:00'),
          endTime: new Date('2024-01-15T10:30:00'),
          duration: 90,
          color: '#3b82f6',
          emoji: '📐',
          course: 'MATH 201',
          location: 'Room 204',
          day: 'Mon',
          userId: 'user1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          title: 'Study Block - Physics',
          type: EventType.FOCUS,
          startTime: new Date('2024-01-15T11:00:00'),
          endTime: new Date('2024-01-15T13:00:00'),
          duration: 120,
          color: '#10b981',
          emoji: '🎯',
          isLocked: true,
          day: 'Mon',
          userId: 'user1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          title: 'CS Project Work',
          type: EventType.ASSIGNMENT,
          startTime: new Date('2024-01-15T14:00:00'),
          endTime: new Date('2024-01-15T16:00:00'),
          duration: 120,
          color: '#8b5cf6',
          emoji: '💻',
          priority: Priority.HIGH,
          day: 'Mon',
          userId: 'user1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      sampleEvents.forEach(event => addEvent(event));
    }
  }, [events.length, addEvent]);

  // Academic stats
  const academicStats = {
    weeklyFocus: { current: 28, target: 30 },
    studyHours: { current: 15, target: 20 },
    assignmentsDue: 3,
    upcomingExams: 2,
    gpa: 3.7,
    completionRate: 85
  };

  const handleSidebarMouseEnter = () => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    // Expand immediately on hover
    setSidebarCollapsed(false);
  };
  
  const handleSidebarMouseLeave = () => {
    // Set a delay before collapsing
    const timeout = setTimeout(() => {
      setSidebarCollapsed(true);
    }, 300); // 300ms delay
    
    setHoverTimeout(timeout);
  };

  // Handle cell click for 15-minute slot selection
  const handleCellClick = (day: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (dragState.isDragging || showQuickEventForm) return;
  
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = document.querySelector('.schedule-container-clockwyz')?.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
  
    const relativeY = e.clientY - rect.top;
    const { hour, minute } = pixelsToTime(relativeY);
  
    const startHour = hour;
    const startMinute = minute;
    const endMinute = minute + 15;
    const endHour = endMinute >= 60 ? hour + 1 : hour;
    const adjustedEndMinute = endMinute >= 60 ? 0 : endMinute;
  
    const startTime = formatTime(startHour, startMinute);
    const endTime = formatTime(endHour, adjustedEndMinute);
  
    // Calculate popup dimensions (approximate)
    const popupWidth = 300;
    const popupHeight = 300;
    
    // Get the click position relative to the viewport
    const clickX = e.clientX;
    const clickY = e.clientY;
    
    // Calculate optimal position
    let popupX = clickX - (popupWidth / 2); // Center horizontally on click
    let popupY = clickY - 100; // Position above click point
    
    // Adjust for right edge overflow
    if (popupX + popupWidth > viewportWidth - 20) {
      popupX = viewportWidth - popupWidth - 20;
    }
    
    // Adjust for left edge overflow
    if (popupX < 20) {
      popupX = 20;
    }
    
    // Adjust for top edge overflow
    if (popupY < 20) {
      popupY = clickY + 20; // Position below click point instead
    }
    
    // Adjust for bottom edge overflow
    if (popupY + popupHeight > viewportHeight - 20) {
      popupY = viewportHeight - popupHeight - 20;
    }
    
    console.log('Popup positioning:', {
      clickPosition: { x: clickX, y: clickY },
      calculatedPosition: { x: popupX, y: popupY },
      viewport: { width: viewportWidth, height: viewportHeight },
      popup: { width: popupWidth, height: popupHeight }
    });
  
    setSelectedSlot({ day, startTime, endTime, x: popupX, y: popupY });
    setQuickEventData({
      title: '',
      type: EventType.FOCUS,
      startTime,
      endTime,
      day
    });
    setEventDuration(15);
  
    // Create initial preview event
    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);
    const endDate = new Date();
    endDate.setHours(endHour, adjustedEndMinute, 0, 0);
  
    const preview: ScheduleEvent = {
      id: 'preview',
      title: '',
      type: EventType.FOCUS,
      startTime: startDate,
      endTime: endDate,
      duration: 15,
      color: getColorForType(EventType.FOCUS),
      day,
      emoji: getEmojiForType(EventType.FOCUS),
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPreviewEvent(preview);
    setShowQuickEventForm(true);
  };

  // Update preview event when form data changes
  const updatePreviewEvent = (updates: Partial<QuickEventData> | { duration?: number }) => {
    if (!previewEvent || !selectedSlot) return;
    
    let newData = { ...quickEventData };
    let newDuration = eventDuration;
    
    if ('duration' in updates) {
      newDuration = updates.duration!;
      setEventDuration(newDuration);
      
      // Recalculate end time based on new duration
      const startTime = parseTime(selectedSlot.startTime);
      const startMinutes = startTime.hour * 60 + startTime.minute;
      const endMinutes = startMinutes + newDuration;
      const endHour = Math.floor(endMinutes / 60);
      const endMinute = endMinutes % 60;
      const newEndTime = formatTime(endHour, endMinute);
      
      newData = { ...newData, endTime: newEndTime };
      setQuickEventData(newData);
    } else {
      newData = { ...newData, ...updates };
      setQuickEventData(newData);
    }
    
    // Create updated preview with proper Date objects
    const startTime = parseTime(selectedSlot.startTime);
    const startDate = new Date();
    startDate.setHours(startTime.hour, startTime.minute, 0, 0);
    
    const endMinutes = (startTime.hour * 60 + startTime.minute) + newDuration;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    const endDate = new Date();
    endDate.setHours(endHour, endMinute, 0, 0);
    
    const updatedPreview: ScheduleEvent = {
      ...previewEvent,
      title: newData.title || '',
      type: newData.type,
      startTime: startDate,
      endTime: endDate,
      duration: newDuration,
      color: getColorForType(newData.type),
      emoji: getEmojiForType(newData.type)
    };
    
    setPreviewEvent(updatedPreview);
  };

  // Handle drag start
  const handleDragStart = (event: ScheduleEvent, e: React.MouseEvent) => {
    if (event.isLocked) return;
    
    e.preventDefault();
    setDragState({
      isDragging: true,
      draggedEvent: event,
      initialPosition: { x: e.clientX, y: e.clientY },
      currentPosition: { x: e.clientX, y: e.clientY },
      targetSlot: null
    });
  };

  // Handle drag move
  const handleDragMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging) return;
    
    setDragState({
      ...dragState,
      currentPosition: { x: e.clientX, y: e.clientY }
    });
  };

  // Handle drag end
  const handleDragEnd = (e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedEvent) return;
    
    const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
    const dayColumn = elementBelow?.closest('[data-day]');
    
    if (dayColumn) {
      const targetDay = dayColumn.getAttribute('data-day');
      const rect = dayColumn.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const { hour, minute } = pixelsToTime(relativeY);
      
      const updatedEvent = {
        ...dragState.draggedEvent,
        day: targetDay || dragState.draggedEvent.day,
        startTime: new Date(`2024-01-01T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`),
        endTime: new Date(`2024-01-01T${hour.toString().padStart(2, '0')}:${(minute + dragState.draggedEvent.duration).toString().padStart(2, '0')}:00`),
      };
      
      updateEvent(dragState.draggedEvent.id, updatedEvent);
    }
    
    setDragState({
      isDragging: false,
      draggedEvent: null,
      initialPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      targetSlot: null
    });
  };

  // Create new event
  const handleCreateEvent = () => {
    if (!previewEvent || !selectedSlot) return;
    
    // Get current date but preserve the selected day
    const today = new Date();
    const dayIndex = weekDays.indexOf(selectedSlot.day);
    const selectedDate = new Date(today);
    selectedDate.setDate(today.getDate() - today.getDay() + dayIndex + 1); // +1 because weekDays starts with Monday
    
    // Parse start time properly
    const startTime = parseTime(selectedSlot.startTime);
    const startDate = new Date(selectedDate);
    startDate.setHours(startTime.hour, startTime.minute, 0, 0);
    
    // Calculate end time based on duration
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + eventDuration);
    
    console.log('Creating event:', {
      title: quickEventData.title,
      startTime: startDate,
      endTime: endDate,
      duration: eventDuration,
      day: selectedSlot.day
    });
    
    const newEvent: ScheduleEvent = {
      id: Date.now().toString(),
      title: quickEventData.title || 'No Title',
      type: quickEventData.type,
      startTime: startDate,
      endTime: endDate,
      duration: eventDuration,
      color: getColorForType(quickEventData.type),
      emoji: getEmojiForType(quickEventData.type),
      day: selectedSlot.day,
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    addEvent(newEvent);
    setShowQuickEventForm(false);
    setSelectedSlot(null);
    setPreviewEvent(null);
    setQuickEventData({ title: '', type: EventType.FOCUS, startTime: '', endTime: '', day: '' });
    setEventDuration(15);
  };
  
  const handleCancelEvent = () => {
    setShowQuickEventForm(false);
    setSelectedSlot(null);
    setPreviewEvent(null);
    setQuickEventData({ title: '', type: EventType.FOCUS, startTime: '', endTime: '', day: '' });
    setEventDuration(15);
  };

  const getPreviewEventDisplay = (event: ScheduleEvent) => {
    const startTimeStr = event.startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    const endTimeStr = event.endTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    
    if (!event.title || event.title.trim() === '') {
      return `No title, ${startTimeStr}-${endTimeStr}`;
    }
    
    return event.title;
  };

  const getColorForType = (type: EventType) => {
    const colors = {
      [EventType.FOCUS]: '#10b981',
      [EventType.CLASS]: '#3b82f6',
      [EventType.ASSIGNMENT]: '#8b5cf6',
      [EventType.STUDY]: '#ec4899',
      [EventType.MEETING]: '#6366f1',
      [EventType.BREAK]: '#f59e0b',
      [EventType.BUSY]: '#ef4444',
      [EventType.PERSONAL]: '#64748b'
    };
    return colors[type] || '#64748b';
  };

  const getEmojiForType = (type: EventType) => {
    const emojis = {
      [EventType.FOCUS]: '🎯',
      [EventType.CLASS]: '📚',
      [EventType.ASSIGNMENT]: '💻',
      [EventType.STUDY]: '📖',
      [EventType.MEETING]: '👥',
      [EventType.BREAK]: '☕',
      [EventType.BUSY]: '⚠️',
      [EventType.PERSONAL]: '📋'
    };
    return emojis[type] || '📋';
  };

  // Calculate event position and styling
  const getEventStyle = (event: ScheduleEvent) => {
    // Get hours and minutes directly from Date objects
    const startHour = event.startTime.getHours();
    const startMinute = event.startTime.getMinutes();
    const endHour = event.endTime.getHours();
    const endMinute = event.endTime.getMinutes();
    
    // Calculate positions using our utility functions
    const topPosition = timeToPixels(startHour, startMinute);
    const bottomPosition = timeToPixels(endHour, endMinute);
    const height = bottomPosition - topPosition;
    
    console.log('Event style calculation:', {
      event: event.title,
      startTime: `${startHour}:${startMinute}`,
      endTime: `${endHour}:${endMinute}`,
      topPosition,
      height,
      duration: event.duration
    });
    
    return {
      top: `${topPosition}px`,
      height: `${Math.max(height, 16)}px`, // Minimum 16px height for visibility
      backgroundColor: event.color,
      borderLeft: event.hasConflict ? '4px solid #ef4444' : event.isLocked ? '4px solid #059669' : 'none',
      opacity: event.isCompleted ? 0.6 : 1,
      zIndex: event.hasConflict ? 20 : 10,
      cursor: event.isLocked ? 'not-allowed' : 'pointer'
    };
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const handleEventClick = (event: ScheduleEvent, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Event clicked:', event);
    
    // Only show details if not currently being dragged
    if (!dragState.isDragging) {
      setSelectedEvent(event);
      setShowEventDetails(true);
      // Close the context menu if it was open
      setShowEventMenu(false);
    }
  };


const handleMouseDown = (event: ScheduleEvent, e: React.MouseEvent) => {
  if (event.isLocked) return;
  
  e.preventDefault();
  setDragStartPosition({ x: e.clientX, y: e.clientY });
  setIsDragInitiated(true);
  
  // Don't start drag immediately - wait for mouse move
};

const handleMouseMove = (e: React.MouseEvent) => {
  if (isDragInitiated && !dragState.isDragging) {
    const deltaX = Math.abs(e.clientX - dragStartPosition.x);
    const deltaY = Math.abs(e.clientY - dragStartPosition.y);
    
    // Only start drag if mouse moved more than 5px
    if (deltaX > 5 || deltaY > 5) {
      // Find the event being dragged
      const draggedEvent = events.find(evt => 
        evt.id === selectedEvent?.id || 
        (e.target as HTMLElement).closest('[data-event-id]')?.getAttribute('data-event-id') === evt.id
      );
      
      if (draggedEvent) {
        setDragState({
          isDragging: true,
          draggedEvent,
          initialPosition: dragStartPosition,
          currentPosition: { x: e.clientX, y: e.clientY },
          targetSlot: null
        });
        setShowEventDetails(false); // Close sidebar during drag
      }
    }
  }
  
  // Continue with existing drag move logic if already dragging
  if (dragState.isDragging) {
    setDragState({
      ...dragState,
      currentPosition: { x: e.clientX, y: e.clientY }
    });
  }
};

const handleMouseUp = (e: React.MouseEvent) => {
  if (isDragInitiated && !dragState.isDragging) {
    // This was just a click, not a drag
    setIsDragInitiated(false);
    // Click handling is done in handleEventClick
  } else if (dragState.isDragging) {
    // Handle drag end
    handleDragEnd(e);
  }
  
  setIsDragInitiated(false);
};

  const handleEventAction = (action: string) => {
    if (!selectedEvent) return;
    
    switch (action) {
      case 'edit':
        console.log('Edit event:', selectedEvent);
        break;
      case 'delete':
        deleteEvent(selectedEvent.id);
        break;
      case 'duplicate':
        const duplicatedEvent = {
          ...selectedEvent,
          id: Date.now().toString(),
          title: `${selectedEvent.title} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        addEvent(duplicatedEvent);
        break;
      case 'complete':
        updateEvent(selectedEvent.id, { isCompleted: !selectedEvent.isCompleted });
        break;
    }
    setShowEventMenu(false);
    setSelectedEvent(null);
  };

  // Components
  const Sidebar = () => (
    <div 
      className={cn('sidebar-clockwyz', sidebarCollapsed && 'collapsed')}
      onMouseEnter={handleSidebarMouseEnter}
      onMouseLeave={handleSidebarMouseLeave}
    >
      <div className="sidebar-header-clockwyz">
        <div className="logo-clockwyz">
          <Zap className="logo-icon-clockwyz" />
          {!sidebarCollapsed && (
            <span className="logo-text-clockwyz">MoreDayz</span>
          )}
        </div>
        {/* Remove the collapse button entirely */}
      </div>
  
      <nav className="sidebar-nav-clockwyz">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant={currentView === item.id ? 'default' : 'ghost'}
            className={cn('nav-item-clockwyz', currentView === item.id && 'active')}
            onClick={() => setCurrentView(item.id)}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <item.icon className="nav-icon-clockwyz" />
            {!sidebarCollapsed && (
              <>
                <span className="nav-label-clockwyz">{item.label}</span>
                {/* {item.badge && (
                  <Badge variant="secondary" className="nav-badge-clockwyz">
                    {item.badge}
                  </Badge>
                )} */}
              </>
            )}
          </Button>
        ))}
      </nav>
  
      {!sidebarCollapsed && (
        <div className="sidebar-stats-clockwyz">
          <div className="stats-header-clockwyz">This Week</div>
          <div className="stat-item-clockwyz">
            <Clock className="w-3 h-3" />
            <span>{academicStats.weeklyFocus.current}h Focus</span>
          </div>
          <div className="stat-item-clockwyz">
            <BookOpen className="w-3 h-3" />
            <span>{academicStats.studyHours.current}h Study</span>
          </div>
          <div className="stat-item-clockwyz">
            <Target className="w-3 h-3" />
            <span>{academicStats.assignmentsDue} Due</span>
          </div>
        </div>
      )}
    </div>
  );
  
  // 5. Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const Header = () => (
    <header className="header-clockwyz">
      <div className="header-left-clockwyz">
        <h1 className="page-title-clockwyz">
          {currentView === 'today' && 'Today'}
          {currentView === 'planner' && 'Planner'}
          {currentView === 'priorities' && 'Priorities'}
          {currentView === 'stats' && 'Statistics'}
          {currentView === 'habits' && 'Habits'}
          {currentView === 'courses' && 'Courses'}
          {currentView === 'meetings' && 'Meetings'}
        </h1>
        
        {/* Only show date navigation on planner view */}
        {currentView === 'planner' && (
          <div className="date-nav-clockwyz">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="nav-btn-clockwyz"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="current-month-clockwyz">
              {currentWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek('next')}
              className="nav-btn-clockwyz"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
  
      <div className="header-right-clockwyz">
        {/* Show next event info only on today view */}
        {currentView === 'today' && (
          <div className="next-event-clockwyz">
            <span className="next-label-clockwyz">Next:</span>
            <div className="next-event-info-clockwyz">
              <div className="event-indicator-clockwyz"></div>
              <span>Focus time</span>
            </div>
          </div>
        )}
  
        <Button 
          className="add-task-btn-clockwyz"
          onClick={() => {
            if (currentView !== 'planner') {
              setCurrentView('planner');
            }
            // This could trigger the quick event form
          }}
        >
          <Plus className="w-4 h-4" />
          New Task
        </Button>
  
        <Button variant="ghost" size="sm" className="header-action-btn-clockwyz">
          <Search className="w-5 h-5" />
        </Button>
  
        <Button variant="ghost" size="sm" className="header-action-btn-clockwyz notification-btn-clockwyz">
          <Bell className="w-5 h-5" />
          <span className="notification-dot-clockwyz"></span>
        </Button>
  
        <div className="user-avatar-clockwyz">
          <span>AJ</span>
        </div>
      </div>
    </header>
  ); 

  const WeekStats = () => (
    <Card className="week-stats-clockwyz">
      <CardContent className="stat-group-clockwyz">
        <div className="stat-clockwyz focus">
          <span className="stat-dot-clockwyz"></span>
          <span>Focus {academicStats.weeklyFocus.current}h</span>
        </div>
        <div className="stat-clockwyz target">
          <Target className="w-3 h-3" />
          <span>Focus target {academicStats.weeklyFocus.target}h</span>
        </div>
        <div className="stat-clockwyz study">
          <span className="stat-dot-clockwyz study"></span>
          <span>Study {academicStats.studyHours.current}h</span>
        </div>
        <div className="stat-clockwyz free">
          <span>Free 25.25h</span>
        </div>
      </CardContent>
    </Card>
  );

  // Quick Event Form Modal
const QuickEventForm = () => {
    if (!showQuickEventForm || !selectedSlot) return null;
    
    const [activeTab, setActiveTab] = useState<'new-task' | 'plan-work'>('new-task');
const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    
    
    // Plan Work tab state with proper typing
const [planWorkData, setPlanWorkData] = useState<PlanWorkData>({
    title: '',
    type: EventType.FOCUS,
    duration: 60,
    recurrenceType: 'weekly',
    daysOfWeek: [],
    startDate: new Date(),
    endDate: null,
    occurrences: 4,
    timeSlot: '09:00'
  });
    const [showRecurrenceDropdown, setShowRecurrenceDropdown] = useState(false);
    const [showDaysDropdown, setShowDaysDropdown] = useState(false);
  
    const typeOptions: { value: EventType; label: string }[] = [
        { value: EventType.FOCUS, label: 'Working' },
        { value: EventType.PERSONAL, label: 'Personal' },
        { value: EventType.STUDY, label: 'Study' },
        { value: EventType.MEETING, label: 'Social' },
      ];
      
      const recurrenceOptions: RecurrenceOption[] = [
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'custom', label: 'Custom' }
      ];
      
      const daysOfWeekOptions: DayOption[] = [
        { value: 'monday', label: 'Monday' },
        { value: 'tuesday', label: 'Tuesday' },
        { value: 'wednesday', label: 'Wednesday' },
        { value: 'thursday', label: 'Thursday' },
        { value: 'friday', label: 'Friday' },
        { value: 'saturday', label: 'Saturday' },
        { value: 'sunday', label: 'Sunday' }
      ];
  
    const selectedTypeLabel = typeOptions.find(option => option.value === quickEventData.type)?.label || 'Select type';
    const selectedRecurrenceLabel = recurrenceOptions.find(option => option.value === planWorkData.recurrenceType)?.label || 'Weekly';
  
    const handleDayToggle = (day: string) => {
        setPlanWorkData(prev => ({
          ...prev,
          daysOfWeek: prev.daysOfWeek.includes(day) 
            ? prev.daysOfWeek.filter((d: string) => d !== day)
            : [...prev.daysOfWeek, day]
        }));
      };
  
      const handlePlanWorkCreate = () => {
        if (!planWorkData.title || planWorkData.daysOfWeek.length === 0) {
          alert('Please fill in the work title and select at least one day');
          return;
        }
      
        // Generate recurring events based on the plan
        const baseDate = new Date();
        const events: ScheduleEvent[] = [];
        
        for (let week = 0; week < planWorkData.occurrences; week++) {
          planWorkData.daysOfWeek.forEach(dayOfWeek => {
            const eventDate = new Date(baseDate);
            
            // Calculate the date for this occurrence
            const dayIndex = daysOfWeekOptions.findIndex(d => d.value === dayOfWeek);
            const currentDay = eventDate.getDay();
            const daysUntilTarget = (dayIndex + 1 - currentDay + 7) % 7;
            eventDate.setDate(eventDate.getDate() + daysUntilTarget + (week * 7));
            
            // Parse time slot
            const [timeHour, timeMinute] = planWorkData.timeSlot.split(':').map(Number);
            const startTime = new Date(eventDate);
            startTime.setHours(timeHour, timeMinute || 0, 0, 0);
            
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + planWorkData.duration);
            
            // Get day abbreviation for the day column
            const dayAbbrev = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][eventDate.getDay()];
            
            const recurringEvent: ScheduleEvent = {
              id: `${Date.now()}-${week}-${dayOfWeek}`,
              title: planWorkData.title,
              type: planWorkData.type,
              startTime,
              endTime,
              duration: planWorkData.duration,
              color: getColorForType(planWorkData.type),
              emoji: getEmojiForType(planWorkData.type),
              day: dayAbbrev,
              userId: 'user1',
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            events.push(recurringEvent);
          });
        }
        
        // Add all recurring events to the schedule
        events.forEach(event => addEvent(event));
        
        // Reset form and close
        setShowQuickEventForm(false);
        setSelectedSlot(null);
        setPlanWorkData({
          title: '',
          type: EventType.FOCUS,
          duration: 60,
          recurrenceType: 'weekly',
          daysOfWeek: [],
          startDate: new Date(),
          endDate: null,
          occurrences: 4,
          timeSlot: '09:00'
        });
      };
  
    return (
      <>
        <div 
  className="task-popup-clockwyz" 
  style={{
    position: 'fixed', // Changed from absolute to fixed
    left: `${selectedSlot.x}px`,
    top: `${selectedSlot.y}px`,
    zIndex: 1001,
  }}
>
          {/* Tab Header */}
          <div className="popup-tabs-clockwyz">
            <button 
              className={`tab-button-clockwyz ${activeTab === 'new-task' ? 'active' : 'inactive'}`}
              onClick={() => setActiveTab('new-task')}
            >
              New Task
            </button>
            <button 
              className={`tab-button-clockwyz ${activeTab === 'plan-work' ? 'active' : 'inactive'}`}
              onClick={() => setActiveTab('plan-work')}
            >
              Plan Work
            </button>
          </div>
          
          {/* Content Area */}
          <div className="popup-content-clockwyz">
            {activeTab === 'new-task' ? (
              <div className="space-y-4">
                {/* Task Name */}
                <div>
                  <label htmlFor="task-title">Task Name</label>
                  <input
                    id="task-title"
                    type="text"
                    placeholder="Task name"
                    value={quickEventData.title}
                    onChange={(e) => updatePreviewEvent({ title: e.target.value })}
                  />
                </div>
  
                {/* Duration with inline +/- buttons */}
                <div>
                  <label htmlFor="duration">Duration</label>
                  <div className="duration-input-wrapper-clockwyz">
                    <input
                      id="duration"
                      type="text"
                      value={`${eventDuration} min`}
                      readOnly
                      className="duration-input-clockwyz"
                    />
                    <div className="duration-controls-clockwyz">
                      <button
                        type="button"
                        className="duration-btn-clockwyz"
                        onClick={() => updatePreviewEvent({ duration: Math.max(15, eventDuration - 15) })}
                        disabled={eventDuration <= 15}
                      >
                        -
                      </button>
                      <button
                        type="button"
                        className="duration-btn-clockwyz"
                        onClick={() => updatePreviewEvent({ duration: eventDuration + 15 })}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
  
                {/* Type Dropdown */}
                <div>
                  <label htmlFor="event-type">Type</label>
                  <div className="select-wrapper-clockwyz">
                    <button
                      type="button"
                      className="select-trigger-clockwyz"
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    >
                      <span>{selectedTypeLabel}</span>
                      <span className="select-icon-clockwyz">▼</span>
                    </button>
                    {showTypeDropdown && (
                      <div className="select-content-clockwyz">
                        {typeOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className="select-item-clockwyz"
                            onClick={() => {
                              updatePreviewEvent({ type: option.value });
                              setShowTypeDropdown(false);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
  
                {/* Start Time and End Date */}
                <div className="time-row-clockwyz">
                  <div className="time-col-clockwyz">
                    <label htmlFor="start-time">Start Time</label>
                    <input
                      id="start-time"
                      type="text"
                      value={quickEventData.startTime}
                      onChange={(e) => updatePreviewEvent({ startTime: e.target.value })}
                    />
                  </div>
                  <div className="time-col-clockwyz">
                    <label htmlFor="end-date">End Date</label>
                    <div className="date-input-wrapper-clockwyz">
                      <input
                        id="end-date"
                        type="text"
                        value={new Date().toLocaleDateString()}
                        readOnly
                        className="date-input-clockwyz"
                        onClick={() => setShowCalendar(!showCalendar)}
                      />
                      <span className="calendar-icon-clockwyz">📅</span>
                      {showCalendar && (
                        <div className="calendar-popup-clockwyz">
                          <div className="calendar-header-clockwyz">
                            Select Date
                          </div>
                          <div className="calendar-grid-clockwyz">
                            {/* Day headers */}
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                              <div key={day} className="calendar-day-header-clockwyz">
                                {day}
                              </div>
                            ))}
                            {/* Calendar days */}
                            {Array.from({ length: 35 }, (_, i) => {
                              const today = new Date();
                              const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                              const startDate = new Date(firstDay);
                              startDate.setDate(startDate.getDate() - firstDay.getDay());
                              const currentDate = new Date(startDate);
                              currentDate.setDate(currentDate.getDate() + i);
                              const isCurrentMonth = currentDate.getMonth() === today.getMonth();
                              
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  className={`calendar-day-clockwyz ${!isCurrentMonth ? 'other-month' : ''}`}
                                  onClick={() => {
                                    if (isCurrentMonth) {
                                      setShowCalendar(false);
                                    }
                                  }}
                                  disabled={!isCurrentMonth}
                                >
                                  {currentDate.getDate()}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Plan Work Tab Content */
              <div className="space-y-4">
                {/* Work Title */}
                <div>
                  <label htmlFor="work-title">Work Title</label>
                  <input
                    id="work-title"
                    type="text"
                    placeholder="e.g., Morning Focus Session"
                    value={planWorkData.title}
                    onChange={(e) => setPlanWorkData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
  
                {/* Duration and Time Slot Row */}
                <div className="time-row-clockwyz">
                  <div className="time-col-clockwyz">
                    <label htmlFor="work-duration">Duration</label>
                    <div className="duration-input-wrapper-clockwyz">
                      <input
                        id="work-duration"
                        type="text"
                        value={`${planWorkData.duration} min`}
                        readOnly
                        className="duration-input-clockwyz"
                      />
                      <div className="duration-controls-clockwyz">
                        <button
                          type="button"
                          className="duration-btn-clockwyz"
                          onClick={() => setPlanWorkData(prev => ({ 
                            ...prev, 
                            duration: Math.max(30, prev.duration - 30) 
                          }))}
                          disabled={planWorkData.duration <= 30}
                        >
                          -
                        </button>
                        <button
                          type="button"
                          className="duration-btn-clockwyz"
                          onClick={() => setPlanWorkData(prev => ({ 
                            ...prev, 
                            duration: prev.duration + 30 
                          }))}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="time-col-clockwyz">
                    <label htmlFor="time-slot">Time Slot</label>
                    <input
                      id="time-slot"
                      type="text"
                      placeholder="09:00"
                      value={planWorkData.timeSlot}
                      onChange={(e) => setPlanWorkData(prev => ({ ...prev, timeSlot: e.target.value }))}
                    />
                  </div>
                </div>
  
                {/* Recurrence Pattern */}
                <div>
                  <label htmlFor="recurrence">Repeat</label>
                  <div className="select-wrapper-clockwyz">
                    <button
                      type="button"
                      className="select-trigger-clockwyz"
                      onClick={() => setShowRecurrenceDropdown(!showRecurrenceDropdown)}
                    >
                      <span>{selectedRecurrenceLabel}</span>
                      <span className="select-icon-clockwyz">▼</span>
                    </button>
                    {showRecurrenceDropdown && (
                      <div className="select-content-clockwyz">
                        {recurrenceOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className="select-item-clockwyz"
                            onClick={() => {
                              setPlanWorkData(prev => ({ ...prev, recurrenceType: option.value }));
                              setShowRecurrenceDropdown(false);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
  
                {/* Days of Week (for weekly recurrence) */}
                {planWorkData.recurrenceType === 'weekly' && (
                  <div>
                    <label>Days of Week</label>
                    <div className="days-selector-clockwyz">
                      {daysOfWeekOptions.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          className={`day-btn-clockwyz ${planWorkData.daysOfWeek.includes(day.value) ? 'selected' : ''}`}
                          onClick={() => handleDayToggle(day.value)}
                        >
                          {day.label.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
  
                {/* Number of Occurrences */}
                <div>
                  <label htmlFor="occurrences">Number of Sessions</label>
                  <div className="duration-input-wrapper-clockwyz">
                    <input
                      id="occurrences"
                      type="text"
                      value={`${planWorkData.occurrences} sessions`}
                      readOnly
                      className="duration-input-clockwyz"
                    />
                    <div className="duration-controls-clockwyz">
                      <button
                        type="button"
                        className="duration-btn-clockwyz"
                        onClick={() => setPlanWorkData(prev => ({ 
                          ...prev, 
                          occurrences: Math.max(1, prev.occurrences - 1) 
                        }))}
                        disabled={planWorkData.occurrences <= 1}
                      >
                        -
                      </button>
                      <button
                        type="button"
                        className="duration-btn-clockwyz"
                        onClick={() => setPlanWorkData(prev => ({ 
                          ...prev, 
                          occurrences: prev.occurrences + 1 
                        }))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="popup-footer-clockwyz">
            <button 
              type="button"
              onClick={activeTab === 'new-task' ? handleCreateEvent : handlePlanWorkCreate} 
              className="create-btn-clockwyz"
            >
              {activeTab === 'new-task' ? 'Create Task' : 'Plan Work'}
            </button>
          </div>
        </div>
  
        {/* Backdrop */}
        <div 
          className="popup-backdrop-clockwyz"
          onClick={handleCancelEvent}
        />
      </>
    );
  };

  // Schedule Grid Component
  const ScheduleGrid = () => (
    <div 
      className="schedule-container-clockwyz"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
    >
      {/* Schedule Header */}
      <div className="schedule-header-clockwyz">
        <div className="timezone-col-clockwyz">
          <span className="timezone-clockwyz">EST</span>
        </div>
        <div className="day-headers-clockwyz">
          {weekDates.map((dayInfo) => (
            <div 
              key={dayInfo.day}
              className={cn(
                'day-header-clockwyz',
                dayInfo.isToday && 'today',
                dayInfo.isWeekend && 'weekend'
              )}
            >
              <span className="day-name-clockwyz">{dayInfo.day}</span>
              <span className="day-number-clockwyz">{dayInfo.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Calendar */}
      <div className="calendar-main-clockwyz">
        {/* Time Axis */}
        <div className="time-axis-clockwyz">
          {timeSlots.map((slot) => (
            <div 
              key={slot.hour}
              className="time-slot-clockwyz"
              style={{ height: `${slot.height}px` }}
            >
              <span className="time-label-clockwyz">{slot.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar Content */}
        <div className="calendar-content-clockwyz">
          {/* Hour Grid Background */}
          <div className="hour-grid-clockwyz">
            {timeSlots.map((slot, index) => (
              <div 
                key={`grid-${slot.hour}`}
                className={cn('hour-line-clockwyz', index % 2 === 0 ? 'major' : 'minor')}
                style={{ height: `${slot.height}px` }}
              ></div>
            ))}
          </div>

          {/* Day Columns */}
          <div className="day-columns-clockwyz">
            {weekDates.map((dayInfo) => (
              <div 
                key={dayInfo.day} 
                className={cn('day-column-clockwyz', dayInfo.isWeekend && 'weekend')}
                data-day={dayInfo.day}
                onClick={(e) => handleCellClick(dayInfo.day, e)}
              >
                <div className="day-events-clockwyz">
                  {/* Preview Event */}
                  {previewEvent && previewEvent.day === dayInfo.day && (
                    <motion.div
                        className="event-clockwyz preview-event-clockwyz"
                        style={getEventStyle(previewEvent)}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 0.8, scale: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="event-content-clockwyz">
                        <div className="event-title-clockwyz">
                            {/* <span className="event-emoji-clockwyz">{previewEvent.emoji}</span> */}
                            <span className="title-text-clockwyz">
                            {getPreviewEventDisplay(previewEvent)}
                            </span>
                        </div>
                        <div className="event-details-clockwyz">
                            <span className="event-time-clockwyz">
                            {previewEvent.duration} min • {previewEvent.type}
                            </span>
                        </div>
                        </div>
                    </motion.div>
                    )}
                  
                  {/* Actual Events */}
                  {events
                    .filter(event => event.day === dayInfo.day)
                    .map((event) => (
                        <motion.div
  key={event.id}
  data-event-id={event.id}
  className={cn(
    'event-clockwyz',
    event.type,
    event.isLocked && 'locked'
  )}
  style={getEventStyle(event)}
  whileHover={{ scale: 1.02, zIndex: 30 }}
  onClick={(e) => handleEventClick(event, e)}
  onContextMenu={(e) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setSelectedEvent(event);
    setShowEventMenu(true);
  }}
  transition={{ duration: 0.2 }}
  drag={!event.isLocked}
  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
  dragElastic={0}
  onDragStart={(e) => {
    if (!event.isLocked) {
      setShowEventDetails(false); // Close sidebar during drag
    }
  }}
>
  <div className="event-content-clockwyz">
    <div className="event-title-clockwyz">
      {event.isLocked && <Lock className="w-3 h-3 lock-icon-clockwyz" />}
      {/* {event.emoji && <span className="event-emoji-clockwyz">{event.emoji}</span>} */}
      <span className="title-text-clockwyz">{event.title}</span>
      {event.priority === Priority.HIGH && <span className="priority-indicator-clockwyz">!</span>}
    </div>
    <div className="event-details-clockwyz">
      <span className="event-time-clockwyz">
        {event.startTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })} - {event.endTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        })}
      </span>
      {event.location && <span className="event-location-clockwyz">{event.location}</span>}
      {event.course && <span className="event-course-clockwyz">{event.course}</span>}
    </div>
  </div>
  {event.hasConflict && (
    <div className="conflict-indicator-clockwyz">
      <AlertTriangle className="w-3 h-3" />
    </div>
  )}
</motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Add this component to enhanced-schedule-grid.tsx after the existing components

// Replace the EventDetailsSidebar component in enhanced-schedule-grid.tsx

const EventDetailsSidebar = () => {
    if (!selectedEvent || !showEventDetails) return null;
  
    const formatEventTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    };
  
    const formatEventDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric' 
      });
    };
  
    const getDuration = () => {
      const diffMs = selectedEvent.endTime.getTime() - selectedEvent.startTime.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      
      if (hours === 0) return `${minutes} minutes`;
      if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
    };
  
    const handleCloseSidebar = () => {
      setShowEventDetails(false);
      setSelectedEvent(null);
    };
  
    return (
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="event-details-sidebar-clockwyz"
      >
        {/* Header with Close Button */}
        <div className="sidebar-header-details-clockwyz">
          <div className="header-left-sidebar-clockwyz">
            <div className="event-type-badge-clockwyz" style={{ backgroundColor: selectedEvent.color }}>
              <span className="event-emoji-clockwyz">{selectedEvent.emoji || '📅'}</span>
              <span>{selectedEvent.type?.toUpperCase() || 'EVENT'}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseSidebar}
            className="close-sidebar-btn-clockwyz"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
  
        {/* Event Details */}
        <div className="sidebar-content-details-clockwyz">
          <div className="event-title-section-clockwyz">
            <h2 className="event-title-large-clockwyz">{selectedEvent.title || 'No Title'}</h2>
            {selectedEvent.isLocked && (
              <div className="locked-indicator-clockwyz">
                <Lock className="w-4 h-4" />
                <span>Locked Event</span>
              </div>
            )}
          </div>
  
          {/* Time Information */}
          <div className="time-section-clockwyz">
            <div className="time-info-header-clockwyz">
              <Clock className="w-5 h-5" />
              <span className="section-title-clockwyz">Schedule</span>
            </div>
            
            <div className="time-details-clockwyz">
              <div className="time-row-details-clockwyz">
                <span className="time-label-clockwyz">Date:</span>
                <span className="time-value-clockwyz">{formatEventDate(selectedEvent.startTime)}</span>
              </div>
              
              <div className="time-row-details-clockwyz">
                <span className="time-label-clockwyz">Time:</span>
                <span className="time-value-clockwyz">
                  {formatEventTime(selectedEvent.startTime)} - {formatEventTime(selectedEvent.endTime)}
                </span>
              </div>
              
              <div className="time-row-details-clockwyz">
                <span className="time-label-clockwyz">Duration:</span>
                <span className="time-value-clockwyz">{getDuration()}</span>
              </div>
            </div>
          </div>
  
          {/* Additional Details */}
          {(selectedEvent.location || selectedEvent.course || selectedEvent.description) && (
            <div className="additional-details-clockwyz">
              <div className="section-header-clockwyz">
                <span className="section-title-clockwyz">Details</span>
              </div>
              
              {selectedEvent.location && (
                <div className="detail-row-clockwyz">
                  <span className="detail-label-clockwyz">Location:</span>
                  <span className="detail-value-clockwyz">{selectedEvent.location}</span>
                </div>
              )}
              
              {selectedEvent.course && (
                <div className="detail-row-clockwyz">
                  <span className="detail-label-clockwyz">Course:</span>
                  <span className="detail-value-clockwyz">{selectedEvent.course}</span>
                </div>
              )}
              
              {selectedEvent.description && (
                <div className="detail-row-clockwyz">
                  <span className="detail-label-clockwyz">Description:</span>
                  <p className="description-text-clockwyz">{selectedEvent.description}</p>
                </div>
              )}
            </div>
          )}
  
          {/* Priority Indicator */}
          {selectedEvent.priority && (
            <div className="priority-section-clockwyz">
              <Target className="w-4 h-4" />
              <span className={`priority-badge-clockwyz priority-${selectedEvent.priority}`}>
                {selectedEvent.priority.toUpperCase()} PRIORITY
              </span>
            </div>
          )}
  
          {/* Status */}
          <div className="status-section-clockwyz">
            {selectedEvent.isCompleted ? (
              <div className="status-completed-clockwyz">
                <CheckCircle className="w-4 h-4" />
                <span>Completed</span>
              </div>
            ) : (
              <div className="status-pending-clockwyz">
                <Clock className="w-4 h-4" />
                <span>Scheduled</span>
              </div>
            )}
          </div>
        </div>
  
        {/* Action Buttons */}
        <div className="sidebar-actions-clockwyz">
          <Button
            onClick={() => {
              handleEventAction('edit');
              handleCloseSidebar();
            }}
            className="action-btn-clockwyz edit-btn-clockwyz"
          >
            <Edit className="w-4 h-4" />
            Edit Event
          </Button>
          
          <div className="action-row-clockwyz">
            <Button
              onClick={() => {
                handleEventAction('duplicate');
                handleCloseSidebar();
              }}
              variant="outline"
              className="action-btn-clockwyz secondary-btn-clockwyz"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </Button>
            
            <Button
              onClick={() => {
                handleEventAction('complete');
              }}
              variant="outline"
              className="action-btn-clockwyz secondary-btn-clockwyz"
            >
              <CheckCircle className="w-4 h-4" />
              {selectedEvent.isCompleted ? 'Incomplete' : 'Complete'}
            </Button>
          </div>
          
          <Button
            onClick={() => {
              handleEventAction('delete');
              handleCloseSidebar();
            }}
            variant="destructive"
            className="action-btn-clockwyz delete-btn-clockwyz"
          >
            <Trash2 className="w-4 h-4" />
            Delete Event
          </Button>
        </div>
      </motion.div>
    );
  };

  // Event Context Menu
  const EventMenu = () => {
    if (!showEventMenu || !selectedEvent) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="event-menu-clockwyz"
        style={{ 
          position: 'fixed', 
          left: menuPosition.x, 
          top: menuPosition.y,
          zIndex: 50 
        }}
        onMouseLeave={() => setShowEventMenu(false)}
      >
        <div className="menu-header-clockwyz">
          <span className="menu-title-clockwyz">{selectedEvent.title}</span>
        </div>
        <div className="menu-actions-clockwyz">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEventAction('edit')}
            className="menu-action-clockwyz"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEventAction('duplicate')}
            className="menu-action-clockwyz"
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEventAction('complete')}
            className="menu-action-clockwyz"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{selectedEvent.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}</span>
          </Button>
          <div className="menu-divider-clockwyz" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEventAction('delete')}
            className="menu-action-clockwyz danger"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="app-clockwyz">
      <Sidebar />
      <div className={cn("main-content-clockwyz", showEventDetails && "sidebar-open")}>
        <Header />
        
        <div className="content-clockwyz">
        {currentView === 'today' && <TodaySection />}
        
        {currentView === 'planner' && (
            <>
      <WeekStats />
      
      {/* Conflicts Alert */}
      <AnimatePresence>
        {conflicts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="conflicts-alert-clockwyz"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Your events are being displayed as they will to others.</span>
            <Button variant="ghost" size="sm" className="alert-dismiss-clockwyz">
              <XCircle className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="schedule-container-clockwyz"
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <ScheduleGrid />
      </div>
    </>
  )}
  
  {/* NEW: Stats Section */}
  {currentView === 'stats' && <StatsSection />}
  
  
  {/* Placeholder sections for other views */}
  {currentView === 'priorities' && <PrioritiesSection />}

  {currentView === 'courses' && <CoursesSection />}
  
  
  {currentView === 'habits' && <HabitsSection />}
  
  
  {currentView === 'meetings' && <MeetingsSection />}
</div>
      </div>

      {/* Event Details Sidebar */}
<AnimatePresence>
  {showEventDetails && selectedEvent && <EventDetailsSidebar />}
</AnimatePresence>

      <AnimatePresence>
        <EventMenu />
      </AnimatePresence>

      <QuickEventForm />

      {/* Click outside handler */}
      {showQuickEventForm && (
        <div 
          className="popup-backdrop-clockwyz"
          onClick={handleCancelEvent}
        />
      )}

      {/* Drag Ghost */}
      {dragState.isDragging && dragState.draggedEvent && (
      <motion.div
        className="drag-ghost-clockwyz"
        style={{
          position: 'fixed',
          left: dragState.currentPosition.x - 50,
          top: dragState.currentPosition.y - 20,
          width: '150px',
          height: '40px',
          background: dragState.draggedEvent.color,
          borderRadius: '6px',
          padding: '8px',
          color: 'white',
          fontSize: '12px',
          fontWeight: '600',
          zIndex: 1000,
          pointerEvents: 'none',
          opacity: 0.8
        }}
        initial={{ scale: 1 }}
        animate={{ scale: 1.1 }}
      >
        {dragState.draggedEvent.title}
      </motion.div>
      )}
      <AIAssistantButton />
      <AIChatInterface />
    </div>
  );
}