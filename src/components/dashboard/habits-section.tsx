'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle,
  Plus,
  Calendar,
  Clock,
  Target,
  Flame,
  Trophy,
  TrendingUp,
  Brain,
  Coffee,
  BookOpen,
  Dumbbell,
  Moon,
  Sun,
  Heart,
  Zap,
  Star,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  AlertCircle,
  Award,
  BarChart3,
  Sparkles,
  X,
  Timer,
  MapPin
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Habit {
  id: string;
  title: string;
  description?: string;
  category: 'health' | 'productivity' | 'learning' | 'wellness' | 'social' | 'creative';
  icon: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  target: number; // e.g., 1 for daily, 3 for 3x per week
  difficulty: 'easy' | 'medium' | 'hard';
  streak: number;
  longestStreak: number;
  completedToday: boolean;
  completedDates: string[]; // ISO date strings
  createdAt: Date;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  duration?: number; // minutes
  linkedHabits?: string[]; // habit IDs for stacking
  aiSuggestions?: {
    stackWith?: string[];
    optimalTime?: string;
    microHabits?: string[];
    recoveryTips?: string[];
  };
}

interface HabitTemplate {
  title: string;
  description: string;
  category: Habit['category'];
  icon: string;
  color: string;
  frequency: Habit['frequency'];
  target: number;
  difficulty: Habit['difficulty'];
  timeOfDay?: Habit['timeOfDay'];
  duration?: number;
}

const habitTemplates: HabitTemplate[] = [
  {
    title: 'Drink Water',
    description: 'Drink a glass of water',
    category: 'health',
    icon: '💧',
    color: '#3b82f6',
    frequency: 'daily',
    target: 8,
    difficulty: 'easy',
    timeOfDay: 'anytime'
  },
  {
    title: 'Morning Exercise',
    description: '15 minutes of physical activity',
    category: 'health',
    icon: '🏃‍♂️',
    color: '#ef4444',
    frequency: 'daily',
    target: 1,
    difficulty: 'medium',
    timeOfDay: 'morning',
    duration: 15
  },
  {
    title: 'Read for 20 minutes',
    description: 'Read books, articles, or educational content',
    category: 'learning',
    icon: '📚',
    color: '#8b5cf6',
    frequency: 'daily',
    target: 1,
    difficulty: 'easy',
    timeOfDay: 'evening',
    duration: 20
  },
  {
    title: 'Meditation',
    description: 'Practice mindfulness and meditation',
    category: 'wellness',
    icon: '🧘‍♀️',
    color: '#10b981',
    frequency: 'daily',
    target: 1,
    difficulty: 'medium',
    timeOfDay: 'morning',
    duration: 10
  },
  {
    title: 'Review Daily Goals',
    description: 'Plan and review your daily objectives',
    category: 'productivity',
    icon: '🎯',
    color: '#f59e0b',
    frequency: 'daily',
    target: 1,
    difficulty: 'easy',
    timeOfDay: 'morning',
    duration: 5
  },
  {
    title: 'Practice Gratitude',
    description: 'Write down 3 things you\'re grateful for',
    category: 'wellness',
    icon: '🙏',
    color: '#ec4899',
    frequency: 'daily',
    target: 1,
    difficulty: 'easy',
    timeOfDay: 'evening',
    duration: 3
  },
  {
    title: 'Learn New Vocabulary',
    description: 'Learn 5 new words or phrases',
    category: 'learning',
    icon: '📝',
    color: '#06b6d4',
    frequency: 'daily',
    target: 1,
    difficulty: 'easy',
    timeOfDay: 'anytime',
    duration: 10
  },
  {
    title: 'Call Family/Friends',
    description: 'Stay connected with loved ones',
    category: 'social',
    icon: '📞',
    color: '#84cc16',
    frequency: 'weekly',
    target: 3,
    difficulty: 'easy',
    timeOfDay: 'anytime'
  }
];

const categoryIcons = {
  health: Heart,
  productivity: Target,
  learning: BookOpen,
  wellness: Sun,
  social: Coffee,
  creative: Sparkles
};

