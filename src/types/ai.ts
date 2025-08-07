// src/types/ai.ts

export interface AIMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  contextData?: AIContextData;
  suggestions?: QuickAction[];
  isLoading?: boolean;
}

export interface AIContextData {
  currentSection: string;
  selectedItems: string[];
  userPreferences: Record<string, any>;
  recentActions: string[];
  scheduleContext?: {
    currentWeek: Date;
    upcomingEvents: number;
    conflicts: number;
    todayEvents: number;
    selectedEvent?: string;
    viewMode: string;
  };
  habitContext?: {
    todayProgress: number;
    streaks: number;
    suggestions: number;
  };
  academicContext?: {
    assignmentsDue: number;
    upcomingExams: number;
    gpa?: number;
  };
}

export interface QuickAction {
  id: string;
  label: string;
  action: string;
  icon?: string;
  params?: Record<string, any>;
}

export interface AIChatSession {
  id: string;
  userId: string;
  messages: AIMessage[];
  context: AIContextData;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface AISuggestion {
  id: string;
  type: 'schedule' | 'habit' | 'academic' | 'productivity';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface AIPreferences {
  enabled: boolean;
  personality: 'professional' | 'friendly' | 'casual';
  notificationLevel: 'minimal' | 'normal' | 'detailed';
  autoSuggestions: boolean;
  voiceEnabled: boolean;
  contextSharing: {
    schedule: boolean;
    habits: boolean;
    academic: boolean;
    personal: boolean;
  };
}

export interface AIStats {
  totalInteractions: number;
  suggestionsAccepted: number;
  averageResponseTime: number;
  topQueries: string[];
  satisfactionScore?: number;
}