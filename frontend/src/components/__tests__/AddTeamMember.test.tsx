import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddTeamMember from '../AddTeamMember'
import { store } from '../../store'

vi.mock('../../store', () => ({
  store: {
    addTeamMember: vi.fn(),
  },
}))

describe('AddTeamMember', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('renders form fields correctly', () => {
    render(<AddTeamMember />)
    
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Picture URL')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add Member' })).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<AddTeamMember />)

    await user.type(screen.getByPlaceholderText('Name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Email'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('Picture URL'), 'https://example.com/photo.jpg')
    
    await user.click(screen.getByRole('button', { name: 'Add Member' }))

    expect(store.addTeamMember).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      picture: 'https://example.com/photo.jpg',
    })
    expect(window.alert).toHaveBeenCalledWith('Team member added successfully!')
  })

  it('clears form after successful submission', async () => {
    const user = userEvent.setup()
    render(<AddTeamMember />)

    const nameInput = screen.getByPlaceholderText('Name')
    const emailInput = screen.getByPlaceholderText('Email')
    const pictureInput = screen.getByPlaceholderText('Picture URL')

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(pictureInput, 'https://example.com/photo.jpg')
    
    await user.click(screen.getByRole('button', { name: 'Add Member' }))

    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
    expect(pictureInput).toHaveValue('')
  })

  it('requires all fields to be filled', async () => {
    const user = userEvent.setup()
    render(<AddTeamMember />)

    await user.click(screen.getByRole('button', { name: 'Add Member' }))

    expect(store.addTeamMember).not.toHaveBeenCalled()
    expect(window.alert).not.toHaveBeenCalled()
  })

  it('validates email format', () => {
    render(<AddTeamMember />)
    const emailInput = screen.getByPlaceholderText('Email')
    
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('validates picture URL format', () => {
    render(<AddTeamMember />)
    const pictureInput = screen.getByPlaceholderText('Picture URL')
    
    expect(pictureInput).toHaveAttribute('type', 'url')
  })
})