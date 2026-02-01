const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface LoginRequest {
  username: string; // FastAPI OAuth2PasswordRequestForm expects 'username' field
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface Deadline {
  id: number;
  title: string;
  description?: string;
  course?: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  estimated_hours?: number;
  completed: boolean;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateDeadlineRequest {
  title: string;
  description?: string;
  course?: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  estimated_hours?: number;
}

export interface UpdateDeadlineRequest {
  title?: string;
  description?: string;
  course?: string;
  date?: string;
  priority?: 'low' | 'medium' | 'high';
  estimated_hours?: number;
  completed?: boolean;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface TeamMember {
  id: number;
  email: string;
  username: string;
  role: string;
}

export interface InviteMemberRequest {
  user_email: string;
  role: string;
}

export interface DeleteTeam {
  message: string;
}

export interface TeamDeadline extends Deadline {
  team_id?: number;
}

export interface CalendarPreferences {
  calendar_sync_enabled: boolean;
  calendar_id?: string;
}

export interface UpdateCalendarPreferencesRequest {
  calendar_sync_enabled: boolean;
}

export interface CalendarConnectionStatus {
  connected: boolean;
  calendar_email?: string;
}

export class ApiClient {
  // Calendar sync all deadlines
  async syncAllDeadlines(): Promise<any> {
    return this.request<any>('/calendar/sync-all', {
      method: 'POST',
    });
  }
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle responses with no content (like 204)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    // Check if response has JSON content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    // For non-JSON responses, return the text or undefined
    const text = await response.text();
    return (text ? text : undefined) as T;
  }

  // Auth methods
  async login(credentials: LoginRequest) {
    // FastAPI OAuth2PasswordRequestForm expects form data
    const formData = new FormData();
    formData.append('username', credentials.username); // Use email as username
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    this.token = data.access_token;
    localStorage.setItem('access_token', this.token!);
    return data;
  }

  async register(userData: RegisterRequest) {
    const response = await this.request<User>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Deadline methods
  async getDeadlines(): Promise<Deadline[]> {
    return this.request<Deadline[]>('/deadlines/');
  }

  async createDeadline(deadline: CreateDeadlineRequest): Promise<Deadline> {
    return this.request<Deadline>('/deadlines/create', {
      method: 'POST',
      body: JSON.stringify(deadline),
    });
  }

  async updateDeadline(id: number, deadline: UpdateDeadlineRequest): Promise<Deadline> {
    return this.request<Deadline>(`/deadlines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deadline),
    });
  }

  async deleteDeadline(id: number): Promise<void> {
    await this.request<void>(`/deadlines/${id}`, {
      method: 'DELETE',
    });
  }

  async scanDocument(file: File): Promise<Deadline[]> {
    const formData = new FormData();
    formData.append('file', file);

    // Do NOT set Content-Type header when sending FormData; browser will set it with boundary
    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const response = await fetch(`${API_BASE_URL}/deadlines/scan-document`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Document scan failed');
    }

    return response.json();
  }

  // Team methods
  async getTeams(): Promise<Team[]> {
    return this.request<Team[]>('/teams/');
  }

  async createTeam(team: CreateTeamRequest): Promise<Team> {
    return this.request<Team>('/teams/', {
      method: 'POST',
      body: JSON.stringify(team),
    });
  }

  async getTeam(teamId: number): Promise<Team> {
    return this.request<Team>(`/teams/${teamId}`);
  }

  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    return this.request<TeamMember[]>(`/teams/${teamId}/members`);
  }

  async inviteTeamMember(teamId: number, data: InviteMemberRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/teams/${teamId}/invite`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteTeam(teamId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/teams/${teamId}`, {
      method: 'DELETE',
    });
  }

  async removeMember(teamId: number, userId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async getTeamDeadlines(teamId: number): Promise<Deadline[]> {
    return this.request<Deadline[]>(`/deadlines/team/${teamId}`);
  }

  async assignDeadlineToTeam(deadlineId: number, teamId: number): Promise<Deadline> {
    return this.request<Deadline>(`/deadlines/${deadlineId}/assign-team/${teamId}`, {
      method: 'POST',
    });
  }

  async removeDeadlineFromTeam(deadlineId: number): Promise<Deadline> {
    return this.request<Deadline>(`/deadlines/${deadlineId}/remove-from-team`, {
      method: 'POST',
    });
  }

  // Calendar Preferences
  async getCalendarPreferences(): Promise<CalendarPreferences> {
    return this.request<CalendarPreferences>('/users/me/calendar-preferences');
  }

  async updateCalendarPreferences(
    preferences: UpdateCalendarPreferencesRequest
  ): Promise<CalendarPreferences> {
    return this.request<CalendarPreferences>('/users/me/calendar-preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Calendar OAuth
  getCalendarConnectUrl(): string {
    const token = this.token;
    if (!token) {
      throw new Error('Not authenticated');
    }
    return `${API_BASE_URL}/calendar/connect?token=${encodeURIComponent(token)}`;
  }

  async getCalendarStatus(): Promise<CalendarConnectionStatus> {
    return this.request<CalendarConnectionStatus>('/calendar/status');
  }

  async disconnectCalendar(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/calendar/disconnect', {
      method: 'POST',
    });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
