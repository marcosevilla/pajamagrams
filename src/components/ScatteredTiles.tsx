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
      }}
    >
      {trayTiles.map((tile) => (
        <motion.div
          key={tile.id}
          initial={{
            x: tile.position.x,
            y: tile.position.y,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            x: tile.position.x,
            y: tile.position.y,
            scale: 1,
            opacity: 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
          style={{
            position: 'absolute',
            pointerEvents: 'auto',
          }}
        >
          <Tile
            id={tile.id}
            letter={tile.letter}
            rotation={tile.rotation}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
