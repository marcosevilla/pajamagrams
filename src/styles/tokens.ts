// Design tokens extracted from Figma file: Daily Design (ye7XiHyMbTmwBDnO1K9lpQ)

export const colors = {
  // Primary
  yellow: {
    DEFAULT: '#F8BD04',
    light: 'rgba(248, 189, 4, 0.1)',
  },

  // Background states
  background: {
    landing: '#F8BD04',
    puzzle: '#F5EFDC',
    success: '#F8BD04',
    error: '#F5EFDC',
  },

  // Tile colors
  tile: {
    fill: '#E3D3C4',
    border: '#DEBB96',
  },

  // Text colors
  text: {
    primary: '#000000',
    secondary: '#7B573D',
    dark: '#403100',
  },

  // Slot colors
  slot: {
    border: '#B2B2B2',
    hoverFill: '#DCD6C3',
    hoverBorder: '#7A7A7A',
  },

  // Button colors
  button: {
    success: '#7B573D',
    error: '#FF0000',
  },
} as const

export const typography = {
  title: {
    fontFamily: '"Arial Narrow", Arial, sans-serif',
    fontWeight: 700,
    fontSize: '46px',
    lineHeight: 1.15,
    letterSpacing: '-0.04em',
  },

  clue: {
    fontFamily: 'Arial, sans-serif',
    fontWeight: 700,
    fontSize: '22px',
    lineHeight: 1.15,
    letterSpacing: '-0.04em',
  },

  tileLetter: {
    fontFamily: 'Arial, sans-serif',
    fontWeight: 700,
    fontSize: '36px',
    lineHeight: 1.15,
    letterSpacing: '-0.01em',
  },

  button: {
    fontFamily: '"Arial Narrow", Arial, sans-serif',
    fontWeight: 700,
    fontSize: '48px',
    lineHeight: 1.15,
    letterSpacing: '-0.04em',
  },
} as const

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  tileGap: '8px',
  slotGap: '8px',
  screenPadding: '43px',
} as const

export const borderRadius = {
  tile: '4px',
  slot: '4px',
  button: '8px',
} as const

export const shadows = {
  tile: {
    default: '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)',
    dragging: '0px 8px 16px 4px rgba(0, 0, 0, 0.2), 0px 4px 8px 0px rgba(0, 0, 0, 0.3)',
  },
} as const

export const dimensions = {
  tile: {
    width: 53,
    height: 53,
  },
  slot: {
    width: 53,
    height: 53,
  },
  button: {
    success: { width: 200, height: 112 },
    error: { width: 265, height: 112 },
  },
  screen: {
    width: 430,
    height: 932,
  },
} as const
