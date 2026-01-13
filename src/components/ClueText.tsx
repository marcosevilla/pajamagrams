import { colors, typography } from '@/styles/tokens'

interface ClueTextProps {
  text: string
  darkMode?: boolean
}

export default function ClueText({ text, darkMode = false }: ClueTextProps) {
  return (
    <p
      style={{
        fontFamily: typography.clue.fontFamily,
        fontWeight: typography.clue.fontWeight,
        fontSize: typography.clue.fontSize,
        lineHeight: typography.clue.lineHeight,
        letterSpacing: typography.clue.letterSpacing,
        textAlign: 'center',
        color: darkMode ? colors.text.dark : colors.text.secondary,
        width: 343,
        maxWidth: '90vw',
        marginTop: 'min(200px, 20vh)',
        padding: '0 20px',
        transition: 'color 0.3s ease',
      }}
    >
      {text}
    </p>
  )
}
