import { useRef, useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import LandingScreen from './screens/LandingScreen'
import BananaScreen from './screens/BananaScreen'
import PuzzleScreen from './screens/PuzzleScreen'
import FinaleScreen from './screens/FinaleScreen'

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
    <div className="app" style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
      {currentScreen === 'landing' && <LandingScreen onStart={handleStartGame} />}
      {currentScreen === 'bananas' && <BananaScreen />}
      {currentScreen === 'puzzle' && <PuzzleScreen />}
      {currentScreen === 'finale' && <FinaleScreen />}
    </div>
  )
}

export default App
