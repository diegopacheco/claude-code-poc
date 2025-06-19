import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateTeam from '../CreateTeam'
import { store } from '../../store'

vi.mock('../../store', () => ({
  store: {
    addTeam: vi.fn(),
  },
}))

describe('CreateTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('renders form fields correctly', () => {
    render(<CreateTeam />)
    
    expect(screen.getByPlaceholderText('Team Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Team Logo URL')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Team' })).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<CreateTeam />)

    await user.type(screen.getByPlaceholderText('Team Name'), 'Development Team')
    await user.type(screen.getByPlaceholderText('Team Logo URL'), 'https://example.com/logo.png')
    
    await user.click(screen.getByRole('button', { name: 'Create Team' }))

    expect(store.addTeam).toHaveBeenCalledWith({
      name: 'Development Team',
      logo: 'https://example.com/logo.png',
    })
    expect(window.alert).toHaveBeenCalledWith('Team created successfully!')
  })

  it('clears form after successful submission', async () => {
    const user = userEvent.setup()
    render(<CreateTeam />)

    const nameInput = screen.getByPlaceholderText('Team Name')
    const logoInput = screen.getByPlaceholderText('Team Logo URL')

    await user.type(nameInput, 'Development Team')
    await user.type(logoInput, 'https://example.com/logo.png')
    
    await user.click(screen.getByRole('button', { name: 'Create Team' }))

    expect(nameInput).toHaveValue('')
    expect(logoInput).toHaveValue('')
  })

  it('requires all fields to be filled', async () => {
    const user = userEvent.setup()
    render(<CreateTeam />)

    await user.click(screen.getByRole('button', { name: 'Create Team' }))

    expect(store.addTeam).not.toHaveBeenCalled()
    expect(window.alert).not.toHaveBeenCalled()
  })

  it('validates logo URL format', () => {
    render(<CreateTeam />)
    const logoInput = screen.getByPlaceholderText('Team Logo URL')
    
    expect(logoInput).toHaveAttribute('type', 'url')
  })
})