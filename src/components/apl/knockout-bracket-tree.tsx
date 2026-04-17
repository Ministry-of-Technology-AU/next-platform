"use client";

import styles from '@/app/platform/sports/apl/apl.module.css';
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
const STAGE_LABELS = ['R16', 'QF', 'SF', 'F', 'SF', 'QF', 'R16'];

const sanitizeTeamLabel = (name: string) => {
  const normalized = (name || '').trim();
  if (!normalized || /^tb[ad]$/i.test(normalized)) {
    return '';
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
  const initials = normalized
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const resolvedLogo = toMediaUrl(logoUrl);
  if (resolvedLogo) {
    return <span className={styles.bracketTeamBadgeImage} style={{ backgroundImage: `url(${resolvedLogo})` }} />;
  }

  return <span className={styles.bracketTeamBadge}>{initials || 'T'}</span>;
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

  return (
    <div className={`${styles.bracketTeamRow} ${side === 'right' ? styles.bracketTeamRowRight : styles.bracketTeamRowLeft}`}>
      {side === 'right' ? (
        <>
          <span className={styles.bracketTeamLabel}>{label}</span>
          <TeamBadge name={teamName} logoUrl={logoUrl} />
        </>
      ) : (
        <>
          <TeamBadge name={teamName} logoUrl={logoUrl} />
          <span className={styles.bracketTeamLabel}>{label}</span>
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
  const teamALabel = sanitizeTeamLabel(slot.teamAName);
  const teamBLabel = sanitizeTeamLabel(slot.teamBName);
  const isUnresolved = !teamALabel && !teamBLabel;

  const firstRowSide: 'left' | 'right' = side === 'right' ? 'right' : 'left';
  const secondRowSide: 'left' | 'right' = side === 'center'
    ? 'right'
    : side === 'right'
      ? 'right'
      : 'left';

  return (
    <div className={`${styles.bracketCard} ${slot.isPlaceholder ? styles.bracketPlaceholder : ''}`}>
      <BracketTeamRow teamName={slot.teamAName} logoUrl={slot.teamALogoUrl} side={firstRowSide} />
      <div className={styles.bracketDivider} />
      <BracketTeamRow teamName={slot.teamBName} logoUrl={slot.teamBLogoUrl} side={secondRowSide} />
      {isUnresolved && (
        <div className={styles.bracketMarkerOnlyRow}>
          <span className={styles.bracketTbdMarker} />
          <span className={styles.bracketTbdMarker} />
        </div>
      )}
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
      <line x1={fromX} y1={fromY} x2={elbowX} y2={fromY} className={styles.bracketConnectorLine} />
      <line x1={elbowX} y1={fromY} x2={elbowX} y2={toY} className={styles.bracketConnectorLine} />
      <line x1={elbowX} y1={toY} x2={toX} y2={toY} className={styles.bracketConnectorLine} />
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
    <svg className={styles.bracketConnectorLayer} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
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

  if (!bracket.hasData) {
    return (
      <div className={styles.knockoutPanelWrap}>
        <div className={styles.knockoutPanelHeader}>KNOCKOUT CHART</div>
        <div className={styles.knockoutPanelEmpty}>No knockout matches available yet.</div>
      </div>
    );
  }

  return (
    <div className={styles.knockoutPanelWrap}>
      <div className={styles.knockoutPanelHeader}>KNOCKOUT CHART</div>
      <div className={styles.bracketStageRow}>
        {STAGE_LABELS.map((label, index) => (
          <span key={`${label}-${index}`} className={styles.bracketStageLabel}>
            {label}
          </span>
        ))}
      </div>
      <div className={styles.bracketTreeContainer}>
        <div className={styles.bracketTreeScroller}>
          <div className={styles.bracketTree}>
            <div className={`${styles.bracketColumn} ${styles.bracketGrid16}`}>
              {bracket.round_of_16.slice(0, 4).map((slot, index) => (
                <SlotWrap key={`l-r16-${slot.id || index}`} startRow={LEFT_R16_ROWS[index]}>
                  <BracketItem slot={slot} side="left" />
                </SlotWrap>
              ))}
            </div>

            <div className={`${styles.bracketColumn} ${styles.bracketGrid16}`}>
              {bracket.quarter_final.slice(0, 2).map((slot, index) => (
                <SlotWrap key={`l-qf-${slot.id || index}`} startRow={LEFT_QF_ROWS[index]}>
                  <BracketItem slot={slot} side="left" />
                </SlotWrap>
              ))}
            </div>

            <div className={`${styles.bracketColumn} ${styles.bracketGrid16}`}>
              <SlotWrap startRow={LEFT_SF_ROW}>
                <BracketItem slot={bracket.semi_final[0]} side="left" />
              </SlotWrap>
            </div>

            <div className={`${styles.bracketColumn} ${styles.bracketGrid16}`}>
              <SlotWrap startRow={FINAL_ROW}>
                <BracketItem slot={bracket.final[0]} side="center" />
              </SlotWrap>
            </div>

            <div className={`${styles.bracketColumn} ${styles.bracketGrid16}`}>
              <SlotWrap startRow={RIGHT_SF_ROW}>
                <BracketItem slot={bracket.semi_final[1]} side="right" />
              </SlotWrap>
            </div>

            <div className={`${styles.bracketColumn} ${styles.bracketGrid16}`}>
              {bracket.quarter_final.slice(2, 4).map((slot, index) => (
                <SlotWrap key={`r-qf-${slot.id || index}`} startRow={RIGHT_QF_ROWS[index]}>
                  <BracketItem slot={slot} side="right" />
                </SlotWrap>
              ))}
            </div>

            <div className={`${styles.bracketColumn} ${styles.bracketGrid16}`}>
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
    </div>
  );
}
