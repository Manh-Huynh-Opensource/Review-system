import { useState, useRef, useEffect, useCallback, type RefObject } from 'react'

interface UseVideoComparisonOptions {
    primaryVersion: number
    versions: { version: number; url: string }[]
    onSeek?: (time: number) => void
}

interface UseVideoComparisonReturn {
    // State
    isComparing: boolean
    secondaryVersion: number | null
    activeAudio: 'primary' | 'secondary'

    // Refs
    primaryVideoRef: RefObject<HTMLVideoElement | null>
    secondaryVideoRef: RefObject<HTMLVideoElement | null>

    // Actions
    toggleCompare: () => void
    setSecondaryVersion: (version: number | null) => void
    toggleAudio: () => void
    handlePrimaryEvent: (event: 'play' | 'pause' | 'seeked' | 'timeupdate', time?: number) => void
    handleSecondaryEvent: (event: 'play' | 'pause' | 'seeked' | 'timeupdate', time?: number) => void

    // Computed
    secondaryUrl: string | undefined
}

export function useVideoComparison({
    primaryVersion,
    versions,
    onSeek
}: UseVideoComparisonOptions): UseVideoComparisonReturn {
    const [isComparing, setIsComparing] = useState(false)
    const [secondaryVersion, setSecondaryVersion] = useState<number | null>(null)
    const [activeAudio, setActiveAudio] = useState<'primary' | 'secondary'>('primary')

    const primaryVideoRef = useRef<HTMLVideoElement>(null)
    const secondaryVideoRef = useRef<HTMLVideoElement>(null)
    const isSyncing = useRef(false) // Prevent infinite sync loops

    // Get secondary video URL
    const secondaryUrl = secondaryVersion
        ? versions.find(v => v.version === secondaryVersion)?.url
        : undefined

    // Toggle compare mode
    const toggleCompare = useCallback(() => {
        if (!isComparing) {
            // Enter compare mode: set secondary to previous version or first available
            const otherVersions = versions.filter(v => v.version !== primaryVersion)
            const prevVersion = otherVersions.find(v => v.version < primaryVersion)
            const nextVersion = otherVersions.find(v => v.version > primaryVersion)
            setSecondaryVersion(prevVersion?.version || nextVersion?.version || primaryVersion)
        } else {
            // Exit compare mode
            setSecondaryVersion(null)
        }
        setIsComparing(!isComparing)
    }, [isComparing, versions, primaryVersion])

    // Toggle audio between primary and secondary
    const toggleAudio = useCallback(() => {
        const newActive = activeAudio === 'primary' ? 'secondary' : 'primary'

        if (primaryVideoRef.current) {
            primaryVideoRef.current.muted = newActive !== 'primary'
        }
        if (secondaryVideoRef.current) {
            secondaryVideoRef.current.muted = newActive !== 'secondary'
        }

        setActiveAudio(newActive)
    }, [activeAudio])

    // Handle primary video events - sync to secondary
    const handlePrimaryEvent = useCallback((event: 'play' | 'pause' | 'seeked' | 'timeupdate', time?: number) => {
        if (isSyncing.current || !isComparing || !secondaryVideoRef.current) return

        isSyncing.current = true

        try {
            const secondary = secondaryVideoRef.current

            switch (event) {
                case 'play':
                    // Only play secondary if it hasn't ended
                    if (secondary.currentTime < secondary.duration) {
                        secondary.play().catch(() => { })
                    }
                    break
                case 'pause':
                    secondary.pause()
                    break
                case 'seeked':
                    if (time !== undefined) {
                        // Clamp to secondary duration
                        secondary.currentTime = Math.min(time, secondary.duration || Infinity)
                        onSeek?.(time)
                    }
                    break
                case 'timeupdate':
                    // Handle duration mismatch: pause secondary if it's shorter
                    if (time !== undefined && secondary.duration && time >= secondary.duration) {
                        secondary.pause()
                        secondary.currentTime = secondary.duration
                    }
                    break
            }
        } finally {
            setTimeout(() => { isSyncing.current = false }, 50)
        }
    }, [isComparing, onSeek])

    // Handle secondary video events - sync to primary
    const handleSecondaryEvent = useCallback((event: 'play' | 'pause' | 'seeked' | 'timeupdate', time?: number) => {
        if (isSyncing.current || !isComparing || !primaryVideoRef.current) return

        isSyncing.current = true

        try {
            const primary = primaryVideoRef.current

            switch (event) {
                case 'play':
                    primary.play().catch(() => { })
                    break
                case 'pause':
                    primary.pause()
                    break
                case 'seeked':
                    if (time !== undefined) {
                        primary.currentTime = Math.min(time, primary.duration || Infinity)
                        onSeek?.(time)
                    }
                    break
            }
        } finally {
            setTimeout(() => { isSyncing.current = false }, 50)
        }
    }, [isComparing, onSeek])

    // Initialize: Secondary video should be muted by default
    useEffect(() => {
        if (secondaryVideoRef.current) {
            secondaryVideoRef.current.muted = true
        }
        // Reset audio state when entering compare mode
        if (isComparing) {
            setActiveAudio('primary')
        }
    }, [isComparing])

    // Sync secondary video position when it loads or version changes
    useEffect(() => {
        if (isComparing && secondaryVideoRef.current && primaryVideoRef.current) {
            const primaryTime = primaryVideoRef.current.currentTime
            if (primaryTime > 0) {
                secondaryVideoRef.current.currentTime = Math.min(
                    primaryTime,
                    secondaryVideoRef.current.duration || Infinity
                )
            }
        }
    }, [isComparing, secondaryVersion])

    return {
        isComparing,
        secondaryVersion,
        activeAudio,
        primaryVideoRef,
        secondaryVideoRef,
        toggleCompare,
        setSecondaryVersion,
        toggleAudio,
        handlePrimaryEvent,
        handleSecondaryEvent,
        secondaryUrl
    }
}
