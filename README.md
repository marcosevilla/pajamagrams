# Pajamagrams

A mobile-first, interactive puzzle gift experience inspired by Bananagrams. Built as a personalized digital gift with clue-based word puzzles featuring drag-and-drop letter tiles.

---

## Table of Contents

1. [Product Goals & Constraints](#1-product-goals--constraints)
2. [Figma-First Workflow](#2-figma-first-workflow)
3. [Core User Flow](#3-core-user-flow)
4. [Interaction Design Spec](#4-interaction-design-spec)
5. [Data Model for Puzzles](#5-data-model-for-puzzles)
6. [Technical Approach](#6-technical-approach)
7. [Repo Structure](#7-repo-structure)
8. [UI Style Guide](#8-ui-style-guide-from-figma)
9. [Milestones / Build Plan](#9-milestones--build-plan)
10. [Open Questions / Configurable Knobs](#10-open-questions--configurable-knobs)

---

## 1. Product Goals & Constraints

### Goals
- Create a **small, delightful gift experience** — not a commercial product
- Deliver a tactile, satisfying puzzle interaction that feels like physical Bananagrams tiles
- Celebrate personal inside jokes and shared memories through clue-based puzzles
- Achieve **pixel-perfect fidelity** to the Figma designs

### Constraints
- **Mobile-first**: Optimized for iPhone Safari and Chrome on iOS/Android
- **No authentication**: Single-player, stateless experience
- **Simple deployment**: Vercel or Netlify with zero backend infrastructure
- **Figma as source of truth**: All UI implemented directly from Figma via MCP
- **Fat-finger resilient**: Touch targets and interactions designed for small screens and imprecise input

### Non-Goals
- Multiplayer functionality
- Leaderboards or scoring
- Backend/database persistence
- Desktop-optimized experience (works, but not priority)

---

## 2. Figma-First Workflow

### Source of Truth

| Asset Type | Source | Sync Method |
|------------|--------|-------------|
| Colors | Figma fill styles | MCP token extraction |
| Typography | Figma text styles | MCP token extraction |
| Spacing | Figma frame measurements | MCP layout data |
| Components | Figma component library | 1:1 React mapping |
| Icons/Illustrations | Figma vector nodes | MCP image export |
| Motion | Figma prototype connections | Manual spec reference |

### Figma File Reference
- **File**: `Daily Design` (ye7XiHyMbTmwBDnO1K9lpQ)
- **Landing Page**: Node `2161:408`
- **Puzzle Screen (Initial)**: Node `2161:410`
- **Puzzle Screen (Hover)**: Node `2169:507`
- **Puzzle Screen (Error)**: Node `2169:602`
- **Puzzle Screen (Success)**: Node `2169:538`

### Component Naming Convention

Components should mirror Figma naming exactly:

```
Figma Component          →  React Component
─────────────────────────────────────────────
Group 5 (Logo)           →  <Logo />
PAJAMAGRAMS (Text)       →  <Title />
Group 6 (Tile)           →  <Tile letter="A" />
Group 15 (SlotRow)       →  <SlotRow slots={5} />
Rectangle 1 (Slot)       →  <Slot />
```

### Asset Export Pipeline

1. **SVGs**: Export logo, slot placeholder outlines, and decorative elements via MCP `download_figma_images`
2. **PNGs**: Export any raster textures at 2x/3x scale
3. **Tokens**: Extract color/typography/spacing tokens from `globalVars.styles`

### Keeping Design & Code in Sync

1. **Before each sprint**: Re-fetch Figma data via MCP to detect changes
2. **Token file**: Generate `src/styles/tokens.ts` from Figma styles
3. **Component audit**: Cross-reference component props with Figma variants
4. **Visual regression**: Screenshot comparison against Figma frames

---

## 3. Core User Flow

### MVP Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Landing   │ ──▶ │   Puzzle    │ ──▶ │   Success   │ ──▶ │  Next Level │
│   Screen    │     │   Level N   │     │    State    │     │  or Finale  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                    │
   Tap to             Drag tiles         Auto-advance          Repeat or
    Start             to solve           after delay            End
```

### Screen States (mapped to Figma frames)

| State | Description | Figma Reference |
|-------|-------------|-----------------|
| `landing` | Title screen with logo, tap to begin | Node `2161:408` |
| `puzzle.initial` | Clue visible, tiles scattered below, slots empty | Node `2161:410` |
| `puzzle.dragging` | Tile elevated, slot highlights on hover | Node `2169:507` |
| `puzzle.partial` | Some slots filled, puzzle incomplete | (Derived state) |
| `puzzle.complete` | All slots filled, pending validation | (Derived state) |
| `puzzle.error` | Wrong answer, "TRY AGAIN!" button, cream background | Node `2169:602` |
| `puzzle.success` | Correct answer, yellow background, "PEEL!" button | Node `2169:538` |
| `finale` | All puzzles complete, celebratory end | (TBD frame) |

### Navigation Logic

```typescript
type GameState =
  | { screen: 'landing' }
  | { screen: 'puzzle'; levelIndex: number; puzzleState: PuzzleState }
  | { screen: 'finale' };

type PuzzleState = 'initial' | 'dragging' | 'partial' | 'complete' | 'success' | 'retry';
```

---

## 4. Interaction Design Spec

### Tile Pickup

| Property | Value | Notes |
|----------|-------|-------|
| Scale | 1.1x | Slight enlargement on pickup |
| Elevation | +8px shadow offset | M3 elevation increase |
| Z-index | 100 | Above all other tiles |
| Transition | 150ms ease-out | Snappy response |
| Haptic | Light impact | iOS `UIImpactFeedbackGenerator.light` |

### Drag Behavior

```typescript
interface DragState {
  tileId: string;
  origin: { x: number; y: number };
  current: { x: number; y: number };
  hoveredSlotIndex: number | null;
}
```

- **Touch tracking**: Use `pointer-events` for unified touch/mouse handling
- **Scroll lock**: Prevent page scroll while dragging (`touch-action: none`)
- **Bounds**: Allow tile to leave tray area freely

### Slot Hover Feedback (from Figma Node 2169:507)

| Property | Value |
|----------|-------|
| Fill | #DCD6C3 (warmer beige) |
| Border color | #7A7A7A (darker gray) |
| Border width | 2px dashed (3,1 pattern) |
| Transition | 100ms ease-in-out |

### Drop Rules

1. **Snap to slot**: If released over valid slot, animate tile into slot center
2. **Swap if occupied**: If slot has a tile, swap positions (dragged tile to slot, existing tile to tray)
3. **Return to tray**: If released outside any slot, animate back to tray origin
4. **Reorder in tray**: Allow rearranging tiles within tray area

### Drop Animation

```typescript
const dropAnimation = {
  duration: 200,
  easing: [0.34, 1.56, 0.64, 1], // Overshoot bounce
  scale: [1.1, 0.95, 1],
};
```

### Reset & Hint Affordances

| Action | Trigger | Effect |
|--------|---------|--------|
| Reset | Tap reset button | All tiles return to tray with stagger animation |
| Hint | Tap hint button (if enabled) | Reveal one correct tile placement |
| Shake to reset | Device shake (optional) | Same as reset button |

### Success State (from Figma Node 2169:538)

When all tiles are placed correctly:

1. **Background transition**: Fade to `#F8BD04` (full yellow)
2. **Tiles snap into row**: All tiles align in slot row (53×53px, 8px gap)
3. **Clue text darkens**: Color changes to `#403100`
4. **"PEEL!" button appears**: Slides up from below
   - Size: 200×111.89px
   - Fill: `#7B573D` (brown)
   - Text: "PEEL!" in Arial Narrow Bold, 48px
   - Text color: `#F8BD04` (yellow)
5. **Haptic**: Success haptic pattern
6. **Button action**: Tapping "PEEL!" advances to next puzzle

### Error State (from Figma Node 2169:602)

When all tiles are placed but answer is wrong:

1. **Background transition**: Fade to `#F5EFDC` (cream)
2. **Tiles remain in row**: Show incorrect arrangement
3. **Clue text darkens**: Color changes to `#403100`
4. **"TRY AGAIN!" button appears**: Slides up from below
   - Size: 265×111.89px
   - Fill: `#FF0000` (red)
   - Text: "TRY AGAIN!" in Arial Narrow Bold, 48px
   - Text color: `#F5EFDC` (cream)
5. **Haptic**: Error haptic
6. **Button action**: Tapping resets tiles back to scattered positions

---

## 5. Data Model for Puzzles

### Puzzle Schema

```typescript
interface Puzzle {
  id: string;                    // Unique identifier (e.g., "puzzle-001")
  clue: string;                  // The hint/riddle shown to player
  answer: string;                // Correct answer (uppercase, no spaces)
  tiles: string[];               // Available letters (includes decoys)
  hint?: string;                 // Optional additional hint
  successMessage?: string;       // Personalized message on success
  backgroundVariant?: 'default' | 'alternate'; // Visual variation
  difficulty?: 'easy' | 'medium' | 'hard';     // For ordering/filtering
}
```

### Example Puzzle Data

```json
{
  "id": "puzzle-001",
  "clue": "An addictive powdery substance derived from a plant. Side effects include increased alertness and an elevated heart rate.",
  "answer": "MATCHA",
  "tiles": ["M", "A", "T", "C", "H", "A"],
  "hint": "It's green and Japanese",
  "successMessage": "You know me too well! ☕",
  "difficulty": "easy"
}
```

### Puzzle Collection Schema

```typescript
interface PuzzleCollection {
  version: string;
  title: string;
  puzzles: Puzzle[];
  finalMessage: string;
}
```

### Validation Rules

```typescript
function validateAnswer(userAnswer: string[], puzzle: Puzzle): boolean {
  const normalized = (str: string) =>
    str.toUpperCase().replace(/[\s\-]/g, '');

  return normalized(userAnswer.join('')) === normalized(puzzle.answer);
}
```

- Case-insensitive comparison
- Ignore spaces and hyphens
- Exact character match required

### File Location

```
/src/data/puzzles.json
```

---

## 6. Technical Approach

### Stack Selection

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **Vite + React** | Faster iteration than Next.js for static SPA; no SSR needed |
| Language | TypeScript | Type safety for game state and puzzle data |
| Styling | Tailwind CSS | Rapid utility-first styling, easy token mapping |
| Animation | Framer Motion | Best-in-class React animation, gesture support |
| Drag/Drop | Framer Motion `drag` | Native gesture handling, better than DnD Kit for this use case |
| State | Zustand | Lightweight, perfect for game state |
| Routing | None (single page) | Level progression via state, not routes |
| Persistence | LocalStorage | Save progress between sessions |

### Why Vite over Next.js

- No server-side rendering requirements
- Faster HMR for animation iteration
- Simpler deployment (static files)
- Lower complexity for a gift experience

### Drag/Drop Strategy

Using **Framer Motion's `drag` prop** rather than a dedicated DnD library:

```tsx
<motion.div
  drag
  dragConstraints={trayRef}
  dragElastic={0.1}
  onDragStart={handleDragStart}
  onDrag={handleDrag}
  onDragEnd={handleDragEnd}
  whileDrag={{ scale: 1.1, zIndex: 100 }}
>
  <Tile letter={letter} />
</motion.div>
```

**Benefits**:
- Native pointer event handling (touch + mouse)
- Built-in gesture physics
- Seamless animation integration
- No external library overhead

### State Model

```typescript
interface GameStore {
  // Navigation
  currentScreen: 'landing' | 'puzzle' | 'finale';
  currentLevelIndex: number;

  // Puzzle state
  slots: (string | null)[];      // Current slot contents
  trayTiles: TileState[];        // Tiles in tray with positions
  dragState: DragState | null;   // Active drag info

  // Actions
  startGame: () => void;
  placeTile: (tileId: string, slotIndex: number) => void;
  returnTileToTray: (tileId: string) => void;
  validateAnswer: () => boolean;
  nextLevel: () => void;
  resetLevel: () => void;
}
```

### LocalStorage Persistence

```typescript
const STORAGE_KEY = 'pajamagrams-progress';

interface SavedProgress {
  currentLevelIndex: number;
  completedLevels: string[];
  lastPlayedAt: string;
}
```

Save on:
- Level completion
- App backgrounding (visibility change)

### Asset Pipeline

1. **Export from Figma**: Use MCP `download_figma_images` for SVGs
2. **Optimize**: Run through SVGO for size reduction
3. **Import**: Reference in components via standard imports
4. **Sprites**: Consider sprite sheet for tile textures if performance needed

---

## 7. Repo Structure

```
/pajamagrams
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── index.html
│
├── /public
│   └── /assets
│       ├── logo.svg              # Pajamagrams logo from Figma
│       └── /tiles                # Tile texture assets if needed
│
├── /src
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Root component with screen routing
│   │
│   ├── /components               # 1:1 mapping with Figma components
│   │   ├── Logo.tsx              # Group 5 from Figma
│   │   ├── Title.tsx             # PAJAMAGRAMS text treatment
│   │   ├── Tile.tsx              # Letter tile (Group 6 pattern)
│   │   ├── Slot.tsx              # Empty placeholder slot
│   │   ├── SlotRow.tsx           # Row of slots for answer
│   │   ├── ScatteredTiles.tsx    # Scattered draggable tiles area
│   │   ├── ClueText.tsx          # Clue/riddle display
│   │   ├── ActionButton.tsx      # "PEEL!" and "TRY AGAIN!" buttons
│   │   └── Confetti.tsx          # Celebration particles (optional)
│   │
│   ├── /screens                  # 1:1 mapping with Figma frames
│   │   ├── LandingScreen.tsx     # Node 2161:408
│   │   ├── PuzzleScreen.tsx      # Node 2161:410
│   │   └── FinaleScreen.tsx      # End celebration
│   │
│   ├── /data
│   │   └── puzzles.json          # Puzzle definitions
│   │
│   ├── /styles
│   │   ├── tokens.ts             # Design tokens from Figma
│   │   └── globals.css           # Base styles + Tailwind imports
│   │
│   ├── /motion
│   │   ├── variants.ts           # Framer Motion animation presets
│   │   └── gestures.ts           # Drag gesture configurations
│   │
│   ├── /store
│   │   └── gameStore.ts          # Zustand game state
│   │
│   └── /utils
│       ├── validation.ts         # Answer checking logic
│       ├── haptics.ts            # Haptic feedback utilities
│       └── storage.ts            # LocalStorage helpers
│
└── /figma
    └── tokens.json               # Raw Figma token export (for reference)
```

---

## 8. UI Style Guide (from Figma)

### Color Tokens

```typescript
// src/styles/tokens.ts

export const colors = {
  // Primary
  yellow: {
    DEFAULT: '#F8BD04',           // Primary brand yellow (success bg)
    light: 'rgba(248, 189, 4, 0.1)', // Puzzle screen background tint
  },

  // Background states
  background: {
    puzzle: 'rgba(248, 189, 4, 0.1)', // Initial puzzle state
    success: '#F8BD04',               // Success state (full yellow)
    error: '#F5EFDC',                 // Error state (cream)
  },

  // Tile colors
  tile: {
    fill: '#E3D3C4',              // Tile background (warm beige)
    border: '#DEBB96',            // Tile border (tan)
  },

  // Text colors
  text: {
    primary: '#000000',           // Tile letters
    secondary: '#7B573D',         // Clue text default (brown)
    dark: '#403100',              // Clue text in success/error states
  },

  // Slot colors
  slot: {
    border: '#B2B2B2',            // Empty slot dashed border
    hoverFill: '#DCD6C3',         // Slot fill when tile hovers
    hoverBorder: '#7A7A7A',       // Slot border when tile hovers
  },

  // Button colors
  button: {
    success: '#7B573D',           // "PEEL!" button (brown)
    error: '#FF0000',             // "TRY AGAIN!" button (red)
  },
} as const;
```

### Typography Tokens

```typescript
export const typography = {
  // Title treatment (landing page)
  title: {
    fontFamily: '"Arial Narrow", Arial, sans-serif',
    fontWeight: 700,
    fontSize: '46px',
    lineHeight: 1.15,
    letterSpacing: '-0.04em',
    textAlign: 'center',
  },

  // Clue text
  clue: {
    fontFamily: 'Arial, sans-serif',
    fontWeight: 700,
    fontSize: '22px',
    lineHeight: 1.15,
    letterSpacing: '-0.04em',
    textAlign: 'center',
  },

  // Tile letter
  tileLetter: {
    fontFamily: 'Arial, sans-serif',
    fontWeight: 700,
    fontSize: '36px',
    lineHeight: 1.15,
    letterSpacing: '-0.01em',
    textAlign: 'center',
  },

  // Action buttons ("PEEL!", "TRY AGAIN!")
  button: {
    fontFamily: '"Arial Narrow", Arial, sans-serif',
    fontWeight: 700,
    fontSize: '48px',
    lineHeight: 1.15,
    letterSpacing: '-0.04em',
    textAlign: 'center',
  },
} as const;
```

### Spacing System

```typescript
export const spacing = {
  // Base unit: 4px
  xs: '4px',    // 1 unit
  sm: '8px',    // 2 units
  md: '16px',   // 4 units
  lg: '24px',   // 6 units
  xl: '32px',   // 8 units
  xxl: '48px',  // 12 units

  // Component-specific
  tileGap: '8px',           // Gap between tiles in tray
  slotGap: '8px',           // Gap between slots (61px - 53px)
  screenPadding: '43px',    // Horizontal screen padding
} as const;
```

### Border Radius System

```typescript
export const borderRadius = {
  tile: '4px',              // Tile corner radius
  slot: '4px',              // Slot corner radius
  button: '8px',            // Button corner radius
  modal: '16px',            // Modal corner radius
} as const;
```

### Elevation / Shadows

```typescript
export const shadows = {
  // M3/Elevation Light/2 (from Figma)
  tile: {
    default: '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)',
    dragging: '0px 8px 16px 4px rgba(0, 0, 0, 0.2), 0px 4px 8px 0px rgba(0, 0, 0, 0.3)',
  },
} as const;
```

### Tile Styling Rules

| State | Size | Shadow | Border | Scale |
|-------|------|--------|--------|-------|
| Default (tray) | 53×53px | `tile.default` | 1px #DEBB96 | 1.0 |
| Dragging | 53×53px | `tile.dragging` | 1px #DEBB96 | 1.1 |
| In slot | 53×53px | `tile.default` | 1px #DEBB96 | 1.0 |
| Success | 53×53px | `tile.default` | 2px #F8BD04 | 1.05→1.0 |

### Slot Styling Rules

| State | Border Style | Border Color | Background |
|-------|--------------|--------------|------------|
| Empty | 1px dashed (3,1) | #B2B2B2 | transparent |
| Hover (drag over) | 2px dashed (3,1) | #7A7A7A | #DCD6C3 |
| Filled | none (tile covers) | — | — |

### Button Styling Rules

| Button | Size | Fill | Text | Text Color |
|--------|------|------|------|------------|
| "PEEL!" (success) | 200×112px | #7B573D | Arial Narrow Bold 48px | #F8BD04 |
| "TRY AGAIN!" (error) | 265×112px | #FF0000 | Arial Narrow Bold 48px | #F5EFDC |

### Motion Principles

1. **Snappy pickups**: Fast response (150ms) to touch
2. **Bouncy drops**: Overshoot easing for playful feel
3. **Staggered resets**: Tiles return to tray with 50ms stagger
4. **Celebration bursts**: Success animations should feel rewarding
5. **No blocking animations**: User can always interact during transitions

---

## 9. Milestones / Build Plan

### Phase 1: Foundation
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind with Figma tokens
- [ ] Set up MCP Figma integration
- [ ] Export assets from Figma (logo, slot SVGs)
- [ ] Create token file from Figma styles

### Phase 2: Static UI
- [ ] Build `LandingScreen` from Figma frame
- [ ] Build `PuzzleScreen` layout (static)
- [ ] Build `Tile` component with correct styling
- [ ] Build `Slot` component with empty state
- [ ] Build `SlotRow` component
- [ ] Build `ClueText` component
- [ ] Build `TileTray` layout

### Phase 3: Data Layer
- [ ] Define puzzle JSON schema
- [ ] Create sample puzzles (3-5 for testing)
- [ ] Set up Zustand store
- [ ] Implement level progression logic
- [ ] Add LocalStorage persistence

### Phase 4: Interactions
- [ ] Implement tile drag with Framer Motion
- [ ] Add slot hover detection
- [ ] Implement drop-to-slot logic
- [ ] Add swap behavior for occupied slots
- [ ] Add return-to-tray animation
- [ ] Implement reset functionality

### Phase 5: Validation & Feedback
- [ ] Implement answer validation
- [ ] Add success state animations
- [ ] Add error shake animation
- [ ] Build `SuccessModal` component
- [ ] Add level transition flow

### Phase 6: Polish
- [ ] Add haptic feedback (iOS)
- [ ] Tune animation timing/easing
- [ ] Add optional sound effects
- [ ] Build `FinaleScreen`
- [ ] Add confetti/celebration effects
- [ ] Implement hint system (if enabled)

### Phase 7: QA & Deploy
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Test various screen sizes
- [ ] Performance optimization
- [ ] Deploy to Vercel
- [ ] Final puzzle content entry

---

## 10. Open Questions / Configurable Knobs

### Resolved Decisions

| Question | Decision |
|----------|----------|
| Number of levels | **6 puzzles** |
| Tray layout | **Scattered** (matching Figma) |
| Success/error states | **Confirmed** (Figma frames provided) |
| Tile size | **53×53px** (fixed, with slight scale on drag) |

### Deferred Decisions

| Question | Options | Default |
|----------|---------|---------|
| Hint system | Enabled / Disabled | Disabled |
| Sound effects | On / Off / Optional | Off |
| Progress persistence | LocalStorage / None | LocalStorage |
| Finale screen design | TBD | Need Figma frame |

### Content Questions

- [x] First puzzle: "MATCHA" (clue provided in Figma)
- [ ] Puzzles 2-6: Clues and answers TBD
- [ ] Finale screen copy

---

## Quick Start

```bash
# Clone and install
cd pajamagrams
npm create vite@latest . -- --template react-ts
npm install

# Add dependencies
npm install framer-motion zustand tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p

# Start development
npm run dev
```

---

## Figma MCP Commands Reference

```bash
# Fetch frame data
mcp__figma__get_figma_data(fileKey: "ye7XiHyMbTmwBDnO1K9lpQ", nodeId: "2161-408")

# Export images
mcp__figma__download_figma_images(
  fileKey: "ye7XiHyMbTmwBDnO1K9lpQ",
  nodes: [{ nodeId: "2165-425", fileName: "logo.svg" }],
  localPath: "/path/to/pajamagrams/public/assets"
)
```

---

*Document generated with MCP Figma integration. Design tokens extracted from Figma file `Daily Design` (ye7XiHyMbTmwBDnO1K9lpQ).*
