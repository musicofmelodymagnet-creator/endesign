import React from 'react'

import { BriefProvider } from './Brief'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <BriefProvider>{children}</BriefProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
