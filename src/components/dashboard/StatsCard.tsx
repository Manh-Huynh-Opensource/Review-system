import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileImage, Video, Box, Film, Folder, MessageSquare, Users } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: number | string
    description?: string
    icon: 'projects' | 'files' | 'comments' | 'clients' | 'image' | 'video' | 'model' | 'sequence'
    loading?: boolean
}

const iconMap = {
    projects: Folder,
    files: FileImage,
    comments: MessageSquare,
    clients: Users,
    image: FileImage,
    video: Video,
    model: Box,
    sequence: Film
}

const colorMap = {
    projects: 'text-blue-500',
    files: 'text-green-500',
    comments: 'text-purple-500',
    clients: 'text-orange-500',
    image: 'text-green-500',
    video: 'text-blue-500',
    model: 'text-purple-500',
    sequence: 'text-orange-500'
}

export function StatsCard({ title, value, description, icon, loading }: StatsCardProps) {
    const Icon = iconMap[icon]
    const iconColor = colorMap[icon]

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`w-4 h-4 ${iconColor}`} />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="animate-pulse space-y-2">
                        <div className="h-8 bg-muted rounded w-20"></div>
                        {description && <div className="h-3 bg-muted rounded w-32"></div>}
                    </div>
                ) : (
                    <>
                        <div className="text-2xl font-bold">{value}</div>
                        {description && (
                            <CardDescription className="text-xs">{description}</CardDescription>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
