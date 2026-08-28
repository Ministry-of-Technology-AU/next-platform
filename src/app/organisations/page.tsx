"use client";
import PageTitle from "@/components/page-title";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, UserCog, Clock, ArrowRight, LayoutDashboard, UserCheck } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
    return (
        <div className="container max-w-6xl mx-auto pt-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <PageTitle
                text="Organisation Portal"
                icon={LayoutDashboard}
                subheading="Welcome! Manage your club's presence, advertise events, and update catalog information for the student body."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Advertisements Card */}
                <Card className="flex flex-col h-full border border-border/80 bg-white/50 dark:bg-black/50 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-6">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary dark:text-primary-bright">
                            <Megaphone className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-xl font-bold !text-left">Advertisements</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground !text-left">Live now</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-between p-6 pt-0 space-y-6">
                        <p className="text-sm text-muted-foreground text-left sm:pl-[72px]">
                            Design and publish advertisements to display across the student platform. Promote your upcoming events, recruitment drives, and initiatives directly to the student body.
                        </p>
                        <Button asChild className="w-full mt-auto">
                            <Link href="/organisations/ads" className="flex items-center justify-center gap-2">
                                Go to Ads Manager <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Organisation Profile Card */}
                <Card className="flex flex-col h-full border border-border/80 bg-white/50 dark:bg-black/50 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-6">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary dark:text-primary-bright">
                            <UserCog className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-xl font-bold !text-left">Organisation Profile</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground !text-left">Live now</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-between p-6 pt-0 space-y-6">
                        <p className="text-sm text-muted-foreground text-left sm:pl-[72px]">
                            Manage your organisation's identity. Update your description, logo, banner, tagline, and details displayed publicly in the Organisations Catalogue.
                        </p>
                        <Button asChild className="w-full mt-auto">
                            <Link href="/organisations/profile" className="flex items-center justify-center gap-2">
                                Manage Profile <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Inductions Tracker Card */}
            <div className="pt-4">
                <Card className="border border-border/80 bg-white/50 dark:bg-black/50 backdrop-blur-md p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary dark:text-primary-bright">
                            <UserCheck className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-lg !text-left">Inductions Tracker</h4>
                            <p className="text-sm text-muted-foreground">Monitor candidate registration progress, verify profile requirements, and oversee your recruitment pipeline.</p>
                        </div>
                    </div>
                    <Button asChild className="w-full md:w-auto shrink-0">
                        <Link href="/organisations/profile" className="flex items-center justify-center gap-2">
                            Go to Tracker <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </Card>
            </div>

            {/* Coming Soon Card */}
            <div className="pt-4">
                <Card className="border border-border/60 bg-white/30 dark:bg-black/30 backdrop-blur-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gray-200 dark:bg-neutral-800 text-gray-500">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-lg !text-left">Inductions Platform</h4>
                            <p className="text-sm text-muted-foreground">Coming Soon • SG-Inductions portal is currently in development.</p>
                        </div>
                    </div>
                    <Button variant="outline" disabled className="w-full md:w-auto">
                        Coming Soon
                    </Button>
                </Card>
            </div>

            <div className="pt-8 text-center space-y-2">
                <p className="text-sm text-muted-foreground">Looking for the student-facing dashboard?</p>
                <Button variant="link" asChild>
                    <Link href="/platform">
                        Go to Platform
                    </Link>
                </Button>
            </div>
        </div>
    );
}