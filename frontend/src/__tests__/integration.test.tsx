import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('complete workflow: add member, create team, assign member, give feedback', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Picture URL'), 'https://example.com/photo.jpg')
    await user.click(screen.getByRole('button', { name: 'Add Member' }))

    expect(window.alert).toHaveBeenCalledWith('Team member added successfully!')

    const navCreateTeam = screen.getAllByText('Create Team')[0]
    await user.click(navCreateTeam)

    await user.type(screen.getByPlaceholderText('Team Name'), 'Development Team')
    await user.type(screen.getByPlaceholderText('Team Logo URL'), 'https://example.com/logo.png')
    
    const form = screen.getByPlaceholderText('Team Name').closest('form')!
    const submitButton = within(form).getByRole('button', { name: 'Create Team' })
    await user.click(submitButton)

    expect(window.alert).toHaveBeenCalledWith('Team created successfully!')

    const navAssignTeam = screen.getAllByText('Assign to Team')[0]
    await user.click(navAssignTeam)

    const selects = screen.getAllByRole('combobox')
    const memberSelect = selects[0]
    const teamSelect = selects[1]
    
    const memberOptions = within(memberSelect).getAllByRole('option')
    const teamOptions = within(teamSelect).getAllByRole('option')
    
    if (memberOptions.length > 1) await user.selectOptions(memberSelect, memberOptions[1].value)
    if (teamOptions.length > 1) await user.selectOptions(teamSelect, teamOptions[1].value)
    
    const assignForm = memberSelect.closest('form')!
    const assignButton = within(assignForm).getByRole('button', { name: 'Assign to Team' })
    await user.click(assignButton)

    expect(window.alert).toHaveBeenCalledWith('Member assigned to team successfully!')

    await user.click(screen.getByRole('button', { name: 'Give Feedback' }))

    const personTargets = screen.getByDisplayValue('Select person')
    const personOptions = within(personTargets).getAllByRole('option')
    
    if (personOptions.length > 1) {
      await user.selectOptions(personTargets, personOptions[1].value)
    }
    
    await user.type(screen.getByPlaceholderText('Enter your feedback...'), 'Excellent work on the project!')
    await user.click(screen.getByRole('button', { name: 'Submit Feedback' }))

    expect(window.alert).toHaveBeenCalledWith('Feedback submitted successfully!')
    expect(screen.getByText('Excellent work on the project!')).toBeInTheDocument()
  })

  it('switches between feedback target types', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Name'), 'Jane Smith')
    await user.type(screen.getByPlaceholderText('Email'), 'jane@example.com')
    await user.type(screen.getByPlaceholderText('Picture URL'), 'https://example.com/jane.jpg')
    await user.click(screen.getByRole('button', { name: 'Add Member' }))

    const navCreateTeam = screen.getAllByText('Create Team')[0]
    await user.click(navCreateTeam)
    
    await user.type(screen.getByPlaceholderText('Team Name'), 'Design Team')
    await user.type(screen.getByPlaceholderText('Team Logo URL'), 'https://example.com/design-logo.png')
    
    const form = screen.getByPlaceholderText('Team Name').closest('form')!
    const submitButton = within(form).getByRole('button', { name: 'Create Team' })
    await user.click(submitButton)

    await user.click(screen.getByRole('button', { name: 'Give Feedback' }))

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Team'))

    expect(screen.getByText('Design Team')).toBeInTheDocument()
    expect(screen.getByText('Select team')).toBeInTheDocument()
  })

  it('validates form requirements across components', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Add Member' }))
    expect(window.alert).not.toHaveBeenCalled()

    const navCreateTeam = screen.getAllByText('Create Team')[0]
    await user.click(navCreateTeam)
    
    const form = screen.getByPlaceholderText('Team Name').closest('form')!
    const submitButton = within(form).getByRole('button', { name: 'Create Team' })
    await user.click(submitButton)
    expect(window.alert).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Give Feedback' }))
    await user.click(screen.getByRole('button', { name: 'Submit Feedback' }))
    expect(window.alert).not.toHaveBeenCalled()
  })

  it('displays team assignment form correctly', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByPlaceholderText('Name'), 'Alice Johnson')
    await user.type(screen.getByPlaceholderText('Email'), 'alice@example.com')
    await user.type(screen.getByPlaceholderText('Picture URL'), 'https://example.com/alice.jpg')
    await user.click(screen.getByRole('button', { name: 'Add Member' }))

    const navCreateTeam = screen.getAllByText('Create Team')[0]
    await user.click(navCreateTeam)
    
    await user.type(screen.getByPlaceholderText('Team Name'), 'QA Team')
    await user.type(screen.getByPlaceholderText('Team Logo URL'), 'https://example.com/qa-logo.png')
    
    const form = screen.getByPlaceholderText('Team Name').closest('form')!
    const submitButton = within(form).getByRole('button', { name: 'Create Team' })
    await user.click(submitButton)

    const navAssignTeam = screen.getAllByText('Assign to Team')[0]
    await user.click(navAssignTeam)

    const qaTeamSection = screen.getByRole('heading', { name: 'QA Team' }).closest('div')!
    expect(within(qaTeamSection).getByText('Members: 0')).toBeInTheDocument()

    const selects = screen.getAllByRole('combobox')
    expect(selects).toHaveLength(2)
    expect(screen.getByText('Alice Johnson (alice@example.com)')).toBeInTheDocument()
  })
})