'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { initializeVideoProtection } from '@/lib/security/antiPiracy'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

interface SecureVideoPlayerProps {
  videoUrl: string
  lessonId: string
  courseId: string
  onProgress?: (progress: number) => void
  onComplete?: () => void
}

export default function SecureVideoPlayer({
  videoUrl,
  lessonId,
  courseId,
  onProgress,
  onComplete,
}: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)
  const { user, profile } = useAuth()

  // Initialize anti-piracy on mount
  useEffect(() => {
    initializeVideoProtection()

    // Disable picture-in-picture
    if (videoRef.current) {
      videoRef.current.disablePictureInPicture = true
    }

    // Add visibility change listener
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }

    // Fullscreen change listener
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Dynamic watermark
  const watermarkText = profile?.full_name || user?.email || 'S7EE7'
  const watermarkId = user?.id?.substring(0, 8) || ''

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress =
        (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(currentProgress)
      onProgress?.(currentProgress)

      if (currentProgress >= 90 && !hasCompleted) {
        setHasCompleted(true)
        onComplete?.()
      }
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const pos = (e.clientX - rect.left) / rect.width
      videoRef.current.currentTime = pos * videoRef.current.duration
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const hideControls = () => {
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 3000)
      }
    }
    hideControls()
    return () => clearTimeout(timeout)
  }, [isPlaying, showControls])

  return (
    <div
      ref={containerRef}
      className="video-container relative bg-black rounded-xl overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: 'none' }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false)
          if (!hasCompleted) {
            setHasCompleted(true)
            onComplete?.()
          }
        }}
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        playsInline
      />

      {/* Dynamic Watermark - Multiple positions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top Left */}
        <div className="absolute top-4 left-4 text-white/20 text-sm font-mono select-none">
          {watermarkText}
        </div>

        {/* Top Right */}
        <div className="absolute top-4 right-4 text-white/20 text-sm font-mono select-none">
          ID: {watermarkId}
        </div>

        {/* Center - Moving */}
        <div
          className="absolute text-white/10 text-2xl font-bold select-none animate-pulse"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-30deg)',
          }}
        >
          {watermarkText} • S7EE7 Academy
        </div>

        {/* Bottom */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/15 text-xs font-mono select-none">
          {user?.email} • {new Date().toLocaleDateString('ar-IQ')}
        </div>

        {/* Random floating watermarks */}
        <div
          className="absolute text-white/5 text-lg font-mono select-none"
          style={{ top: '20%', right: '20%' }}
        >
          {watermarkId}
        </div>
        <div
          className="absolute text-white/5 text-lg font-mono select-none"
          style={{ bottom: '30%', left: '15%' }}
        >
          {watermarkText}
        </div>
      </div>

      {/* Custom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div
          className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer group/progress"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-primary rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>

            {/* Volume */}
            <button
              onClick={toggleMute}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Time */}
            <span className="text-white text-sm">
              {formatTime((progress / 100) * duration)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-white" />
              ) : (
                <Maximize className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Play button overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30"
        >
          <div className="w-20 h-20 flex items-center justify-center bg-primary rounded-full hover:scale-110 transition-transform">
            <Play className="w-10 h-10 text-black ml-1" />
          </div>
        </button>
      )}
    </div>
  )
}
