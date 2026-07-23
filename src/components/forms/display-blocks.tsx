'use client';

/**
 * Presentational (non-input) blocks: title, paragraph, divider, image,
 * social-links. Paragraph HTML is rendered with dangerouslySetInnerHTML — safe
 * ONLY because it is sanitized server-side at save time (spec §14.5). Never
 * feed unsanitized HTML here.
 */

import { Instagram, Linkedin, Twitter, Youtube, Globe, MessageCircle } from 'lucide-react';
import type {
  TitleBlock,
  ParagraphBlock,
  ImageBlock,
  SocialLinksBlock,
  SocialPlatform,
} from '@/lib/forms/schema';

export function TitleDisplay({ block }: { block: TitleBlock }) {
  const align =
    block.align === 'center' ? 'text-center' : block.align === 'right' ? 'text-right' : 'text-left';
  const size = block.level === 1 ? 'text-3xl' : block.level === 2 ? 'text-2xl' : 'text-xl';
  return (
    <p
      className={`font-bold leading-tight text-[var(--form-text)] ${size} ${align}`}
      style={{
        fontFamily: 'var(--form-font-heading)',
        fontWeight: 'var(--form-weight-heading, 700)' as unknown as number,
        fontStyle: 'var(--form-style-heading, normal)',
      }}
    >
      {block.text}
    </p>
  );
}

export function ParagraphDisplay({ block }: { block: ParagraphBlock }) {
  return (
    <div
      className="prose max-w-none text-[var(--form-text)]"
      style={{ fontFamily: 'var(--form-font-body)' }}
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
}

export function DividerDisplay() {
  return <hr className="border-t border-[var(--form-border)]" />;
}

export function ImageDisplay({ block }: { block: ImageBlock }) {
  if (!block.url) return null;
  return (
    <div className={block.width === 'half' ? 'mx-auto max-w-sm' : 'w-full'}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={block.url}
        alt={block.alt}
        className="h-auto w-full rounded-[var(--form-radius)] object-cover"
        loading="lazy"
      />
    </div>
  );
}

const SOCIAL_ICON: Record<SocialPlatform, typeof Instagram> = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
  website: Globe,
  discord: MessageCircle,
};

export function SocialLinksDisplay({ block }: { block: SocialLinksBlock }) {
  const links = block.links.filter((l) => l.url);
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link, i) => {
        const Icon = SOCIAL_ICON[link.platform] ?? Globe;
        return (
          <a
            key={`${link.platform}-${i}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.platform}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--form-border)] text-[var(--form-text)] transition-colors hover:bg-[var(--form-primary)] hover:text-[var(--form-primary-text)]"
          >
            <Icon className="h-5 w-5" />
          </a>
        );
      })}
    </div>
  );
}
