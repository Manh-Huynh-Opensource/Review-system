import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Mail, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface UserSettings {
    defaultNotificationEmail?: string
    updatedAt?: Date
}

export function AccountSettingsDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [notificationEmail, setNotificationEmail] = useState('')
    const { user } = useAuthStore()

    // Load user settings when dialog opens
    useEffect(() => {
        if (open && user?.email) {
            loadSettings()
        }
    }, [open, user?.email])

    const loadSettings = async () => {
        if (!user?.email) return
        setLoading(true)
        try {
            const settingsDoc = await getDoc(doc(db, 'userSettings', user.email))
            if (settingsDoc.exists()) {
                const data = settingsDoc.data() as UserSettings
                setNotificationEmail(data.defaultNotificationEmail || '')
            }
        } catch (error) {
            console.error('Failed to load settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!user?.email) return
        setSaving(true)
        try {
            await setDoc(doc(db, 'userSettings', user.email), {
                defaultNotificationEmail: notificationEmail.trim() || null,
                updatedAt: new Date()
            }, { merge: true })
            toast.success('Đã lưu cài đặt')
            setOpen(false)
        } catch (error) {
            console.error('Failed to save settings:', error)
            toast.error('Không thể lưu cài đặt')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <Settings className="h-4 w-4" />
                    Cài đặt tài khoản
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cài đặt tài khoản</DialogTitle>
                    <DialogDescription>
                        Quản lý cài đặt thông báo và tài khoản của bạn
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="notificationEmail">Email nhận thông báo mặc định</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="notificationEmail"
                                    type="email"
                                    value={notificationEmail}
                                    onChange={(e) => setNotificationEmail(e.target.value)}
                                    placeholder="email-nhan-thongbao@example.com"
                                    className="pl-9"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Email này sẽ nhận thông báo cho TẤT CẢ dự án (trừ khi dự án có cài đặt email riêng).
                                <br />
                                Để trống nếu muốn dùng email đăng nhập: <strong>{user?.email}</strong>
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                disabled={saving}
                            >
                                Hủy
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Lưu cài đặt
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
