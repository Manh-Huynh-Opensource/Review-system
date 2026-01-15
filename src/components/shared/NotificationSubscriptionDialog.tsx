
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Mail, CheckCircle, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'

interface Props {
    projectId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function NotificationSubscriptionDialog({ projectId, open, onOpenChange }: Props) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'checking' | 'subscribed' | 'unsubscribed'>('checking')

    // Load email from local storage on open
    useEffect(() => {
        if (open) {
            const storedEmail = localStorage.getItem('reviewNotificationEmail')
            if (storedEmail) {
                setEmail(storedEmail)
                checkSubscription(storedEmail)
            } else {
                setStatus('unsubscribed')
                setEmail('')
            }
        }
    }, [open, projectId])

    const checkSubscription = async (checkEmail: string) => {
        setStatus('checking')
        try {
            const checkFn = httpsCallable(functions, 'checkSubscription')
            const result = await checkFn({ projectId, email: checkEmail }) as { data: { isSubscribed: boolean } }

            if (result.data.isSubscribed) {
                setStatus('subscribed')
            } else {
                // If server says no, but local said yes -> sync to local (remove staled)
                localStorage.removeItem('reviewNotificationEmail')
                setStatus('unsubscribed')
            }
        } catch (error) {
            console.error('Check failed', error)
            setStatus('unsubscribed') // Fallback
        }
    }

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setLoading(true)
        try {
            const subscribeFn = httpsCallable(functions, 'subscribeToNotifications')
            await subscribeFn({ projectId, email })

            localStorage.setItem('reviewNotificationEmail', email)
            setStatus('subscribed')
            toast.success('Đăng ký nhận thông báo thành công!')
        } catch (error: any) {
            console.error('Subscribe error', error)
            toast.error('Lỗi đăng ký: ' + (error.message || 'Thử lại sau'))
        } finally {
            setLoading(false)
        }
    }

    const handleUnsubscribe = async () => {
        if (!email) return

        if (!confirm('Bạn có chắc chắn muốn hủy nhận thông báo qua email này?')) return

        setLoading(true)
        try {
            const unsubscribeFn = httpsCallable(functions, 'unsubscribeFromNotifications')
            await unsubscribeFn({ projectId, email })

            localStorage.removeItem('reviewNotificationEmail')
            setStatus('unsubscribed')
            setEmail('') // Clear email input
            toast.success('Đã hủy đăng ký')
        } catch (error: any) {
            console.error('Unsubscribe error', error)
            toast.error('Lỗi hủy đăng ký')
        } finally {
            setLoading(false)
        }
    }

    const handleClearLocal = () => {
        // Allow user to clear local email and use another one if they want
        localStorage.removeItem('reviewNotificationEmail')
        setEmail('')
        setStatus('unsubscribed')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        Nhận thông báo qua Email
                    </DialogTitle>
                    <DialogDescription>
                        Cập nhật tin tức mới nhất về bình luận và file mới trong dự án này.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {status === 'checking' ? (
                        <div className="flex flex-col items-center justify-center py-4 space-y-2">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Đang kiểm tra trạng thái...</p>
                        </div>
                    ) : status === 'subscribed' ? (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center space-y-2">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-green-900">Đã đăng ký</h3>
                                    <p className="text-sm text-green-700 break-all">{email}</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full text-muted-foreground"
                                    onClick={handleClearLocal}
                                >
                                    Dùng email khác
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="w-full"
                                    onClick={handleUnsubscribe}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                    Hủy đăng ký
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Chúng tôi sẽ gửi email khi có bình luận hoặc file mới.
                                </p>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Đóng
                                </Button>
                                <Button type="submit" disabled={loading || !email}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Đăng ký"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
