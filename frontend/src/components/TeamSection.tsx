import { useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input, Label, Badge, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui";
import { Plus, Users, Calendar, Clock, User, Mail, UserPlus, Target, ArrowLeft, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface TeamDeadline {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo: number;
  assignedBy: number;
  status: 'pending' | 'completed' | 'in-progress';
}

export function TeamSection() {
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddDeadline, setShowAddDeadline] = useState(false);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: '' });
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
  priority: 'medium' as 'high' | 'medium' | 'low',
    assignedTo: 0
  });

  // Current user is always ID 1
  const currentUserId = 1;
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 1, name: "Alex Johnson (You)", email: "alex@company.com", role: "Project Manager" },
    { id: 2, name: "Sarah Chen", email: "sarah@company.com", role: "Designer" },
    { id: 3, name: "Mike Rodriguez", email: "mike@company.com", role: "Developer" },
    { id: 4, name: "Emma Davis", email: "emma@company.com", role: "Marketing" }
  ]);

  const [teamDeadlines, setTeamDeadlines] = useState<TeamDeadline[]>([
    {
      id: 1,
      title: "Design System Review",
      description: "Complete review of the new design system components",
      date: "2024-10-15",
      time: "2:00 PM",
      priority: "high",
      assignedTo: 2,
      assignedBy: 1,
      status: "pending"
    },
    {
      id: 2,
      title: "API Integration Testing",
      description: "Test all API endpoints for the new feature",
      date: "2024-10-18",
      time: "5:00 PM",
      priority: "medium",
      assignedTo: 3,
      assignedBy: 1,
      status: "in-progress"
    },
    {
      id: 3,
      title: "Campaign Launch Prep",
      description: "Prepare materials for the upcoming product launch campaign",
      date: "2024-10-22",
      time: "10:00 AM",
      priority: "high",
      assignedTo: 4,
      assignedBy: 1,
      status: "pending"
    },
    {
      id: 4,
      title: "Quarterly Planning Meeting",
      description: "Attend and lead quarterly business planning session",
      date: "2024-10-25",
      time: "9:00 AM",
      priority: "high",
      assignedTo: 1,
      assignedBy: 1,
      status: "pending"
    },
    {
      id: 5,
      title: "UI Mockup Updates",
      description: "Update mockups based on client feedback",
      date: "2024-10-20",
      time: "3:00 PM",
      priority: "medium",
      assignedTo: 2,
      assignedBy: 1,
      status: "completed"
    },
    {
      id: 6,
      title: "Team Performance Review",
      description: "Conduct individual performance reviews for team members",
      date: "2024-10-30",
      time: "11:00 AM",
      priority: "medium",
      assignedTo: 1,
      assignedBy: 1,
      status: "pending"
    }
  ]);

  // Personal deadlines (these would normally come from the user's personal deadline list)
  const [personalDeadlines] = useState([
    {
      id: 101,
      title: "Math Assignment Due",
      description: "Complete chapters 5-7 exercises and submit online",
      date: "2024-10-12",
      time: "11:59 PM",
      priority: "high" as const,
      source: "syllabus.pdf",
      status: "pending" as const,
      type: "personal"
    },
    {
      id: 102,
      title: "Project Presentation",
      description: "Present final project to the class",
      date: "2024-10-18",
      time: "2:00 PM",
      priority: "medium" as const,
      source: "schedule.jpg",
      status: "pending" as const,
      type: "personal"
    }
  ]);

  const addTeamMember = () => {
    if (newMember.name && newMember.email && newMember.role) {
      setTeamMembers(prev => [...prev, {
        id: Date.now(),
        ...newMember
      }]);
      setNewMember({ name: '', email: '', role: '' });
      setShowAddMember(false);
    }
  };

  const addTeamDeadline = () => {
    if (newDeadline.title && newDeadline.date && newDeadline.assignedTo) {
      setTeamDeadlines(prev => [...prev, {
        id: Date.now(),
        ...newDeadline,
        assignedBy: 1, // Current user
        status: 'pending'
      }]);
      setNewDeadline({
        title: '',
        description: '',
        date: '',
        time: '',
        priority: 'medium',
        assignedTo: 0
      });
      setShowAddDeadline(false);
    }
  };

  const getMemberName = (memberId: number) => {
    return teamMembers.find(member => member.id === memberId)?.name || 'Unknown';
  };

  const getMemberDeadlines = (memberId: number) => {
    const teamAssignments = teamDeadlines.filter(deadline => deadline.assignedTo === memberId);
    const personalAssignments = memberId === currentUserId ? personalDeadlines : [];
    return [...teamAssignments, ...personalAssignments];
  };

  const getSelectedMember = () => {
    return teamMembers.find(member => member.id === selectedMember);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // If a member is selected, show their individual view
  if (selectedMember) {
    const member = getSelectedMember();
    const memberDeadlines = getMemberDeadlines(selectedMember);
    
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedMember(null)}
            className="mb-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Team Overview
          </Button>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {member?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{member?.name}</h1>
              <p className="text-gray-600 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                {member?.email}
              </p>
              <Badge variant="outline" className="mt-1">
                {member?.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Member's Deadlines */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Target className="h-6 w-6 mr-2 text-blue-600" />
              {member?.name.includes('(You)') ? 'Your' : `${member?.name.split(' ')[0]}'s`} Deadlines ({memberDeadlines.length})
            </h2>
          </div>

          {memberDeadlines.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200">
              <CardContent className="p-12 text-center">
                <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Deadlines</h3>
                <p className="text-gray-600">
                  {member?.name.includes('(You)') ? 'You have' : `${member?.name.split(' ')[0]} has`} no deadlines assigned yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {memberDeadlines.map((deadline, index) => (
                <motion.div
                  key={deadline.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{deadline.title}</h3>
                          <p className="text-gray-600 mb-3">{deadline.description}</p>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <Badge className={`${getPriorityColor(deadline.priority)} border text-xs`}>
                            {deadline.priority.toUpperCase()}
                          </Badge>
                          <Badge className={`${getStatusColor(deadline.status)} border text-xs`}>
                            {deadline.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                          {('type' in deadline) && (
                            <Badge variant="outline" className="text-xs">
                              Personal
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(deadline.date).toLocaleDateString()}
                          </div>
                          {deadline.time && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {deadline.time}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          {('source' in deadline) ? (
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              From {deadline.source}
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              Assigned by {getMemberName(('assignedBy' in deadline) ? deadline.assignedBy : 1)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Team Collaboration
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Manage deadlines across your team. Add team members, assign deadlines, and track progress together.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team Members Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-6 w-6 mr-2 text-purple-600" />
              Team Members ({teamMembers.length})
            </h2>
            <Button
              onClick={() => setShowAddMember(!showAddMember)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>

          {/* Add Member Form */}
          {showAddMember && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newMember.name}
                        onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter team member name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={newMember.role}
                      onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                      placeholder="Enter role (e.g., Developer, Designer)"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={addTeamMember} className="flex-1">
                      Add Member
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddMember(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Team Members List */}
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <Card 
                key={member.id} 
                className="hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedMember(member.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {member.email}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline">
                          {member.role}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          {getMemberDeadlines(member.id).length} deadline{getMemberDeadlines(member.id).length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Deadlines Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Target className="h-6 w-6 mr-2 text-blue-600" />
              Team Deadlines ({teamDeadlines.length})
            </h2>
            <Button
              onClick={() => setShowAddDeadline(!showAddDeadline)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Deadline
            </Button>
          </div>

          {/* Add Deadline Form */}
          {showAddDeadline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="deadline-title">Title</Label>
                    <Input
                      id="deadline-title"
                      value={newDeadline.title}
                      onChange={(e) => setNewDeadline(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter deadline title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadline-description">Description</Label>
                    <Textarea
                      id="deadline-description"
                      value={newDeadline.description}
                      onChange={(e) => setNewDeadline(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter deadline description"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deadline-date">Date</Label>
                      <Input
                        id="deadline-date"
                        type="date"
                        value={newDeadline.date}
                        onChange={(e) => setNewDeadline(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deadline-time">Time</Label>
                      <Input
                        id="deadline-time"
                        type="time"
                        value={newDeadline.time}
                        onChange={(e) => setNewDeadline(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newDeadline.priority} onValueChange={(value: 'high' | 'medium' | 'low') => setNewDeadline(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="assigned-to">Assign To</Label>
                      <Select value={newDeadline.assignedTo.toString()} onValueChange={(value) => setNewDeadline(prev => ({ ...prev, assignedTo: parseInt(value) }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={addTeamDeadline} className="flex-1">
                      Add Deadline
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddDeadline(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Team Deadlines List */}
          <div className="space-y-3">
            {teamDeadlines.map((deadline) => (
              <Card key={deadline.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{deadline.title}</h3>
                    <div className="flex space-x-2">
                      <Badge className={`${getPriorityColor(deadline.priority)} border text-xs`}>
                        {deadline.priority.toUpperCase()}
                      </Badge>
                      <Badge className={`${getStatusColor(deadline.status)} border text-xs`}>
                        {deadline.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{deadline.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(deadline.date).toLocaleDateString()}
                      </div>
                      {deadline.time && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {deadline.time}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Assigned to {getMemberName(deadline.assignedTo)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}