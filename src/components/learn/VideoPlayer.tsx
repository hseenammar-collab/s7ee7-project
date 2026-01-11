'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  RotateCcw,
  SkipForward,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  src: string // URL for HLS or MP4
  poster?: string
  title?: string
  onProgress?: (seconds: number) => void
  onComplete?: () => void
  initialTime?: number
  autoPlay?: boolean
}

export default function VideoPlayer({
  src,
  poster,
  title,
  onProgress,
  onComplete,
  initialTime = 0,
  autoPlay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [quality, setQuality] = useState<number>(-1) // -1 = auto
  const [availableQualities, setAvailableQualities] = useState<{ height: number; index: number }[]>([])
  const [error, setError] = useState<string | null>(null)

  // Initialize HLS or native video
  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    setError(null)
    setIsLoading(true)

    // Check if HLS stream
    const isHLS = src.includes('.m3u8')

    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      })

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setIsLoading(false)
        // Get available qualities
        const qualities = data.levels.map((level, index) => ({
          height: level.height,
          index,
        }))
        setAvailableQualities(qualities)

        if (initialTime > 0) {
          video.currentTime = initialTime
        }
        if (autoPlay) {
          video.play().catch(() => {})
        }
      })

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('حدث خطأ في تحميل الفيديو')
          setIsLoading(false)
        }
      })

      hlsRef.current = hls
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = src
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false)
        if (initialTime > 0) {
          video.currentTime = initialTime
        }
        if (autoPlay) {
          video.play().catch(() => {})
        }
      })
    } else {
      // Regular MP4
      video.src = src
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false)
        if (initialTime > 0) {
          video.currentTime = initialTime
        }
        if (autoPlay) {
          video.play().catch(() => {})
        }
      })
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src, initialTime, autoPlay])

  // Progress tracking
  useEffect(() => {
    if (isPlaying && onProgress) {
      progressInterval.current = setInterval(() => {
        if (videoRef.current) {
          onProgress(Math.floor(videoRef.current.currentTime))
        }
      }, 10000) // Report every 10 seconds
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [isPlaying, onProgress])

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout

    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 3000)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('touchstart', handleMouseMove)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('touchstart', handleMouseMove)
      }
      clearTimeout(timeout)
    }
  }, [isPlaying])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlay()
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'ArrowLeft':
          e.preventDefault()
          skip(-10)
          break
        case 'ArrowRight':
          e.preventDefault()
          skip(10)
          break
        case 'ArrowUp':
          e.preventDefault()
          changeVolume(Math.min(1, volume + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          changeVolume(Math.max(0, volume - 0.1))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [volume])

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }, [isPlaying])

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }, [isMuted])

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      await containerRef.current.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }, [isFullscreen])

  const skip = useCallback((seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime += seconds
  }, [])

  const changeVolume = useCallback((value: number) => {
    if (!videoRef.current) return
    videoRef.current.volume = value
    setVolume(value)
    setIsMuted(value === 0)
  }, [])

  const changePlaybackRate = useCallback((rate: number) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = rate
    setPlaybackRate(rate)
    setShowSettings(false)
  }, [])

  const changeQuality = useCallback((index: number) => {
    if (!hlsRef.current) return
    hlsRef.current.currentLevel = index
    setQuality(index)
    setShowSettings(false)
  }, [])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const time = parseFloat(e.target.value)
    videoRef.current.currentTime = time
    setCurrentTime(time)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Video event handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const handlePlay = () => setIsPlaying(true)
  const handlePause = () => setIsPlaying(false)

  const handleEnded = () => {
    setIsPlaying(false)
    if (onComplete) {
      onComplete()
    }
  }

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement)
  }

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (error) {
    return (
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
        <div className="text-center text-white">
          <RotateCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cyan-500 rounded-lg hover:bg-cyan-600 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-xl overflow-hidden group"
      onClick={togglePlay}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
        </div>
      )}

      {/* Big Play Button (when paused) */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation()
              togglePlay()
            }}
            className="w-20 h-20 bg-cyan-500/90 rounded-full flex items-center justify-center hover:bg-cyan-500 transition-colors"
          >
            <Play className="h-10 w-10 text-white mr-[-4px]" fill="white" />
          </button>
        </div>
      )}

      {/* Title Overlay */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
          <h3 className="text-white font-medium truncate">{title}</h3>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:bg-cyan-400
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:cursor-pointer
              hover:[&::-webkit-slider-thumb]:w-4
              hover:[&::-webkit-slider-thumb]:h-4
              transition-all"
            style={{
              background: `linear-gradient(to right, #22d3ee ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.3) ${(currentTime / (duration || 1)) * 100}%)`,
            }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-white" fill="white" />
              ) : (
                <Play className="h-6 w-6 text-white" fill="white" />
              )}
            </button>

            {/* Skip Backward */}
            <button
              onClick={() => skip(-10)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors hidden sm:block"
            >
              <RotateCcw className="h-5 w-5 text-white" />
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => skip(10)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors hidden sm:block"
            >
              <SkipForward className="h-5 w-5 text-white" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5 text-white" />
                ) : (
                  <Volume2 className="h-5 w-5 text-white" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer hidden sm:block
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>

            {/* Time */}
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Settings */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5 text-white" />
              </button>

              {/* Settings Menu */}
              {showSettings && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black/95 rounded-lg p-3 min-w-[200px] border border-white/10">
                  {/* Playback Speed */}
                  <div className="mb-3">
                    <p className="text-gray-400 text-xs mb-2">سرعة التشغيل</p>
                    <div className="flex flex-wrap gap-1">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={cn(
                            'px-2 py-1 text-xs rounded transition-colors',
                            playbackRate === rate
                              ? 'bg-cyan-500 text-white'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          )}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality */}
                  {availableQualities.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-xs mb-2">الجودة</p>
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => changeQuality(-1)}
                          className={cn(
                            'px-2 py-1 text-xs rounded transition-colors',
                            quality === -1
                              ? 'bg-cyan-500 text-white'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          )}
                        >
                          Auto
                        </button>
                        {availableQualities.map((q) => (
                          <button
                            key={q.index}
                            onClick={() => changeQuality(q.index)}
                            className={cn(
                              'px-2 py-1 text-xs rounded transition-colors',
                              quality === q.index
                                ? 'bg-cyan-500 text-white'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            )}
                          >
                            {q.height}p
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5 text-white" />
              ) : (
                <Maximize className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
