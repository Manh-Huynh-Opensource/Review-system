import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, HardDrive } from 'lucide-react'
import { formatBytes, getStoragePercentage, getStorageColor } from '@/lib/storageUtils'
import { STORAGE_FREE_TIER_LIMIT } from '@/stores/statistics'

interface StorageOverviewCardProps {
    totalSize: number
    loading?: boolean
}

export function StorageOverviewCard({ totalSize, loading }: StorageOverviewCardProps) {
    const percentage = getStoragePercentage(totalSize, STORAGE_FREE_TIER_LIMIT)
    const color = getStorageColor(percentage)
    const isWarning = percentage >= 80

    const getProgressColor = () => {
        if (color === 'green') return 'bg-green-500'
        if (color === 'yellow') return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <HardDrive className="w-5 h-5" />
                            Storage Usage
                        </CardTitle>
                        <CardDescription>Firebase Storage Free Tier</CardDescription>
                    </div>
                    {isWarning && (
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-2 bg-muted rounded"></div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Used</span>
                                <span className="font-mono font-medium">
                                    {formatBytes(totalSize)} / {formatBytes(STORAGE_FREE_TIER_LIMIT)}
                                </span>
                            </div>
                            <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className={`h-full transition-all ${getProgressColor()}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{percentage}% used</span>
                                <span>{formatBytes(STORAGE_FREE_TIER_LIMIT - totalSize)} remaining</span>
                            </div>
                        </div>

                        {isWarning && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    Cảnh báo: Bạn đã sử dụng {percentage}% dung lượng storage.
                                    Hãy xem xét xóa bớt files không cần thiết.
                                </AlertDescription>
                            </Alert>
                        )}

                        {percentage >= 50 && percentage < 80 && (
                            <Alert>
                                <AlertDescription>
                                    Bạn đã sử dụng hơn 50% dung lượng storage.
                                    Theo dõi và quản lý dữ liệu thường xuyên.
                                </AlertDescription>
                            </Alert>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
