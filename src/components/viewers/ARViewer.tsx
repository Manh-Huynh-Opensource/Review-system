/// <reference path="../../global.d.ts" />
import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react'

export interface ARViewerRef {
    activateAR: () => void
}

interface ARViewerProps {
    url: string
    iosSrc?: string // Optional USDZ source for iOS
    alt?: string
}

/**
 * ARViewer Component
 * Wraps @google/model-viewer to provide native AR capabilities (AR Quick Look / Scene Viewer)
 * This component remains hidden and is only used to trigger the AR session.
 */
export const ARViewer = forwardRef<ARViewerRef, ARViewerProps>(({ url, iosSrc, alt = "3D Model" }, ref) => {
    const modelViewerRef = useRef<HTMLElement>(null)
    const [arUrl, setArUrl] = useState<string | undefined>(undefined)
    const [error, setError] = useState<string | null>(null)

    useImperativeHandle(ref, () => ({
        activateAR: () => {
            setError(null) // Reset error
            setArUrl(url)
            setTimeout(() => {
                if (modelViewerRef.current) {
                    // @ts-ignore
                    modelViewerRef.current.activateAR()
                }
            }, 100)
        }
    }))

    // Register the custom element if it hasn't been registered yet
    useEffect(() => {
        import('@google/model-viewer').catch(console.error)
    }, [])

    return (
        <>
            <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none opacity-0" aria-hidden="true">
                <model-viewer
                    ref={(el: HTMLElement | null) => {
                        // @ts-ignore
                        modelViewerRef.current = el;
                        if (el) {
                            el.addEventListener('error', (e: any) => {
                                const msg = e.detail?.message || JSON.stringify(e.detail) || "Unknown AR Error";
                                console.error('AR Viewer Error:', msg);
                                setError(msg);
                            });
                        }
                    }}
                    src={arUrl}
                    ios-src={iosSrc}
                    alt={alt}
                    ar
                    ar-modes="scene-viewer webxr quick-look"
                    ar-scale="auto"
                    ar-placement="floor"
                    camera-controls
                    shadow-intensity="0"
                    environment-image="neutral"
                    loading="eager"
                    style={{ width: '1px', height: '1px' }}
                >
                </model-viewer>
            </div>

            {/* Mobile Debug Error Overlay */}
            {error && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-xl max-w-sm w-full text-center space-y-4">
                        <div className="text-red-500 font-bold text-lg">Lỗi AR</div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 break-words font-mono bg-zinc-100 dark:bg-zinc-800 p-2 rounded">
                            {error}
                        </p>
                        <button
                            onClick={() => setError(null)}
                            className="w-full py-2 bg-primary text-white rounded-md font-medium"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </>
    )
})

ARViewer.displayName = 'ARViewer'
