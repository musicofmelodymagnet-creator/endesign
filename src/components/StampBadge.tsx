import React from 'react'
import { cn } from '@/utilities/ui'

type Props = {
  children: React.ReactNode
  className?: string
  tone?: 'amber' | 'crimson' | 'ink'
}

const tones = {
  amber: 'bg-primary text-primary-foreground',
  crimson: 'bg-accent text-accent-foreground',
  ink: 'bg-foreground text-background',
}

export const StampBadge: React.FC<Props> = ({ children, className, tone = 'amber' }) => (
  <span
    className={cn(
      'stamp font-display inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm uppercase tracking-wider',
      tones[tone],
      className,
    )}
  >
    {children}
  </span>
)
