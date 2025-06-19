import { describe, it, expect, beforeEach } from 'vitest'
import { store } from '../store'

describe('Store', () => {
  beforeEach(() => {
    store['teamMembers'] = []
    store['teams'] = []
    store['feedbacks'] = []
  })

  describe('Team Members', () => {
    it('adds a team member', () => {
      const member = store.addTeamMember({
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'https://example.com/photo.jpg',
      })

      expect(member).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'https://example.com/photo.jpg',
      })
      expect(member.id).toBeDefined()
      expect(store.getTeamMembers()).toHaveLength(1)
    })

    it('gets all team members', () => {
      store.addTeamMember({
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'photo1.jpg',
      })
      store.addTeamMember({
        name: 'Jane Smith',
        email: 'jane@example.com',
        picture: 'photo2.jpg',
      })

      const members = store.getTeamMembers()
      expect(members).toHaveLength(2)
      expect(members[0].name).toBe('John Doe')
      expect(members[1].name).toBe('Jane Smith')
    })

    it('gets unassigned members', () => {
      const member1 = store.addTeamMember({
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'photo1.jpg',
      })
      const member2 = store.addTeamMember({
        name: 'Jane Smith',
        email: 'jane@example.com',
        picture: 'photo2.jpg',
      })

      const team = store.addTeam({
        name: 'Development Team',
        logo: 'logo.png',
      })

      store.assignMemberToTeam(member1.id, team.id)

      const unassigned = store.getUnassignedMembers()
      expect(unassigned).toHaveLength(1)
      expect(unassigned[0].name).toBe('Jane Smith')
    })
  })

  describe('Teams', () => {
    it('adds a team', () => {
      const team = store.addTeam({
        name: 'Development Team',
        logo: 'https://example.com/logo.png',
      })

      expect(team).toMatchObject({
        name: 'Development Team',
        logo: 'https://example.com/logo.png',
        members: [],
      })
      expect(team.id).toBeDefined()
      expect(store.getTeams()).toHaveLength(1)
    })

    it('gets all teams', () => {
      store.addTeam({
        name: 'Development Team',
        logo: 'logo1.png',
      })
      store.addTeam({
        name: 'Design Team',
        logo: 'logo2.png',
      })

      const teams = store.getTeams()
      expect(teams).toHaveLength(2)
      expect(teams[0].name).toBe('Development Team')
      expect(teams[1].name).toBe('Design Team')
    })
  })

  describe('Team Assignment', () => {
    it('assigns member to team', () => {
      const member = store.addTeamMember({
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'photo.jpg',
      })
      const team = store.addTeam({
        name: 'Development Team',
        logo: 'logo.png',
      })

      store.assignMemberToTeam(member.id, team.id)

      const updatedTeam = store.getTeams()[0]
      const updatedMember = store.getTeamMembers()[0]

      expect(updatedTeam.members).toHaveLength(1)
      expect(updatedTeam.members[0].id).toBe(member.id)
      expect(updatedMember.teamId).toBe(team.id)
    })

    it('does not assign member to team if member not found', () => {
      const team = store.addTeam({
        name: 'Development Team',
        logo: 'logo.png',
      })

      store.assignMemberToTeam('nonexistent', team.id)

      const updatedTeam = store.getTeams()[0]
      expect(updatedTeam.members).toHaveLength(0)
    })

    it('does not assign member to team if team not found', () => {
      const member = store.addTeamMember({
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'photo.jpg',
      })

      store.assignMemberToTeam(member.id, 'nonexistent')

      const updatedMember = store.getTeamMembers()[0]
      expect(updatedMember.teamId).toBeUndefined()
    })

    it('does not duplicate member in team', () => {
      const member = store.addTeamMember({
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'photo.jpg',
      })
      const team = store.addTeam({
        name: 'Development Team',
        logo: 'logo.png',
      })

      store.assignMemberToTeam(member.id, team.id)
      store.assignMemberToTeam(member.id, team.id)

      const updatedTeam = store.getTeams()[0]
      expect(updatedTeam.members).toHaveLength(1)
    })
  })

  describe('Feedback', () => {
    it('adds feedback', () => {
      const feedback = store.addFeedback({
        content: 'Great work!',
        targetType: 'person',
        targetId: '1',
        targetName: 'John Doe',
      })

      expect(feedback).toMatchObject({
        content: 'Great work!',
        targetType: 'person',
        targetId: '1',
        targetName: 'John Doe',
      })
      expect(feedback.id).toBeDefined()
      expect(feedback.date).toBeDefined()
      expect(store.getFeedbacks()).toHaveLength(1)
    })

    it('gets all feedback', () => {
      store.addFeedback({
        content: 'Great work!',
        targetType: 'person',
        targetId: '1',
        targetName: 'John Doe',
      })
      store.addFeedback({
        content: 'Excellent teamwork!',
        targetType: 'team',
        targetId: '1',
        targetName: 'Development Team',
      })

      const feedbacks = store.getFeedbacks()
      expect(feedbacks).toHaveLength(2)
      expect(feedbacks[0].content).toBe('Great work!')
      expect(feedbacks[1].content).toBe('Excellent teamwork!')
    })
  })
})