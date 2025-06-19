import { TeamMember, Team, Feedback } from './types';
import { api } from './api';

export interface ToastState {
  show: boolean;
  message: string;
}

class Store {
  private teamMembers: TeamMember[] = [];
  private teams: Team[] = [];
  private feedbacks: Feedback[] = [];
  private toastState: ToastState = { show: false, message: '' };
  private listeners: (() => void)[] = [];

  // Toast methods
  showToast(message: string) {
    this.toastState = { show: true, message };
    this.notifyListeners();
  }

  hideToast() {
    this.toastState = { show: false, message: '' };
    this.notifyListeners();
  }

  getToastState(): ToastState {
    return this.toastState;
  }

  // Listener methods
  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Initialize data from API
  async initializeData() {
    try {
      const [members, teams, feedbacks] = await Promise.all([
        api.getMembers(),
        api.getTeams(),
        api.getFeedback(),
      ]);
      this.teamMembers = members;
      this.teams = teams;
      this.feedbacks = feedbacks;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to initialize data:', error);
    }
  }

  async addTeamMember(member: Omit<TeamMember, 'id'>) {
    try {
      const newMember = await api.createMember(member);
      this.teamMembers.push(newMember);
      this.showToast('Team member added successfully!');
      this.notifyListeners();
      return newMember;
    } catch (error) {
      console.error('Failed to add team member:', error);
      throw error;
    }
  }

  async addTeam(team: Omit<Team, 'id' | 'members'>) {
    try {
      const newTeam = await api.createTeam(team);
      this.teams.push(newTeam);
      this.showToast('Team created successfully!');
      this.notifyListeners();
      return newTeam;
    } catch (error) {
      console.error('Failed to create team:', error);
      throw error;
    }
  }

  async assignMemberToTeam(memberId: string, teamId: string) {
    try {
      await api.assignToTeam(teamId, memberId);
      
      // Update local state
      const member = this.teamMembers.find(m => m.id === memberId);
      const team = this.teams.find(t => t.id === teamId);
      
      if (member && team) {
        member.teamId = teamId;
        if (!team.members.find(m => m.id === memberId)) {
          team.members.push(member);
        }
      }
      
      this.showToast('Member assigned to team successfully!');
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to assign member to team:', error);
      throw error;
    }
  }

  async removeFromTeam(teamId: string, memberId: string) {
    try {
      await api.removeFromTeam(teamId, memberId);
      
      // Update local state
      const member = this.teamMembers.find(m => m.id === memberId);
      const team = this.teams.find(t => t.id === teamId);
      
      if (member && team) {
        member.teamId = undefined;
        team.members = team.members.filter(m => m.id !== memberId);
      }
      
      this.showToast('Member removed from team successfully!');
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to remove member from team:', error);
      throw error;
    }
  }

  async deleteTeam(teamId: string) {
    try {
      await api.deleteTeam(teamId);
      
      // Update local state
      this.teams = this.teams.filter(t => t.id !== teamId);
      // Remove team assignments from members
      this.teamMembers.forEach(member => {
        if (member.teamId === teamId) {
          member.teamId = undefined;
        }
      });
      
      this.showToast('Team deleted successfully!');
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to delete team:', error);
      throw error;
    }
  }

  async addFeedback(feedback: Omit<Feedback, 'id' | 'date'>) {
    try {
      const newFeedback = await api.createFeedback(feedback);
      this.feedbacks.push(newFeedback);
      this.showToast('Feedback submitted successfully!');
      this.notifyListeners();
      return newFeedback;
    } catch (error) {
      console.error('Failed to add feedback:', error);
      throw error;
    }
  }

  getTeamMembers() {
    return this.teamMembers;
  }

  getTeams() {
    return this.teams;
  }

  getFeedbacks() {
    return this.feedbacks;
  }

  getUnassignedMembers() {
    return this.teamMembers.filter(member => !member.teamId);
  }

  getFeedbackByTarget(targetType: 'team' | 'person', targetId?: string) {
    let filtered = this.feedbacks.filter(f => f.targetType === targetType);
    if (targetId) {
      filtered = filtered.filter(f => f.targetId === targetId);
    }
    return filtered;
  }
}

export const store = new Store();