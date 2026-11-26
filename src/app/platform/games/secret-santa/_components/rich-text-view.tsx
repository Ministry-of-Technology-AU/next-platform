import { cn } from "@/lib/utils"

interface RichTextViewProps {
    /** Sanitised on the server before it was stored (`_server/http.ts` → `cleanRichText`). */
    html: string
    empty: string
    className?: string
}

/** Shows a wish list or host note. Server-sanitised HTML only. */
export function RichTextView({ html, empty, className }: RichTextViewProps) {
    if (!html.trim()) return <p className={cn("text-sm text-muted-foreground", className)}>{empty}</p>
    return (
        <div
            className={cn(
                "text-sm leading-relaxed [&_a]:text-primary [&_a]:underline dark:[&_a]:text-secondary [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc",
                className,
            )}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}
