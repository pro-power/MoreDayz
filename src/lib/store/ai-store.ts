// src/lib/store/ai-store.ts

import { create } from 'zustand';
import { AIMessage, AIChatSession, AIContextData, AISuggestion, AIPreferences } from '@/types/ai';

interface AIStore {
  // UI State
  isOpen: boolean;
  isMinimized: boolean;
  isLoading: boolean;
  isTyping: boolean;
  
  // Chat State
  currentSession: AIChatSession | null;
  messages: AIMessage[];
  inputValue: string;
  
  // Context & Suggestions
  contextData: AIContextData;
  suggestions: AISuggestion[];
  unreadSuggestions: number;
  
  // Preferences
  preferences: AIPreferences;
  
  // Error Handling
  error: string | null;
  
  // UI Actions
  toggleChat: () => void;
  minimizeChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  
  // Message Actions
  addMessage: (message: Omit<AIMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<AIMessage>) => void;
  clearMessages: () => void;
  setInputValue: (value: string) => void;
  
  // Session Management
  createSession: () => void;
  endSession: () => void;
  loadSession: (sessionId: string) => void;
  
  // Context Management
  updateContext: (context: Partial<AIContextData>) => void;
  setCurrentSection: (section: string) => void;
  addRecentAction: (action: string) => void;
  
  // Suggestions
  addSuggestion: (suggestion: AISuggestion) => void;
  removeSuggestion: (id: string) => void;
  markSuggestionRead: (id: string) => void;
  clearSuggestions: () => void;
  
  // Loading States
  setLoading: (loading: boolean) => void;
  setTyping: (typing: boolean) => void;
  setError: (error: string | null) => void;
  
  // Preferences
  updatePreferences: (preferences: Partial<AIPreferences>) => void;
}

export const useAIStore = create<AIStore>((set, get) => ({
  // Initial UI State
  isOpen: false,
  isMinimized: false,
  isLoading: false,
  isTyping: false,
  
  // Initial Chat State
  currentSession: null,
  messages: [],
  inputValue: '',
  
  // Initial Context
  contextData: {
    currentSection: 'dashboard',
    selectedItems: [],
    userPreferences: {},
    recentActions: [],
  },
  
  // Initial Suggestions
  suggestions: [],
  unreadSuggestions: 0,
  
  // Default Preferences
  preferences: {
    enabled: true,
    personality: 'friendly',
    notificationLevel: 'normal',
    autoSuggestions: true,
    voiceEnabled: false,
    contextSharing: {
      schedule: true,
      habits: true,
      academic: true,
      personal: false,
    },
  },
  
  // Initial Error State
  error: null,
  
  // UI Actions
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  
  minimizeChat: () => set({ isMinimized: true }),
  
  openChat: () => set({ isOpen: true, isMinimized: false }),
  
  closeChat: () => set({ isOpen: false, isMinimized: false }),
  
  // Message Actions
  addMessage: (message) => {
    const newMessage: AIMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },
  
  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg.id === id ? { ...msg, ...updates } : msg
    ),
  })),
  
  clearMessages: () => set({ messages: [] }),
  
  setInputValue: (value) => set({ inputValue: value }),
  
  // Session Management
  createSession: () => {
    const newSession: AIChatSession = {
      id: Date.now().toString(),
      userId: 'current-user', // Replace with actual user ID
      messages: [],
      context: get().contextData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };
    
    set({ currentSession: newSession, messages: [] });
  },
  
  endSession: () => set({ currentSession: null }),
  
  loadSession: (sessionId) => {
    // This would typically load from an API
    console.log('Loading session:', sessionId);
  },
  
  // Context Management
  updateContext: (context) => set((state) => ({
    contextData: { ...state.contextData, ...context },
  })),
  
  setCurrentSection: (section) => set((state) => ({
    contextData: { ...state.contextData, currentSection: section },
  })),
  
  addRecentAction: (action) => set((state) => ({
    contextData: {
      ...state.contextData,
      recentActions: [action, ...state.contextData.recentActions].slice(0, 10),
    },
  })),
  
  // Suggestions Management
  addSuggestion: (suggestion) => set((state) => ({
    suggestions: [suggestion, ...state.suggestions],
    unreadSuggestions: state.unreadSuggestions + 1,
  })),
  
  removeSuggestion: (id) => set((state) => ({
    suggestions: state.suggestions.filter((s) => s.id !== id),
  })),
  
  markSuggestionRead: (id) => set((state) => {
    const suggestion = state.suggestions.find((s) => s.id === id);
    if (suggestion && state.unreadSuggestions > 0) {
      return { unreadSuggestions: state.unreadSuggestions - 1 };
    }
    return state;
  }),
  
  clearSuggestions: () => set({ suggestions: [], unreadSuggestions: 0 }),
  
  // Loading States
  setLoading: (loading) => set({ isLoading: loading }),
  
  setTyping: (typing) => set({ isTyping: typing }),
  
  setError: (error) => set({ error }),
  
  // Preferences
  updatePreferences: (preferences) => set((state) => ({
    preferences: { ...state.preferences, ...preferences },
  })),
}));