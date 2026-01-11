'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

interface UpdateItem {
    id: string;
    title: string;
    description: string;
    type: 'new' | 'improvement' | 'feature' | 'fix';
    link?: string;
    icon?: string;
}

interface WhatsNewData {
    version: string;
    lastUpdated: string;
    updates: UpdateItem[];
}

const STORAGE_KEY = 'whats-new-dismissed-version';

export function WhatsNewModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<WhatsNewData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [canDismiss, setCanDismiss] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch from JSON file (can be changed to API later)
                const response = await fetch('/whats-new.json');
                if (!response.ok) throw new Error('Failed to fetch');

                const whatsNewData: WhatsNewData = await response.json();
                setData(whatsNewData);

                // Check if user has already dismissed this version
                const dismissedVersion = localStorage.getItem(STORAGE_KEY);
                if (dismissedVersion !== whatsNewData.version) {
                    // Show modal after a small delay for page to load
                    setTimeout(() => {
                        setIsOpen(true);
                        // Allow dismiss after 1.5s
                        setTimeout(() => {
                            setCanDismiss(true);
                        }, 1500);
                    }, 1500);
                }
            } catch (error) {
                console.error('Failed to load What\'s New data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDismiss = () => {
        if (data) {
            localStorage.setItem(STORAGE_KEY, data.version);
        }
        setIsOpen(false);
    };

    const getTypeBadge = (type: UpdateItem['type']) => {
        switch (type) {
            case 'new':
                return <Badge className="bg-green/20 text-green-dark border-green/30 hover:bg-green/30">New</Badge>;
            case 'improvement':
                return <Badge className="bg-blue/20 text-blue-dark border-blue/30 hover:bg-blue/30">Improved</Badge>;
            case 'feature':
                return <Badge className="bg-purple/20 text-purple-dark border-purple/30 hover:bg-purple/30">Feature</Badge>;
            case 'fix':
                return <Badge className="bg-orange/20 text-orange-dark border-orange/30 hover:bg-orange/30">Fixed</Badge>;
            default:
                return null;
        }
    };

    if (isLoading || !data) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open && canDismiss) handleDismiss();
        }}>
            <DialogContent className="w-sm sm:mx-0 sm:w-2xl sm:max-w-2xl max-h-[80vh] overflow-hidden">
                <DialogHeader className="pb-2">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-primary" />
                        What's New
                    </DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto max-h-[60vh] pr-2 -mr-2">
                    <div className="grid grid-cols-1 gap-3">
                        {data.updates.map((update) => (
                            <Card
                                key={update.id}
                                className="border-border bg-card hover:bg-muted/50 transition-colors"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-sm">{update.title}</h3>
                                                {getTypeBadge(update.type)}
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {update.description}
                                            </p>
                                            {update.link && (
                                                <Link href={update.link}>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="h-auto p-0 mt-2 text-primary gap-1"
                                                    >
                                                        Try it out <ArrowRight size={14} />
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t h-[65px]">
                    {canDismiss && (
                        <Button onClick={handleDismiss} className="gap-2 animate-in fade-in zoom-in duration-300">
                            Got it!
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
