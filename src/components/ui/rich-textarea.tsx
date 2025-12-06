import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { linkifyText } from '@/lib/linkify'

interface RichTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
  minRows?: number
  maxRows?: number
  onFocus?: () => void
  onBlur?: () => void
  onPaste?: (e: React.ClipboardEvent) => void
  onDrop?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  disabled?: boolean
  required?: boolean
}

export interface RichTextareaRef {
  focus: () => void
  blur: () => void
  setSelectionRange: (start: number, end: number) => void
  selectionStart: number | null
  selectionEnd: number | null
}

// Check if text contains any links
const hasLinks = (text: string) => {
  const markdownRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|www\.[^\s)]+)\)/
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/
  return markdownRegex.test(text) || urlRegex.test(text)
}

export const RichTextarea = forwardRef<RichTextareaRef, RichTextareaProps>(({
  value,
  onChange,
  placeholder = '',
  className = '',
  rows = 3,
  minRows = 3,
  maxRows = 10,
  onFocus,
  onBlur,
  onPaste,
  onDrop,
  onDragOver,
  disabled = false,
  required = false,
}, ref) => {
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Calculate dynamic rows based on content and focus state
  const computedRows = Math.min(
    Math.max(
      focused || value.length > 0 ? Math.max(minRows, rows) : minRows,
      value.split('\n').length
    ),
    maxRows
  )

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus()
    },
    blur: () => {
      textareaRef.current?.blur()
    },
    setSelectionRange: (start: number, end: number) => {
      textareaRef.current?.setSelectionRange(start, end)
    },
    get selectionStart() {
      return textareaRef.current?.selectionStart ?? null
    },
    get selectionEnd() {
      return textareaRef.current?.selectionEnd ?? null
    }
  }))

  const handleFocus = () => {
    setFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    setFocused(false)
    onBlur?.()
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  // Show link preview when text contains links
  const showLinkPreview = hasLinks(value)

  return (
    <div className={cn('relative', className)}>
      {/* Textarea Editor */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onPaste={onPaste}
        onDrop={onDrop}
        onDragOver={onDragOver}
        placeholder={placeholder}
        rows={computedRows}
        disabled={disabled}
        required={required}
        className={cn(
          'w-full px-3 py-2 text-sm bg-background border border-border rounded-md resize-none transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          showLinkPreview && 'rounded-b-none border-b-0',
          className
        )}
      />
      
      {/* Link Preview - shown below textarea when links are present */}
      {showLinkPreview && (
        <div className="px-3 py-2 text-sm bg-muted/30 border border-border border-t-0 rounded-b-md">
          <div className="text-xs text-muted-foreground mb-1">Xem trước:</div>
          <div className="whitespace-pre-wrap break-words leading-relaxed text-foreground">
            {linkifyText(value)}
          </div>
        </div>
      )}
    </div>
  )
})