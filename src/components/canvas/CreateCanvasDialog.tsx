import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Loader2 } from 'lucide-react'
import { useFileStore } from '@/stores/files'

interface CreateCanvasDialogProps {
    projectId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateCanvasDialog({ projectId, open, onOpenChange }: CreateCanvasDialogProps) {
    const [name, setName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const { createCanvasFile } = useFileStore()

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        setIsCreating(true)
        try {
            await createCanvasFile(projectId, name.trim())
            setName('')
            onOpenChange(false)
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-pink-500">
                        <Pencil className="w-5 h-5" />
                        Tạo Canvas mới
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="canvas-name">Tên Canvas</Label>
                        <Input
                            id="canvas-name"
                            placeholder="VD: Moodboard thiết kế, Brief yêu cầu..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isCreating}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={!name.trim() || isCreating}
                            className="bg-pink-600 hover:bg-pink-700 text-white"
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                'Tạo ngay'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
