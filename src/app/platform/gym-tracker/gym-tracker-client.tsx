"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, QrCode, RefreshCw, Users, Dumbbell } from 'lucide-react';

type ChartMode = 'density' | 'trend';

interface TrendPoint {
  hour: number;
  label: string;
  count: number;
}

interface GymTrackerPayload {
  success: boolean;
  source: 'strapi' | 'mock';
  totalVisitors: number;
  liveCount: number;
  trend: TrendPoint[];
  density: {
    am: number[];
    pm: number[];
  };
  peakHourLabel: string;
  recommendation: string;
  lastUpdatedAt: string;
  error?: string;
}

const densityScale = ['#d8ecfb', '#a9d3f3', '#7bb9eb', '#4999db', '#1f79c6', '#155fa2'];

function getDensityColor(value: number, max: number): string {
  if (max <= 0) return densityScale[0];
  const ratio = value / max;

  if (ratio >= 0.85) return densityScale[5];
  if (ratio >= 0.7) return densityScale[4];
  if (ratio >= 0.5) return densityScale[3];
  if (ratio >= 0.3) return densityScale[2];
  if (ratio >= 0.15) return densityScale[1];
  return densityScale[0];
}

function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

function TrendAreaChart({ values }: { values: number[] }) {
  const width = 860;
  const height = 260;
  const paddingX = 16;
  const paddingY = 18;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const max = Math.max(1, ...values);

  const points = values.map((value, index) => {
    const x = paddingX + (chartWidth / Math.max(1, values.length - 1)) * index;
    const y = paddingY + chartHeight - (value / max) * chartHeight;
    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPath = `${linePath} L ${paddingX + chartWidth} ${paddingY + chartHeight} L ${paddingX} ${paddingY + chartHeight} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[700px]" role="img" aria-label="People over time area chart">
        <defs>
          <linearGradient id="gymTrendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f79c6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1f79c6" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((step, idx) => {
          const y = paddingY + chartHeight * step;
          return (
            <line
              key={idx}
              x1={paddingX}
              x2={paddingX + chartWidth}
              y1={y}
              y2={y}
              stroke="currentColor"
              className="text-border"
              strokeWidth="1"
            />
          );
        })}

        <path d={areaPath} fill="url(#gymTrendGradient)" />
        <path d={linePath} fill="none" stroke="#1764ae" strokeWidth="3" strokeLinecap="round" />

        {points.filter((_, index) => index % 3 === 0).map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={height - 6}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="11"
          >
            {index * 3}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function GymTrackerClient() {
  const [mode, setMode] = useState<ChartMode>('density');
  const [data, setData] = useState<GymTrackerPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState<'enter' | 'exit' | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/platform/gym-tracker', { cache: 'no-store' });
      const payload = (await response.json()) as GymTrackerPayload;

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Could not load gym tracker data');
      }

      setData(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error while loading gym tracker';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const postScan = useCallback(
    async (action: 'enter' | 'exit') => {
      setScanLoading(action);
      setError(null);

      try {
        const response = await fetch('/api/platform/gym-tracker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });

        const payload = (await response.json()) as GymTrackerPayload;

        if (!response.ok || !payload.success) {
          throw new Error(payload.error || 'Could not record scan');
        }

        setData(payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error while recording scan';
        setError(message);
      } finally {
        setScanLoading(null);
      }
    },
    []
  );

  const trendValues = useMemo(() => data?.trend.map((point) => point.count) || new Array(24).fill(0), [data]);
  const maxDensity = useMemo(() => {
    if (!data) return 0;
    return Math.max(0, ...data.density.am, ...data.density.pm);
  }, [data]);

  const crowdMessage = useMemo(() => {
    const count = data?.liveCount || 0;
    if (count <= 8) return 'Light crowd, ideal for focused workouts.';
    if (count <= 18) return 'Solid crowd, keep the momentum going.';
    return 'Peak hours right now, plan your sets smartly.';
  }, [data]);

  if (loading) {
    return (
      <Card className="border border-border rounded-3xl">
        <CardContent className="p-8 flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading gym insights...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Exercise Tracker CTA */}
      <Link href="/platform/gym-tracker/exercise-tracker">
        <Card className="rounded-3xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg">Exercise Tracker</p>
              <p className="text-sm text-muted-foreground">Log sets, reps & weight. Track your progress over time.</p>
            </div>
            <Activity className="h-5 w-5 text-primary shrink-0" />
          </CardContent>
        </Card>
      </Link>

      {error && (
        <Card className="border border-red-200 dark:border-red-900 rounded-3xl">
          <CardContent className="p-4 text-sm text-red-600 dark:text-red-300 flex items-center justify-between gap-3">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => void fetchData()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1.1fr] gap-5">
        <Card className="rounded-3xl border border-border">
          <CardContent className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-3xl sm:text-4xl font-semibold text-left">Hourly Gym Activity</h3>
                <p className="text-muted-foreground text-sm sm:text-base text-left">
                  Estimated people present using last week&apos;s scan pattern
                </p>
              </div>

              <div className="rounded-full border border-blue-light bg-blue-dark/5 p-1 inline-flex">
                <button
                  type="button"
                  onClick={() => setMode('density')}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    mode === 'density' ? 'bg-blue text-white' : 'text-blue-dark dark:text-blue-light'
                  }`}
                >
                  Density Map
                </button>
                <button
                  type="button"
                  onClick={() => setMode('trend')}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    mode === 'trend' ? 'bg-blue text-white' : 'text-blue-dark dark:text-blue-light'
                  }`}
                >
                  People Over Time
                </button>
              </div>
            </div>

            {mode === 'density' ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-muted-foreground text-sm text-left">Total Count (Last Week)</p>
                    <p className="text-3xl sm:text-4xl font-semibold text-left">{data?.totalVisitors ?? 0} Visitors</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {densityScale.map((color, index) => (
                      <span key={index} className="h-3 w-8 rounded-sm" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[620px]">
                    <div className="grid grid-cols-[56px_repeat(12,minmax(0,1fr))] gap-1 mb-1">
                      <span />
                      {Array.from({ length: 12 }, (_, i) => (
                        <span key={i} className="text-[11px] text-muted-foreground text-center">
                          {formatHourLabel(i).replace(' AM', '').replace(' PM', '')}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-[56px_repeat(12,minmax(0,1fr))] gap-1 items-center mb-1">
                      <span className="text-left text-xl font-medium">AM</span>
                      {(data?.density.am || []).map((value, i) => (
                        <div
                          key={`am-${i}`}
                          className="h-10 rounded-sm border border-white/20"
                          style={{ backgroundColor: getDensityColor(value, maxDensity) }}
                          title={`${formatHourLabel(i)}: ${value} estimated people`}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-[56px_repeat(12,minmax(0,1fr))] gap-1 items-center">
                      <span className="text-left text-xl font-medium">PM</span>
                      {(data?.density.pm || []).map((value, i) => (
                        <div
                          key={`pm-${i}`}
                          className="h-10 rounded-sm border border-white/20"
                          style={{ backgroundColor: getDensityColor(value, maxDensity) }}
                          title={`${formatHourLabel(i + 12)}: ${value} estimated people`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <TrendAreaChart values={trendValues} />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border">
          <CardContent className="p-5 sm:p-6 h-full flex flex-col">
            <h3 className="text-3xl sm:text-4xl font-semibold text-left">Live Count</h3>
            <p className="text-muted-foreground text-sm sm:text-base mt-1 text-left">
              Based on QR scans at the gym entry and exit points
            </p>

            <div className="flex-1 flex flex-col items-center justify-center py-6">
              <p className="text-8xl sm:text-9xl font-semibold text-green-dark dark:text-green-light leading-none">
                {data?.liveCount ?? 0}
              </p>
              <p className="mt-4 text-green-dark/80 dark:text-green-light text-sm text-center">
                Last updated at{' '}
                {data?.lastUpdatedAt
                  ? new Date(data.lastUpdatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                  : '--'}
              </p>
              <p className="mt-6 text-xl text-center">{crowdMessage}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="rounded-3xl border border-border">
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              <h3 className="text-2xl sm:text-3xl font-semibold text-left">QR Scan Actions</h3>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground text-left">
              This panel writes scans to Strapi. Hook these actions to your QR scanner flow for entry and exit events.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button
                onClick={() => void postScan('enter')}
                disabled={scanLoading !== null}
                className="bg-green-dark hover:bg-green text-white"
              >
                {scanLoading === 'enter' ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
                Simulate Entry Scan
              </Button>
              <Button
                onClick={() => void postScan('exit')}
                disabled={scanLoading !== null}
                variant="outline"
              >
                {scanLoading === 'exit' ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Activity className="h-4 w-4 mr-2" />}
                Simulate Exit Scan
              </Button>
              <Button variant="ghost" onClick={() => void fetchData()} disabled={scanLoading !== null}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border">
          <CardContent className="p-5 sm:p-6 space-y-3">
            <h3 className="text-2xl sm:text-3xl font-semibold text-left">Weekly Insights</h3>
            <p className="text-base sm:text-lg text-left">
              Peak occupancy window: <span className="font-semibold">{data?.peakHourLabel || '--'}</span>
            </p>
            <p className="text-muted-foreground text-sm sm:text-base text-left">
              {data?.recommendation || 'No trend data available yet.'}
            </p>
            <p className="text-xs text-muted-foreground pt-2 text-left">
              Data source: {data?.source === 'strapi' ? 'Strapi QR scan records' : 'Mock fallback (configure Strapi endpoint)'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
