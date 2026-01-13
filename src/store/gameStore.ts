import { create } from 'zustand'
import puzzles from '@/data/puzzles.json'

export type PuzzleState = 'initial' | 'playing' | 'error' | 'success'
export type Screen = 'landing' | 'puzzle' | 'finale'

export interface TileData {
  id: string
  letter: string
  position: { x: number; y: number }
  rotation: number // rotation angle in degrees
  inSlot: number | null // null = in tray, number = slot index
}

interface GameStore {
  // Navigation
  currentScreen: Screen
  currentLevelIndex: number

  // Puzzle state
  puzzleState: PuzzleState
  tiles: TileData[]
  slots: (string | null)[] // tile id or null
  hoveredSlotIndex: number | null // which slot is being hovered during drag

  // Actions
  startGame: () => void
  initializePuzzle: (levelIndex: number) => void
  placeTileInSlot: (tileId: string, slotIndex: number) => void
  returnTileToTray: (tileId: string) => void
  setHoveredSlot: (index: number | null) => void
  validateAnswer: () => boolean
  nextLevel: () => void
  resetPuzzle: () => void

  // Helpers
  getCurrentPuzzle: () => typeof puzzles.puzzles[0] | null
}

// Generate scattered positions for tiles with natural rotations
// Positions are relative to viewport, adjusted for mobile layouts
function generateScatteredPositions(count: number): { x: number; y: number; rotation: number }[] {
  const positions: { x: number; y: number; rotation: number }[] = []

  // Predefined natural-looking positions (adjusted for smaller layout)
  // Tiles scattered in the lower portion of the screen
  const presetPositions = [
    { x: 101, y: 420, rotation: 0 },
    { x: 148, y: 455, rotation: 5 },
    { x: 190, y: 440, rotation: -18 },
    { x: 280, y: 500, rotation: 22 },
    { x: 165, y: 520, rotation: -30 },
    { x: 111, y: 550, rotation: 15 },
    { x: 250, y: 580, rotation: -12 },
    { x: 80, y: 500, rotation: 8 },
  ]

  for (let i = 0; i < count; i++) {
    if (i < presetPositions.length) {
      // Use preset positions for first tiles
      positions.push(presetPositions[i])
    } else {
      // Generate random positions for additional tiles
      positions.push({
        x: 80 + Math.random() * 250,
        y: 420 + Math.random() * 180,
        rotation: (Math.random() - 0.5) * 50,
      })
    }
  }

  // Shuffle positions so tiles don't always appear in the same spots
  return positions.sort(() => Math.random() - 0.5)
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  currentScreen: 'landing',
  currentLevelIndex: 0,
  puzzleState: 'initial',
  tiles: [],
  slots: [],
  hoveredSlotIndex: null,

  // Actions
  startGame: () => {
    set({ currentScreen: 'puzzle' })
    get().initializePuzzle(0)
  },

  initializePuzzle: (levelIndex: number) => {
    const puzzle = puzzles.puzzles[levelIndex]
    if (!puzzle) return

    const positions = generateScatteredPositions(puzzle.tiles.length)
    const tiles: TileData[] = puzzle.tiles.map((letter, i) => ({
      id: `tile-${i}`,
      letter,
      position: { x: positions[i].x, y: positions[i].y },
      rotation: positions[i].rotation,
      inSlot: null,
    }))

    set({
      currentLevelIndex: levelIndex,
      puzzleState: 'initial',
      tiles,
      slots: new Array(puzzle.answer.length).fill(null),
    })
  },

  placeTileInSlot: (tileId: string, slotIndex: number) => {
    const { tiles, slots } = get()

    // Check if slot already has a tile
    const existingTileId = slots[slotIndex]

    // Update tiles
    const newTiles = tiles.map((tile) => {
      if (tile.id === tileId) {
        // Place this tile in the slot
        return { ...tile, inSlot: slotIndex }
      }
      if (tile.id === existingTileId) {
        // Return existing tile to tray with new random position and rotation
        return {
          ...tile,
          inSlot: null,
          position: {
            x: 80 + Math.random() * 250,
            y: 420 + Math.random() * 180,
          },
          rotation: (Math.random() - 0.5) * 50,
        }
      }
      return tile
    })

    // Update slots
    const newSlots = [...slots]
    newSlots[slotIndex] = tileId

    // Check if all slots are filled
    const allFilled = newSlots.every((s) => s !== null)

    set({
      tiles: newTiles,
      slots: newSlots,
      puzzleState: allFilled ? 'playing' : 'playing',
    })

    // Auto-validate when all slots filled
    if (allFilled) {
      setTimeout(() => {
        get().validateAnswer()
      }, 300)
    }
  },

  returnTileToTray: (tileId: string) => {
    const { tiles, slots } = get()

    const tile = tiles.find((t) => t.id === tileId)
    if (!tile || tile.inSlot === null) return

    const slotIndex = tile.inSlot

    const newTiles = tiles.map((t) =>
      t.id === tileId
        ? {
            ...t,
            inSlot: null,
            position: {
              x: 80 + Math.random() * 250,
              y: 420 + Math.random() * 180,
            },
            rotation: (Math.random() - 0.5) * 50,
          }
        : t
    )

    const newSlots = [...slots]
    newSlots[slotIndex] = null

    set({
      tiles: newTiles,
      slots: newSlots,
      puzzleState: 'playing',
    })
  },

  setHoveredSlot: (index: number | null) => {
    set({ hoveredSlotIndex: index })
  },

  validateAnswer: () => {
    const { tiles, slots, currentLevelIndex } = get()
    const puzzle = puzzles.puzzles[currentLevelIndex]
    if (!puzzle) return false

    // Build answer from slots
    const answer = slots
      .map((tileId) => {
        const tile = tiles.find((t) => t.id === tileId)
        return tile?.letter || ''
      })
      .join('')

    const isCorrect = answer.toUpperCase() === puzzle.answer.toUpperCase()

    set({ puzzleState: isCorrect ? 'success' : 'error' })

    return isCorrect
  },

  nextLevel: () => {
    const { currentLevelIndex } = get()
    const nextIndex = currentLevelIndex + 1

    if (nextIndex >= puzzles.puzzles.length) {
      set({ currentScreen: 'finale' })
    } else {
      get().initializePuzzle(nextIndex)
    }
  },

  resetPuzzle: () => {
    const { currentLevelIndex } = get()
    get().initializePuzzle(currentLevelIndex)
  },

  getCurrentPuzzle: () => {
    const { currentLevelIndex } = get()
    return puzzles.puzzles[currentLevelIndex] || null
  },
}))
