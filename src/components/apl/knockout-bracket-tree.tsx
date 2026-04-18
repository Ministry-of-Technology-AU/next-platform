"use client";

import { buildFixedKnockoutBracket, KnockoutSlot } from '@/lib/apl-knockout';
import type { ReactNode } from 'react';

type KnockoutBracketTreeProps = {
  matches: any[];
};

type BracketSide = 'left' | 'right' | 'center';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || '';

const LEFT_R16_ROWS = [1, 5, 9, 13];
const RIGHT_R16_ROWS = [1, 5, 9, 13];
const LEFT_QF_ROWS = [3, 11];
const RIGHT_QF_ROWS = [3, 11];
const LEFT_SF_ROW = 6;
const RIGHT_SF_ROW = 10;
const FINAL_ROW = 8;

const sanitizeTeamLabel = (name: string) => {
  const normalized = (name || '').trim();
  if (!normalized || /^tb[ad]$/i.test(normalized)) {
    return 'TBA';
  }
  return normalized.toUpperCase();
};

const toMediaUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (!STRAPI_URL) return url;
  return `${STRAPI_URL}${url}`;
};

function TeamBadge({ name, logoUrl }: { name: string; logoUrl: string }) {
  const normalized = (name || '').trim();
  const hasMeaningfulName = normalized && !/^tb[ad]$/i.test(normalized);
  const initials = normalized
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const resolvedLogo = toMediaUrl(logoUrl);
  if (resolvedLogo) {
    return (
      <span
        className="h-[1.1rem] w-[1.1rem] shrink-0 rounded-full border border-border/80 bg-cover bg-center bg-no-repeat dark:border-border"
        style={{ backgroundImage: `url(${resolvedLogo})` }}
      />
    );
  }

  return (
    <span className="inline-flex h-[1.1rem] w-[1.1rem] shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted/80 text-[0.56rem] font-bold text-muted-foreground dark:border-border dark:bg-muted/60">
      {hasMeaningfulName ? initials : ''}
    </span>
  );
}

function BracketTeamRow({
  teamName,
  logoUrl,
  side,
}: {
  teamName: string;
  logoUrl: string;
  side: 'left' | 'right';
}) {
  const label = sanitizeTeamLabel(teamName);
  const rowClass = side === 'right'
    ? 'grid min-h-[1.55rem] grid-cols-[1fr_auto] items-center gap-[0.42rem]'
    : 'grid min-h-[1.55rem] grid-cols-[auto_1fr] items-center gap-[0.42rem]';
  const labelClass = side === 'right'
    ? 'truncate text-right text-[0.75rem] font-bold uppercase leading-tight tracking-[0.01em] text-foreground'
    : 'truncate text-[0.75rem] font-bold uppercase leading-tight tracking-[0.01em] text-foreground';

  return (
    <div className={rowClass}>
      {side === 'right' ? (
        <>
          <span className={labelClass}>{label}</span>
          <TeamBadge name={teamName} logoUrl={logoUrl} />
        </>
      ) : (
        <>
          <TeamBadge name={teamName} logoUrl={logoUrl} />
          <span className={labelClass}>{label}</span>
        </>
      )}
    </div>
  );
}

type BracketItemProps = {
  slot: KnockoutSlot;
  side: BracketSide;
};

function BracketItem({ slot, side }: BracketItemProps) {
  const firstRowSide: 'left' | 'right' = side === 'right' ? 'right' : 'left';
  const secondRowSide: 'left' | 'right' = side === 'center'
    ? 'right'
    : side === 'right'
      ? 'right'
      : 'left';

  return (
    <div
      className={`grid min-h-[3.65rem] gap-[0.2rem] rounded-lg border border-border/70 bg-card/95 px-2 py-[0.28rem] dark:border-border dark:bg-card/85 ${slot.isPlaceholder ? 'opacity-100' : ''}`}
    >
      <BracketTeamRow teamName={slot.teamAName} logoUrl={slot.teamALogoUrl} side={firstRowSide} />
      <div className="border-t border-border/70 dark:border-border" />
      <BracketTeamRow teamName={slot.teamBName} logoUrl={slot.teamBLogoUrl} side={secondRowSide} />
    </div>
  );
}

