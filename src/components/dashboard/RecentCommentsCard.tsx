import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquare, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/storageUtils'
import type { Comment } from '@/types'

interface CommentWithFileInfo extends Comment {
    fileName?: string
    projectName?: string
}

interface RecentCommentsCardProps {
    comments: CommentWithFileInfo[]
    loading?: boolean
    onCommentClick: (comment: CommentWithFileInfo) => void
}

const ITEMS_PER_PAGE = 5

export function RecentCommentsCard({ comments, loading, onCommentClick }: RecentCommentsCardProps) {
    const [currentPage, setCurrentPage] = useState(1)

    // Sort by creation date
    const sortedComments = [...comments].sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0
        const timeB = b.createdAt?.toMillis?.() || 0
        return timeB - timeA
    })

    const totalPages = Math.ceil(sortedComments.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedComments = sortedComments.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MessageSquare className="w-4 h-4" />
                                Comments Mới Nhất
                            </CardTitle>
                            <CardDescription className="text-xs">Click để xem file</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-14 bg-muted rounded animate-pulse" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <MessageSquare className="w-4 h-4" />
                            Comments Mới Nhất
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {sortedComments.length} comments - Click để xem file
                        </CardDescription>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-3 w-3" />
                            </Button>
                            <span className="text-xs text-muted-foreground px-2">
                                {currentPage}/{totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {sortedComments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-6 text-sm">
                        Chưa có comments nào
                    </div>
                ) : (
                    <div className="max-h-[280px] overflow-y-auto space-y-2 pr-2">
                        {paginatedComments.map((comment) => (
                            <div
                                key={comment.id}
                                onClick={() => onCommentClick(comment)}
                                className="p-2.5 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="font-medium text-xs truncate">
                                                {comment.fileName || 'Unknown File'}
                                            </span>
                                            {!comment.isResolved && (
                                                <Badge variant="destructive" className="text-[10px] h-4 px-1">
                                                    Pending
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                                            {comment.content}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                            <span className="truncate max-w-[100px]">{comment.userName}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-0.5">
                                                <Clock className="w-2.5 h-2.5" />
                                                {formatDate(comment.createdAt)}
                                            </span>
                                            {comment.projectName && (
                                                <>
                                                    <span>•</span>
                                                    <span className="truncate max-w-[120px]">{comment.projectName}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
