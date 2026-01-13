import { useRef, useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import LandingScreen from './screens/LandingScreen'
import PuzzleScreen from './screens/PuzzleScreen'

function App() {
  const { currentScreen } = useGameStore()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/assets/Banana Pancakes.mp3')
    audio.loop = true
    audio.volume = 0.5
    audioRef.current = audio

    // Try to autoplay (will likely be blocked on mobile)
    audio.play().catch(() => {
      // Autoplay blocked - will play on first user interaction
    })

    // Cleanup on unmount
    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  const handleStartGame = () => {
    // Ensure audio plays on user interaction
    if (audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }

  return (
    <div className="app">
      {currentScreen === 'landing' && <LandingScreen onStart={handleStartGame} />}
      {currentScreen === 'puzzle' && <PuzzleScreen />}
      {currentScreen === 'finale' && <div>Finale coming soon!</div>}
    </div>
  )
}

export default App
