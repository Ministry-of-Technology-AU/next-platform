'use client';

import ReactMarkdown, { type Components } from 'react-markdown';

// Raw HTML in the markdown is dropped (react-markdown's default), so Strapi content can't inject markup.
const COMPONENTS: Components = {
  h1: ({ children }) => <h1 className="mb-4 mt-8 text-2xl font-bold first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-3 mt-8 text-xl font-bold first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-6 text-lg font-semibold first:mt-0">{children}</h3>,
  h4: ({ children }) => <h4 className="mb-2 mt-4 font-semibold first:mt-0">{children}</h4>,
  p: ({ children }) => <p className="mb-4 leading-relaxed last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-4 list-disc space-y-1 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="mb-4 list-decimal space-y-1 pl-6">{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-4 border-primary/40 pl-4 italic text-muted-foreground">{children}</blockquote>
  ),
  a: ({ href, children }) => {
    const external = href?.startsWith('http') ?? false;
    return (
      <a
        href={href}
        className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
        {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {children}
      </a>
    );
  },
  code: ({ children }) => <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>,
  pre: ({ children }) => <pre className="mb-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm">{children}</pre>,
  hr: () => <hr className="my-6 border-border" />,
  img: ({ src, alt }) =>
    // eslint-disable-next-line @next/next/no-img-element
    typeof src === 'string' ? <img src={src} alt={alt ?? ''} loading="lazy" className="my-4 max-w-full rounded-lg" /> : null,
};

/** Renders a Strapi classic rich text (markdown) document in the viewer. */
export function RichTextViewer({ markdown }: { markdown: string }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-6 text-sm sm:px-8 sm:py-8 sm:text-base">
      <ReactMarkdown components={COMPONENTS}>{markdown}</ReactMarkdown>
    </div>
  );
}
