import { TeamMember, Team, Feedback } from './types';

const API_BASE_URL = '/api/v1';

export const api = {
  // Team Members
  async getMembers(): Promise<TeamMember[]> {
    const response = await fetch(`${API_BASE_URL}/members`);
    if (!response.ok) throw new Error('Failed to fetch members');
    return response.json();
  },

  async createMember(member: Omit<TeamMember, 'id' | 'teams' | 'created_at' | 'updated_at'>): Promise<TeamMember> {
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    if (!response.ok) throw new Error('Failed to create member');
    return response.json();
  },

  async updateMember(id: number, member: Partial<TeamMember>): Promise<TeamMember> {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    if (!response.ok) throw new Error('Failed to update member');
    return response.json();
  },

  async deleteMember(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/members/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete member');
  },

  // Teams
  async getTeams(): Promise<Team[]> {
    const response = await fetch(`${API_BASE_URL}/teams`);
    if (!response.ok) throw new Error('Failed to fetch teams');
    return response.json();
  },

  async createTeam(team: Omit<Team, 'id' | 'members' | 'created_at' | 'updated_at'>): Promise<Team> {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team),
    });
    if (!response.ok) throw new Error('Failed to create team');
    return response.json();
  },

  async updateTeam(id: number, team: Partial<Team>): Promise<Team> {
    const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team),
    });
    if (!response.ok) throw new Error('Failed to update team');
    return response.json();
  },

  async deleteTeam(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete team');
  },

  // Team Assignment
  async assignToTeam(teamId: number, memberId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_id: teamId, member_id: memberId }),
    });
    if (!response.ok) throw new Error('Failed to assign member to team');
  },

  async removeFromTeam(teamId: number, memberId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/remove-member/${teamId}/${memberId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove member from team');
  },

  // Feedback
  async getFeedback(): Promise<Feedback[]> {
    const response = await fetch(`${API_BASE_URL}/feedback`);
    if (!response.ok) throw new Error('Failed to fetch feedback');
    return response.json();
  },

  async createFeedback(feedback: Omit<Feedback, 'id' | 'created_at' | 'updated_at'>): Promise<Feedback> {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: feedback.content,
        target_type: feedback.target_type,
        target_id: feedback.target_id,
      }),
    });
    if (!response.ok) throw new Error('Failed to create feedback');
    return response.json();
  },

  async deleteFeedback(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete feedback');
  },
};