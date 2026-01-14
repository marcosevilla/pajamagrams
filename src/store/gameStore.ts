import { create } from 'zustand'
import puzzles from '@/data/puzzles.json'

export type PuzzleState = 'initial' | 'playing' | 'error' | 'success'
export type Screen = 'landing' | 'bananas' | 'puzzle' | 'finale'

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
  completedPuzzles: number // 0-6, tracks how many puzzles are complete
  justCompletedPuzzle: boolean // true when returning from a completed puzzle (for fade animation)

  // Puzzle state
  puzzleState: PuzzleState
  tiles: TileData[]
  slots: (string | null)[] // tile id or null
  hoveredSlotIndex: number | null // which slot is being hovered during drag

  // Actions
  startGame: () => void
  goToPuzzle: (levelIndex: number) => void
  initializePuzzle: (levelIndex: number) => void
  placeTileInSlot: (tileId: string, slotIndex: number) => void
  returnTileToTray: (tileId: string, dropPosition?: { x: number; y: number }) => void
  updateTilePosition: (tileId: string, position: { x: number; y: number }) => void
  setHoveredSlot: (index: number | null) => void
  validateAnswer: () => boolean
  completePuzzle: () => void // Called when PEEL is clicked after success
  resetPuzzle: () => void
  clearJustCompleted: () => void // Called after fade animation completes

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
  completedPuzzles: 0,
  justCompletedPuzzle: false,
  puzzleState: 'initial',
  tiles: [],
  slots: [],
  hoveredSlotIndex: null,

  // Actions
  startGame: () => {
    set({ currentScreen: 'bananas' })
  },

  goToPuzzle: (levelIndex: number) => {
    set({ currentScreen: 'puzzle' })
    get().initializePuzzle(levelIndex)
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

    // Check if the tile being placed is already in a different slot
    const movingTile = tiles.find((t) => t.id === tileId)
    const previousSlotIndex = movingTile?.inSlot

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

    // Clear the previous slot if tile was already in one
    if (previousSlotIndex !== null && previousSlotIndex !== undefined) {
      newSlots[previousSlotIndex] = null
    }

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

  returnTileToTray: (tileId: string, dropPosition?: { x: number; y: number }) => {
    const { tiles, slots } = get()

    const tile = tiles.find((t) => t.id === tileId)
    if (!tile || tile.inSlot === null) return

    const slotIndex = tile.inSlot

    const newTiles = tiles.map((t) =>
      t.id === tileId
        ? {
            ...t,
            inSlot: null,
            position: dropPosition || {
              x: 80 + Math.random() * 250,
              y: 420 + Math.random() * 180,
            },
            rotation: (Math.random() - 0.5) * 30,
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

  updateTilePosition: (tileId: string, position: { x: number; y: number }) => {
    const { tiles } = get()

    const newTiles = tiles.map((t) =>
      t.id === tileId
        ? {
            ...t,
            position,
            rotation: (Math.random() - 0.5) * 30,
          }
        : t
    )

    set({ tiles: newTiles })
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

  completePuzzle: () => {
    const { completedPuzzles } = get()
    const newCompleted = completedPuzzles + 1
    const isFinale = newCompleted >= puzzles.puzzles.length

    set({
      completedPuzzles: newCompleted,
      justCompletedPuzzle: true,
      currentScreen: isFinale ? 'finale' : 'bananas',
    })
  },

  resetPuzzle: () => {
    const { currentLevelIndex } = get()
    get().initializePuzzle(currentLevelIndex)
  },

  clearJustCompleted: () => {
    set({ justCompletedPuzzle: false })
  },

  getCurrentPuzzle: () => {
    const { currentLevelIndex } = get()
    return puzzles.puzzles[currentLevelIndex] || null
  },
}))
