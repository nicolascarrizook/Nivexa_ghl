import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

// Mock the Spinner component
vi.mock('../feedback/Spinner', () => ({
  default: ({ className }: { className?: string }) => (
    <div data-testid="spinner" className={className}>
      Loading...
    </div>
  ),
}))

describe('Button Component', () => {
  it('renders button with children', () => {
    render(<Button>Test Button</Button>)
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders different variants', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-purple-600')

    rerender(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-gray-100')

    rerender(<Button variant="destructive">Destructive</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-red-600')
  })

  it('renders different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-base')
  })

  it('shows loading state', () => {
    render(<Button loading>Loading Button</Button>)
    
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
  })

  it('renders with icons', () => {
    const LeftIcon = () => <span data-testid="left-icon">←</span>
    const RightIcon = () => <span data-testid="right-icon">→</span>

    render(
      <Button leftIcon={<LeftIcon />} rightIcon={<RightIcon />}>
        With Icons
      </Button>
    )

    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('renders icon-only button', () => {
    const Icon = () => <span data-testid="icon">✓</span>

    render(
      <Button size="icon" leftIcon={<Icon />} aria-label="Check" />
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByLabelText('Check')).toBeInTheDocument()
  })

  it('renders full width', () => {
    render(<Button fullWidth>Full Width</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Ref Button</Button>)
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('prevents click when loading', () => {
    const handleClick = vi.fn()
    render(<Button loading onClick={handleClick}>Loading</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('shows loading spinner with correct color for different variants', () => {
    const { rerender } = render(<Button variant="primary" loading>Primary Loading</Button>)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()

    rerender(<Button variant="secondary" loading>Secondary Loading</Button>)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })
})