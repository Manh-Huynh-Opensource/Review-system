import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { formatBytes } from '@/lib/storageUtils'

interface StorageByType {
    image: number
    video: number
    model: number
    sequence: number
}

interface ProjectStat {
    projectId: string
    projectName: string
    totalSize: number
    fileCount: number
}

interface StorageChartProps {
    byType: StorageByType
    topProjects: ProjectStat[]
    loading?: boolean
}

const COLORS = {
    image: '#10b981', // green
    video: '#3b82f6', // blue
    model: '#a855f7', // purple
    sequence: '#f97316', // orange
}

const TYPE_LABELS = {
    image: 'Images',
    video: 'Videos',
    model: '3D Models',
    sequence: 'Sequences'
}

export function StorageChart({ byType, topProjects, loading }: StorageChartProps) {
    // Prepare pie chart data
    const pieData = Object.entries(byType)
        .filter(([_, value]) => value > 0)
        .map(([type, value]) => ({
            name: TYPE_LABELS[type as keyof typeof TYPE_LABELS],
            value,
            color: COLORS[type as keyof typeof COLORS]
        }))

    // Prepare bar chart data (top 10 projects)
    const barData = topProjects
        .slice(0, 10)
        .map(p => ({
            name: p.projectName.length > 20 ? p.projectName.substring(0, 20) + '...' : p.projectName,
            size: p.totalSize,
            files: p.fileCount
        }))

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Phân bổ theo loại file</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                            <div className="animate-pulse text-muted-foreground">Đang tải...</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                            <div className="animate-pulse text-muted-foreground">Đang tải...</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Pie Chart - File Type Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Phân bổ theo loại file</CardTitle>
                    <CardDescription>Dung lượng storage theo từng loại file</CardDescription>
                </CardHeader>
                <CardContent>
                    {pieData.length === 0 ? (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                            Chưa có dữ liệu
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatBytes(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* Bar Chart - Top Projects */}
            <Card>
                <CardHeader>
                    <CardTitle>Top 10 Projects</CardTitle>
                    <CardDescription>Projects chiếm nhiều dung lượng nhất</CardDescription>
                </CardHeader>
                <CardContent>
                    {barData.length === 0 ? (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                            Chưa có dữ liệu
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={(value) => formatBytes(value)} />
                                <YAxis dataKey="name" type="category" width={150} />
                                <Tooltip
                                    formatter={(value: number) => {
                                        return [formatBytes(value), 'Dung lượng']
                                    }}
                                />
                                <Bar dataKey="size" fill="#3b82f6" name="Dung lượng" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
