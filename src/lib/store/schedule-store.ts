import { create } from 'zustand';
import { ScheduleEvent, DragState, EventType, Priority } from '@/types/schedule';

interface ScheduleStore {
  events: ScheduleEvent[];
  selectedEvent: ScheduleEvent | null;
  dragState: DragState;
  currentWeek: Date;
  viewMode: 'week' | 'day';
  filterType: string;
  isLoading: boolean;
  
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
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  // Initial state
  events: [],
  selectedEvent: null,
  dragState: {
    isDragging: false,
    draggedEvent: null,
    initialPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    targetSlot: null,
  },
  currentWeek: new Date(),
  viewMode: 'week',
  filterType: 'all',
  isLoading: false,

  // Actions
  setEvents: (events) => set({ events }),
  
  addEvent: (event) => 
    set((state) => ({ events: [...state.events, event] })),
  
  updateEvent: (id, updates) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id ? { ...event, ...updates, updatedAt: new Date() } : event
      ),
    })),
  
  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
      selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
    })),
  
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
  setDragState: (dragState) => set({ dragState }),
  setCurrentWeek: (currentWeek) => set({ currentWeek }),
  setViewMode: (viewMode) => set({ viewMode }),
  setFilterType: (filterType) => set({ filterType }),
  setLoading: (isLoading) => set({ isLoading }),
}));