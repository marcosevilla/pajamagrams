import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { colors, typography } from '@/styles/tokens'

// Image positions from Figma (default state node 3-1329)
const imageSlots = [
  { id: 1, x: 183, y: 208, width: 197, height: 197 },
  { id: 2, x: 216, y: 629, width: 186, height: 179 },
  { id: 3, x: 52, y: 208, width: 134, height: 213 },
  { id: 4, x: 192, y: 427, width: 196, height: 172 },
  { id: 5, x: 28, y: 406, width: 200, height: 216 },
  { id: 6, x: 40, y: 664, width: 130, height: 88 },
]

// Banana images (all PNG)
const bananaImages = [
  '/assets/bananas/banana1.png',
  '/assets/bananas/banana2.png',
  '/assets/bananas/banana3.png',
  '/assets/bananas/banana4.png',
  '/assets/bananas/banana5.png',
  '/assets/bananas/banana6.png',
]

// Gift images (all PNG)
const giftImages = [
  '/assets/gifts/gift1.png',
  '/assets/gifts/gift2.png',
  '/assets/gifts/gift3.png',
  '/assets/gifts/gift4.png',
  '/assets/gifts/gift5.png',
  '/assets/gifts/gift6.png',
]

export default function BananaScreen() {
  const { completedPuzzles, justCompletedPuzzle, goToPuzzle, clearJustCompleted } = useGameStore()
  const [showingFade, setShowingFade] = useState(false)
  const [fadeIndex, setFadeIndex] = useState<number | null>(null)

  // Handle fade animation when returning from completed puzzle
  useEffect(() => {
    if (justCompletedPuzzle && completedPuzzles > 0) {
      // The puzzle that was just completed is completedPuzzles - 1 (0-indexed)
      const justCompletedIndex = completedPuzzles - 1
      setFadeIndex(justCompletedIndex)
      setShowingFade(true)

      // After animation completes, clear the flag
      const timer = setTimeout(() => {
        setShowingFade(false)
        setFadeIndex(null)
        clearJustCompleted()
      }, 1000) // Animation duration

      return () => clearTimeout(timer)
    }
  }, [justCompletedPuzzle, completedPuzzles, clearJustCompleted])

  const handleBananaClick = (index: number) => {
    // Only the next banana (completedPuzzles index) is clickable
    if (index === completedPuzzles) {
      goToPuzzle(index)
    }
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: colors.background.puzzle,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Title text */}
      <div
        style={{
          position: 'absolute',
          top: 123,
          left: 43,
          width: 343,
          textAlign: 'center',
          fontFamily: typography.clue.fontFamily,
          fontWeight: typography.clue.fontWeight,
          fontSize: typography.clue.fontSize,
          lineHeight: typography.clue.lineHeight,
          letterSpacing: typography.clue.letterSpacing,
          color: colors.text.dark,
        }}
      >
        Unpeel all 6 bananas
      </div>

      {/* Banana/Gift images */}
      {imageSlots.map((slot, index) => {
        const isCompleted = index < completedPuzzles
        const isNext = index === completedPuzzles
        const isFading = showingFade && fadeIndex === index

        // Determine opacity for bananas
        let bananaOpacity = 0.6 // Future bananas
        if (isNext) bananaOpacity = 1 // Next banana (active)

        return (
          <div
            key={slot.id}
            style={{
              position: 'absolute',
              left: slot.x,
              top: slot.y,
              width: slot.width,
              height: slot.height,
              cursor: isNext ? 'pointer' : 'default',
            }}
            onClick={() => handleBananaClick(index)}
          >
            {isFading ? (
              // Fading animation: banana out, gift in
              <>
                <motion.img
                  src={bananaImages[index]}
                  alt=""
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
                <motion.img
                  src={giftImages[index]}
                  alt=""
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </>
            ) : isCompleted ? (
              // Show gift (completed puzzles)
              <img
                src={giftImages[index]}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              // Show banana (not yet completed)
              <img
                src={bananaImages[index]}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  opacity: bananaOpacity,
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
