import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('App', () => {
  it('renders navigation correctly', () => {
    render(<App />)
    
    expect(screen.getByText('Coaching App')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Team Member' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Team' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Assign to Team' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Give Feedback' })).toBeInTheDocument()
  })

  it('defaults to Add Team Member page', () => {
    render(<App />)
    
    expect(screen.getByRole('heading', { name: 'Add Team Member' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
  })

  it('navigates to Create Team page', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Create Team' }))

    expect(screen.getByRole('heading', { name: 'Create Team' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Team Name')).toBeInTheDocument()
  })

  it('navigates to Assign to Team page', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Assign to Team' }))

    expect(screen.getByRole('heading', { name: 'Assign to Team' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Current Teams' })).toBeInTheDocument()
  })

  it('navigates to Give Feedback page', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Give Feedback' }))

    expect(screen.getByRole('heading', { name: 'Give Feedback' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your feedback...')).toBeInTheDocument()
  })

  it('highlights active navigation button', async () => {
    const user = userEvent.setup()
    render(<App />)

    const addMemberBtn = screen.getByRole('button', { name: 'Add Team Member' })
    const createTeamBtn = screen.getByRole('button', { name: 'Create Team' })

    expect(addMemberBtn.style.backgroundColor).toBe('rgb(0, 123, 255)')
    expect(createTeamBtn.style.backgroundColor).toBe('transparent')

    await user.click(createTeamBtn)

    expect(createTeamBtn.style.backgroundColor).toBe('rgb(0, 123, 255)')
    expect(addMemberBtn.style.backgroundColor).toBe('transparent')
  })
})