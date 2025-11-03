'use client'

import { useTheme } from '@/hooks/use-theme'
import '../custom-components.css'

export default function ThemeToggle() {
    const { theme, setTheme, actualTheme } = useTheme()

    const handleToggle = () => {
        // Cycle through: light -> dark -> system -> light
        if (theme === 'light') {
            setTheme('dark')
        } else if (theme === 'dark') {
            setTheme('system')
        } else {
            setTheme('light')
        }
    }

    return(
        <label className="switch">
            <input 
                type="checkbox" 
                checked={actualTheme === 'dark'}
                onChange={handleToggle}
            />
            <span className="slider"></span>
        </label>
    )
}