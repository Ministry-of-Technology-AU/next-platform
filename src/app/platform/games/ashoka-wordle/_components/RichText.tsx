'use client';

import ReactMarkdown from 'react-markdown';

interface RichTextProps {
    content: string;
    className?: string;
}

export default function RichText({ content, className }: RichTextProps) {
    return (
        <div className={className}>
            <ReactMarkdown
                components={{
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary dark:text-secondary underline hover:opacity-80"
                        >
                            {children}
                        </a>
                    ),
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