export function HabitsSection() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showNewHabitForm, setShowNewHabitForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [aiInsights, setAiInsights] = useState<any[]>([]);

  // Initialize with some sample habits
  useEffect(() => {
    const sampleHabits: Habit[] = [
      {
        id: '1',
        title: 'Morning Exercise',
        description: '15 minutes of physical activity',
        category: 'health',
        icon: '🏃‍♂️',
        color: '#ef4444',
        frequency: 'daily',
        target: 1,
        difficulty: 'medium',
        streak: 7,
        longestStreak: 12,
        completedToday: true,
        completedDates: ['2025-01-15', '2025-01-14', '2025-01-13', '2025-01-12', '2025-01-11', '2025-01-10', '2025-01-09'],
        createdAt: new Date('2025-01-08'),
        timeOfDay: 'morning',
        duration: 15,
        aiSuggestions: {
          stackWith: ['meditation', 'water'],
          optimalTime: '7:00 AM - Most energy available',
          microHabits: ['Put on workout clothes', 'Do 5 jumping jacks', 'Walk for 2 minutes'],
          recoveryTips: ['Start with just 5 minutes', 'Try a different activity', 'Exercise with a friend']
        }
      },
      {
        id: '2',
        title: 'Read for 20 minutes',
        description: 'Read books, articles, or educational content',
        category: 'learning',
        icon: '📚',
        color: '#8b5cf6',
        frequency: 'daily',
        target: 1,
        difficulty: 'easy',
        streak: 3,
        longestStreak: 15,
        completedToday: false,
        completedDates: ['2025-01-14', '2025-01-13', '2025-01-12'],
        createdAt: new Date('2025-01-01'),
        timeOfDay: 'evening',
        duration: 20,
        aiSuggestions: {
          stackWith: ['tea', 'meditation'],
          optimalTime: '9:00 PM - Wind down period',
          microHabits: ['Open book/app', 'Read one page', 'Read for 5 minutes'],
          recoveryTips: ['Try audiobooks', 'Read shorter articles', 'Set book beside bed']
        }
      },
      {
        id: '3',
        title: 'Drink Water',
        description: 'Stay hydrated throughout the day',
        category: 'health',
        icon: '💧',
        color: '#3b82f6',
        frequency: 'daily',
        target: 8,
        difficulty: 'easy',
        streak: 12,
        longestStreak: 25,
        completedToday: true,
        completedDates: ['2025-01-15', '2025-01-14', '2025-01-13', '2025-01-12', '2025-01-11', '2025-01-10', '2025-01-09', '2025-01-08', '2025-01-07', '2025-01-06', '2025-01-05', '2025-01-04'],
        createdAt: new Date('2024-12-20'),
        timeOfDay: 'anytime'
      }
    ];
    
    if (habits.length === 0) {
      setHabits(sampleHabits);
    }

    // Mock AI insights
    setAiInsights([
      {
        type: 'stack_suggestion',
        title: 'Habit Stacking Opportunity',
        description: 'Try doing "Review Daily Goals" right after "Morning Exercise" - both are morning habits!',
        actionable: true
      },
      {
        type: 'timing_optimization',
        title: 'Optimal Timing',
        description: 'Your reading habit succeeds 85% more when done at 9:00 PM vs other times.',
        actionable: false
      },
      {
        type: 'streak_recovery',
        title: 'Streak Recovery Plan',
        description: 'Your "Reading" streak broke yesterday. Start with just 5 minutes tonight to rebuild momentum.',
        actionable: true
      }
    ]);
  }, [habits.length]);

  // Filter habits by category
  const filteredHabits = selectedCategory === 'all' 
    ? habits 
    : habits.filter(habit => habit.category === selectedCategory);

  // Calculate stats
  const todayCompleted = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? (todayCompleted / totalHabits) * 100 : 0;
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0);

  // Handle habit completion toggle
  const toggleHabitCompletion = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const wasCompleted = habit.completedToday;
        const newCompletedDates = wasCompleted
          ? habit.completedDates.filter(date => date !== today)
          : [...habit.completedDates, today];
        
        const newStreak = wasCompleted 
          ? Math.max(0, habit.streak - 1)
          : habit.streak + 1;

        return {
          ...habit,
          completedToday: !wasCompleted,
          completedDates: newCompletedDates,
          streak: newStreak,
          longestStreak: Math.max(habit.longestStreak, newStreak)
        };
      }
      return habit;
    }));
  };

  // Add new habit
  const addHabit = (template: HabitTemplate, customTitle?: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      title: customTitle || template.title,
      description: template.description,
      category: template.category,
      icon: template.icon,
      color: template.color,
      frequency: template.frequency,
      target: template.target,
      difficulty: template.difficulty,
      streak: 0,
      longestStreak: 0,
      completedToday: false,
      completedDates: [],
      createdAt: new Date(),
      timeOfDay: template.timeOfDay,
      duration: template.duration
    };
    
    setHabits([...habits, newHabit]);
    setShowNewHabitForm(false);
    setSelectedTemplate(null);
  };

  // Delete habit
  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter(h => h.id !== habitId));
  };

  const getDifficultyColor = (difficulty: Habit['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
    }
  };

  const getCategoryColor = (category: Habit['category']) => {
    const colors = {
      health: 'text-red-600',
      productivity: 'text-orange-600',
      learning: 'text-purple-600',
      wellness: 'text-green-600',
      social: 'text-blue-600',
      creative: 'text-pink-600'
    };
    return colors[category];
  };

  return (
    <div className="habits-section-clockwyz">
      {/* Header */}
      <div className="habits-header-clockwyz">
        <div className="habits-title-section-clockwyz">
          <h1 className="habits-main-title-clockwyz">Habit Builder</h1>
          <p className="habits-subtitle-clockwyz">Build lasting routines with AI-powered insights</p>
        </div>
        <div className="habits-controls-clockwyz">
          <Button
            onClick={() => setShowTemplates(true)}
            className="add-habit-btn-clockwyz"
          >
            <Plus className="w-4 h-4" />
            Add Habit
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="habits-stats-clockwyz">
        <Card className="stat-card-habits-clockwyz completion">
          <CardContent className="stat-content-habits-clockwyz">
            <div className="stat-icon-habits-clockwyz">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="stat-details-habits-clockwyz">
              <span className="stat-number-habits-clockwyz">{todayCompleted}/{totalHabits}</span>
              <span className="stat-label-habits-clockwyz">Today's Progress</span>
              <div className="stat-bar-habits-clockwyz">
                <div 
                  className="stat-fill-habits-clockwyz" 
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card-habits-clockwyz streak">
          <CardContent className="stat-content-habits-clockwyz">
            <div className="stat-icon-habits-clockwyz streak">
              <Flame className="w-5 h-5" />
            </div>
            <div className="stat-details-habits-clockwyz">
              <span className="stat-number-habits-clockwyz">{totalStreak}</span>
              <span className="stat-label-habits-clockwyz">Active Streaks</span>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card-habits-clockwyz record">
          <CardContent className="stat-content-habits-clockwyz">
            <div className="stat-icon-habits-clockwyz record">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="stat-details-habits-clockwyz">
              <span className="stat-number-habits-clockwyz">{longestStreak}</span>
              <span className="stat-label-habits-clockwyz">Best Streak</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <Card className="ai-insights-card-clockwyz">
          <CardHeader className="ai-insights-header-clockwyz">
            <CardTitle className="ai-insights-title-clockwyz">
              <Brain className="w-5 h-5" />
              AI Insights & Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="ai-insights-content-clockwyz">
            {aiInsights.map((insight, index) => (
              <div key={index} className="ai-insight-item-clockwyz">
                <div className="insight-icon-wrapper-habits-clockwyz">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div className="insight-content-habits-clockwyz">
                  <h4 className="insight-title-habits-clockwyz">{insight.title}</h4>
                  <p className="insight-description-habits-clockwyz">{insight.description}</p>
                  {insight.actionable && (
                    <Button size="sm" variant="outline" className="insight-action-btn-clockwyz">
                      Apply Suggestion
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="category-filter-clockwyz">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
          className="category-btn-clockwyz"
        >
          All
        </Button>
        {Object.entries(categoryIcons).map(([category, Icon]) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="category-btn-clockwyz"
          >
            <Icon className="w-4 h-4" />
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Habits List */}
      <div className="habits-list-clockwyz">
        {filteredHabits.map((habit) => (
          <Card key={habit.id} className="habit-card-clockwyz">
            <CardContent className="habit-card-content-clockwyz">
              <div className="habit-main-row-clockwyz">
                <div className="habit-checkbox-section-clockwyz">
                  <button
                    onClick={() => toggleHabitCompletion(habit.id)}
                    className={cn(
                      "habit-checkbox-clockwyz",
                      habit.completedToday && "completed"
                    )}
                    style={{ borderColor: habit.color }}
                  >
                    {habit.completedToday && <CheckCircle className="w-4 h-4" style={{ color: habit.color }} />}
                  </button>
                </div>

                <div className="habit-content-clockwyz">
                  <div className="habit-header-clockwyz">
                    <div className="habit-title-row-clockwyz">
                      <span className="habit-emoji-clockwyz">{habit.icon}</span>
                      <h3 className={cn(
                        "habit-title-clockwyz",
                        habit.completedToday && "completed"
                      )}>
                        {habit.title}
                      </h3>
                      <Badge 
                        className={getDifficultyColor(habit.difficulty)}
                        variant="secondary"
                      >
                        {habit.difficulty}
                      </Badge>
                    </div>
                    <div className="habit-meta-clockwyz">
                      <div className="habit-streak-clockwyz">
                        <Flame className="w-3 h-3" />
                        <span>{habit.streak} day streak</span>
                      </div>
                      {habit.timeOfDay && (
                        <div className="habit-time-clockwyz">
                          <Clock className="w-3 h-3" />
                          <span>{habit.timeOfDay}</span>
                        </div>
                      )}
                      {habit.duration && (
                        <div className="habit-duration-clockwyz">
                          <Timer className="w-3 h-3" />
                          <span>{habit.duration}min</span>
                        </div>
                      )}
                    </div>
                    {habit.description && (
                      <p className="habit-description-clockwyz">{habit.description}</p>
                    )}
                  </div>
                </div>

                <div className="habit-actions-clockwyz">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedHabit(expandedHabit === habit.id ? null : habit.id)}
                    className="expand-btn-clockwyz"
                  >
                    {expandedHabit === habit.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteHabit(habit.id)}
                    className="delete-btn-clockwyz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedHabit === habit.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="habit-expanded-clockwyz"
                  >
                    <div className="habit-stats-expanded-clockwyz">
                      <div className="stat-item-expanded-clockwyz">
                        <Trophy className="w-4 h-4" />
                        <span>Best: {habit.longestStreak} days</span>
                      </div>
                      <div className="stat-item-expanded-clockwyz">
                        <BarChart3 className="w-4 h-4" />
                        <span>Total: {habit.completedDates.length} times</span>
                      </div>
                      <div className="stat-item-expanded-clockwyz">
                        <Calendar className="w-4 h-4" />
                        <span>Since: {habit.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* AI Suggestions */}
                    {habit.aiSuggestions && (
                      <div className="ai-suggestions-expanded-clockwyz">
                        <h4 className="ai-suggestions-title-clockwyz">
                          <Brain className="w-4 h-4" />
                          AI Suggestions
                        </h4>
                        
                        {habit.aiSuggestions.optimalTime && (
                          <div className="ai-suggestion-item-clockwyz">
                            <Clock className="w-3 h-3" />
                            <span>{habit.aiSuggestions.optimalTime}</span>
                          </div>
                        )}
                        
                        {habit.aiSuggestions.stackWith && (
                          <div className="ai-suggestion-item-clockwyz">
                            <Target className="w-3 h-3" />
                            <span>Stack with: {habit.aiSuggestions.stackWith.join(', ')}</span>
                          </div>
                        )}
                        
                        {habit.aiSuggestions.microHabits && (
                          <div className="ai-suggestion-item-clockwyz">
                            <Sparkles className="w-3 h-3" />
                            <span>Micro-habits: {habit.aiSuggestions.microHabits[0]}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="habit-quick-actions-clockwyz">
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <RotateCcw className="w-3 h-3" />
                        Reset Streak
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="w-3 h-3" />
                        View Stats
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredHabits.length === 0 && (
        <div className="empty-habits-clockwyz">
          <Target className="w-12 h-12 empty-icon-clockwyz" />
          <h3>No habits yet</h3>
          <p>Start building better routines by adding your first habit</p>
          <Button onClick={() => setShowTemplates(true)}>
            <Plus className="w-4 h-4" />
            Add Your First Habit
          </Button>
        </div>
      )}

      {/* Habit Templates Modal */}
      <AnimatePresence>
        {showTemplates && (
          <>
            <motion.div
              className="templates-backdrop-clockwyz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTemplates(false)}
            />
            <motion.div
              className="templates-modal-clockwyz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="templates-header-clockwyz">
                <h2 className="templates-title-clockwyz">Choose a Habit Template</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(false)}
                  className="templates-close-btn-clockwyz"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="templates-content-clockwyz">
                <div className="templates-grid-clockwyz">
                  {habitTemplates.map((template, index) => (
                    <div
                      key={index}
                      className="template-card-clockwyz"
                      onClick={() => addHabit(template)}
                    >
                      <div className="template-header-clockwyz">
                        <span className="template-emoji-clockwyz">{template.icon}</span>
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {template.difficulty}
                        </Badge>
                      </div>
                      <h3 className="template-title-clockwyz">{template.title}</h3>
                      <p className="template-description-clockwyz">{template.description}</p>
                      <div className="template-meta-clockwyz">
                        <span className="template-frequency-clockwyz">
                          {template.frequency === 'daily' ? 'Daily' : `${template.target}x per week`}
                        </span>
                        {template.duration && (
                          <span className="template-duration-clockwyz">{template.duration}min</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}