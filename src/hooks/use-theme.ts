import { useTheme as useThemeContext } from '@/components/providers/theme-provider'

export function useTheme() {
  return useThemeContext()
}

export function useIsDark() {
  const { actualTheme } = useThemeContext()
  return actualTheme === 'dark'
}

export function useIsLight() {
  const { actualTheme } = useThemeContext()
  return actualTheme === 'light'
}