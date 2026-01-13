import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { colors } from '@/styles/tokens'
import ClueText from '@/components/ClueText'
import SlotRow from '@/components/SlotRow'
import ScatteredTiles from '@/components/ScatteredTiles'
import ActionButton from '@/components/ActionButton'

export default function PuzzleScreen() {
  const { puzzleState, getCurrentPuzzle, nextLevel, resetPuzzle } = useGameStore()
  const puzzle = getCurrentPuzzle()

  const backgroundColor = useMemo(() => {
    switch (puzzleState) {
      case 'success':
        return colors.background.success
      case 'error':
        return colors.background.error
      default:
        return colors.background.puzzle
    }
  }, [puzzleState])

  if (!puzzle) return null

  return (
    <motion.div
      className="puzzle-screen"
      animate={{ backgroundColor }}
      transition={{ duration: 0.3 }}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Clue */}
      <ClueText
        text={puzzle.clue}
        darkMode={puzzleState === 'success' || puzzleState === 'error'}
      />

      {/* Slot row */}
      <SlotRow answerLength={puzzle.answer.length} />

      {/* Scattered tiles (hidden when success/error) */}
      <AnimatePresence>
        {puzzleState !== 'success' && puzzleState !== 'error' && (
          <ScatteredTiles />
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <AnimatePresence>
        {puzzleState === 'success' && (
          <ActionButton type="success" onClick={nextLevel} />
        )}
        {puzzleState === 'error' && (
          <ActionButton type="error" onClick={resetPuzzle} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
