"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getOptimizedImageUrl } from "@/lib/apis/cloudinary-url";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

/**
 * Credits the teams a page was built with. Three layouts share one partner list:
 *
 * - `strip`   (default) a slim, one-line band for the top of a page, above the PageTitle.
 * - `compact` a chip for PageTitle's `actions` slot, when vertical space is tight.
 * - `credits` a quiet footer line (what InitiativeCredits used to be).
 *
 * The platform is Techmin's, so Techmin's logo always leads the logo stack (`host`), while the
 * words name only the collaborators: "In collaboration with Jazbaa".
 *
 * It is attribution, not an announcement: it never dismisses, never animates in and never
 * collapses. The full list, with roles and links, opens from the names in a popover.
 *
 * Colours are plain CSS values, so any colour works. Prefer the token-based `tone` presets,
 * which already switch for dark mode; custom colours should pass `darkColors` too.
 */

export interface CollaborationPartner {
  name: string;
  /** Image URL. Cloudinary URLs are resized automatically. Without one, initials are shown. */
  logo?: string;
  /** Opens in a new tab from the popover and the credits line. */
  url?: string;
  /** What they did, e.g. "Content and outreach". Shown in the popover. */
  role?: string;
}

/** Any CSS colour: a token (`var(--color-primary)`), hex, rgb(), oklch(), color-mix()... */
export interface CollaborationColors {
  background?: string;
  /** Lead text and body copy. */
  foreground?: string;
  /** Partner names, links and the logo ring. */
  accent?: string;
  border?: string;
}

export type CollaborationTone = "neutral" | "crimson" | "gold";

/** Builds every tool on the platform. Leads the logo stack on every collaboration. */
export const TECHMIN: CollaborationPartner = {
  name: "Techmin",
  role: "Ministry of Technology",
  logo: "https://res.cloudinary.com/brxcz8ak/image/upload/v1792592069/Techmin_Logo_NEW.png",
};

/** Presets built from the platform's tokens. Each pairs light and dark values. */
export const COLLABORATION_TONES: Record<CollaborationTone, { colors: CollaborationColors; darkColors: CollaborationColors }> = {
  neutral: {
    colors: {
      background: "color-mix(in oklab, var(--foreground) 4%, transparent)",
      foreground: "var(--color-muted-foreground)",
      accent: "var(--color-primary)",
      border: "var(--color-border)",
    },
    darkColors: { accent: "var(--color-secondary-dark)" },
  },
  crimson: {
    colors: {
      background: "color-mix(in oklab, var(--color-primary) 8%, transparent)",
      foreground: "var(--color-foreground)",
      accent: "var(--color-primary)",
      border: "color-mix(in oklab, var(--color-primary) 25%, transparent)",
    },
    darkColors: {
      background: "color-mix(in oklab, var(--color-primary) 22%, transparent)",
      accent: "var(--color-secondary-dark)",
      border: "color-mix(in oklab, var(--color-primary) 45%, transparent)",
    },
  },
  gold: {
    colors: {
      background: "color-mix(in oklab, var(--color-secondary-light) 55%, transparent)",
      foreground: "var(--color-foreground)",
      accent: "var(--color-primary-dark)",
      border: "color-mix(in oklab, var(--color-secondary-dark) 45%, transparent)",
    },
    darkColors: {
      background: "color-mix(in oklab, var(--color-secondary-dark) 14%, transparent)",
      accent: "var(--color-secondary-dark)",
      border: "color-mix(in oklab, var(--color-secondary-dark) 35%, transparent)",
    },
  },
};

export interface CollaborationBannerProps {
  /** The collaborators. Don't include the host; the words name only these. */
  partners: CollaborationPartner[];
  /** Logo shown first and the "Built by" line in the popover. Default Techmin; null hides it. */
  host?: CollaborationPartner | null;
  variant?: "strip" | "compact" | "credits";
  /** Words before the names. Default "In collaboration with" ("Collaboration with" on the compact chip). */
  lead?: string;
  /** One short line after the names on the strip, e.g. what the collaboration is. Wraps to its own line on phones. */
  message?: string;
  /** Extra content at the end of the strip, e.g. a "Learn more" link. */
  action?: ReactNode;
  tone?: CollaborationTone;
  /** Overrides the tone, value by value. */
  colors?: CollaborationColors;
  /** Dark-mode values. Falls back to `colors`, then the tone's dark values. */
  darkColors?: CollaborationColors;
  /** Logos shown before "+N". Default 4. */
  maxLogos?: number;
  className?: string;
}

