import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AssignToTeam from '../AssignToTeam'
import { store } from '../../store'

const mockMembers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic1.jpg' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', picture: 'pic2.jpg' },
]

const mockTeams = [
  { id: '1', name: 'Development Team', logo: 'logo1.png', members: [] },
  { id: '2', name: 'Design Team', logo: 'logo2.png', members: [] },
]

vi.mock('../../store', () => ({
  store: {
    getUnassignedMembers: vi.fn(),
    getTeams: vi.fn(),
    assignMemberToTeam: vi.fn(),
  },
}))

describe('AssignToTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.mocked(store.getUnassignedMembers).mockReturnValue(mockMembers)
    vi.mocked(store.getTeams).mockReturnValue(mockTeams)
  })

  it('renders form fields correctly', () => {
    render(<AssignToTeam />)
    
    expect(screen.getByDisplayValue('Select Member')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Select Team')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Assign to Team' })).toBeInTheDocument()
  })

  it('displays available members and teams', () => {
    render(<AssignToTeam />)
    
    expect(screen.getByText('John Doe (john@example.com)')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith (jane@example.com)')).toBeInTheDocument()
    expect(screen.getAllByText('Development Team')).toHaveLength(2)
    expect(screen.getAllByText('Design Team')).toHaveLength(2)
  })

  it('submits assignment with valid selections', async () => {
    const user = userEvent.setup()
    render(<AssignToTeam />)

    await user.selectOptions(screen.getByDisplayValue('Select Member'), '1')
    await user.selectOptions(screen.getByDisplayValue('Select Team'), '1')
    await user.click(screen.getByRole('button', { name: 'Assign to Team' }))

    expect(store.assignMemberToTeam).toHaveBeenCalledWith('1', '1')
    expect(window.alert).toHaveBeenCalledWith('Member assigned to team successfully!')
  })

  it('clears selections after successful assignment', async () => {
    const user = userEvent.setup()
    render(<AssignToTeam />)

    const memberSelect = screen.getByDisplayValue('Select Member')
    const teamSelect = screen.getByDisplayValue('Select Team')

    await user.selectOptions(memberSelect, '1')
    await user.selectOptions(teamSelect, '1')
    await user.click(screen.getByRole('button', { name: 'Assign to Team' }))

    expect(memberSelect).toHaveValue('')
    expect(teamSelect).toHaveValue('')
  })

  it('requires both member and team to be selected', async () => {
    const user = userEvent.setup()
    render(<AssignToTeam />)

    await user.click(screen.getByRole('button', { name: 'Assign to Team' }))

    expect(store.assignMemberToTeam).not.toHaveBeenCalled()
    expect(window.alert).not.toHaveBeenCalled()
  })

  it('displays current teams section', () => {
    render(<AssignToTeam />)
    
    expect(screen.getByText('Current Teams')).toBeInTheDocument()
  })

  it('shows team member count', () => {
    const teamsWithMembers = [
      { 
        id: '1', 
        name: 'Development Team', 
        logo: 'logo1.png', 
        members: [mockMembers[0]] 
      },
    ]
    vi.mocked(store.getTeams).mockReturnValue(teamsWithMembers)

    render(<AssignToTeam />)
    
    expect(screen.getByText('Members: 1')).toBeInTheDocument()
    expect(screen.getByText('• John Doe')).toBeInTheDocument()
  })
})