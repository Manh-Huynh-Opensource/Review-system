import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, SkipBack, SkipForward, Repeat, Film, Images } from 'lucide-react'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'

interface ImageSequenceViewerProps {
  urls: string[]
  fps?: number
  onFrameChange?: (frame: number) => void
  defaultViewMode?: 'video' | 'carousel'
  isAdmin?: boolean
  onViewModeChange?: (mode: 'video' | 'carousel') => void
}

type ViewMode = 'video' | 'carousel'

export function ImageSequenceViewer({ urls, fps = 24, onFrameChange, defaultViewMode = 'video', isAdmin = false, onViewModeChange }: ImageSequenceViewerProps) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const lastFrameTimeRef = useRef<number>(0)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)

  const frameCount = urls.length
  const frameDuration = 1000 / fps // milliseconds per frame

  // Preload images
  useEffect(() => {
    const loaded = new Set<number>()
    let cancelled = false

    const preloadImages = async () => {
      for (let i = 0; i < urls.length; i++) {
        if (cancelled) break
        
        const img = new Image()
        await new Promise((resolve, reject) => {
          img.onload = () => {
            if (!cancelled) {
              loaded.add(i)
              setLoadedImages(new Set(loaded))
            }
            resolve(null)
          }
          img.onerror = reject
          img.src = urls[i]
        })
      }
      if (!cancelled) {
        setLoading(false)
      }
    }

    preloadImages().catch(console.error)

    return () => {
      cancelled = true
    }
  }, [urls])

  // Animation loop
  useEffect(() => {
    if (!isPlaying || loading || viewMode === 'carousel') return

    const animate = (timestamp: number) => {
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = timestamp
      }

      const elapsed = timestamp - lastFrameTimeRef.current

      if (elapsed >= frameDuration) {
        setCurrentFrame(prev => {
          const next = prev + 1
          if (next >= frameCount) {
            if (isLooping) {
              onFrameChange?.(0)
              return 0
            } else {
              setIsPlaying(false)
              return prev
            }
          }
          onFrameChange?.(next)
          return next
        })
        lastFrameTimeRef.current = timestamp
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, frameDuration, frameCount, isLooping, loading, onFrameChange, viewMode])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return // Don't interfere with input fields
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          handlePrevFrame()
          break
        case 'ArrowRight':
          e.preventDefault()
          handleNextFrame()
          break
        case ' ':
          if (viewMode === 'video') {
            e.preventDefault()
            handlePlayPause()
          }
          break
        case 'Home':
          e.preventDefault()
          handleFirstFrame()
          break
        case 'End':
          e.preventDefault()
          handleLastFrame()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentFrame, frameCount, isPlaying, viewMode])

  const handlePlayPause = () => {
    if (currentFrame >= frameCount - 1 && !isPlaying) {
      setCurrentFrame(0)
      lastFrameTimeRef.current = 0
    }
    setIsPlaying(!isPlaying)
  }

  const handleFrameChange = (value: number[]) => {
    const frame = value[0]
    setCurrentFrame(frame)
    onFrameChange?.(frame)
    lastFrameTimeRef.current = 0
  }

  const handlePrevFrame = () => {
    const newFrame = Math.max(0, currentFrame - 1)
    setCurrentFrame(newFrame)
    onFrameChange?.(newFrame)
  }

  const handleNextFrame = () => {
    const newFrame = Math.min(frameCount - 1, currentFrame + 1)
    setCurrentFrame(newFrame)
    onFrameChange?.(newFrame)
  }

  const handleFirstFrame = () => {
    setCurrentFrame(0)
    onFrameChange?.(0)
  }

  const handleLastFrame = () => {
    setCurrentFrame(frameCount - 1)
    onFrameChange?.(frameCount - 1)
  }

  if (loading) {
    return (
      <div className="relative aspect-video bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <div className="text-sm text-muted-foreground">
            Đang tải {loadedImages.size}/{frameCount} frames...
          </div>
        </div>
      </div>
    )
  }

  const handleViewModeChange = (newMode: string) => {
    if (newMode && isAdmin) {
      const mode = newMode as ViewMode
      setViewMode(mode)
      onViewModeChange?.(mode)
    }
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between px-4">
        {isAdmin ? (
          <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange}>
            <ToggleGroupItem value="video" aria-label="Video mode" className="gap-2">
              <Film className="w-4 h-4" />
              <span className="text-xs">Video</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="carousel" aria-label="Carousel mode" className="gap-2">
              <Images className="w-4 h-4" />
              <span className="text-xs">Carousel</span>
            </ToggleGroupItem>
          </ToggleGroup>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
            {viewMode === 'video' ? (
              <>
                <Film className="w-4 h-4" />
                <span className="text-xs font-medium">Chế độ Video</span>
              </>
            ) : (
              <>
                <Images className="w-4 h-4" />
                <span className="text-xs font-medium">Chế độ Carousel</span>
              </>
            )}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          {viewMode === 'video' ? 'Chế độ phát tự động' : 'Chế độ xem thủ công'}
        </div>
      </div>

      {/* Image Display */}
      <div className="relative bg-muted/20">
        <img
          src={urls[currentFrame]}
          alt={`Frame ${currentFrame + 1}`}
          className="w-full h-auto max-h-[60vh] object-contain mx-auto"
          draggable={false}
        />
        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-md text-sm font-mono">
          Frame {currentFrame + 1} / {frameCount}
        </div>
      </div>

      {viewMode === 'video' ? (
        /* Video Mode Controls */
        <div className="space-y-3 px-4">
          {/* Timeline Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-mono w-12 text-right">
              {String(currentFrame + 1).padStart(3, '0')}
            </span>
            <Slider
              value={[currentFrame]}
              min={0}
              max={frameCount - 1}
              step={1}
              onValueChange={handleFrameChange}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground font-mono w-12">
              {String(frameCount).padStart(3, '0')}
            </span>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFirstFrame}
              disabled={currentFrame === 0}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevFrame}
              disabled={currentFrame === 0}
            >
              <SkipBack className="w-3 h-3" />
            </Button>

            <Button
              variant="default"
              size="lg"
              onClick={handlePlayPause}
              className="px-6"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextFrame}
              disabled={currentFrame === frameCount - 1}
            >
              <SkipForward className="w-3 h-3" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLastFrame}
              disabled={currentFrame === frameCount - 1}
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-2" />

            <Button
              variant={isLooping ? "default" : "outline"}
              size="sm"
              onClick={() => setIsLooping(!isLooping)}
              title="Loop"
            >
              <Repeat className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs text-muted-foreground">FPS:</span>
              <span className="text-sm font-mono font-medium">{fps}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Carousel Mode Controls */
        <div className="space-y-3 px-4">
          {/* Info Bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-md">
            <span>Tổng số frames: {frameCount}</span>
            <span>Dùng ← → để điều hướng</span>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 bg-muted/20 rounded-lg">
            {urls.map((url, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFrame(index)
                  onFrameChange?.(index)
                }}
                className={`relative aspect-square rounded overflow-hidden border-2 transition-all hover:scale-105 ${
                  currentFrame === index 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-transparent hover:border-primary/50'
                }`}
              >
                <img
                  src={url}
                  alt={`Thumb ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                  currentFrame === index ? 'bg-black/20' : 'bg-black/40'
                }`}>
                  <span className={`text-xs font-mono font-medium ${
                    currentFrame === index ? 'text-primary' : 'text-white'
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleFirstFrame}
              disabled={currentFrame === 0}
              className="flex-1"
            >
              <SkipBack className="w-4 h-4 mr-2" />
              Đầu
            </Button>
            
            <Button
              variant="outline"
              onClick={handlePrevFrame}
              disabled={currentFrame === 0}
              className="flex-1"
            >
              <SkipBack className="w-3 h-3 mr-2" />
              Trước
            </Button>

            <div className="px-4 py-2 bg-muted rounded-md font-mono text-sm min-w-[100px] text-center">
              {currentFrame + 1} / {frameCount}
            </div>

            <Button
              variant="outline"
              onClick={handleNextFrame}
              disabled={currentFrame === frameCount - 1}
              className="flex-1"
            >
              Sau
              <SkipForward className="w-3 h-3 ml-2" />
            </Button>

            <Button
              variant="outline"
              onClick={handleLastFrame}
              disabled={currentFrame === frameCount - 1}
              className="flex-1"
            >
              Cuối
              <SkipForward className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
