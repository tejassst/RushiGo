import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Plus,
  Users,
  Calendar,
  Target,
  Loader,
  UserPlus,
  Mail,
  Crown,
  Shield,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  apiClient,
  Team,
  Deadline,
  CreateTeamRequest,
  CreateDeadlineRequest,
  TeamMember,
  InviteMemberRequest,
  DeleteTeam,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface NewTeamForm {
  name: string;
  description: string;
}

interface NewDeadlineForm {
  title: string;
  description: string;
  date: string;
  priority: "high" | "medium" | "low";
}

interface InviteMemberForm {
  user_email: string;
  role: "admin" | "member" | "viewer";
}

export function TeamSection() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamDeadlines, setTeamDeadlines] = useState<Deadline[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAddDeadline, setShowAddDeadline] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [deadlineFilter, setDeadlineFilter] = useState<
    "all" | "pending" | "completed"
  >("all");

  const [newTeam, setNewTeam] = useState<NewTeamForm>({
    name: "",
    description: "",
  });

  const [newDeadline, setNewDeadline] = useState<NewDeadlineForm>({
    title: "",
    description: "",
    date: "",
    priority: "medium",
  });

  const [inviteMember, setInviteMember] = useState<InviteMemberForm>({
    user_email: "",
    role: "member",
  });
  const [emailError, setEmailError] = useState<string>("");

  // Email validation helper
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Load team data on component mount
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        const userTeams = await apiClient.getTeams();
        setTeams(userTeams);

        if (userTeams.length > 0) {
          const firstTeam = userTeams[0];
          setSelectedTeam(firstTeam);
          await loadTeamDeadlines(firstTeam.id);
          await loadTeamMembers(firstTeam.id);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load team data";
        setError(`Failed to load team data: ${errorMessage}`);
        console.error("Error loading team data:", err);

        // Log more details for debugging
        if (err instanceof Error && "response" in err) {
          console.error("Response error:", (err as any).response);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadTeamData();
    }
  }, [user]);

  const loadTeamDeadlines = async (teamId: number) => {
    try {
      const deadlines = await apiClient.getTeamDeadlines(teamId);
      setTeamDeadlines(deadlines);
    } catch (err) {
      console.error("Error loading team deadlines:", err);
    }
  };

  const loadTeamMembers = async (teamId: number) => {
    try {
      const members = await apiClient.getTeamMembers(teamId);
      setTeamMembers(members);
    } catch (err) {
      console.error("Error loading team members:", err);
    }
  };

  const createTeam = async () => {
    if (newTeam.name.trim()) {
      try {
        const teamData: CreateTeamRequest = {
          name: newTeam.name,
          description: newTeam.description || undefined,
        };

        const createdTeam = await apiClient.createTeam(teamData);
        setTeams([...teams, createdTeam]);
        setSelectedTeam(createdTeam);
        setTeamDeadlines([]);

        setNewTeam({ name: "", description: "" });
        setShowCreateTeam(false);

        console.log(`✅ Team "${createdTeam.name}" created successfully!`);
      } catch (err) {
        alert("Failed to create team: " + (err as Error).message);
      }
    }
  };

  const addTeamDeadline = async () => {
    if (!selectedTeam) {
      alert("No team selected!");
      return;
    }

    if (newDeadline.title && newDeadline.date) {
      try {
        const deadlineData: CreateDeadlineRequest = {
          title: newDeadline.title,
          description: newDeadline.description || undefined,
          date: newDeadline.date,
          priority: newDeadline.priority,
        };

        // Create the deadline first
        const createdDeadline = await apiClient.createDeadline(deadlineData);

        // Then assign it to the team
        await apiClient.assignDeadlineToTeam(
          createdDeadline.id,
          selectedTeam.id
        );

        // Reload team deadlines
        const updatedDeadlines = await apiClient.getTeamDeadlines(
          selectedTeam.id
        );
        setTeamDeadlines(updatedDeadlines);

        setNewDeadline({
          title: "",
          description: "",
          date: "",
          priority: "medium",
        });
        setShowAddDeadline(false);

        console.log(
          `✅ Deadline "${createdDeadline.title}" added to team successfully!`
        );
      } catch (err) {
        alert("Failed to add deadline: " + (err as Error).message);
      }
    }
  };

  const removeMember = async (userId: number) => {
    if (!selectedTeam) {
      alert("No team selected!");
      return;
    }

    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        await apiClient.removeMember(selectedTeam.id, userId);
        if (selectedTeam) {
          await loadTeamMembers(selectedTeam.id);
        }
      } catch (err) {
        alert("Failed to remove member: " + (err as Error).message);
      }
    }
  };

  const inviteTeamMember = async () => {
    if (!selectedTeam) {
      alert("No team selected!");
      return;
    }

    const email = inviteMember.user_email.trim();

    if (!email) {
      setEmailError("Please enter an email address");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(
        "Please enter a valid email address (e.g., user@example.com)"
      );
      return;
    }

    setEmailError(""); // Clear any previous errors

    try {
      const inviteData: InviteMemberRequest = {
        user_email: email,
        role: inviteMember.role,
      };

      await apiClient.inviteTeamMember(selectedTeam.id, inviteData);

      // Reload team members
      await loadTeamMembers(selectedTeam.id);

      setInviteMember({
        user_email: "",
        role: "member",
      });
      setShowInviteMember(false);

      console.log(
        ` User "${inviteData.user_email}" invited to team successfully!`
      );
    } catch (err) {
      alert("Failed to invite member: " + (err as Error).message);
    }
  };

  const updateDeadlineStatus = async (
    deadlineId: number,
    completed: boolean
  ) => {
    try {
      await apiClient.updateDeadline(deadlineId, { completed });
      if (selectedTeam) {
        await loadTeamDeadlines(selectedTeam.id);
      }
    } catch (err) {
      alert("Failed to update deadline: " + (err as Error).message);
    }
  };

  const deleteDeadline = async (deadlineId: number) => {
    if (window.confirm("Are you sure you want to delete this deadline?")) {
      try {
        await apiClient.deleteDeadline(deadlineId);
        if (selectedTeam) {
          await loadTeamDeadlines(selectedTeam.id);
        }
      } catch (err) {
        alert("Failed to delete deadline: " + (err as Error).message);
      }
    }
  };

  const deleteTeam = async (teamId: number) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        await apiClient.deleteTeam(teamId);
        setTeams(teams.filter((team) => team.id !== teamId));
        setSelectedTeam(null);
        setTeamDeadlines([]);
        setTeamMembers([]);

        alert("Team deleted successfully.");
      } catch (err) {
        alert("Failed to delete team: " + (err as Error).message);
      }
    }
  };

  const getFilteredDeadlines = () => {
    if (deadlineFilter === "all") return teamDeadlines;
    return teamDeadlines.filter((d) =>
      deadlineFilter === "completed" ? d.completed : !d.completed
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading teams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Team Management
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Create teams, manage deadlines, and collaborate effectively.
        </p>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {teams.length}
            </div>
            <div className="text-sm text-gray-600">Your Teams</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {teamDeadlines.length}
            </div>
            <div className="text-sm text-gray-600">Team Deadlines</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {teamDeadlines.filter((d) => d.completed).length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Teams Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 mr-2 text-purple-600" />
            Teams ({teams.length})
          </h2>

          <Button
            onClick={() => setShowCreateTeam(!showCreateTeam)}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Team
          </Button>

          {/* Create Team Form */}
          {showCreateTeam && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input
                      id="team-name"
                      value={newTeam.name}
                      onChange={(e) =>
                        setNewTeam((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter team name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="team-description">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="team-description"
                      value={newTeam.description}
                      onChange={(e) =>
                        setNewTeam((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Enter team description"
                      rows={2}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={createTeam} className="flex-1">
                      Create Team
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateTeam(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Teams List */}
          <div className="space-y-3">
            {teams.map((team) => (
              <Card
                key={team.id}
                className={`transition-all ${
                  selectedTeam?.id === team.id
                    ? "ring-2 ring-purple-500 bg-purple-50"
                    : "hover:shadow-md hover:bg-gray-50"
                }`}
              >
                <CardContent className="p-4">
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTeam(team);
                      loadTeamDeadlines(team.id);
                      loadTeamMembers(team.id);
                    }}
                  >
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    {team.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {team.description}
                      </p>
                    )}
                    <div className="text-xs text-purple-600 mt-2">
                      Click to manage members & deadlines
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTeam(team.id);
                    }}
                    className="text-red-500 hover:text-red-700 mt-2 w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Team
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Members Section */}
        <div className="space-y-6">
          {selectedTeam && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2 text-green-600" />
                Team Members ({teamMembers.length})
              </h2>

              <Button
                onClick={() => setShowInviteMember(!showInviteMember)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>

              {/* Invite Member Form */}
              {showInviteMember && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <Label htmlFor="userEmail">User Email</Label>
                        <Input
                          id="userEmail"
                          type="email"
                          placeholder="Enter user email address"
                          value={inviteMember.user_email}
                          onChange={(e) => {
                            setInviteMember({
                              ...inviteMember,
                              user_email: e.target.value,
                            });
                            // Clear error when user starts typing
                            if (emailError) setEmailError("");
                          }}
                          className={
                            emailError
                              ? "border-red-500 focus:ring-red-500"
                              : ""
                          }
                        />
                        {emailError && (
                          <p className="text-sm text-red-600 mt-1">
                            {emailError}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="memberRole">Role</Label>
                        <Select
                          value={inviteMember.role}
                          onValueChange={(
                            value: "admin" | "member" | "viewer"
                          ) =>
                            setInviteMember({ ...inviteMember, role: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">
                              Admin - Full access
                            </SelectItem>
                            <SelectItem value="member">
                              Member - Can edit
                            </SelectItem>
                            <SelectItem value="viewer">
                              Viewer - Read only
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex space-x-2">
                        <Button onClick={inviteTeamMember} className="flex-1">
                          <Mail className="h-4 w-4 mr-2" />
                          Send Invitation
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowInviteMember(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Members List */}
              <div className="space-y-3">
                {teamMembers.map((member, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {member.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.username}
                            </p>
                            <p className="text-sm text-gray-600">
                              {member.email}
                            </p>
                            {member.role !== "admin" && (
                              <button
                                onClick={() => removeMember(member.id)}
                                className="text-xs text-red-600 hover:text-red-800 transition-colors mt-1"
                              >
                                Remove member
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              member.role === "admin"
                                ? "destructive"
                                : member.role === "member"
                                ? "default"
                                : "secondary"
                            }
                            className="flex items-center space-x-1 ml-2"
                          >
                            {member.role === "admin" && (
                              <Crown className="h-3 w-3" />
                            )}
                            {member.role === "member" && (
                              <Shield className="h-3 w-3" />
                            )}
                            <span className="capitalize">{member.role}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {teamMembers.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No members yet. Invite someone to get started!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>

        {/* Team Deadlines Section */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTeam ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Target className="h-6 w-6 mr-2 text-blue-600" />
                    {selectedTeam.name} Deadlines (
                    {getFilteredDeadlines().length})
                  </h2>
                  <Select
                    value={deadlineFilter}
                    onValueChange={(value: "all" | "pending" | "completed") =>
                      setDeadlineFilter(value)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        All ({teamDeadlines.length})
                      </SelectItem>
                      <SelectItem value="pending">
                        Pending (
                        {teamDeadlines.filter((d) => !d.completed).length})
                      </SelectItem>
                      <SelectItem value="completed">
                        Completed (
                        {teamDeadlines.filter((d) => d.completed).length})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <Label htmlFor="deadline-title">Title</Label>
                        <Input
                          id="deadline-title"
                          value={newDeadline.title}
                          onChange={(e) =>
                            setNewDeadline((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Enter deadline title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="deadline-description">
                          Description
                        </Label>
                        <Textarea
                          id="deadline-description"
                          value={newDeadline.description}
                          onChange={(e) =>
                            setNewDeadline((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
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
                            onChange={(e) =>
                              setNewDeadline((prev) => ({
                                ...prev,
                                date: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Select
                            value={newDeadline.priority}
                            onValueChange={(value: "high" | "medium" | "low") =>
                              setNewDeadline((prev) => ({
                                ...prev,
                                priority: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">
                                High Priority
                              </SelectItem>
                              <SelectItem value="medium">
                                Medium Priority
                              </SelectItem>
                              <SelectItem value="low">Low Priority</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={addTeamDeadline} className="flex-1">
                          Add Deadline
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowAddDeadline(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Deadlines List */}
              <div className="space-y-3">
                {getFilteredDeadlines().length === 0 ? (
                  <Card className="border-dashed border-2 border-gray-200">
                    <CardContent className="p-12 text-center">
                      <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Deadlines Found
                      </h3>
                      <p className="text-gray-600">
                        {deadlineFilter === "all"
                          ? "No deadlines have been created yet. Create your first deadline to get started!"
                          : `No ${deadlineFilter} deadlines found.`}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  getFilteredDeadlines().map((deadline) => (
                    <Card
                      key={deadline.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">
                            {deadline.title}
                          </h3>
                          <div className="flex space-x-2 items-center">
                            <Badge
                              className={`${getPriorityColor(
                                deadline.priority
                              )} border text-xs`}
                            >
                              {deadline.priority.toUpperCase()}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                updateDeadlineStatus(
                                  deadline.id,
                                  !deadline.completed
                                )
                              }
                              className={`text-xs ${
                                deadline.completed
                                  ? "text-green-600 hover:text-green-700"
                                  : "text-gray-600 hover:text-gray-700"
                              }`}
                            >
                              {deadline.completed
                                ? "✓ Completed"
                                : "Mark Complete"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteDeadline(deadline.id)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        {deadline.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {deadline.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(deadline.date).toLocaleDateString()}
                          </div>
                          {deadline.completed && (
                            <div className="text-green-600 font-medium">
                              Completed
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          ) : (
            <Card className="border-dashed border-2 border-gray-200 lg:col-span-2">
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Team
                </h3>
                <p className="text-gray-600">
                  Choose a team from the left to view and manage its deadlines.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
