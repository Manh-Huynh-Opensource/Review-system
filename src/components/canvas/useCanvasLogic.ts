import { useState, useEffect, useCallback } from 'react'
import { useFileStore } from '@/stores/files'
import toast from 'react-hot-toast'

export function useCanvasLogic(projectId: string, fileId: string, currentVersionUrl?: string) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const { saveCanvasVersion } = useFileStore()

    const loadData = useCallback(async (url: string) => {
        setLoading(true)
        try {
            const response = await fetch(url)
            if (!response.ok) throw new Error('Failed to fetch canvas data')
            const json = await response.json()
            setData(json)
        } catch (error) {
            console.error('Error loading canvas data:', error)
            toast.error('Không thể tải dữ liệu Canvas')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (currentVersionUrl) {
            loadData(currentVersionUrl)
        }
    }, [currentVersionUrl, loadData])

    const handleSave = useCallback(async (canvasData: any) => {
        try {
            await saveCanvasVersion(projectId, fileId, canvasData)
            // Data will be re-loaded via currentVersionUrl change in parent
        } catch (error) {
            // Error handled in store
        }
    }, [projectId, fileId, saveCanvasVersion])

    return {
        data,
        loading,
        handleSave,
        refresh: () => currentVersionUrl && loadData(currentVersionUrl)
    }
}
