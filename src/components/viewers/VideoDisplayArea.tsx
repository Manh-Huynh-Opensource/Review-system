import { forwardRef, memo } from 'react'
import { VideoOverlayContainer, SafeZoneOverlay, CompositionOverlay, type CompositionGuide } from './overlays'
import { Loader2 } from 'lucide-react'

interface VideoDisplayAreaProps {
    src: string
    isFullscreen: boolean
    isBuffering: boolean
    activeSafeZone: string | null
    activeGuides: CompositionGuide[]
    videoRatio: number
    guideColor: string
    overlayOpacity: number
    onClick: () => void
    onDoubleClick: () => void
}

const VideoDisplayAreaComponent = forwardRef<HTMLVideoElement, VideoDisplayAreaProps>(({
    src,
    isFullscreen,
    isBuffering,
    activeSafeZone,
    activeGuides,
    videoRatio,
    guideColor,
    overlayOpacity,
    onClick,
    onDoubleClick
}, ref) => {
    return (
        <>
            <video
                ref={ref}
                src={src}
                crossOrigin="anonymous"
                playsInline
                webkit-playsinline=""
                preload="auto"
                className="w-full h-auto bg-black"
                style={isFullscreen ? {
                    maxHeight: 'calc(100vh - 120px)',
                    objectFit: 'contain'
                } : undefined}
                onClick={onClick}
                onDoubleClick={onDoubleClick}
            />

            {/* Loading Spinner */}
            {isBuffering && (
                <div className="loading-overlay">
                    <Loader2 className="loading-spinner" />
                </div>
            )}

            {/* Video Overlays (Safe Zone + Composition Guides) */}
            <VideoOverlayContainer videoRef={ref as React.RefObject<HTMLVideoElement>}>
                <SafeZoneOverlay safeZoneUrl={activeSafeZone} opacity={overlayOpacity} />
                <CompositionOverlay
                    activeGuides={activeGuides}
                    videoRatio={videoRatio}
                    color={guideColor}
                    opacity={overlayOpacity}
                />
            </VideoOverlayContainer>
        </>
    )
})

export const VideoDisplayArea = memo(VideoDisplayAreaComponent)
