import { motion } from 'framer-motion'
import { typography, colors } from '@/styles/tokens'

interface ActionButtonProps {
  type: 'success' | 'error'
  onClick: () => void
  buttonSize?: { width: number; height: number }
}

// Custom easing that creates a stepped/choppy effect
const steppedEase = [0.3, 0, 0.2, 1] // Quick start, pause, quick end

// Default button dimensions
const DEFAULT_SUCCESS_SIZE = { width: 200, height: 112 }
const DEFAULT_ERROR_SIZE = { width: 265, height: 112 }

export default function ActionButton({ type, onClick, buttonSize }: ActionButtonProps) {
  const isSuccess = type === 'success'

  // Use custom size or default based on type
  const defaultSize = isSuccess ? DEFAULT_SUCCESS_SIZE : DEFAULT_ERROR_SIZE
  const { width: buttonWidth, height: buttonHeight } = buttonSize || defaultSize

  // Calculate scale factor for text sizing (based on width ratio to default)
  const scaleFactor = buttonWidth / defaultSize.width

  // Text positioning scales with button size
  const textLeft = (isSuccess ? 46.15 : 30) * scaleFactor
  const textTop = 29.37 * scaleFactor
  const textWidth = (isSuccess ? 108 : 207) * scaleFactor
  const textHeight = 55 * scaleFactor
  const fontSize = 47.5 * scaleFactor

  const buttonImage = isSuccess ? '/assets/button-peel.png' : '/assets/button-try-again.png'
  const buttonText = isSuccess ? 'PEEL!' : 'TRY AGAIN!'
  const textColor = isSuccess ? colors.yellow.DEFAULT : colors.background.error

  return (
    <motion.button
      initial={{ x: 350 }}
      animate={{ x: 0 }}
      exit={{ x: 350 }}
      transition={{
        duration: 0.6,
        delay: 0.4,
        ease: steppedEase,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        position: 'absolute',
        bottom: 'min(200px, 20vh)',
        left: `calc(50% - ${buttonWidth / 2}px)`,
        width: buttonWidth,
        height: buttonHeight,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      {/* Button image from Figma */}
      <img
        src={buttonImage}
        alt=""
        style={{
          width: buttonWidth,
          height: buttonHeight,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      {/* Button text */}
      <span
        style={{
          position: 'absolute',
          top: textTop,
          left: textLeft,
          width: textWidth,
          height: textHeight,
          fontFamily: typography.button.fontFamily,
          fontWeight: typography.button.fontWeight,
          fontSize: `${fontSize}px`,
          lineHeight: 1.15,
          letterSpacing: '-0.04em',
          color: textColor,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {buttonText}
      </span>
    </motion.button>
  )
}
