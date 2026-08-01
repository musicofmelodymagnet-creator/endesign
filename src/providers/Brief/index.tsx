'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

type BriefContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
}

const BriefContext = createContext<BriefContextValue | undefined>(undefined)

export const BriefProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  return <BriefContext.Provider value={{ isOpen, open, close }}>{children}</BriefContext.Provider>
}

export function useBrief() {
  const ctx = useContext(BriefContext)
  if (!ctx) throw new Error('useBrief must be used within a BriefProvider')
  return ctx
}