function yCenterForRow(startRow: number) {
  return startRow * 6.25;
}

function matchConnectorSegment(
  key: string,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  elbowX: number
) {
  return (
    <g key={key}>
      <line x1={fromX} y1={fromY} x2={elbowX} y2={fromY} stroke="hsl(var(--border))" strokeWidth={0.18} fill="none" strokeLinecap="round" />
      <line x1={elbowX} y1={fromY} x2={elbowX} y2={toY} stroke="hsl(var(--border))" strokeWidth={0.18} fill="none" strokeLinecap="round" />
      <line x1={elbowX} y1={toY} x2={toX} y2={toY} stroke="hsl(var(--border))" strokeWidth={0.18} fill="none" strokeLinecap="round" />
    </g>
  );
}

function KnockoutConnectors() {
  const connectors: ReactNode[] = [];

  const columnLeftEdge = [0, 15, 30, 45, 60, 75, 90];
  const columnRightEdge = [10, 25, 40, 55, 70, 85, 100];

  LEFT_R16_ROWS.forEach((row, index) => {
    const targetRow = LEFT_QF_ROWS[Math.floor(index / 2)];
    connectors.push(
      matchConnectorSegment(
        `l-r16-qf-${index}`,
        columnRightEdge[0],
        yCenterForRow(row),
        columnLeftEdge[1],
        yCenterForRow(targetRow),
        12.5
      )
    );
  });

  LEFT_QF_ROWS.forEach((row, index) => {
    connectors.push(
      matchConnectorSegment(
        `l-qf-sf-${index}`,
        columnRightEdge[1],
        yCenterForRow(row),
        columnLeftEdge[2],
        yCenterForRow(LEFT_SF_ROW),
        27.5
      )
    );
  });

  connectors.push(
    matchConnectorSegment(
      'l-sf-final',
      columnRightEdge[2],
      yCenterForRow(LEFT_SF_ROW),
      columnLeftEdge[3],
      yCenterForRow(FINAL_ROW),
      42.5
    )
  );

  connectors.push(
    matchConnectorSegment(
      'r-sf-final',
      columnLeftEdge[4],
      yCenterForRow(RIGHT_SF_ROW),
      columnRightEdge[3],
      yCenterForRow(FINAL_ROW),
      57.5
    )
  );

  RIGHT_QF_ROWS.forEach((row, index) => {
    connectors.push(
      matchConnectorSegment(
        `r-qf-sf-${index}`,
        columnLeftEdge[5],
        yCenterForRow(row),
        columnRightEdge[4],
        yCenterForRow(RIGHT_SF_ROW),
        72.5
      )
    );
  });

  RIGHT_R16_ROWS.forEach((row, index) => {
    const targetRow = RIGHT_QF_ROWS[Math.floor(index / 2)];
    connectors.push(
      matchConnectorSegment(
        `r-r16-qf-${index}`,
        columnLeftEdge[6],
        yCenterForRow(row),
        columnRightEdge[5],
        yCenterForRow(targetRow),
        87.5
      )
    );
  });

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
      {connectors}
    </svg>
  );
}

const SlotWrap = ({ startRow, children }: { startRow: number; children: ReactNode }) => (
  <div style={{ gridRow: `${startRow} / span 2` }}>
    {children}
  </div>
);

