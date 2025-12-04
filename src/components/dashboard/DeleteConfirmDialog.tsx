import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import { formatBytes } from '@/lib/storageUtils'

interface DeleteConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    fileName: string
    fileSize: number
    projectName: string
    onConfirm: () => void
    loading?: boolean
}

export function DeleteConfirmDialog({
    open,
    onOpenChange,
    fileName,
    fileSize,
    projectName,
    onConfirm,
    loading
}: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Xác nhận xóa file</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn xóa file này? Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tên file:</span>
                            <span className="font-medium">{fileName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Project:</span>
                            <span className="font-medium">{projectName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Kích thước:</span>
                            <span className="font-mono font-medium">{formatBytes(fileSize)}</span>
                        </div>
                    </div>

                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            File sẽ bị xóa vĩnh viễn khỏi Firebase Storage và Firestore.
                            Dung lượng sẽ được giải phóng: <strong>{formatBytes(fileSize)}</strong>
                        </AlertDescription>
                    </Alert>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
