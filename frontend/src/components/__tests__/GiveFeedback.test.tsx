import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GiveFeedback from '../GiveFeedback'
import { store } from '../../store'

const mockMembers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', picture: 'pic1.jpg' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', picture: 'pic2.jpg' },
]

const mockTeams = [
  { id: '1', name: 'Development Team', logo: 'logo1.png', members: [] },
  { id: '2', name: 'Design Team', logo: 'logo2.png', members: [] },
]

const mockFeedbacks = [
  {
    id: '1',
    content: 'Great work!',
    targetType: 'person',
    targetId: '1',
    targetName: 'John Doe',
    date: '2024-01-01T10:00:00.000Z',
  },
]

vi.mock('../../store', () => ({
  store: {
    getTeamMembers: vi.fn(),
    getTeams: vi.fn(),
    getFeedbacks: vi.fn(),
    addFeedback: vi.fn(),
  },
}))

describe('GiveFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.mocked(store.getTeamMembers).mockReturnValue(mockMembers)
    vi.mocked(store.getTeams).mockReturnValue(mockTeams)
    vi.mocked(store.getFeedbacks).mockReturnValue(mockFeedbacks)
  })

  it('renders form fields correctly', () => {
    render(<GiveFeedback />)
    
    expect(screen.getByLabelText('Person')).toBeInTheDocument()
    expect(screen.getByLabelText('Team')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your feedback...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit Feedback' })).toBeInTheDocument()
  })

  it('defaults to person target type', () => {
    render(<GiveFeedback />)
    
    expect(screen.getByLabelText('Person')).toBeChecked()
    expect(screen.getByLabelText('Team')).not.toBeChecked()
  })

  it('switches between person and team target types', async () => {
    const user = userEvent.setup()
    render(<GiveFeedback />)

    await user.click(screen.getByLabelText('Team'))

    expect(screen.getByLabelText('Team')).toBeChecked()
    expect(screen.getByLabelText('Person')).not.toBeChecked()
    expect(screen.getByText('Select team')).toBeInTheDocument()
  })

  it('displays correct options based on target type', async () => {
    const user = userEvent.setup()
    render(<GiveFeedback />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Team'))

    expect(screen.getByText('Development Team')).toBeInTheDocument()
    expect(screen.getByText('Design Team')).toBeInTheDocument()
  })

  it('submits feedback for person', async () => {
    const user = userEvent.setup()
    render(<GiveFeedback />)

    await user.selectOptions(screen.getByDisplayValue('Select person'), '1')
    await user.type(screen.getByPlaceholderText('Enter your feedback...'), 'Excellent work!')
    await user.click(screen.getByRole('button', { name: 'Submit Feedback' }))

    expect(store.addFeedback).toHaveBeenCalledWith({
      content: 'Excellent work!',
      targetType: 'person',
      targetId: '1',
      targetName: 'John Doe',
    })
    expect(window.alert).toHaveBeenCalledWith('Feedback submitted successfully!')
  })

  it('submits feedback for team', async () => {
    const user = userEvent.setup()
    render(<GiveFeedback />)

    await user.click(screen.getByLabelText('Team'))
    await user.selectOptions(screen.getByDisplayValue('Select team'), '1')
    await user.type(screen.getByPlaceholderText('Enter your feedback...'), 'Great teamwork!')
    await user.click(screen.getByRole('button', { name: 'Submit Feedback' }))

    expect(store.addFeedback).toHaveBeenCalledWith({
      content: 'Great teamwork!',
      targetType: 'team',
      targetId: '1',
      targetName: 'Development Team',
    })
  })

  it('clears form after successful submission', async () => {
    const user = userEvent.setup()
    render(<GiveFeedback />)

    const feedbackTextarea = screen.getByPlaceholderText('Enter your feedback...')
    const targetSelect = screen.getByDisplayValue('Select person')

    await user.selectOptions(targetSelect, '1')
    await user.type(feedbackTextarea, 'Great work!')
    await user.click(screen.getByRole('button', { name: 'Submit Feedback' }))

    expect(feedbackTextarea).toHaveValue('')
    expect(targetSelect).toHaveValue('')
  })

  it('requires both content and target to be filled', async () => {
    const user = userEvent.setup()
    render(<GiveFeedback />)

    await user.click(screen.getByRole('button', { name: 'Submit Feedback' }))

    expect(store.addFeedback).not.toHaveBeenCalled()
    expect(window.alert).not.toHaveBeenCalled()
  })

  it('displays recent feedback section', () => {
    render(<GiveFeedback />)
    
    expect(screen.getByText('Recent Feedback')).toBeInTheDocument()
    expect(screen.getByText('To: John Doe (person)')).toBeInTheDocument()
    expect(screen.getByText('Great work!')).toBeInTheDocument()
  })

  it('shows no feedback message when list is empty', () => {
    vi.mocked(store.getFeedbacks).mockReturnValue([])
    render(<GiveFeedback />)
    
    expect(screen.getByText('No feedback submitted yet.')).toBeInTheDocument()
  })
})