/** "A", "A and B", "A, B and C". */
export function formatPartnerNames(names: string[]): string {
  return new Intl.ListFormat("en-IN", { style: "long", type: "conjunction" }).format(names);
}

function initials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, "").trim().split(/\s+/);
  return (words.length > 1 ? `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}` : (words[0] ?? "").slice(0, 2)).toUpperCase();
}

/** Writes the colour values into CSS variables the classes below read. */
function colourVariables(tone: CollaborationTone, colors?: CollaborationColors, darkColors?: CollaborationColors): CSSProperties {
  const preset = COLLABORATION_TONES[tone];
  const light = { ...preset.colors, ...colors };
  // A colour overridden in `colors` is used in dark mode too, unless `darkColors` says otherwise;
  // everything not overridden keeps the tone's dark value.
  const dark = { ...preset.colors, ...preset.darkColors, ...colors, ...darkColors };
  return {
    "--collab-bg": light.background,
    "--collab-fg": light.foreground,
    "--collab-accent": light.accent,
    "--collab-border": light.border,
    "--collab-bg-dark": dark.background,
    "--collab-fg-dark": dark.foreground,
    "--collab-accent-dark": dark.accent,
    "--collab-border-dark": dark.border,
  } as CSSProperties;
}

const SURFACE =
  "border bg-[var(--collab-bg)] text-[var(--collab-fg)] border-[var(--collab-border)] dark:bg-[var(--collab-bg-dark)] dark:text-[var(--collab-fg-dark)] dark:border-[var(--collab-border-dark)]";
const ACCENT = "text-[var(--collab-accent)] dark:text-[var(--collab-accent-dark)]";

function PartnerLogo({ partner, size }: { partner: CollaborationPartner; size: "sm" | "md" }) {
  const [failed, setFailed] = useState(false);
  const box = size === "sm" ? "size-6" : "size-8";
  const pixels = size === "sm" ? 48 : 64;
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-background ring-2 ring-background",
        box,
      )}
    >
      {partner.logo && !failed ? (
        // Logos are tiny and mostly on Cloudinary, which resizes them; next/image isn't needed.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getOptimizedImageUrl(partner.logo, { width: pixels, height: pixels, crop: "fit" })}
          alt=""
          className="size-full object-contain"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={cn("text-[10px] font-bold", ACCENT)}>{initials(partner.name)}</span>
      )}
    </span>
  );
}

function LogoStack({ partners, max }: { partners: CollaborationPartner[]; max: number }) {
  const shown = partners.slice(0, max);
  const extra = partners.length - shown.length;
  return (
    <span className="flex shrink-0 items-center -space-x-1.5" aria-hidden>
      {shown.map((partner) => (
        <PartnerLogo key={partner.name} partner={partner} size="sm" />
      ))}
      {extra > 0 && (
        <span className="flex size-6 items-center justify-center rounded-full bg-background text-[10px] font-semibold ring-2 ring-background">
          +{extra}
        </span>
      )}
    </span>
  );
}

