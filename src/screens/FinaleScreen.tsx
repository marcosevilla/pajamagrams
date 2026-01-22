import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { colors, typography } from '@/styles/tokens'

// Image positions - uniform 160x160 grid layout
const imageSlots = [
  { id: 1, x: 40, y: 200, width: 160, height: 160 },   // top left
  { id: 2, x: 215, y: 200, width: 160, height: 160 },  // top right
  { id: 3, x: 40, y: 400, width: 160, height: 160 },   // middle left
  { id: 4, x: 215, y: 400, width: 160, height: 160 },  // middle right
  { id: 5, x: 40, y: 600, width: 160, height: 160 },   // bottom left
  { id: 6, x: 215, y: 600, width: 160, height: 160 },  // bottom right
]

// Gift images
const giftImages = [
  '/assets/gifts/gift1.png',
  '/assets/gifts/gift2.png',
  '/assets/gifts/gift3.png',
  '/assets/gifts/gift4.png',
  '/assets/gifts/gift5.png',
  '/assets/gifts/gift6.png',
]

// Confetti piece component
function ConfettiPiece({ delay, x }: { delay: number; x: number }) {
  const colors = ['#F8BD04', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
  const color = colors[Math.floor(Math.random() * colors.length)]
  const size = 8 + Math.random() * 8
  const duration = 3 + Math.random() * 2

  return (
    <motion.div
      initial={{
        x: x,
        y: -20,
        rotate: 0,
        opacity: 1,
      }}
      animate={{
        y: 1000,
        rotate: 360 + Math.random() * 360,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: 'linear',
      }}
      style={{
        position: 'absolute',
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        borderRadius: 2,
      }}
    />
  )
}

export default function FinaleScreen() {
  const [confetti, setConfetti] = useState<{ id: number; delay: number; x: number }[]>([])

  // Generate confetti on mount
  useEffect(() => {
    const pieces: { id: number; delay: number; x: number }[] = []
    for (let i = 0; i < 100; i++) {
      pieces.push({
        id: i,
        delay: Math.random() * 2,
        x: Math.random() * 430,
      })
    }
    setConfetti(pieces)
  }, [])

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
      {/* Confetti layer */}
      <div
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
        {confetti.map((piece) => (
          <ConfettiPiece key={piece.id} delay={piece.delay} x={piece.x} />
        ))}
      </div>

      {/* Birthday message */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{
          position: 'absolute',
          top: 100,
          left: 43,
          width: 343,
          textAlign: 'center',
          fontFamily: typography.clue.fontFamily,
          fontWeight: typography.clue.fontWeight,
          fontSize: '24px',
          lineHeight: 1.3,
          letterSpacing: typography.clue.letterSpacing,
          color: colors.text.dark,
        }}
      >
        Happy 29th Birthday!!!
        <br />
        Love, Marco
      </motion.div>

      {/* All gift images */}
      {imageSlots.map((slot, index) => (
        <motion.div
          key={slot.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          style={{
            position: 'absolute',
            left: slot.x,
            top: slot.y,
            width: slot.width,
            height: slot.height,
          }}
        >
          <img
            src={giftImages[index]}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}
