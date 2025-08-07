// src/hooks/use-ai-context.ts

import { useEffect, useCallback, useRef } from 'react';
import { useAIStore } from '@/lib/store/ai-store';
import { useScheduleStore } from '@/lib/store/schedule-store';

/**
 * Hook to automatically sync AI context with app state
 * This ensures the AI assistant has current context about user's activity
 */
export function useAIContext() {
  const { 
    updateContext, 
    addRecentAction,
    contextData 
  } = useAIStore();
  
  const { 
    events, 
    selectedEvent, 
    currentWeek, 
    viewMode 
  } = useScheduleStore();

  // Use refs to avoid recreating functions
  const updateContextRef = useRef(updateContext);
  const addRecentActionRef = useRef(addRecentAction);
  
  // Update refs when functions change
  useEffect(() => {
    updateContextRef.current = updateContext;
    addRecentActionRef.current = addRecentAction;
  }, [updateContext, addRecentAction]);

  // Update schedule context when schedule data changes
  useEffect(() => {
    const now = new Date();
    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === now.toDateString();
    });

    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate > now && eventDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    });

    // Detect basic conflicts by checking for overlapping events
    const detectConflicts = () => {
      const conflicts = [];
      for (let i = 0; i < events.length; i++) {
        for (let j = i + 1; j < events.length; j++) {
          const event1 = events[i];
          const event2 = events[j];
          
          const start1 = new Date(event1.startTime);
          const end1 = new Date(event1.endTime);
          const start2 = new Date(event2.startTime);
          const end2 = new Date(event2.endTime);
          
          // Check if events overlap
          if (start1 < end2 && start2 < end1) {
            conflicts.push({ event1: event1.id, event2: event2.id });
          }
        }
      }
      return conflicts;
    };

    const conflictsList = detectConflicts();

    updateContextRef.current({
      scheduleContext: {
        currentWeek,
        upcomingEvents: upcomingEvents.length,
        conflicts: conflictsList.length,
        todayEvents: todayEvents.length,
        selectedEvent: selectedEvent?.id,
        viewMode
      }
    });
  }, [events, selectedEvent, currentWeek, viewMode]);

  // Stable function references using useCallback
  const trackAction = useCallback((action: string, details?: any) => {
    const actionString = details 
      ? `${action}: ${JSON.stringify(details)}`
      : action;
    addRecentActionRef.current(actionString);
  }, []);

  const setCurrentSection = useCallback((section: string) => {
    updateContextRef.current({ currentSection: section });
  }, []);

  const setSelectedItems = useCallback((items: string[]) => {
    updateContextRef.current({ selectedItems: items });
    if (items.length > 0) {
      trackAction('items_selected', { count: items.length });
    }
  }, [trackAction]);

  return {
    contextData,
    trackAction,
    setCurrentSection,
    setSelectedItems,
    updateContext: updateContextRef.current
  };
}