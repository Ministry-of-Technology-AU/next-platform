import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Activity, Dumbbell } from 'lucide-react';

export default function SportsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Sports Portal</h1>
        <p className="text-muted-foreground text-lg">
          Follow live matches, view leaderboards, and check detailed statistics for campus sports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/platform/gym-tracker" className="group">
          <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Dumbbell className="w-24 h-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-primary" />
                Gym Tracker
              </CardTitle>
              <CardDescription className="text-base">
                Live Occupancy and Heatmap
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track last-week occupancy trends, view live gym count via QR scans, and identify the best low-crowd workout windows.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/platform/sports/aba" className="group">
          <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="w-24 h-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="w-6 h-6 text-primary" />
                ABA
              </CardTitle>
              <CardDescription className="text-base">
                Ashoka Basketball Association
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View live scores, match schedules, the group and knockout stage leaderboards, and detailed player statistics for the ABA season.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/platform/sports/apl" className="group">
          <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-24 h-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                APL
              </CardTitle>
              <CardDescription className="text-base">
                Ashoka Premier League
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Coming soon. The portal for the Ashoka Premier League football league.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
