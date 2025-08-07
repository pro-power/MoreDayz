'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  Plus,
  Calendar,
  Clock,
  VideoIcon,
  Link2,
  MapPin,
  User,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  FileText,
  MessageSquare,
  Settings,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  X,
  Send,
  UserPlus,
  Clipboard
} from 'lucide-react';

import { useScheduleStore } from '@/lib/store/schedule-store';
import { ScheduleEvent, EventType } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  meetingLink?: string;
  platform?: 'zoom' | 'teams' | 'meet' | 'other';
  participants: Participant[];
  organizer: string;
  agenda?: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  type: 'team' | 'client' | 'interview' | 'presentation' | 'casual' | 'other';
  isRecurring?: boolean;
  followUpTasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  role?: 'organizer' | 'required' | 'optional';
  avatar?: string;
}

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  dueDate?: Date;
  completed: boolean;
}

const platformIcons = {
  zoom: '🔵',
  teams: '🟣',
  meet: '🟢',
  other: '📹'
};

const meetingTypes = [
  { value: 'team', label: 'Team Meeting', color: 'bg-blue-100 text-blue-800' },
  { value: 'client', label: 'Client Call', color: 'bg-green-100 text-green-800' },
  { value: 'interview', label: 'Interview', color: 'bg-purple-100 text-purple-800' },
  { value: 'presentation', label: 'Presentation', color: 'bg-orange-100 text-orange-800' },
  { value: 'casual', label: 'Casual Chat', color: 'bg-gray-100 text-gray-800' },
  { value: 'other', label: 'Other', color: 'bg-indigo-100 text-indigo-800' }
];

