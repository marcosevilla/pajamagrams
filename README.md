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
11. [Feature: Banana/Gift Reveal System](#11-feature-bananagift-reveal-system)

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
│   Landing   │ ──▶ │   Bananas   │ ──▶ │   Puzzle    │ ──▶ │   Success   │
│   Screen    │     │   Screen    │     │   Level N   │     │    State    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                    │
   Tap to             Tap banana          Drag tiles          Tap "PEEL!"
    Start             to start            to solve
                          │                                       │
                          ▼                                       ▼
                    ┌─────────────┐                         ┌─────────────┐
                    │    Fade     │◀────────────────────────│   Return    │
                    │ Banana→Gift │                         │ to Bananas  │
                    └─────────────┘                         └─────────────┘
                          │
                          ▼ (after all 6)
                    ┌─────────────┐
                    │   Finale    │
                    │   Screen    │
                    └─────────────┘
```

### Screen States (mapped to Figma frames)

| State | Description | Figma Reference |
|-------|-------------|-----------------|
| `landing` | Title screen with logo, tap to begin | Node `2161:408` |
| `bananas` | 6 banana images, tap next to solve puzzle | Node `3-1329` |
| `puzzle.initial` | Clue visible, tiles scattered below, slots empty | Node `2161:410` |
| `puzzle.dragging` | Tile elevated, slot highlights on hover | Node `2169:507` |
| `puzzle.partial` | Some slots filled, puzzle incomplete | (Derived state) |
| `puzzle.complete` | All slots filled, pending validation | (Derived state) |
| `puzzle.error` | Wrong answer, "TRY AGAIN!" button, cream background | Node `2169:602` |
| `puzzle.success` | Correct answer, yellow background, "PEEL!" button | Node `2169:538` |
| `finale` | All 6 gifts revealed, birthday message, confetti | Custom |

### Navigation Logic

```typescript
type Screen = 'landing' | 'bananas' | 'puzzle' | 'finale';

type PuzzleState = 'initial' | 'success' | 'error';

interface GameState {
  currentScreen: Screen;
  currentLevelIndex: number;
  completedPuzzles: number;      // 0-6 tracking how many puzzles solved
  justCompletedPuzzle: boolean;  // Flag for fade animation trigger
  puzzleState: PuzzleState;
}
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

### All 6 Puzzles

| # | Answer | Clue | Orientation |
|---|--------|------|-------------|
| 1 | **MATCHA** | "An addictive powdery substance derived from a plant. Side effects include increased alertness and an elevated heart rate." | horizontal |
| 2 | **SMISKIS** | "Glow in the dark" | vertical |
| 3 | **HARDTHINGS** | "We can do ______!" | vertical |
| 4 | **SUNSETGYM** | "Your almost daily stroll." | vertical |
| 5 | **BASQUE** | "A place in between France and Spain" | horizontal |
| 6 | **REGAL** | "We come to this place for magic" | horizontal |

### Example Puzzle Data

```json
{
  "puzzles": [
    {
      "id": "puzzle-001",
      "clue": "An addictive powdery substance derived from a plant. Side effects include increased alertness and an elevated heart rate.",
      "answer": "MATCHA"
    },
    {
      "id": "puzzle-002",
      "clue": "Glow in the dark",
      "answer": "SMISKIS",
      "layout": { "orientation": "vertical" }
    },
    {
      "id": "puzzle-003",
      "clue": "We can do ______!",
      "answer": "HARDTHINGS",
      "layout": { "orientation": "vertical" }
    },
    {
      "id": "puzzle-004",
      "clue": "Your almost daily stroll.",
      "answer": "SUNSETGYM",
      "layout": { "orientation": "vertical" }
    },
    {
      "id": "puzzle-005",
      "clue": "A place in between France and Spain",
      "answer": "BASQUE"
    },
    {
      "id": "puzzle-006",
      "clue": "We come to this place for magic",
      "answer": "REGAL"
    }
  ]
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
  currentScreen: 'landing' | 'bananas' | 'puzzle' | 'finale';
  currentLevelIndex: number;
  completedPuzzles: number;        // 0-6 tracking progress
  justCompletedPuzzle: boolean;    // Triggers fade animation on BananaScreen

  // Puzzle state
  puzzleState: 'initial' | 'success' | 'error';
  slots: (string | null)[];        // Current slot contents (tile IDs)
  tiles: TileState[];              // All tiles with positions

  // Actions
  startGame: () => void;
  goToPuzzle: (levelIndex: number) => void;
  placeTileInSlot: (tileId: string, slotIndex: number) => void;
  removeTileFromSlot: (slotIndex: number, position: Position) => void;
  updateTilePosition: (tileId: string, position: Position) => void;
  completePuzzle: () => void;      // Mark puzzle done, return to bananas
  resetPuzzle: () => void;         // Reset tiles for retry
  clearJustCompleted: () => void;  // Clear animation flag
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
├── index.html
│
├── /public
│   └── /assets
│       ├── logo.svg              # Pajamagrams logo from Figma
│       ├── Banana Pancakes.mp3   # Background music
│       │
│       ├── /bananas              # Banana images (6 PNG files)
│       │   ├── banana1.png
│       │   ├── banana2.png
│       │   ├── banana3.png
│       │   ├── banana4.png
│       │   ├── banana5.png
│       │   └── banana6.png
│       │
│       └── /gifts                # Gift images revealed after puzzles
│           ├── gift1.png
│           ├── gift2.png
│           ├── gift3.png
│           ├── gift4.png
│           ├── gift5.png
│           └── gift6.png
│
├── /src
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Root component with slide transitions
│   │
│   ├── /components               # UI components
│   │   ├── Logo.tsx              # PAJAMAGRAMS logo from Figma
│   │   ├── Tile.tsx              # Draggable letter tile
│   │   ├── Slot.tsx              # Drop target slot
│   │   ├── SlotRow.tsx           # Row/column of slots (supports vertical)
│   │   ├── ScatteredTiles.tsx    # Scattered draggable tiles area
│   │   ├── ClueText.tsx          # Clue/riddle display
│   │   └── ActionButton.tsx      # "PEEL!" and "TRY AGAIN!" buttons
│   │
│   ├── /screens
│   │   ├── LandingScreen.tsx     # Title screen, tap to start
│   │   ├── BananaScreen.tsx      # 6 bananas/gifts with fade animation
│   │   ├── PuzzleScreen.tsx      # Clue + slots + tiles puzzle
│   │   └── FinaleScreen.tsx      # All gifts + confetti + birthday msg
│   │
│   ├── /data
│   │   └── puzzles.json          # All 6 puzzle definitions
│   │
│   ├── /styles
│   │   ├── tokens.ts             # Design tokens from Figma
│   │   └── globals.css           # Base styles
│   │
│   ├── /store
│   │   └── gameStore.ts          # Zustand game state
│   │
│   └── /utils
│       └── tileLayout.ts         # Tile scatter layout generation
│
└── /figma
    └── tokens.json               # Raw Figma token export
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

### Phase 1: Foundation ✅
- [x] Initialize Vite + React + TypeScript project
- [x] Configure with Figma tokens
- [x] Set up MCP Figma integration
- [x] Export assets from Figma (logo, slot SVGs)
- [x] Create token file from Figma styles

### Phase 2: Static UI ✅
- [x] Build `LandingScreen` from Figma frame
- [x] Build `PuzzleScreen` layout
- [x] Build `Tile` component with correct styling
- [x] Build `Slot` component with empty/hover states
- [x] Build `SlotRow` component (horizontal + vertical)
- [x] Build `ClueText` component
- [x] Build `ScatteredTiles` area

### Phase 3: Data Layer ✅
- [x] Define puzzle JSON schema
- [x] Create all 6 puzzles with clues
- [x] Set up Zustand store
- [x] Implement level progression logic

### Phase 4: Interactions ✅
- [x] Implement tile drag with Framer Motion
- [x] Add slot hover detection
- [x] Implement drop-to-slot logic
- [x] Add swap behavior for occupied slots
- [x] Fix tile positioning (clamp to screen bounds)
- [x] Fix z-index layering (tiles always above slots)

### Phase 5: Validation & Feedback ✅
- [x] Implement answer validation
- [x] Add success state (yellow background)
- [x] Add error state (cream background)
- [x] Build `ActionButton` component ("PEEL!" / "TRY AGAIN!")
- [x] Add level transition flow

### Phase 6: Banana/Gift System ✅
- [x] Build `BananaScreen` with 6 positioned images
- [x] Implement banana→gift fade animation on puzzle complete
- [x] Track completed puzzles (0-6)
- [x] Only allow tapping next available banana
- [x] Dim incomplete bananas (60% opacity)
- [x] Build `FinaleScreen` with all gifts revealed
- [x] Add confetti celebration animation
- [x] Add birthday message ("Happy 29th Birthday!!! Love, Marco")

### Phase 7: Polish ✅
- [x] Add background music (Banana Pancakes)
- [x] Tune animation timing/easing
- [x] Add slide transitions between screens

### Phase 8: QA & Deploy
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Test various screen sizes
- [ ] Performance optimization
- [ ] Deploy to Vercel

---

## 10. Open Questions / Configurable Knobs

### Resolved Decisions

| Question | Decision |
|----------|----------|
| Number of levels | **6 puzzles** (MATCHA, SMISKIS, HARDTHINGS, SUNSETGYM, BASQUE, REGAL) |
| Tray layout | **Scattered** (matching Figma) |
| Success/error states | **Confirmed** (Figma frames provided) |
| Tile size | **53×53px** (fixed, with slight scale on drag) |
| Puzzle orientations | **Mixed** - 3 horizontal, 3 vertical |
| Finale screen | **Gifts + birthday message + confetti** |
| Background music | **"Banana Pancakes"** by Jack Johnson |
| Screen transitions | **Slide left/right** based on flow direction |

### Deferred Decisions

| Question | Options | Default |
|----------|---------|---------|
| Hint system | Enabled / Disabled | **Disabled** |
| Sound effects | On / Off / Optional | **Background music only** |
| Progress persistence | LocalStorage / None | **Not implemented** |

### Content - All Complete ✅

- [x] Puzzle 1: "MATCHA" - An addictive powdery substance...
- [x] Puzzle 2: "SMISKIS" - Glow in the dark
- [x] Puzzle 3: "HARDTHINGS" - We can do ______!
- [x] Puzzle 4: "SUNSETGYM" - Your almost daily stroll.
- [x] Puzzle 5: "BASQUE" - A place in between France and Spain
- [x] Puzzle 6: "REGAL" - We come to this place for magic
- [x] Finale screen: "Happy 29th Birthday!!! Love, Marco"

---

## 11. Feature: Banana/Gift Reveal System

### Overview

The game uses a banana/gift reveal mechanic where each solved puzzle "unpeels" a banana to reveal a gift underneath. This creates a visual progression toward the birthday celebration finale.

### BananaScreen

The BananaScreen displays 6 banana images at fixed positions (from Figma design). Each banana corresponds to a puzzle:

```typescript
const imageSlots = [
  { id: 1, x: 183, y: 208, width: 197, height: 197 },
  { id: 2, x: 216, y: 629, width: 186, height: 179 },
  { id: 3, x: 52, y: 208, width: 134, height: 213 },
  { id: 4, x: 192, y: 427, width: 196, height: 172 },
  { id: 5, x: 28, y: 406, width: 200, height: 216 },
  { id: 6, x: 40, y: 664, width: 130, height: 88 },
]
```

**Interaction Rules:**
- Only the **next unfinished banana** is tappable (100% opacity)
- Future bananas are dimmed (60% opacity) and non-interactive
- Completed puzzles show **gift images** instead of bananas
- Title displays "Unpeel all 6 bananas"

### Fade Animation

When returning from a completed puzzle:

1. `justCompletedPuzzle` flag is set to `true`
2. BananaScreen detects this flag and triggers fade animation
3. Animation sequence:
   - Banana fades out (opacity 1→0, 500ms)
   - Gift fades in (opacity 0→1, 500ms, 300ms delay)
4. After animation, flag is cleared via `clearJustCompleted()`

```typescript
// Fade animation timing
<motion.img
  key={`banana-fade-${index}`}
  initial={{ opacity: 1 }}
  animate={{ opacity: 0 }}
  transition={{ duration: 0.5 }}
/>
<motion.img
  key={`gift-fade-${index}`}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5, delay: 0.3 }}
/>
```

### FinaleScreen

After all 6 puzzles are completed:

- Screen transitions to FinaleScreen
- All 6 gift images displayed at same positions
- Birthday message: "Happy 29th Birthday!!! Love, Marco"
- Confetti animation with 100 pieces falling from top
- Confetti colors: yellow, red, teal, blue, green, lavender, pink

### Screen Transitions

Screens transition with slide animations using Framer Motion:

```typescript
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 1,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 1,
  }),
}
```

Direction is determined by comparing screen indices:
- `landing (0) → bananas (1)`: slide left
- `bananas (1) → puzzle (2)`: slide left
- `puzzle (2) → bananas (1)`: slide right (after completing puzzle)
- `bananas (1) → finale (3)`: slide left (after all 6 complete)

---

## Quick Start

```bash
# Install dependencies
cd pajamagrams
npm install

# Start development server
npm run dev
# Opens at http://localhost:5173

# Build for production
npm run build
```

### Key Dependencies
- **React 19** + TypeScript
- **Vite** - Fast dev server with HMR
- **Framer Motion** - Drag/drop and animations
- **Zustand** - Lightweight state management

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

*Last updated: Added Banana/Gift reveal system, all 6 puzzles, FinaleScreen with confetti, and screen transition animations.*
