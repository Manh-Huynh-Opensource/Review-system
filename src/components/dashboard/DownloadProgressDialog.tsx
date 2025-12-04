import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Loader2 } from 'lucide-react'

interface DownloadProgressDialogProps {
    open: boolean
    progress: number
    message: string
    fileName?: string
}

export function DownloadProgressDialog({
    open,
    progress,
    message,
    fileName
}: DownloadProgressDialogProps) {
    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        Đang xử lý...
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{message}</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                    {fileName && (
                        <p className="text-xs text-muted-foreground truncate">
                            Đang xử lý: {fileName}
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