export function MeetingsSection() {
  const { events, addEvent, updateEvent, deleteEvent } = useScheduleStore();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form state
  const [newMeeting, setNewMeeting] = useState<Partial<Meeting>>({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
    location: '',
    meetingLink: '',
    platform: 'zoom',
    participants: [],
    agenda: [''],
    type: 'team'
  });
  const [newParticipant, setNewParticipant] = useState({ name: '', email: '' });

  // Initialize with sample meetings
  useEffect(() => {
    const sampleMeetings: Meeting[] = [
      {
        id: '1',
        title: 'Weekly Team Standup',
        description: 'Review progress and plan for the week',
        startTime: new Date('2025-01-16T09:00:00'),
        endTime: new Date('2025-01-16T09:30:00'),
        meetingLink: 'https://zoom.us/j/123456789',
        platform: 'zoom',
        participants: [
          { id: '1', name: 'Alice Johnson', email: 'alice@company.com', status: 'accepted', role: 'required' },
          { id: '2', name: 'Bob Smith', email: 'bob@company.com', status: 'accepted', role: 'required' },
          { id: '3', name: 'Carol Davis', email: 'carol@company.com', status: 'pending', role: 'optional' }
        ],
        organizer: 'You',
        agenda: ['Review last week\'s goals', 'Discuss current blockers', 'Set priorities for this week'],
        status: 'scheduled',
        type: 'team',
        isRecurring: true,
        followUpTasks: [],
        createdAt: new Date('2025-01-10'),
        updatedAt: new Date('2025-01-15')
      },
      {
        id: '2',
        title: 'Client Presentation - Q4 Results',
        description: 'Present quarterly results to stakeholders',
        startTime: new Date('2025-01-17T14:00:00'),
        endTime: new Date('2025-01-17T15:00:00'),
        location: 'Conference Room A',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        platform: 'meet',
        participants: [
          { id: '4', name: 'Michael Chen', email: 'michael@client.com', status: 'accepted', role: 'required' },
          { id: '5', name: 'Sarah Wilson', email: 'sarah@client.com', status: 'accepted', role: 'required' }
        ],
        organizer: 'You',
        agenda: ['Q4 Performance Overview', 'Key Achievements', 'Q1 Roadmap', 'Q&A'],
        status: 'scheduled',
        type: 'client',
        followUpTasks: [
          { id: '1', title: 'Send presentation slides', assignedTo: 'You', completed: false },
          { id: '2', title: 'Schedule follow-up meeting', assignedTo: 'You', completed: false }
        ],
        createdAt: new Date('2025-01-12'),
        updatedAt: new Date('2025-01-15')
      },
      {
        id: '3',
        title: 'Project Kickoff - Mobile App',
        description: 'Kickoff meeting for the new mobile application project',
        startTime: new Date('2025-01-20T10:00:00'),
        endTime: new Date('2025-01-20T11:30:00'),
        meetingLink: 'https://teams.microsoft.com/l/meetup-join/xyz',
        platform: 'teams',
        participants: [
          { id: '6', name: 'David Lee', email: 'david@company.com', status: 'accepted', role: 'required' },
          { id: '7', name: 'Emma Brown', email: 'emma@company.com', status: 'accepted', role: 'required' },
          { id: '8', name: 'Frank Miller', email: 'frank@company.com', status: 'tentative', role: 'optional' }
        ],
        organizer: 'David Lee',
        agenda: ['Project overview', 'Team introductions', 'Timeline discussion', 'Next steps'],
        status: 'scheduled',
        type: 'team',
        followUpTasks: [],
        createdAt: new Date('2025-01-14'),
        updatedAt: new Date('2025-01-14')
      }
    ];
    
    if (meetings.length === 0) {
      setMeetings(sampleMeetings);
    }
  }, [meetings.length]);

  // Filter meetings
  const filteredMeetings = meetings.filter(meeting => {
    const matchesType = filterType === 'all' || meeting.type === filterType;
    const matchesSearch = meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meeting.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meeting.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // Sort meetings by start time
  const sortedMeetings = filteredMeetings.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Get upcoming meetings
  const now = new Date();
  const upcomingMeetings = sortedMeetings.filter(m => m.startTime > now && m.status === 'scheduled');
  const todayMeetings = sortedMeetings.filter(m => {
    const meetingDate = new Date(m.startTime);
    const today = new Date();
    return meetingDate.toDateString() === today.toDateString();
  });

  // Add participant to new meeting
  const addParticipant = () => {
    if (newParticipant.name && newParticipant.email) {
      const participant: Participant = {
        id: Date.now().toString(),
        name: newParticipant.name,
        email: newParticipant.email,
        status: 'pending',
        role: 'required'
      };
      
      setNewMeeting(prev => ({
        ...prev,
        participants: [...(prev.participants || []), participant]
      }));
      
      setNewParticipant({ name: '', email: '' });
    }
  };

  // Remove participant
  const removeParticipant = (participantId: string) => {
    setNewMeeting(prev => ({
      ...prev,
      participants: prev.participants?.filter(p => p.id !== participantId) || []
    }));
  };

  // Add agenda item
  const addAgendaItem = () => {
    setNewMeeting(prev => ({
      ...prev,
      agenda: [...(prev.agenda || []), '']
    }));
  };

  // Update agenda item
  const updateAgendaItem = (index: number, value: string) => {
    setNewMeeting(prev => ({
      ...prev,
      agenda: prev.agenda?.map((item, i) => i === index ? value : item) || []
    }));
  };

  // Remove agenda item
  const removeAgendaItem = (index: number) => {
    setNewMeeting(prev => ({
      ...prev,
      agenda: prev.agenda?.filter((_, i) => i !== index) || []
    }));
  };

  // Create meeting
  const createMeeting = () => {
    if (!newMeeting.title || !newMeeting.startTime || !newMeeting.endTime) return;

    const meeting: Meeting = {
      id: Date.now().toString(),
      title: newMeeting.title,
      description: newMeeting.description,
      startTime: new Date(newMeeting.startTime),
      endTime: new Date(newMeeting.endTime),
      location: newMeeting.location,
      meetingLink: newMeeting.meetingLink,
      platform: newMeeting.platform || 'zoom',
      participants: newMeeting.participants || [],
      organizer: 'You',
      agenda: newMeeting.agenda?.filter(item => item.trim()) || [],
      status: 'scheduled',
      type: newMeeting.type || 'team',
      followUpTasks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setMeetings([...meetings, meeting]);

    // Also add to schedule as an event
    const scheduleEvent: ScheduleEvent = {
      id: meeting.id,
      title: meeting.title,
      type: EventType.MEETING,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      duration: (meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60),
      color: '#6366f1',
      emoji: '👥',
      location: meeting.location,
      description: meeting.description,
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][meeting.startTime.getDay()],
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    addEvent(scheduleEvent);
    setShowNewMeetingForm(false);
    resetForm();
  };

  const resetForm = () => {
    setNewMeeting({
      title: '',
      description: '',
      startTime: new Date(),
      endTime: new Date(),
      location: '',
      meetingLink: '',
      platform: 'zoom',
      participants: [],
      agenda: [''],
      type: 'team'
    });
  };

  // Join meeting (open link)
  const joinMeeting = (meeting: Meeting) => {
    if (meeting.meetingLink) {
      window.open(meeting.meetingLink, '_blank');
    }
  };

  // Copy meeting link
  const copyMeetingLink = (meeting: Meeting) => {
    if (meeting.meetingLink) {
      navigator.clipboard.writeText(meeting.meetingLink);
    }
  };

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
    }
  };

  const getTypeInfo = (type: Meeting['type']) => {
    return meetingTypes.find(t => t.value === type) || meetingTypes[meetingTypes.length - 1];
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="meetings-section-clockwyz">
      {/* Header */}
      <div className="meetings-header-clockwyz">
        <div className="meetings-title-section-clockwyz">
          <h1 className="meetings-main-title-clockwyz">Meetings</h1>
          <p className="meetings-subtitle-clockwyz">Organize and manage your meetings efficiently</p>
        </div>
        <div className="meetings-controls-clockwyz">
          <div className="meetings-search-clockwyz">
            <Search className="w-4 h-4 search-icon-clockwyz" />
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-clockwyz"
            />
          </div>
          <Button
            onClick={() => setShowNewMeetingForm(true)}
            className="add-meeting-btn-clockwyz"
          >
            <Plus className="w-4 h-4" />
            New Meeting
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="meetings-stats-clockwyz">
        <Card className="stat-card-meetings-clockwyz">
          <CardContent className="stat-content-meetings-clockwyz">
            <div className="stat-icon-meetings-clockwyz">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="stat-details-meetings-clockwyz">
              <span className="stat-number-meetings-clockwyz">{todayMeetings.length}</span>
              <span className="stat-label-meetings-clockwyz">Today</span>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card-meetings-clockwyz">
          <CardContent className="stat-content-meetings-clockwyz">
            <div className="stat-icon-meetings-clockwyz upcoming">
              <Clock className="w-5 h-5" />
            </div>
            <div className="stat-details-meetings-clockwyz">
              <span className="stat-number-meetings-clockwyz">{upcomingMeetings.length}</span>
              <span className="stat-label-meetings-clockwyz">Upcoming</span>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card-meetings-clockwyz">
          <CardContent className="stat-content-meetings-clockwyz">
            <div className="stat-icon-meetings-clockwyz total">
              <Users className="w-5 h-5" />
            </div>
            <div className="stat-details-meetings-clockwyz">
              <span className="stat-number-meetings-clockwyz">{meetings.length}</span>
              <span className="stat-label-meetings-clockwyz">Total</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="meetings-filters-clockwyz">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterType('all')}
          className="filter-btn-meetings-clockwyz"
        >
          All
        </Button>
        {meetingTypes.map((type) => (
          <Button
            key={type.value}
            variant={filterType === type.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(type.value)}
            className="filter-btn-meetings-clockwyz"
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Meetings List */}
      <div className="meetings-list-clockwyz">
        {sortedMeetings.map((meeting) => (
          <Card key={meeting.id} className="meeting-card-clockwyz">
            <CardContent className="meeting-card-content-clockwyz">
              <div className="meeting-main-row-clockwyz">
                <div className="meeting-content-clockwyz">
                  <div className="meeting-header-clockwyz">
                    <div className="meeting-title-row-clockwyz">
                      <h3 className="meeting-title-clockwyz">{meeting.title}</h3>
                      <div className="meeting-badges-clockwyz">
                        <Badge className={getStatusColor(meeting.status)}>
                          {meeting.status}
                        </Badge>
                        <Badge className={getTypeInfo(meeting.type).color}>
                          {getTypeInfo(meeting.type).label}
                        </Badge>
                        {meeting.isRecurring && (
                          <Badge variant="outline">
                            Recurring
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="meeting-time-clockwyz">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(meeting.startTime)}</span>
                      <span className="meeting-duration-clockwyz">
                        ({Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60))} min)
                      </span>
                    </div>

                    {meeting.description && (
                      <p className="meeting-description-clockwyz">{meeting.description}</p>
                    )}

                    <div className="meeting-meta-clockwyz">
                      {meeting.location && (
                        <div className="meeting-location-clockwyz">
                          <MapPin className="w-3 h-3" />
                          <span>{meeting.location}</span>
                        </div>
                      )}
                      
                      {meeting.meetingLink && (
                        <div className="meeting-platform-clockwyz">
                          <VideoIcon className="w-3 h-3" />
                          <span>{meeting.platform}</span>
                          <span className="platform-emoji-clockwyz">
                            {platformIcons[meeting.platform || 'other']}
                          </span>
                        </div>
                      )}

                      <div className="meeting-participants-preview-clockwyz">
                        <Users className="w-3 h-3" />
                        <span>{meeting.participants.length} participants</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="meeting-actions-clockwyz">
                  {meeting.meetingLink && meeting.status === 'scheduled' && (
                    <Button
                      onClick={() => joinMeeting(meeting)}
                      className="join-btn-clockwyz"
                      size="sm"
                    >
                      <VideoIcon className="w-4 h-4" />
                      Join
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedMeeting(expandedMeeting === meeting.id ? null : meeting.id)}
                    className="expand-btn-meetings-clockwyz"
                  >
                    {expandedMeeting === meeting.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedMeeting === meeting.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="meeting-expanded-clockwyz"
                  >
                    {/* Participants */}
                    <div className="expanded-section-clockwyz">
                      <h4 className="expanded-section-title-clockwyz">
                        <Users className="w-4 h-4" />
                        Participants ({meeting.participants.length})
                      </h4>
                      <div className="participants-list-clockwyz">
                        {meeting.participants.map((participant) => (
                          <div key={participant.id} className="participant-item-clockwyz">
                            <div className="participant-avatar-clockwyz">
                              {participant.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="participant-info-clockwyz">
                              <span className="participant-name-clockwyz">{participant.name}</span>
                              <span className="participant-email-clockwyz">{participant.email}</span>
                            </div>
                            <Badge 
                              className={cn(
                                participant.status === 'accepted' && 'bg-green-100 text-green-800',
                                participant.status === 'declined' && 'bg-red-100 text-red-800',
                                participant.status === 'tentative' && 'bg-yellow-100 text-yellow-800',
                                participant.status === 'pending' && 'bg-gray-100 text-gray-800'
                              )}
                              variant="secondary"
                            >
                              {participant.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Agenda */}
                    {meeting.agenda && meeting.agenda.length > 0 && (
                      <div className="expanded-section-clockwyz">
                        <h4 className="expanded-section-title-clockwyz">
                          <FileText className="w-4 h-4" />
                          Agenda
                        </h4>
                        <ul className="agenda-list-clockwyz">
                          {meeting.agenda.map((item, index) => (
                            <li key={index} className="agenda-item-clockwyz">
                              <span className="agenda-number-clockwyz">{index + 1}</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Follow-up Tasks */}
                    {meeting.followUpTasks && meeting.followUpTasks.length > 0 && (
                      <div className="expanded-section-clockwyz">
                        <h4 className="expanded-section-title-clockwyz">
                          <CheckCircle className="w-4 h-4" />
                          Follow-up Tasks
                        </h4>
                        <div className="followup-tasks-clockwyz">
                          {meeting.followUpTasks.map((task) => (
                            <div key={task.id} className="followup-task-clockwyz">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => {
                                  // Handle task completion
                                }}
                                className="task-checkbox-clockwyz"
                              />
                              <span className={cn(
                                "task-title-clockwyz",
                                task.completed && "completed"
                              )}>
                                {task.title}
                              </span>
                              <span className="task-assignee-clockwyz">
                                Assigned to: {task.assignedTo}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="meeting-expanded-actions-clockwyz">
                      {meeting.meetingLink && (
                        <Button size="sm" variant="outline" onClick={() => copyMeetingLink(meeting)}>
                          <Copy className="w-3 h-3" />
                          Copy Link
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-3 h-3" />
                        Add Notes
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="w-3 h-3" />
                        Delete
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
      {sortedMeetings.length === 0 && (
        <div className="empty-meetings-clockwyz">
          <Users className="w-12 h-12 empty-icon-clockwyz" />
          <h3>No meetings found</h3>
          <p>Create your first meeting to get started</p>
          <Button onClick={() => setShowNewMeetingForm(true)}>
            <Plus className="w-4 h-4" />
            Create Meeting
          </Button>
        </div>
      )}

      {/* New Meeting Modal */}
      <AnimatePresence>
        {showNewMeetingForm && (
          <>
            <motion.div
              className="meeting-form-backdrop-clockwyz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewMeetingForm(false)}
            />
            <motion.div
              className="meeting-form-modal-clockwyz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="meeting-form-header-clockwyz">
                <h2 className="meeting-form-title-clockwyz">Create New Meeting</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewMeetingForm(false)}
                  className="meeting-form-close-btn-clockwyz"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="meeting-form-content-clockwyz">
                <div className="meeting-form-section-clockwyz">
                  <Label htmlFor="meeting-title">Meeting Title *</Label>
                  <Input
                    id="meeting-title"
                    value={newMeeting.title || ''}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter meeting title"
                    className="meeting-form-input-clockwyz"
                  />
                </div>

                <div className="meeting-form-section-clockwyz">
                  <Label htmlFor="meeting-description">Description</Label>
                  <Input
                    id="meeting-description"
                    value={newMeeting.description || ''}
                    onChange={(e) => setNewMeeting(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Meeting description or purpose"
                    className="meeting-form-input-clockwyz"
                  />
                </div>

                <div className="meeting-form-row-clockwyz">
                  <div className="meeting-form-section-clockwyz">
                    <Label htmlFor="start-time">Start Time *</Label>
                    <Input
                      id="start-time"
                      type="datetime-local"
                      value={newMeeting.startTime ? new Date(newMeeting.startTime).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, startTime: new Date(e.target.value) }))}
                      className="meeting-form-input-clockwyz"
                    />
                  </div>
                  <div className="meeting-form-section-clockwyz">
                    <Label htmlFor="end-time">End Time *</Label>
                    <Input
                      id="end-time"
                      type="datetime-local"
                      value={newMeeting.endTime ? new Date(newMeeting.endTime).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, endTime: new Date(e.target.value) }))}
                      className="meeting-form-input-clockwyz"
                    />
                  </div>
                </div>

                <div className="meeting-form-row-clockwyz">
                  <div className="meeting-form-section-clockwyz">
                    <Label htmlFor="meeting-type">Meeting Type</Label>
                    <Select
                      value={newMeeting.type || 'team'}
                      onValueChange={(value: Meeting['type']) => setNewMeeting(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="meeting-form-select-clockwyz">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {meetingTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                </div>

                <div className="meeting-form-row-clockwyz">
                  <div className="meeting-form-section-clockwyz">
                    <Label htmlFor="meeting-location">Location</Label>
                    <Input
                      id="meeting-location"
                      value={newMeeting.location || ''}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Conference room or address"
                      className="meeting-form-input-clockwyz"
                    />
                  </div>
                  <div className="meeting-form-section-clockwyz">
                    <Label htmlFor="meeting-link">Meeting Link</Label>
                    <Input
                      id="meeting-link"
                      value={newMeeting.meetingLink || ''}
                      onChange={(e) => setNewMeeting(prev => ({ ...prev, meetingLink: e.target.value }))}
                      placeholder="Zoom/Teams/Meet URL"
                      className="meeting-form-input-clockwyz"
                    />
                  </div>
                </div>

                {/* Participants Section */}
                <div className="meeting-form-section-clockwyz">
                  <Label>Participants</Label>
                  <div className="participants-input-section-clockwyz">
                    <div className="add-participant-row-clockwyz">
                      <Input
                        placeholder="Name"
                        value={newParticipant.name}
                        onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                        className="participant-name-input-clockwyz"
                      />
                      <Input
                        placeholder="Email"
                        value={newParticipant.email}
                        onChange={(e) => setNewParticipant(prev => ({ ...prev, email: e.target.value }))}
                        className="participant-email-input-clockwyz"
                      />
                      <Button
                        type="button"
                        onClick={addParticipant}
                        size="sm"
                        className="add-participant-btn-clockwyz"
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </div>
                    {newMeeting.participants && newMeeting.participants.length > 0 && (
                      <div className="added-participants-clockwyz">
                        {newMeeting.participants.map((participant) => (
                          <div key={participant.id} className="added-participant-clockwyz">
                            <div className="added-participant-info-clockwyz">
                              <span className="added-participant-name-clockwyz">{participant.name}</span>
                              <span className="added-participant-email-clockwyz">{participant.email}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeParticipant(participant.id)}
                              className="remove-participant-btn-clockwyz"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Agenda Section */}
                <div className="meeting-form-section-clockwyz">
                  <Label>Agenda</Label>
                  <div className="agenda-section-clockwyz">
                    {newMeeting.agenda?.map((item, index) => (
                      <div key={index} className="agenda-item-input-clockwyz">
                        <span className="agenda-item-number-clockwyz">{index + 1}.</span>
                        <Input
                          value={item}
                          onChange={(e) => updateAgendaItem(index, e.target.value)}
                          placeholder="Agenda item"
                          className="agenda-item-field-clockwyz"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAgendaItem(index)}
                          className="remove-agenda-btn-clockwyz"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAgendaItem}
                      className="add-agenda-btn-clockwyz"
                    >
                      <Plus className="w-3 h-3" />
                      Add Agenda Item
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="meeting-form-footer-clockwyz">
                <Button
                  variant="outline"
                  onClick={() => setShowNewMeetingForm(false)}
                  className="meeting-form-cancel-btn-clockwyz"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createMeeting}
                  disabled={!newMeeting.title || !newMeeting.startTime || !newMeeting.endTime}
                  className="meeting-form-create-btn-clockwyz"
                >
                  Create Meeting
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
                     
                     