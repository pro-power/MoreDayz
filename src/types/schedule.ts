export interface ScheduleEvent {
    id: string;
    title: string;
    type: EventType;
    startTime: Date;
    endTime: Date;
    duration: number;
    color: string;
    isLocked?: boolean;
    emoji?: string;
    course?: string;
    location?: string;
    priority?: Priority;
    isCompleted?: boolean;
    hasConflict?: boolean;
    day: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    description?: string;
    recurrence?: RecurrencePattern;
    metadata?: Record<string, any>;
  }
  
  export enum EventType {
    FOCUS = 'focus',
    MEETING = 'meeting',
    BUSY = 'busy',
    BREAK = 'break',
    STUDY = 'study',
    CLASS = 'class',
    ASSIGNMENT = 'assignment',
    PERSONAL = 'personal',
  }
  
  export enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent',
  }
  
  export interface TimeSlot {
    hour: number;
    label: string;
    height: number;
  }
  
  export interface DragState {
    isDragging: boolean;
    draggedEvent: ScheduleEvent | null;
    initialPosition: { x: number; y: number };
    currentPosition: { x: number; y: number };
    targetSlot: { day: string; time: string } | null;
  }
  
  export interface QuickEventData {
    title: string;
    type: EventType;
    startTime: string;
    endTime: string;
    day: string;
    priority?: Priority;
    description?: string;
  }
  
  export interface WeekDate {
    day: string;
    date: number;
    fullDate: Date;
    isToday: boolean;
    isWeekend: boolean;
  }
  
  export interface RecurrencePattern {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval: number;
    daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
    endDate?: Date;
    occurrences?: number;
  }
  
  export interface EventConflict {
    eventId1: string;
    eventId2: string;
    type: 'overlap' | 'double-booking' | 'location-conflict';
    severity: 'low' | 'medium' | 'high';
  }
  
  export interface TimeConstraints {
    earliestStart: Date;
    latestEnd: Date;
    blockedTimes: { start: Date; end: Date }[];
    preferredTimes: { start: Date; end: Date }[];
  }
  
  export interface UserPreferences {
    defaultEventDuration: number;
    workingHours: { start: number; end: number };
    breakDuration: number;
    timeZone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
    notifications: {
      enabled: boolean;
      beforeEvent: number; // minutes
      dailyDigest: boolean;
      weeklyPlanning: boolean;
    };
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
  }
  
  export interface ScheduleView {
    type: 'week' | 'day' | 'month' | 'agenda';
    startDate: Date;
    endDate: Date;
    filterBy?: {
      types?: EventType[];
      priorities?: Priority[];
      courses?: string[];
      tags?: string[];
    };
  }
  
  export interface AcademicStats {
    weeklyFocus: { current: number; target: number };
    studyHours: { current: number; target: number };
    assignmentsDue: number;
    upcomingExams: number;
    gpa?: number;
    completionRate: number;
    productivity: {
      score: number;
      trend: 'up' | 'down' | 'stable';
      focusTime: number;
      distractions: number;
    };
  }
  
  export interface NavigationItem {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    badge?: string;
    children?: NavigationItem[];
  }
  
  export interface ScheduleStore {
    // State
    events: ScheduleEvent[];
    selectedEvent: ScheduleEvent | null;
    dragState: DragState;
    currentWeek: Date;
    viewMode: 'week' | 'day';
    filterType: string;
    isLoading: boolean;
    conflicts: EventConflict[];
    userPreferences: UserPreferences;
    
    // Actions
    setEvents: (events: ScheduleEvent[]) => void;
    addEvent: (event: ScheduleEvent) => void;
    updateEvent: (id: string, updates: Partial<ScheduleEvent>) => void;
    deleteEvent: (id: string) => void;
    setSelectedEvent: (event: ScheduleEvent | null) => void;
    setDragState: (dragState: DragState) => void;
    setCurrentWeek: (date: Date) => void;
    setViewMode: (mode: 'week' | 'day') => void;
    setFilterType: (type: string) => void;
    setLoading: (loading: boolean) => void;
    detectConflicts: () => void;
    updatePreferences: (preferences: Partial<UserPreferences>) => void;
  }
  
  // API Types
  export interface CreateEventRequest {
    title: string;
    type: EventType;
    startTime: Date;
    endTime: Date;
    description?: string;
    priority?: Priority;
    location?: string;
    course?: string;
    recurrence?: RecurrencePattern;
  }
  
  export interface UpdateEventRequest extends Partial<CreateEventRequest> {
    id: string;
  }
  
  export interface EventsResponse {
    events: ScheduleEvent[];
    totalCount: number;
    hasMore: boolean;
  }
  
  export interface AnalyticsData {
    focusTime: number;
    studyTime: number;
    meetingTime: number;
    freeTime: number;
    productivity: number;
    goals: {
      daily: { target: number; achieved: number };
      weekly: { target: number; achieved: number };
      monthly: { target: number; achieved: number };
    };
  }
  
  // Form Types
  export interface EventFormData {
    title: string;
    type: EventType;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    description: string;
    priority: Priority;
    location: string;
    course: string;
    isRecurring: boolean;
    recurrence: RecurrencePattern;
    reminders: number[];
  }
  
  // Search Types
  export interface SearchFilters {
    query?: string;
    types?: EventType[];
    priorities?: Priority[];
    dateRange?: { start: Date; end: Date };
    courses?: string[];
    completed?: boolean;
  }
  
  export interface SearchResult {
    event: ScheduleEvent;
    score: number;
    highlights: string[];
  }

  export interface PlanWorkData {
    title: string;
    type: EventType;
    duration: number;
    recurrenceType: 'daily' | 'weekly' | 'monthly' | 'custom';
    daysOfWeek: string[];
    startDate: Date;
    endDate: Date | null;
    occurrences: number;
    timeSlot: string;
  }
  
  export interface DayOption {
    value: string;
    label: string;
  }
  
  export interface RecurrenceOption {
    value: 'daily' | 'weekly' | 'monthly' | 'custom';
    label: string;
  }
  
  // Export utility type helpers
  export type PartialScheduleEvent = Partial<ScheduleEvent>;
  export type EventWithoutId = Omit<ScheduleEvent, 'id' | 'createdAt' | 'updatedAt'>;
  export type CreateEventData = Omit<ScheduleEvent, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
  export type UpdateEventData = Partial<Omit<ScheduleEvent, 'id' | 'createdAt' | 'userId'>>;