import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { strapiGet, strapiPost } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';

type ScanDirection = 'IN' | 'OUT';

interface NormalizedScan {
  timestamp: Date;
  direction: ScanDirection;
}

interface TrendPoint {
  hour: number;
  label: string;
  count: number;
}

interface GymAnalytics {
  totalVisitors: number;
  liveCount: number;
  trend: TrendPoint[];
  density: {
    am: number[];
    pm: number[];
  };
  peakHourLabel: string;
  recommendation: string;
}

const DEFAULT_SCAN_ENDPOINT = '/gym-scans';

function normalizeEndpoint(endpoint: string): string {
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
}

function getScanEndpoint(): string {
  return normalizeEndpoint(process.env.GYM_TRACKER_SCAN_ENDPOINT || DEFAULT_SCAN_ENDPOINT);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function parseDirection(raw: unknown): ScanDirection | null {
  if (typeof raw !== 'string') return null;
  const normalized = raw.trim().toUpperCase();

  if (normalized === 'IN' || normalized === 'ENTER' || normalized === 'ENTRY') return 'IN';
  if (normalized === 'OUT' || normalized === 'EXIT') return 'OUT';

  return null;
}

function parseTimestamp(raw: unknown): Date | null {
  if (typeof raw !== 'string') return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeScanRecord(raw: unknown): NormalizedScan | null {
  const root = asRecord(raw);
  const attrs = asRecord(root.attributes);

  const direction = parseDirection(
    root.direction ?? attrs.direction ?? attrs.scanType ?? attrs.type
  );

  const timestamp =
    parseTimestamp(root.scannedAt) ||
    parseTimestamp(attrs.scannedAt) ||
    parseTimestamp(root.timestamp) ||
    parseTimestamp(attrs.timestamp) ||
    parseTimestamp(root.createdAt) ||
    parseTimestamp(attrs.createdAt);

  if (!direction || !timestamp) return null;

  return { direction, timestamp };
}

function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getLastNDates(n: number): string[] {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (n - 1));

  return Array.from({ length: n }, (_, index) => {
    const d = new Date(start);
    d.setDate(start.getDate() + index);
    return getDateKey(d);
  });
}

function computeAnalytics(scans: NormalizedScan[]): GymAnalytics {
  const weekDates = getLastNDates(7);
  const byDate: Record<string, NormalizedScan[]> = Object.fromEntries(
    weekDates.map((date) => [date, []])
  );

  for (const scan of scans) {
    const key = getDateKey(scan.timestamp);
    if (byDate[key]) byDate[key].push(scan);
  }

  const dailyHourlyOccupancy: number[][] = [];

  for (const dateKey of weekDates) {
    const dayScans = byDate[dateKey].slice().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const hourly = new Array<number>(24).fill(0);

    let occupancy = 0;
    let cursor = 0;

    for (let hour = 0; hour < 24; hour++) {
      while (cursor < dayScans.length && dayScans[cursor].timestamp.getHours() === hour) {
        occupancy += dayScans[cursor].direction === 'IN' ? 1 : -1;
        occupancy = Math.max(0, occupancy);
        cursor += 1;
      }

      hourly[hour] = occupancy;
    }

    dailyHourlyOccupancy.push(hourly);
  }

  const trend = Array.from({ length: 24 }, (_, hour) => {
    const avg =
      dailyHourlyOccupancy.reduce((sum, day) => sum + day[hour], 0) /
      Math.max(1, dailyHourlyOccupancy.length);

    return {
      hour,
      label: `${hour}`,
      count: Math.round(avg),
    } satisfies TrendPoint;
  });

  const density = {
    am: trend.slice(0, 12).map((item) => item.count),
    pm: trend.slice(12, 24).map((item) => item.count),
  };

  const todayKey = getDateKey(new Date());
  const todayScans = (byDate[todayKey] || []).slice().sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  let liveCount = 0;
  for (const scan of todayScans) {
    liveCount += scan.direction === 'IN' ? 1 : -1;
    liveCount = Math.max(0, liveCount);
  }

  const totalVisitors = scans.filter((scan) => scan.direction === 'IN').length;

  let peakHour = 0;
  for (let i = 1; i < trend.length; i++) {
    if (trend[i].count > trend[peakHour].count) {
      peakHour = i;
    }
  }

  const peakStart = peakHour;
  const peakEnd = (peakHour + 1) % 24;
  const peakHourLabel = `${peakStart.toString().padStart(2, '0')}:00-${peakEnd
    .toString()
    .padStart(2, '0')}:00`;

  const recommendation =
    trend[peakHour].count <= 8
      ? 'Gym is usually manageable all day. Train when it fits your schedule.'
      : `Peak crowd is around ${peakHourLabel}. For quieter sessions, avoid this window.`;

  return {
    totalVisitors,
    liveCount,
    trend,
    density,
    peakHourLabel,
    recommendation,
  };
}

function buildMockScans(): NormalizedScan[] {
  const scans: NormalizedScan[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const day = new Date(today);
    day.setDate(today.getDate() - dayOffset);

    for (let hour = 6; hour <= 22; hour++) {
      const base = Math.max(0, Math.round(4 + Math.sin((hour - 6) / 2) * 6 + (hour === 18 || hour === 19 ? 10 : 0)));
      const inCount = Math.max(0, base + (dayOffset % 3) - 1);
      const outCount = Math.max(0, inCount - (hour < 20 ? 1 : 3));

      for (let i = 0; i < inCount; i++) {
        const ts = new Date(day);
        ts.setHours(hour, Math.min(59, i * 3), 0, 0);
        scans.push({ direction: 'IN', timestamp: ts });
      }

      for (let i = 0; i < outCount; i++) {
        const ts = new Date(day);
        ts.setHours(Math.min(23, hour + 1), Math.min(59, i * 4), 0, 0);
        scans.push({ direction: 'OUT', timestamp: ts });
      }
    }
  }

  return scans.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

async function fetchScansFromStrapi(): Promise<{ scans: NormalizedScan[]; source: 'strapi' | 'mock' }> {
  const endpoint = getScanEndpoint();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);

  try {
    const response = await strapiGet(endpoint, {
      filters: {
        $or: [
          { scannedAt: { $gte: start.toISOString() } },
          { timestamp: { $gte: start.toISOString() } },
          { createdAt: { $gte: start.toISOString() } },
        ],
      },
      sort: ['scannedAt:asc', 'timestamp:asc', 'createdAt:asc'],
      pagination: { pageSize: 5000 },
    });

    const responseRecord = asRecord(response);
    const data = Array.isArray(responseRecord.data) ? responseRecord.data : [];
    const scans = data.map(normalizeScanRecord).filter((value): value is NormalizedScan => value !== null);

    return { scans, source: 'strapi' };
  } catch (error) {
    console.warn('Gym tracker Strapi fetch failed, using mock data:', error);
    return { scans: buildMockScans(), source: 'mock' };
  }
}

async function getGymTrackerResponse() {
  const { scans, source } = await fetchScansFromStrapi();
  const analytics = computeAnalytics(scans);

  return {
    success: true,
    source,
    ...analytics,
    lastUpdatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const payload = await getGymTrackerResponse();
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error in gym-tracker GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load gym tracker data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    const body = (await request.json()) as { action?: string };

    if (!body?.action || !['enter', 'exit'].includes(body.action)) {
      return NextResponse.json(
        { success: false, error: "Action must be either 'enter' or 'exit'" },
        { status: 400 }
      );
    }

    const direction: ScanDirection = body.action === 'enter' ? 'IN' : 'OUT';
    const userId = await getUserIdByEmail(user.email);

    const payload: Record<string, unknown> = {
      direction,
      scannedAt: new Date().toISOString(),
      scannerEmail: user.email,
      source: 'platform-qr',
    };

    if (userId) payload.user = userId;

    try {
      await strapiPost(getScanEndpoint(), { data: payload });
    } catch (error) {
      console.error('Gym tracker scan write failed:', error);
      return NextResponse.json(
        {
          success: false,
          error:
            'Unable to save scan in Strapi. Please verify GYM_TRACKER_SCAN_ENDPOINT and collection fields.',
        },
        { status: 502 }
      );
    }

    const refreshed = await getGymTrackerResponse();

    return NextResponse.json({
      ...refreshed,
      message: direction === 'IN' ? 'Entry scan recorded.' : 'Exit scan recorded.',
    });
  } catch (error) {
    console.error('Error in gym-tracker POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process QR scan' },
      { status: 500 }
    );
  }
}
