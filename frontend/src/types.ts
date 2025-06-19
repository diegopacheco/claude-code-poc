export interface TeamMember {
  id: string;
  name: string;
  email: string;
  picture: string;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  members: TeamMember[];
}

export interface Feedback {
  id: string;
  content: string;
  targetType: 'team' | 'person';
  targetId: string;
  targetName: string;
  date: string;
}