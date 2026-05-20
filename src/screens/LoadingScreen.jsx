import { useEffect } from 'react'
import './LoadingScreen.css'
import StatusBar from '../components/StatusBar'
import { LOGO } from '../assets'

export default function LoadingScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="screen loading-screen">
      <StatusBar />
      <img src={LOGO} alt="Blå Sol logo" className="loading-screen__logo" />
    </div>
  )
}
