import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, setTheme, resolvedTheme } = useTheme();

    // Determine what to display. If system, show the resolved state.
    const displayTheme = theme === 'system' ? resolvedTheme : theme;

    const icons = {
        light: '☀️',
        dark: '🌙'
    };

    const nextTheme = () => {
        // Simple toggle: If currently dark (effecitvely), go light. Else dark.
        // This removes 'system' from the cycle after the first interaction.
        const next = resolvedTheme === 'dark' ? 'light' : 'dark';
        setTheme(next);
    };

    return (
        <button
            onClick={nextTheme}
            className="nav-button"
            style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}
            title={`Current theme: ${displayTheme} ${theme === 'system' ? '(System)' : ''}`}
        >
            <span>{icons[displayTheme]}</span>
            <span style={{ textTransform: 'capitalize' }}>{displayTheme}</span>
        </button>
    );
};

export default ThemeToggle;
