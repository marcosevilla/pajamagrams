import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { colors } from '@/styles/tokens'

interface LandingScreenProps {
  onStart?: () => void
}

export default function LandingScreen({ onStart }: LandingScreenProps) {
  const startGame = useGameStore((state) => state.startGame)

  const handleClick = () => {
    onStart?.()
    startGame()
  }

  return (
    <motion.div
      className="landing-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: colors.background.landing,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: 10,
      }}
    >
      {/* Logo from Figma - scales responsively */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
        style={{
          width: 'min(314px, 80vw)',
          aspectRatio: '314 / 168',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Banana character with brown oval background */}
        <img
          src="/assets/banana-character.png"
          alt=""
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        {/* PAJAMAGRAMS text - centered over the brown oval */}
        <h1
          style={{
            fontFamily: '"Arial Narrow", Arial, sans-serif',
            fontWeight: 700,
            fontSize: 'min(38px, 10vw)',
            lineHeight: 1.15,
            letterSpacing: '-0.04em',
            textAlign: 'center',
            color: colors.yellow.DEFAULT,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            margin: 0,
          }}
        >
          PAJAMAGRAMS
        </h1>
      </motion.div>

      {/* Tap to start hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        style={{
          position: 'absolute',
          bottom: '80px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '16px',
          color: colors.text.secondary,
          opacity: 0.7,
        }}
      >
        Tap anywhere to start
      </motion.p>
    </motion.div>
  )
}
