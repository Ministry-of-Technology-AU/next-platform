'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'platform-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  // Function to get system theme
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Function to apply theme to document
  const applyTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    let resolvedTheme: 'light' | 'dark'

    if (newTheme === 'system') {
      resolvedTheme = getSystemTheme()
    } else {
      resolvedTheme = newTheme
    }

    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Add the new theme class
    root.classList.add(resolvedTheme)

    // Update the actual theme state
    setActualTheme(resolvedTheme)

    // Save to localStorage
    localStorage.setItem(storageKey, newTheme)
  }

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Get theme from localStorage or use default
    const savedTheme = localStorage.getItem(storageKey) as Theme | null
    const initialTheme = savedTheme || defaultTheme

    // Set the theme state
    setTheme(initialTheme)

    // Apply the theme immediately
    applyTheme(initialTheme)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const systemTheme = e.matches ? 'dark' : 'light'
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(systemTheme)
        setActualTheme(systemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [defaultTheme, storageKey])

  // Update theme when theme state changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  const value = {
    theme,
    setTheme: handleSetTheme,
    actualTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}