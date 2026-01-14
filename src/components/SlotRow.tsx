import { useRef, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import Slot from './Slot'
import Tile from './Tile'
import { spacing } from '@/styles/tokens'

interface SlotRowProps {
  answerLength: number
  marginTop?: number
  orientation?: 'horizontal' | 'vertical'
}

export default function SlotRow({ answerLength, marginTop = 60, orientation = 'horizontal' }: SlotRowProps) {
  const { slots, tiles, hoveredSlotIndex } = useGameStore()
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])

  const setSlotRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    slotRefs.current[index] = el
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        alignItems: 'center',
        gap: spacing.slotGap,
        marginTop: `min(${marginTop}px, 10vh)`,
        position: 'relative',
        zIndex: 1,
      }}
    >
      {Array.from({ length: answerLength }).map((_, index) => {
        const tileId = slots[index]
        const tile = tileId ? tiles.find((t) => t.id === tileId) : null
        const isHovered = hoveredSlotIndex === index

        return (
          <div
            key={index}
            data-slot-index={index}
            style={{ position: 'relative' }}
          >
            {/* Slot is always visible - positioned behind tile */}
            <Slot ref={setSlotRef(index)} isHovered={isHovered} />

            {/* Tile sits on top of slot when placed */}
            {tile && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              >
                <Tile
                  id={tile.id}
                  letter={tile.letter}
                  rotation={tile.rotation}
                  inSlot={index}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
