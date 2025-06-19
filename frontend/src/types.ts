export interface TeamMember {
  id: number;
  name: string;
  email: string;
  picture: string;
  teams: Team[];
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
  members: TeamMember[];
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: number;
  content: string;
  target_type: 'team' | 'member';
  target_id: number;
  created_at: string;
  updated_at: string;
}