import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import Tile from './Tile'

export default function ScatteredTiles() {
  const tiles = useGameStore((state) => state.tiles)

  // Only show tiles that are not in a slot
  const trayTiles = tiles.filter((tile) => tile.inSlot === null)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {trayTiles.map((tile) => (
        <div
          key={`${tile.id}-${tile.position.x}-${tile.position.y}`}
          style={{
            position: 'absolute',
            left: tile.position.x,
            top: tile.position.y,
            pointerEvents: 'auto',
          }}
        >
          <Tile
            id={tile.id}
            letter={tile.letter}
            rotation={tile.rotation}
          />
        </div>
      ))}
    </motion.div>
  )
}
