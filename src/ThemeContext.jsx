import React, { createContext, useContext, useState } from 'react';

// ── Light theme (existing beige/cream design) ────────────────────────────────
export const LIGHT = {
  '--cs-bg':           '#F8F6F0',
  '--cs-card':         '#FFFFFF',
  '--cs-card-alt':     '#F0EDE6',
  '--cs-border':       '#E8E4D8',
  '--cs-border-soft':  '#F0EDE6',
  '--cs-text':         '#1A2416',
  '--cs-text-sec':     '#5A6B52',
  '--cs-text-muted':   '#9CA3AF',
  '--cs-text-dim':     '#7A8C72',
  '--cs-accent':       '#4A7C59',
  '--cs-accent-bold':  '#3d6b4a',
  '--cs-accent-light': '#F0F7F2',
  '--cs-icon-dim':     '#C4C0B8',
  '--cs-toggle-off':   '#D4D0C8',
  '--cs-danger':       '#DC2626',
  '--cs-danger-light': '#FFF5F5',
  '--cs-danger-border':'#FEE2E2',
  '--cs-warning':      '#D97706',
  '--cs-warning-light':'#FFFBEB',
  '--cs-shadow':       'rgba(0,0,0,0.07)',
  '--cs-shadow-md':    'rgba(0,0,0,0.10)',
};

// ── Dark theme (reference image: dark green / neon accent) ───────────────────
export const DARK = {
  '--cs-bg':           '#0B1A0D',
  '--cs-card':         '#142018',
  '--cs-card-alt':     '#1B2D1E',
  '--cs-border':       '#2A4020',
  '--cs-border-soft':  '#223320',
  '--cs-text':         '#E8F5E8',
  '--cs-text-sec':     '#9DC49D',
  '--cs-text-muted':   '#6B8A6B',
  '--cs-text-dim':     '#7A9A7A',
  '--cs-accent':       '#4ADE80',
  '--cs-accent-bold':  '#22C55E',
  '--cs-accent-light': '#0F2A18',
  '--cs-icon-dim':     '#5A7A5A',
  '--cs-toggle-off':   '#2A3A2A',
  '--cs-danger':       '#FF6B6B',
  '--cs-danger-light': '#2A1515',
  '--cs-danger-border':'#4A2020',
  '--cs-warning':      '#FCD34D',
  '--cs-warning-light':'#2A2010',
  '--cs-shadow':       'rgba(0,0,0,0.40)',
  '--cs-shadow-md':    'rgba(0,0,0,0.55)',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('cs-theme') === 'dark';
  });

  React.useEffect(() => {
    localStorage.setItem('cs-theme', isDark ? 'dark' : 'light');
    
    // Sync the browser/OS status bar color with the active theme background
    const bgColor = isDark ? DARK['--cs-bg'] : LIGHT['--cs-bg'];
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    // Remove the media attribute if it exists, so we forcefully control the color
    metaTheme.removeAttribute('media');
    metaTheme.setAttribute('content', bgColor);
    
  }, [isDark]);

  const vars = isDark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {/* Applying all CSS custom properties on this root div
          means every child that uses var(--cs-xxx) will react
          to theme changes with zero extra code. */}
      <div data-theme={isDark ? 'dark' : 'light'} style={vars}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
