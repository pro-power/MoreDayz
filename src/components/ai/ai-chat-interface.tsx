// src/components/ai/ai-chat-interface.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  ChevronDown,
  Brain,
  Calendar,
  Target,
  BarChart3,
  Zap,
  CheckCircle,
  Users,
  BookOpen,
  Settings,
  TrendingUp,
  Lightbulb,
  Focus,
  Clock
} from 'lucide-react';
import { useAIStore } from '@/lib/store/ai-store';

interface AITool {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface Message {
  type: 'user' | 'assistant';
  content: string;
  suggestions?: Array<{ id: string; label: string; action: string; }>;
}

const aiTools: AITool[] = [
  {
    id: 'optimize',
    label: 'Optimize Schedule',
    icon: TrendingUp,
    description: 'Optimize your schedule and find conflicts'
  },
  {
    id: 'insights',
    label: 'Get Insights',
    icon: Lightbulb,
    description: 'Analyze your productivity patterns'
  },
  {
    id: 'focus',
    label: 'Focus Helper',
    icon: Focus,
    description: 'Improve focus and eliminate distractions'
  },
  {
    id: 'habits',
    label: 'Build Habits',
    icon: Target,
    description: 'Build better habits and routines'
  },
  {
    id: 'plan',
    label: 'Plan Time',
    icon: Clock,
    description: 'Plan your time more effectively'
  },
  {
    id: 'tasks',
    label: 'Organize Tasks',
    icon: CheckCircle,
    description: 'Organize and prioritize tasks'
  },
  {
    id: 'meetings',
    label: 'Meeting Help',
    icon: Users,
    description: 'Schedule and manage meetings'
  },
  {
    id: 'courses',
    label: 'Course Help',
    icon: BookOpen,
    description: 'Academic planning and course management'
  }
];

export function AIChatInterface() {
  const {
    isOpen,
    inputValue,
    contextData,
    addMessage,
    setInputValue,
    setLoading,
    setTyping,
    createSession,
    toggleChat,
  } = useAIStore();

  // Add missing state variables
  const [selectedTool, setSelectedTool] = useState<AITool>(aiTools[0]);
  const [showToolDropdown, setShowToolDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-close functionality with activity tracking
  const handleMouseEnter = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
  };

  const handleMouseLeave = () => {
    // Only start auto-close if user is not actively typing/interacting
    if (!isActive && !showToolDropdown && !isSubmitting) {
      const timer = setTimeout(() => {
        toggleChat(); // Close the chat
      }, 3000); // 3 seconds delay
      setAutoCloseTimer(timer);
    }
  };

  // Track user activity
  const handleUserActivity = () => {
    setIsActive(true);
    // Reset activity after a delay
    setTimeout(() => setIsActive(false), 1000);
  };

  const handleInputFocus = () => {
    setIsActive(true);
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsActive(false), 500); // Small delay before marking inactive
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [autoCloseTimer]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  // Focus textarea when opened
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return;

    const userMessage = inputValue.trim();
    const toolContext = selectedTool.id;

    setIsSubmitting(true);
    setIsActive(true); // Mark as active during submission

    // Add user message to conversation
    const newConversation: Message[] = [...conversation, {
      type: 'user' as const,
      content: userMessage
    }];
    setConversation(newConversation);

    setInputValue('');

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate contextual response based on selected tool
      const response = generateToolResponse(userMessage, toolContext, contextData);
      
      // Add AI response to conversation
      setConversation([...newConversation, {
        type: 'assistant' as const,
        content: response.content,
        suggestions: response.suggestions
      }]);
    } catch (error) {
      setConversation([...newConversation, {
        type: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsSubmitting(false);
      setIsActive(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      ref={cardRef}
      initial={{ 
        width: '64px',
        height: '64px',
        borderRadius: '50%'
      }}
      animate={{ 
        width: window.innerWidth < 768 ? '90vw' : '50vw',
        height: showToolDropdown ? 'auto' : 'auto', // Allow expansion for dropdown
        borderRadius: '25px'
      }}
      exit={{ 
        width: '64px',
        height: '64px',
        borderRadius: '50%'
      }}
      transition={{ 
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="ai-chat-card"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        background: 'white',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        minHeight: '60px',
        maxHeight: conversation.length > 0 ? '400px' : (showToolDropdown ? 'none' : '200px')
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top Row - Input Field */}
      <div style={{
        padding: '16px 16px 8px 16px',
        display: 'flex',
        alignItems: 'flex-start'
      }}>
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            handleUserActivity();
          }}
          onKeyPress={handleKeyPress}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={`Ask ${selectedTool.label}...`}
          disabled={isSubmitting}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            resize: 'none',
            background: 'transparent',
            fontSize: '14px',
            lineHeight: '1.5',
            minHeight: '20px',
            maxHeight: '120px',
            color: '#111827',
            fontFamily: 'inherit',
            overflow: 'hidden'
          }}
          rows={1}
        />
      </div>

      {/* Conversation Display */}
      {conversation.length > 0 && (
        <div style={{
          maxHeight: '250px',
          overflowY: 'auto',
          padding: '0 16px 8px 16px',
          borderTop: '1px solid #f3f4f6',
          background: '#fafbfc'
        }}>
          {conversation.map((message: Message, index: number) => (
            <div key={index} style={{ marginBottom: '12px' }}>
              {message.type === 'user' ? (
                <div style={{
                  background: '#eff6ff',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  marginLeft: '20%',
                  fontSize: '14px',
                  color: '#1e40af'
                }}>
                  {message.content}
                </div>
              ) : (
                <div>
                  <div style={{
                    background: 'white',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    marginRight: '10%',
                    fontSize: '14px',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    marginBottom: message.suggestions ? '8px' : '0'
                  }}>
                    {message.content}
                  </div>
                  
                  {/* Action Buttons for AI Responses */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginTop: '8px',
                      marginRight: '10%'
                    }}>
                      {message.suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          onClick={() => {
                            console.log('Action:', suggestion.action);
                            handleUserActivity();
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
                          }}
                        >
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Row - Tools and Submit */}
      <div style={{
        padding: '0 16px 16px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* Tools Dropdown */}
        <div style={{ position: 'relative' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
            setShowToolDropdown(!showToolDropdown);
            handleUserActivity();
          }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              border: 'none',
              background: '#f8fafc',
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              color: '#475569',
              transition: 'all 0.2s ease',
              minWidth: 'fit-content'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Tools</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
              showToolDropdown ? 'rotate-180' : 'rotate-0'
            }`} />
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showToolDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: '8px',
                  background: 'white',
                  borderRadius: '12px',
                  padding: '8px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  minWidth: '240px',
                  zIndex: 10000
                }}
              >
                {aiTools.map((tool) => (
                  <motion.button
                    key={tool.id}
                    whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedTool(tool);
                      setShowToolDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      border: 'none',
                      background: selectedTool.id === tool.id ? '#eff6ff' : 'transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      marginBottom: '2px'
                    }}
                  >
                    <tool.icon className={`w-4 h-4 ${
                      selectedTool.id === tool.id ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                    <div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: selectedTool.id === tool.id ? '#1e40af' : '#111827',
                        marginBottom: '1px'
                      }}>
                        {tool.label}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#6b7280',
                        lineHeight: '1.3'
                      }}>
                        {tool.description}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSubmit}
          disabled={!inputValue.trim() || isSubmitting}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            background: inputValue.trim() && !isSubmitting 
              ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
              : '#e5e7eb',
            cursor: inputValue.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
        >
          <ArrowRight className={`w-3.5 h-3.5 transition-all duration-200 ${
            inputValue.trim() && !isSubmitting ? 'text-white' : 'text-gray-400'
          } ${isSubmitting ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* Loading Indicator */}
      {isSubmitting && (
        <div style={{
          position: 'absolute',
          bottom: '2px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '20px',
          height: '2px',
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
          borderRadius: '1px',
          opacity: 0.6
        }}>
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              borderRadius: '1px'
            }}
          />
        </div>
      )}
    </motion.div>
  );
}

// Generate contextual responses based on selected tool
function generateToolResponse(message: string, toolId: string, context: any) {
  const responses: Record<string, {
    content: string;
    suggestions: { id: string; label: string; action: string; }[];
  }> = {
    optimize: {
      content: "I found some 2-hour free slots for your shopping trip! Based on your current schedule, here are the best available times:",
      suggestions: [
        { id: 'fri3pm', label: 'Friday 3:00 PM', action: 'schedule_friday_3pm' },
        { id: 'sat12pm', label: 'Saturday 12:30 PM', action: 'schedule_saturday_12pm' },
        { id: 'sun10am', label: 'Sunday 10:00 AM', action: 'schedule_sunday_10am' }
      ]
    },
    insights: {
      content: "Let me analyze your productivity patterns! I'll examine your schedule data, completed tasks, and time allocation to provide actionable insights.",
      suggestions: [
        { id: 'report', label: 'Weekly Report', action: 'weekly_report' },
        { id: 'trends', label: 'Show Trends', action: 'show_trends' }
      ]
    },
    focus: {
      content: "I'll help you improve your focus! Let me suggest techniques and schedule adjustments to minimize distractions and maximize your deep work sessions.",
      suggestions: [
        { id: 'blocks', label: 'Focus Blocks', action: 'focus_blocks' },
        { id: 'distractions', label: 'Eliminate Distractions', action: 'eliminate_distractions' }
      ]
    },
    habits: {
      content: "Great choice for building better habits! I can help you create sustainable routines that stick. Based on your schedule, I'll suggest habits that fit your lifestyle.",
      suggestions: [
        { id: 'morning', label: 'Morning Routine', action: 'morning_routine' },
        { id: 'evening', label: 'Evening Routine', action: 'evening_routine' }
      ]
    },
    plan: {
      content: "Time planning made easy! I'll help you allocate your time more effectively and create realistic schedules that you can actually follow.",
      suggestions: [
        { id: 'weekly', label: 'Weekly Plan', action: 'weekly_plan' },
        { id: 'daily', label: 'Daily Schedule', action: 'daily_schedule' }
      ]
    },
    tasks: {
      content: "Task organization assistance! I'll help you prioritize, organize, and track your tasks more effectively for better productivity.",
      suggestions: [
        { id: 'prioritize', label: 'Prioritize Tasks', action: 'prioritize_tasks' },
        { id: 'organize', label: 'Organize Projects', action: 'organize_projects' }
      ]
    },
    meetings: {
      content: "Meeting management help! I can assist with scheduling meetings efficiently, preparing agendas, and optimizing your meeting time.",
      suggestions: [
        { id: 'schedule', label: 'Schedule Meeting', action: 'schedule_meeting' },
        { id: 'agenda', label: 'Create Agenda', action: 'create_agenda' }
      ]
    },
    courses: {
      content: "Academic planning support! I'll help you manage your courses, assignments, and study schedule more effectively for better academic performance.",
      suggestions: [
        { id: 'study', label: 'Study Plan', action: 'study_plan' },
        { id: 'assignments', label: 'Track Assignments', action: 'track_assignments' }
      ]
    }
  };

  return responses[toolId] || {
    content: "I'm here to help! Let me provide some suggestions based on what you're looking for.",
    suggestions: [
      { id: 'help', label: 'Get Help', action: 'get_help' }
    ]
  };
}