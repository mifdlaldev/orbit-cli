/**
 * Theme Configuration
 * Central design tokens for ORBIT CLI
 */

export const orbitTheme = {
  // Colors
  colors: {
    primary: '#8B5CF6',
    secondary: '#6366F1',
    accent: '#22D3EE',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#6366F1',
    text: '#FAFAFA',
    dim: '#A1A1AA',
    muted: '#71717A',
    // Solar-system accent tokens
    sun: '#FBBF24',
    orbitRing: '#22D3EE',
  },

  // Spacing (in characters)
  spacing: {
    xs: 1,
    sm: 2,
    md: 4,
    lg: 6,
  },

  // UI Elements
  spinner: {
    type: 'orbit' as const,
    color: 'yellow' as const,
    interval: 90,
    frames: [
      '●◌◌◌◌',
      '◌●◌◌◌',
      '◌◌●◌◌',
      '◌◌◌●◌',
      '◌◌◌◌●',
      '◌◌◌●◌',
      '◌◌●◌◌',
      '◌●◌◌◌',
    ] as const,
  },

  // Box Drawing
  border: {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    horizontal: '─',
    vertical: '│',
  },
} as const;

export type OrbitTheme = typeof orbitTheme;
