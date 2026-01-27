import { format } from 'date-fns'
import { Clock } from 'lucide-react'

interface CanvasVersionSidebarProps {
    versions: any[]
    currentVersion: number
    onVersionSelect: (version: number) => void
}

export function CanvasVersionSidebar({
    versions,
    currentVersion,
    onVersionSelect
}: CanvasVersionSidebarProps) {
    // Sort versions descending
    const sortedVersions = [...versions].sort((a, b) => b.version - a.version)

    return (
        <div className="w-64 border-l bg-background flex flex-col h-full">
            <div className="p-4 border-b">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <span>Lịch sử phiên bản</span>
                    <span className="text-xs font-normal text-muted-foreground bg-muted px-1.5 rounded">
                        {versions.length}
                    </span>
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-2">
                    {sortedVersions.map((v) => {
                        const isActive = v.version === currentVersion
                        const date = v.uploadedAt?.toDate ? v.uploadedAt.toDate() : new Date()

                        return (
                            <button
                                key={v.version}
                                onClick={() => onVersionSelect(v.version)}
                                className={`w-full text-left group transition-all rounded-lg border p-3 hover:border-primary/50 relative overflow-hidden ${isActive
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'border-border bg-card'
                                    }`}
                            >
                                {/* Visual indicator like a slide */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                        }`}>
                                        SLIDE {v.version}
                                    </span>
                                    {isActive && (
                                        <span className="text-[10px] font-medium text-primary">Đang xem</span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        <span>{format(date, 'dd/MM/yyyy HH:mm')}</span>
                                    </div>
                                    {v.metadata?.name && (
                                        <div className="text-xs font-medium truncate opacity-70">
                                            {v.metadata.name}
                                        </div>
                                    )}
                                </div>

                                {/* Progress bar effect on active slide */}
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 h-1 bg-primary w-full" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
