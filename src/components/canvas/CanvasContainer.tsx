import type { File as FileModel } from '@/types'
import { CanvasEditor } from './CanvasEditor'
import { CanvasAssetPicker } from './CanvasAssetPicker'
import { CanvasVersionSidebar } from './CanvasVersionSidebar'
import { useCanvasLogic } from './useCanvasLogic'
import { Loader2, PanelRightClose, PanelRight, LayoutList, PlusCircle } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

interface CanvasContainerProps {
    file: FileModel
    projectId: string
    currentVersion: number
    onVersionSelect: (version: number) => void
    isAdmin?: boolean
}

export default function CanvasContainer({
    file,
    projectId,
    currentVersion,
    onVersionSelect,
    isAdmin
}: CanvasContainerProps) {
    const [showSidebar, setShowSidebar] = useState(true)
    const [showAssetPicker, setShowAssetPicker] = useState(false)
    const editorRef = useRef<any>(null)
    const currentV = file.versions.find(v => v.version === currentVersion) || file.versions[0]
    const isLatest = currentVersion === file.currentVersion

    const { data, loading, handleSave } = useCanvasLogic(
        projectId,
        file.id,
        currentV?.url
    )

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p>Đang tải dữ liệu Canvas...</p>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full overflow-hidden bg-background flex-col sm:flex-row">
            {/* Top Bar for Mobile */}
            <div className="sm:hidden flex items-center justify-between p-2 border-b bg-card">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAssetPicker(!showAssetPicker)}
                    className={showAssetPicker ? 'text-primary' : ''}
                >
                    <PlusCircle className="w-5 h-5" />
                </Button>
                <div className="text-xs font-semibold uppercase tracking-wider">Phiên bản v{currentVersion}</div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSidebar(!showSidebar)}
                    className={showSidebar ? 'text-primary' : ''}
                >
                    <LayoutList className="w-5 h-5" />
                </Button>
            </div>

            {/* Asset Picker - Left (Desktop) or Overlay (Mobile) */}
            {(showAssetPicker && isAdmin && isLatest) && (
                <CanvasAssetPicker
                    projectId={projectId}
                    onSelectAsset={(url, type, name) => {
                        editorRef.current?.addAsset(url, type, name)
                        if (window.innerWidth < 640) setShowAssetPicker(false)
                    }}
                />
            )}

            {/* Editor Area */}
            <div className="flex-1 relative border-l shadow-inner bg-[#f9fafb] dark:bg-[#0f1115]">
                {/* Desktop Toggles */}
                <div className="absolute top-4 left-4 z-[1001] hidden sm:flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="shadow-md gap-2 bg-background/80 backdrop-blur-sm"
                        onClick={() => setShowAssetPicker(!showAssetPicker)}
                        disabled={!isAdmin || !isLatest}
                    >
                        <PlusCircle className="w-4 h-4 text-pink-500" />
                        <span>Tài liệu project</span>
                    </Button>
                </div>

                <CanvasEditor
                    ref={editorRef}
                    key={`${file.id}-v${currentVersion}`} // Force re-mount on version change
                    initialData={data}
                    onSave={handleSave}
                    readOnly={!isLatest || !isAdmin}
                />

                {/* Info Overlay */}
                <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
                    <div className="bg-background/80 backdrop-blur-sm border rounded-lg px-3 py-1.5 shadow-sm text-xs space-y-0.5">
                        <div className="font-semibold text-primary">Phiên bản: v{currentVersion}</div>
                        <div className="text-muted-foreground">
                            {!isLatest ? 'Chế độ xem lại (Read-only)' : (isAdmin ? 'Chế độ chỉnh sửa' : 'Chế độ xem')}
                        </div>
                    </div>
                </div>

                {/* Sidebar Desktop Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-[1001] hidden sm:flex h-8 w-8 bg-background/50 border shadow-sm"
                    onClick={() => setShowSidebar(!showSidebar)}
                >
                    {showSidebar ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
                </Button>
            </div>

            {/* Sidebar - Slide List */}
            {showSidebar && (
                <CanvasVersionSidebar
                    versions={file.versions}
                    currentVersion={currentVersion}
                    onVersionSelect={(v: number) => {
                        onVersionSelect(v)
                        if (window.innerWidth < 640) setShowSidebar(false)
                    }}
                />
            )}
        </div>
    )
}
