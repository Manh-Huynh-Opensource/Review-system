import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link as LinkIcon, ExternalLink, Loader2 } from 'lucide-react'

interface LinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (url: string, title: string) => void
}

export function LinkDialog({ open, onOpenChange, onInsert }: LinkDialogProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-fetch title when URL changes
  useEffect(() => {
    if (!url.trim()) {
      setTitle('')
      setError('')
      return
    }

    const timeoutId = setTimeout(async () => {
      if (!url.match(/^https?:\/\//)) {
        // If URL doesn't start with http/https, add https
        const correctedUrl = url.startsWith('www.') ? `https://${url}` : `https://${url}`
        setUrl(correctedUrl)
        return
      }

      setLoading(true)
      setError('')
      
      try {
        // Try to extract domain as fallback
        const domain = new URL(url).hostname.replace(/^www\./, '')
        
        // In a real app, you'd fetch the actual title via a backend proxy
        // For now, we'll use the domain as a smart default
        setTitle(title || domain)
      } catch (e) {
        setError('URL không hợp lệ')
        setTitle('')
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [url, title])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || !title.trim()) return
    
    onInsert(url.trim(), title.trim())
    handleClose()
  }

  const handleClose = () => {
    setUrl('')
    setTitle('')
    setError('')
    setLoading(false)
    onOpenChange(false)
  }

  const isValidUrl = url.trim() && url.match(/^https?:\/\//)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Chèn liên kết
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL liên kết</Label>
            <div className="relative">
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={error ? 'border-red-500' : ''}
                autoFocus
              />
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
              )}
              {isValidUrl && !loading && (
                <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              )}
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Văn bản hiển thị</Label>
            <Input
              id="title"
              placeholder="Nhập tiêu đề liên kết..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Văn bản này sẽ hiển thị thay vì URL đầy đủ
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={!url.trim() || !title.trim() || !!error}
            >
              Chèn liên kết
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}