/** The full list: logo, name, role and link. Shared by the strip and the chip. */
function PartnerList({ partners, lead, host }: { partners: CollaborationPartner[]; lead: string; host: CollaborationPartner | null }) {
  return (
    <div className="space-y-3">
      {host && (
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <PartnerLogo partner={host} size="md" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Built by</p>
            <p className="text-sm font-semibold leading-snug">{host.name}</p>
          </div>
        </div>
      )}
      <p className="text-xs font-medium text-muted-foreground">{lead}</p>
      <ul className="space-y-2.5">
        {partners.map((partner) => (
          <li key={partner.name} className="flex items-center gap-3">
            <PartnerLogo partner={partner} size="md" />
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-semibold leading-snug">{partner.name}</p>
              {partner.role && <p className="break-words text-xs text-muted-foreground">{partner.role}</p>}
            </div>
            {partner.url && (
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${partner.name} (opens in a new tab)`}
                className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <ExternalLink className="size-4" />
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PartnersPopover({
  partners,
  host,
  lead,
  trigger,
  label,
}: {
  partners: CollaborationPartner[];
  host: CollaborationPartner | null;
  lead: string;
  trigger: ReactNode;
  label: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={() => void haptic.tap()}
          className="group flex min-w-0 items-center gap-2 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {trigger}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 max-w-[calc(100vw-2rem)]">
        <PartnerList partners={partners} lead={lead} host={host} />
      </PopoverContent>
    </Popover>
  );
}

export function CollaborationBanner({
  partners,
  host = TECHMIN,
  variant = "strip",
  lead,
  message,
  action,
  tone = "neutral",
  colors,
  darkColors,
  maxLogos = 4,
  className,
}: CollaborationBannerProps) {
  if (partners.length === 0) return null;

  const names = partners.map((partner) => partner.name);
  const logos = host ? [host, ...partners.filter((partner) => partner.name !== host.name)] : partners;
  const allNames = formatPartnerNames(names);
  const style = colourVariables(tone, colors, darkColors);

  if (variant === "credits") {
    const leadText = lead ?? "A collaborative initiative with";
    return (
      <p className={cn("mt-8 border-t pt-8 text-center text-sm text-muted-foreground", className)} style={style}>
        {leadText}{" "}
        {partners.map((partner, index) => {
          const separator = index === partners.length - 2 ? " and " : index < partners.length - 1 ? ", " : "";
          const nameClass = cn("font-bold", ACCENT);
          return (
            <span key={partner.name}>
              {partner.url ? (
                <a href={partner.url} target="_blank" rel="noopener noreferrer" className={cn(nameClass, "hover:underline")}>
                  {partner.name}
                </a>
              ) : (
                <span className={nameClass}>{partner.name}</span>
              )}
              {separator}
            </span>
          );
        })}
      </p>
    );
  }

  if (variant === "compact") {
    const leadText = lead ?? "Collaboration with";
    return (
      <div className={cn("inline-flex rounded-full px-1.5", SURFACE, className)} style={style}>
        <PartnersPopover
          partners={partners}
          host={host}
          lead={lead ?? "In collaboration with"}
          label={`In collaboration with ${allNames}. Show details`}
          trigger={
            <span className="flex min-h-11 items-center gap-2 px-1 text-xs font-medium sm:min-h-9">
              <span>{leadText}</span>
              <LogoStack partners={logos} max={maxLogos} />
              <ChevronDown className="size-3.5 opacity-60 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
            </span>
          }
        />
      </div>
    );
  }

  const leadText = lead ?? "In collaboration with";
  const first = names[0] ?? "";
  const others = names.length - 1;

  return (
    <aside
      aria-label="Collaboration"
      className={cn("flex min-h-11 min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 rounded-lg px-3 py-1.5 text-sm", SURFACE, className)}
      style={style}
    >
      <PartnersPopover
        partners={partners}
        host={host}
        lead={leadText}
        label={`${leadText} ${allNames}. Show details`}
        trigger={
          <>
            <LogoStack partners={logos} max={maxLogos} />
            <span className="min-w-0 truncate">
              <span className="hidden xs:inline">{leadText} </span>
              {/* Phones get the first name and a count; wider screens the whole list. */}
              <span className={cn("font-semibold sm:hidden", ACCENT)}>
                {first}
                {others > 0 && ` and ${others} more`}
              </span>
              <span className={cn("hidden font-semibold sm:inline", ACCENT)}>{allNames}</span>
            </span>
            <ChevronDown
              className="size-3.5 shrink-0 opacity-60 transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
              aria-hidden
            />
          </>
        }
      />
      {/* Phones: its own short line under the names. Wider screens: same line, truncated if it runs long. */}
      {message && (
        <span className="min-w-0 basis-full pb-0.5 text-xs opacity-80 sm:flex-1 sm:basis-auto sm:truncate sm:pb-0 sm:text-sm">{message}</span>
      )}
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </aside>
  );
}
