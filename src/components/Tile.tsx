import { useRef, useState } from 'react'
import { motion, PanInfo } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { colors, dimensions, borderRadius, shadows, typography } from '@/styles/tokens'

interface TileProps {
  id: string
  letter: string
  rotation?: number
  inSlot?: number | null
}

// Helper to find which slot a point is over
function findSlotAtPoint(x: number, y: number): number | null {
  const slots = document.querySelectorAll('[data-slot-index]')

  for (const slot of slots) {
    const rect = slot.getBoundingClientRect()
    const slotIndex = parseInt(slot.getAttribute('data-slot-index') || '-1', 10)

    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return slotIndex
    }
  }

  return null
}

// Helper to clamp position within viewport bounds with padding
function clampPosition(x: number, y: number, tileWidth: number, tileHeight: number): { x: number; y: number } {
  const padding = 10 // Keep tiles at least 10px from edge
  const minX = padding
  const minY = padding
  const maxX = window.innerWidth - tileWidth - padding
  const maxY = window.innerHeight - tileHeight - padding
  return {
    x: Math.max(minX, Math.min(x, maxX)),
    y: Math.max(minY, Math.min(y, maxY)),
  }
}

export default function Tile({ id, letter, rotation = 0, inSlot }: TileProps) {
  const { placeTileInSlot, returnTileToTray, updateTilePosition, setHoveredSlot, puzzleState } = useGameStore()
  const tileRef = useRef<HTMLDivElement>(null)
  const lastHoveredSlotRef = useRef<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => {
    // Get the pointer position directly from the event
    let pointerX: number
    let pointerY: number

    if ('touches' in event && event.touches.length > 0) {
      pointerX = event.touches[0].clientX
      pointerY = event.touches[0].clientY
    } else if ('clientX' in event) {
      pointerX = event.clientX
      pointerY = event.clientY
    } else {
      return
    }

    const hoveredSlot = findSlotAtPoint(pointerX, pointerY)

    // Only update state if hovered slot changed
    if (hoveredSlot !== lastHoveredSlotRef.current) {
      lastHoveredSlotRef.current = hoveredSlot
      setHoveredSlot(hoveredSlot)
    }
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => {
    // Get the pointer position directly from the event
    let pointerX: number
    let pointerY: number

    if ('changedTouches' in event && event.changedTouches.length > 0) {
      pointerX = event.changedTouches[0].clientX
      pointerY = event.changedTouches[0].clientY
    } else if ('clientX' in event) {
      pointerX = event.clientX
      pointerY = event.clientY
    } else {
      // Fallback - clear hover and return to tray
      lastHoveredSlotRef.current = null
      setHoveredSlot(null)
      if (inSlot !== null && inSlot !== undefined) {
        returnTileToTray(id)
      }
      return
    }

    // Clear hover state
    lastHoveredSlotRef.current = null
    setHoveredSlot(null)

    const targetSlotIndex = findSlotAtPoint(pointerX, pointerY)
    const tileWidth = dimensions.tile.width
    const tileHeight = dimensions.tile.height

    if (targetSlotIndex !== null) {
      placeTileInSlot(id, targetSlotIndex)
    } else {
      // Use pointer position - center tile on where finger/cursor was released
      const newPosition = clampPosition(
        pointerX - tileWidth / 2,
        pointerY - tileHeight / 2,
        tileWidth,
        tileHeight
      )

      if (inSlot !== null && inSlot !== undefined) {
        returnTileToTray(id, newPosition)
      } else {
        updateTilePosition(id, newPosition)
      }
    }
  }

  // Disable drag in success/error states
  const isDraggable = puzzleState !== 'success' && puzzleState !== 'error'

  // Tiles in slots should have 0 rotation
  const currentRotation = inSlot !== null && inSlot !== undefined ? 0 : rotation

  const handleDragStart = () => {
    setIsDragging(true)
  }

  return (
    <motion.div
      ref={tileRef}
      drag={isDraggable}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={(event, info) => {
        setIsDragging(false)
        handleDragEnd(event, info)
      }}
      initial={false}
      animate={{
        rotate: isDragging ? 0 : currentRotation,
        scale: isDragging ? 1.1 : 1,
      }}
      transition={{
        rotate: { type: 'spring', stiffness: 300, damping: 25 },
        scale: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      whileDrag={{
        boxShadow: shadows.tile.dragging,
      }}
      style={{
        position: 'relative',
        zIndex: isDragging ? 9999 : 10,
        width: dimensions.tile.width,
        height: dimensions.tile.height,
        backgroundColor: colors.tile.fill,
        border: `1px solid ${colors.tile.border}`,
        borderRadius: borderRadius.tile,
        boxShadow: shadows.tile.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDraggable ? 'grab' : 'default',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <span
        style={{
          fontFamily: typography.tileLetter.fontFamily,
          fontWeight: typography.tileLetter.fontWeight,
          fontSize: typography.tileLetter.fontSize,
          lineHeight: typography.tileLetter.lineHeight,
          letterSpacing: typography.tileLetter.letterSpacing,
          color: colors.text.primary,
        }}
      >
        {letter}
      </span>
    </motion.div>
  )
}
