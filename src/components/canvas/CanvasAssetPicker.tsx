import { useFileStore } from '@/stores/files'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Video, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'

interface CanvasAssetPickerProps {
    projectId: string
    onSelectAsset: (assetUrl: string, type: 'image' | 'video', name: string) => void
}

export function CanvasAssetPicker({ projectId, onSelectAsset }: CanvasAssetPickerProps) {
    const { files } = useFileStore()
    const [searchTerm, setSearchTerm] = useState('')

    // Filter only images and videos from this project
    const projectAssets = files.filter(f =>
        f.projectId === projectId &&
        (f.type === 'image' || f.type === 'video') &&
        !f.isTrashed &&
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="w-64 border-r bg-background flex flex-col h-full">
            <div className="p-4 border-b space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span>Tài liệu dự án</span>
                </h3>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm tài liệu..."
                        className="pl-8 h-8 text-xs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-2 grid grid-cols-1 gap-2">
                    {projectAssets.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-xs italic">
                            Không tìm thấy tài liệu phù hợp
                        </div>
                    ) : (
                        projectAssets.map((asset) => {
                            const currentV = asset.versions.find(v => v.version === asset.currentVersion) || asset.versions[0]
                            const thumbUrl = currentV?.thumbnailUrl || currentV?.url

                            return (
                                <div
                                    key={asset.id}
                                    className="group relative border rounded-md overflow-hidden bg-muted/30 hover:border-primary transition-all shadow-sm"
                                >
                                    <div className="aspect-video w-full overflow-hidden flex items-center justify-center bg-black/5">
                                        {asset.type === 'image' ? (
                                            <img src={thumbUrl} alt={asset.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="relative w-full h-full">
                                                <img src={thumbUrl} alt={asset.name} className="object-cover w-full h-full opacity-60" />
                                                <Video className="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow-md" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-2 bg-background">
                                        <p className="text-[10px] font-medium truncate mb-1" title={asset.name}>
                                            {asset.name}
                                        </p>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="w-full h-6 text-[10px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => onSelectAsset(currentV.url, asset.type as 'image' | 'video', asset.name)}
                                        >
                                            <Plus className="w-3 h-3" />
                                            Thêm vào canvas
                                        </Button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