export default function KnockoutBracketTree({ matches }: KnockoutBracketTreeProps) {
  const bracket = buildFixedKnockoutBracket(matches);

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_10px_24px_rgba(15,23,42,0.12)] dark:border-border dark:bg-card/95 dark:shadow-[0_14px_26px_rgba(2,6,23,0.42)]">
      <div className="flex items-center bg-primary/90 px-5 py-3 text-2xl font-extrabold uppercase tracking-[0.03em] text-primary-foreground dark:bg-primary/70 max-[1100px]:px-4 max-[1100px]:py-2.5 max-[1100px]:text-lg">
        KNOCKOUT CHART
      </div>
        {!bracket.hasData ? (
          <div className="px-5 py-8 text-center text-[0.95rem] text-muted-foreground">No knockout matches available yet.</div>
        ) : (
          <div className="relative w-full overflow-hidden px-4 pb-5 pt-4">
            <div className="w-full overflow-hidden">
              <div className="relative grid min-h-[clamp(25rem,54vw,32rem)] w-full min-w-0 grid-cols-[1.35fr_1.15fr_1fr_0.9fr_1fr_1.15fr_1.35fr] gap-[clamp(0.35rem,1.05vw,0.95rem)] max-[1100px]:min-h-[clamp(20rem,66vw,27rem)]">
                <div className="relative grid grid-rows-[repeat(16,minmax(1.35rem,1fr))] gap-y-[clamp(0.12rem,0.45vw,0.35rem)]">
                  {bracket.round_of_16.slice(0, 4).map((slot, index) => (
                    <SlotWrap key={`l-r16-${slot.id || index}`} startRow={LEFT_R16_ROWS[index]}>
                      <BracketItem slot={slot} side="left" />
                    </SlotWrap>
                  ))}
                </div>

                <div className="relative grid grid-rows-[repeat(16,minmax(1.35rem,1fr))] gap-y-[clamp(0.12rem,0.45vw,0.35rem)]">
                  {bracket.quarter_final.slice(0, 2).map((slot, index) => (
                    <SlotWrap key={`l-qf-${slot.id || index}`} startRow={LEFT_QF_ROWS[index]}>
                      <BracketItem slot={slot} side="left" />
                    </SlotWrap>
                  ))}
                </div>

                <div className="relative grid grid-rows-[repeat(16,minmax(1.35rem,1fr))] gap-y-[clamp(0.12rem,0.45vw,0.35rem)]">
                  <SlotWrap startRow={LEFT_SF_ROW}>
                    <BracketItem slot={bracket.semi_final[0]} side="left" />
                  </SlotWrap>
                </div>

                <div className="relative grid grid-rows-[repeat(16,minmax(1.35rem,1fr))] gap-y-[clamp(0.12rem,0.45vw,0.35rem)]">
                  <SlotWrap startRow={FINAL_ROW}>
                    <BracketItem slot={bracket.final[0]} side="center" />
                  </SlotWrap>
                </div>

                <div className="relative grid grid-rows-[repeat(16,minmax(1.35rem,1fr))] gap-y-[clamp(0.12rem,0.45vw,0.35rem)]">
                  <SlotWrap startRow={RIGHT_SF_ROW}>
                    <BracketItem slot={bracket.semi_final[1]} side="right" />
                  </SlotWrap>
                </div>

                <div className="relative grid grid-rows-[repeat(16,minmax(1.35rem,1fr))] gap-y-[clamp(0.12rem,0.45vw,0.35rem)]">
                  {bracket.quarter_final.slice(2, 4).map((slot, index) => (
                    <SlotWrap key={`r-qf-${slot.id || index}`} startRow={RIGHT_QF_ROWS[index]}>
                      <BracketItem slot={slot} side="right" />
                    </SlotWrap>
                  ))}
                </div>

                <div className="relative grid grid-rows-[repeat(16,minmax(1.35rem,1fr))] gap-y-[clamp(0.12rem,0.45vw,0.35rem)]">
                  {bracket.round_of_16.slice(4, 8).map((slot, index) => (
                    <SlotWrap key={`r-r16-${slot.id || index}`} startRow={RIGHT_R16_ROWS[index]}>
                      <BracketItem slot={slot} side="right" />
                    </SlotWrap>
                  ))}
                </div>

                <KnockoutConnectors />
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
