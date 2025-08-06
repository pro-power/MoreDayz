'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Calendar,
  Award,
  Activity,
  Brain,
  CheckCircle,
  Flame,
  Zap,
  BookOpen,
  Users,
  Coffee,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  Star,
  Trophy
} from 'lucide-react';

import { useScheduleStore } from '@/lib/store/schedule-store';
import { ScheduleEvent, EventType } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  color: string;
}

interface TimeData {
  day: string;
  focus: number;
  study: number;
  meetings: number;
  classes: number;
}

export function StatsSection() {
  const { events } = useScheduleStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'semester'>('week');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Calculate date ranges
  const today = new Date();
  const getDateRange = (period: string) => {
    const end = new Date(today);
    const start = new Date(today);
    
    switch (period) {
      case 'week':
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start.setDate(today.getDate() - 30);
        break;
      case 'semester':
        start.setDate(today.getDate() - 120);
        break;
    }
    
    return { start, end };
  };

  // Filter events based on selected period
  const { start, end } = getDateRange(selectedPeriod);
  const periodEvents = events.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate >= start && eventDate <= end;
  });

  // Calculate comprehensive stats
  const stats = {
    totalTasks: periodEvents.length,
    completedTasks: periodEvents.filter(e => e.isCompleted).length,
    focusHours: periodEvents
      .filter(e => e.type === EventType.FOCUS)
      .reduce((acc, e) => acc + (e.duration / 60), 0),
    studyHours: periodEvents
      .filter(e => e.type === EventType.STUDY)
      .reduce((acc, e) => acc + (e.duration / 60), 0),
    classHours: periodEvents
      .filter(e => e.type === EventType.CLASS)
      .reduce((acc, e) => acc + (e.duration / 60), 0),
    meetingHours: periodEvents
      .filter(e => e.type === EventType.MEETING)
      .reduce((acc, e) => acc + (e.duration / 60), 0),
    assignmentsCompleted: periodEvents
      .filter(e => e.type === EventType.ASSIGNMENT && e.isCompleted).length,
    totalAssignments: periodEvents.filter(e => e.type === EventType.ASSIGNMENT).length,
  };

  // Calculate productivity metrics
  const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
  const assignmentRate = stats.totalAssignments > 0 ? (stats.assignmentsCompleted / stats.totalAssignments) * 100 : 0;
  const totalProductiveHours = stats.focusHours + stats.studyHours;
  const averageDaily = totalProductiveHours / (selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 120);

  // Mock trend data (replace with real calculations)
  const getTrend = (current: number, target: number) => {
    const diff = ((current - target) / target) * 100;
    if (diff > 5) return { direction: 'up' as const, value: `+${diff.toFixed(1)}%` };
    if (diff < -5) return { direction: 'down' as const, value: `${diff.toFixed(1)}%` };
    return { direction: 'neutral' as const, value: '~' };
  };

  // Main stat cards
  const statCards: StatCard[] = [
    {
      title: 'Completion Rate',
      value: `${completionRate.toFixed(1)}%`,
      subtitle: `${stats.completedTasks}/${stats.totalTasks} tasks completed`,
      icon: CheckCircle,
      trend: getTrend(completionRate, 85),
      color: 'text-green-600'
    },
    {
      title: 'Focus Time',
      value: `${stats.focusHours.toFixed(1)}h`,
      subtitle: `${averageDaily.toFixed(1)}h daily average`,
      icon: Brain,
      trend: getTrend(stats.focusHours, selectedPeriod === 'week' ? 20 : 80),
      color: 'text-blue-600'
    },
    {
      title: 'Study Hours',
      value: `${stats.studyHours.toFixed(1)}h`,
      subtitle: `${stats.classHours.toFixed(1)}h in classes`,
      icon: BookOpen,
      trend: getTrend(stats.studyHours, selectedPeriod === 'week' ? 15 : 60),
      color: 'text-purple-600'
    },
    {
      title: 'Assignment Success',
      value: `${assignmentRate.toFixed(0)}%`,
      subtitle: `${stats.assignmentsCompleted}/${stats.totalAssignments} completed`,
      icon: Target,
      trend: getTrend(assignmentRate, 90),
      color: 'text-orange-600'
    }
  ];

  // Weekly breakdown data (mock data for visualization)
  const weeklyData: TimeData[] = [
    { day: 'Mon', focus: 3.5, study: 2.0, meetings: 1.0, classes: 2.5 },
    { day: 'Tue', focus: 4.0, study: 1.5, meetings: 0.5, classes: 3.0 },
    { day: 'Wed', focus: 2.5, study: 3.0, meetings: 1.5, classes: 2.0 },
    { day: 'Thu', focus: 3.0, study: 2.5, meetings: 1.0, classes: 2.5 },
    { day: 'Fri', focus: 2.0, study: 1.0, meetings: 2.0, classes: 3.0 },
    { day: 'Sat', focus: 1.5, study: 4.0, meetings: 0.0, classes: 0.0 },
    { day: 'Sun', focus: 1.0, study: 2.0, meetings: 0.5, classes: 0.0 }
  ];

  // Insights based on data
  const insights = [
    {
      title: 'Peak Productivity',
      description: 'You\'re most productive on Tuesdays with 4h of focused work',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Improvement Opportunity',
      description: 'Weekend study sessions could be more consistent',
      icon: TrendingDown,
      color: 'text-orange-600'
    },
    {
      title: 'Strength',
      description: 'Class attendance is excellent at 95%',
      icon: Star,
      color: 'text-blue-600'
    }
  ];

  // Achievements/streaks
  const achievements = [
    { title: 'Focus Streak', days: 5, icon: Flame, color: 'text-red-500' },
    { title: 'Study Consistency', days: 12, icon: Trophy, color: 'text-yellow-500' },
    { title: 'Task Completion', days: 3, icon: CheckCircle, color: 'text-green-500' }
  ];

  const handlePeriodChange = (period: 'week' | 'month' | 'semester') => {
    setSelectedPeriod(period);
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  return (
    <div className="stats-section-clockwyz">
      {/* Header */}
      <div className="stats-header-clockwyz">
        <div className="stats-title-section-clockwyz">
          <h1 className="stats-main-title-clockwyz">Analytics & Insights</h1>
          <p className="stats-subtitle-clockwyz">Track your productivity and identify patterns</p>
        </div>
        <div className="stats-controls-clockwyz">
          <div className="period-selector-clockwyz">
            {(['week', 'month', 'semester'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                onClick={() => handlePeriodChange(period)}
                className="period-btn-clockwyz"
              >
                {period === 'week' ? 'This Week' : 
                 period === 'month' ? 'This Month' : 
                 'This Semester'}
              </Button>
            ))}
          </div>
          <Button variant="outline" className="export-btn-clockwyz">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="main-stats-grid-clockwyz">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="stat-card-clockwyz">
              <CardContent className="stat-card-content-clockwyz">
                <div className="stat-header-row-clockwyz">
                  <div className="stat-icon-wrapper-clockwyz">
                    <stat.icon className={cn("stat-icon-clockwyz", stat.color)} />
                  </div>
                  {stat.trend && (
                    <div className={cn(
                      "trend-indicator-clockwyz",
                      stat.trend.direction === 'up' ? 'positive' : 
                      stat.trend.direction === 'down' ? 'negative' : 'neutral'
                    )}>
                      {stat.trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
                      {stat.trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
                      <span>{stat.trend.value}</span>
                    </div>
                  )}
                </div>
                <div className="stat-main-content-clockwyz">
                  <h3 className="stat-value-clockwyz">{stat.value}</h3>
                  <p className="stat-title-clockwyz">{stat.title}</p>
                  <p className="stat-subtitle-clockwyz">{stat.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Time Breakdown Chart */}
      <Card className="chart-card-clockwyz">
        <CardHeader className="chart-header-clockwyz">
          <CardTitle className="chart-title-clockwyz">
            <Activity className="w-5 h-5" />
            Weekly Time Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="chart-content-clockwyz">
          <div className="chart-legend-clockwyz">
            <div className="legend-item-clockwyz focus">
              <div className="legend-dot-clockwyz"></div>
              <span>Focus Time</span>
            </div>
            <div className="legend-item-clockwyz study">
              <div className="legend-dot-clockwyz"></div>
              <span>Study</span>
            </div>
            <div className="legend-item-clockwyz meetings">
              <div className="legend-dot-clockwyz"></div>
              <span>Meetings</span>
            </div>
            <div className="legend-item-clockwyz classes">
              <div className="legend-dot-clockwyz"></div>
              <span>Classes</span>
            </div>
          </div>
          <div className="chart-container-clockwyz">
            {weeklyData.map((day) => (
              <div key={day.day} className="chart-day-clockwyz">
                <div className="chart-bars-clockwyz">
                  <div 
                    className="chart-bar-clockwyz focus" 
                    style={{ height: `${(day.focus / 5) * 100}%` }}
                    title={`Focus: ${day.focus}h`}
                  ></div>
                  <div 
                    className="chart-bar-clockwyz study" 
                    style={{ height: `${(day.study / 5) * 100}%` }}
                    title={`Study: ${day.study}h`}
                  ></div>
                  <div 
                    className="chart-bar-clockwyz meetings" 
                    style={{ height: `${(day.meetings / 5) * 100}%` }}
                    title={`Meetings: ${day.meetings}h`}
                  ></div>
                  <div 
                    className="chart-bar-clockwyz classes" 
                    style={{ height: `${(day.classes / 5) * 100}%` }}
                    title={`Classes: ${day.classes}h`}
                  ></div>
                </div>
                <span className="chart-day-label-clockwyz">{day.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid */}
      <div className="bottom-grid-clockwyz">
        {/* Insights */}
        <Card className="insights-card-clockwyz">
          <CardHeader className="insights-header-clockwyz">
            <CardTitle className="insights-title-clockwyz">
              <Brain className="w-5 h-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="insights-content-clockwyz">
            <div className="insights-list-clockwyz">
              {insights.map((insight, index) => (
                <div key={index} className="insight-item-clockwyz">
                  <div className="insight-icon-wrapper-clockwyz">
                    <insight.icon className={cn("insight-icon-clockwyz", insight.color)} />
                  </div>
                  <div className="insight-content-wrapper-clockwyz">
                    <h4 className="insight-title-clockwyz">{insight.title}</h4>
                    <p className="insight-description-clockwyz">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="achievements-card-clockwyz">
          <CardHeader className="achievements-header-clockwyz">
            <CardTitle className="achievements-title-clockwyz">
              <Award className="w-5 h-5" />
              Current Streaks
            </CardTitle>
          </CardHeader>
          <CardContent className="achievements-content-clockwyz">
            <div className="achievements-list-clockwyz">
              {achievements.map((achievement, index) => (
                <div key={index} className="achievement-item-clockwyz">
                  <div className="achievement-icon-wrapper-clockwyz">
                    <achievement.icon className={cn("achievement-icon-clockwyz", achievement.color)} />
                  </div>
                  <div className="achievement-content-clockwyz">
                    <h4 className="achievement-title-clockwyz">{achievement.title}</h4>
                    <p className="achievement-days-clockwyz">{achievement.days} days</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      <Card className="goals-card-clockwyz">
        <CardHeader className="goals-header-clockwyz">
          <CardTitle className="goals-title-clockwyz">
            <Target className="w-5 h-5" />
            Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="goals-content-clockwyz">
          <div className="goals-list-clockwyz">
            <div className="goal-item-clockwyz">
              <div className="goal-info-clockwyz">
                <span className="goal-title-clockwyz">Daily Focus Time</span>
                <span className="goal-target-clockwyz">4.2h / 5.0h</span>
              </div>
              <div className="goal-progress-clockwyz">
                <div className="progress-bar-clockwyz">
                  <div className="progress-fill-clockwyz" style={{ width: '84%' }}></div>
                </div>
                <span className="progress-percentage-clockwyz">84%</span>
              </div>
            </div>
            <div className="goal-item-clockwyz">
              <div className="goal-info-clockwyz">
                <span className="goal-title-clockwyz">Weekly Study Hours</span>
                <span className="goal-target-clockwyz">18h / 20h</span>
              </div>
              <div className="goal-progress-clockwyz">
                <div className="progress-bar-clockwyz">
                  <div className="progress-fill-clockwyz" style={{ width: '90%' }}></div>
                </div>
                <span className="progress-percentage-clockwyz">90%</span>
              </div>
            </div>
            <div className="goal-item-clockwyz">
              <div className="goal-info-clockwyz">
                <span className="goal-title-clockwyz">Assignment Completion</span>
                <span className="goal-target-clockwyz">9 / 10</span>
              </div>
              <div className="goal-progress-clockwyz">
                <div className="progress-bar-clockwyz">
                  <div className="progress-fill-clockwyz" style={{ width: '90%' }}></div>
                </div>
                <span className="progress-percentage-clockwyz">90%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}