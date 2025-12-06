import React from 'react'

/**
 * Converts plain text URLs into clickable links
 * Supports http://, https://, and www. URLs
 */
export function linkifyText(text: string): React.ReactNode {
    if (!text) return text

    // First, handle markdown-style links: [text](url)
    const markdownRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|www\.[^\s)]+)\)/g
    const segments: Array<React.ReactNode> = []
    let lastIndex = 0

    const pushPlain = (plain: string) => {
        if (!plain) return
        // Then, linkify plain URLs inside the plain text
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g
        const parts = plain.split(urlRegex)
        parts.forEach((part, i) => {
            if (part.match(urlRegex)) {
                const url = part.startsWith('www.') ? `https://${part}` : part
                // Display domain as a shorter title
                try {
                    const domain = new URL(url).hostname.replace(/^www\./, '')
                    segments.push(
                        <a
                            key={`u-${segments.length}-${i}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {domain}
                            <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    )
                } catch {
                    segments.push(
                        <a
                            key={`u-${segments.length}-${i}`}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                            <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    )
                }
            } else {
                segments.push(<React.Fragment key={`p-${segments.length}-${i}`}>{part}</React.Fragment>)
            }
        })
    }

    let match: RegExpExecArray | null
    while ((match = markdownRegex.exec(text)) !== null) {
        const [full, label, rawUrl] = match
        const start = match.index
        const end = start + full.length
        // push any plain text before this match
        pushPlain(text.slice(lastIndex, start))
        const url = rawUrl.startsWith('www.') ? `https://${rawUrl}` : rawUrl
        segments.push(
            <a
                key={`m-${segments.length}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
            >
                {label}
                <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
            </a>
        )
        lastIndex = end
    }

    // push remaining text
    pushPlain(text.slice(lastIndex))

    return segments
}
