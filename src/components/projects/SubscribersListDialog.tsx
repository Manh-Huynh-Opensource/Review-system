
import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, Trash2, Loader2, UserMinus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'
import type { Project } from '@/types'

interface Props {
    project: Project
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SubscribersListDialog({ project, open, onOpenChange }: Props) {
    const [removingEmail, setRemovingEmail] = useState<string | null>(null)

    const emails = project.notificationEmails || []

    const handleRemove = async (email: string) => {
        if (!confirm(`Bạn có chắc chắn muốn hủy đăng ký nhận thông báo cho ${email}?`)) return

        setRemovingEmail(email)
        try {
            const unsubscribeFn = httpsCallable(functions, 'unsubscribeFromNotifications')
            await unsubscribeFn({ projectId: project.id, email })
            toast.success(`Đã xóa ${email} khỏi danh sách`)
            // Note: The UI will update automatically via Firestore snapshot listener in ProjectDetailPage
        } catch (error: any) {
            console.error('Remove error', error)
            toast.error('Lỗi khi xóa email')
        } finally {
            setRemovingEmail(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Danh sách nhận thông báo
                    </DialogTitle>
                    <DialogDescription>
                        Các email dưới đây (khách) sẽ nhận được thông báo khi có thay đổi trong dự án.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {emails.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                            <UserMinus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Chưa có ai đăng ký nhận thông báo.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                            {emails.map((email) => (
                                <div key={email} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border group hover:bg-secondary/40 transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Mail className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium truncate" title={email}>{email}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRemove(email)}
                                        disabled={removingEmail === email}
                                        title="Hủy đăng ký"
                                    >
                                        {removingEmail === email ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Tổng số: {emails.length} người đăng ký
                </div>
            </DialogContent>
        </Dialog>
    )
}
