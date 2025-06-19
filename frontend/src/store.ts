import { TeamMember, Team, Feedback } from './types';

class Store {
  private teamMembers: TeamMember[] = [];
  private teams: Team[] = [];
  private feedbacks: Feedback[] = [];

  addTeamMember(member: Omit<TeamMember, 'id'>) {
    const newMember: TeamMember = {
      ...member,
      id: Date.now().toString(),
    };
    this.teamMembers.push(newMember);
    return newMember;
  }

  addTeam(team: Omit<Team, 'id' | 'members'>) {
    const newTeam: Team = {
      ...team,
      id: Date.now().toString(),
      members: [],
    };
    this.teams.push(newTeam);
    return newTeam;
  }

  assignMemberToTeam(memberId: string, teamId: string) {
    const member = this.teamMembers.find(m => m.id === memberId);
    const team = this.teams.find(t => t.id === teamId);
    
    if (member && team) {
      member.teamId = teamId;
      if (!team.members.find(m => m.id === memberId)) {
        team.members.push(member);
      }
    }
  }

  addFeedback(feedback: Omit<Feedback, 'id' | 'date'>) {
    const newFeedback: Feedback = {
      ...feedback,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    this.feedbacks.push(newFeedback);
    return newFeedback;
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
}

export const store = new Store();