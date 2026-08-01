'use client'

import React from 'react'

import { useBrief } from '@/providers/Brief'

export const BriefTrigger: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => {
  const { open } = useBrief()

  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  )
}
