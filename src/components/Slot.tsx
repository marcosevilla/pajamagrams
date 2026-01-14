import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { dimensions, borderRadius, colors } from '@/styles/tokens'

interface SlotProps {
  isHovered?: boolean
}

const Slot = forwardRef<HTMLDivElement, SlotProps>(
  ({ isHovered = false }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={false}
        animate={{
          backgroundColor: isHovered ? colors.slot.hoverFill : 'transparent',
          borderColor: isHovered ? colors.slot.hoverBorder : colors.slot.border,
          borderWidth: isHovered ? 2 : 1,
        }}
        transition={{
          duration: 0.15,
          ease: 'easeOut',
        }}
        style={{
          width: dimensions.slot.width,
          height: dimensions.slot.height,
          borderRadius: borderRadius.slot,
          borderStyle: 'dashed',
          // Dashed pattern: 3px dash, 1px gap
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            transparent 3px,
            transparent 4px
          )`,
          boxSizing: 'border-box',
          flexShrink: 0,
          position: 'relative',
          zIndex: 0,
        }}
      />
    )
  }
)

Slot.displayName = 'Slot'

export default Slot
