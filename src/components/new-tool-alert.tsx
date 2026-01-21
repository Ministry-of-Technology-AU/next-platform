'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Announcement, AnnouncementTitle, AnnouncementTag } from "@/components/ui/shadcn-io/announcement";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface NewToolAlertProps {
    href: string;
    title: string;
    className?: string;
    checkSeenKey?: string;
    blockIfNewVersion?: boolean;
}

const WHATS_NEW_STORAGE_KEY = 'whats-new-dismissed-version';

export function NewToolAlert({ href, title, className, checkSeenKey, blockIfNewVersion }: NewToolAlertProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Don't show the alert if we're already on the page it's linking to
        if (pathname === href || pathname.startsWith(href + '/')) {
            return;
        }

        // Check if user has already seen this tool
        if (checkSeenKey) {
            const hasSeen = localStorage.getItem(checkSeenKey);
            if (hasSeen) return;
        }

        // Check if there is a new version pending (so we show the modal instead of this alert first)
        // AND check if the user has ALREADY dismissed the current version (so modal won't show).
        // If modal WILL show, we hide this.
        if (blockIfNewVersion) {
            // We need to know the current version to check against storage.
            // Since we don't have it passed prop, we might need to fetch it or assume logic.
            // Simplified logic: If we want to prioritize the Modal, we should wait until the Modal has been dismissed.
            // Use the same key as WhatsNewModal
            const dismissedVersion = localStorage.getItem(WHATS_NEW_STORAGE_KEY);
            // If NO version is dismissed, it implies a new user or new update -> Modal likely to show -> Hide Alert
            if (!dismissedVersion) return;
        }

        // Show the component immediately (but off-screen)
        setIsVisible(true);
        // Animate it in after a brief delay to ensure initial render
        const timer = setTimeout(() => {
            setIsAnimating(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, [pathname, href, checkSeenKey, blockIfNewVersion]);

    const handleDismiss = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setIsVisible(false);
        }, 300); // Wait for animation to complete
    };

    if (!isVisible) return null;

    return (
        <div
            className={`hidden md:block fixed top-20 right-4 z-[100] transition-all duration-300 ease-out ${isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                } ${className || ''}`}
        >
            <div className="relative">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDismiss}
                    className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-background border border-border hover:bg-destructive hover:text-destructive-foreground z-10 shadow-md"
                    aria-label="Dismiss notification"
                >
                    <X className="h-3 w-3" />
                </Button>
                <Announcement className="bg-green/20 shadow-lg border-green/30">
                    <AnnouncementTitle>
                        <AnnouncementTag className="bg-green/50 ml-1">New Feature Added!</AnnouncementTag>
                        <Button
                            variant="animatedGhost"
                            className="text-left underline text-sm hover:text-primary"
                            onClick={() => (window.location.href = href)}
                        >
                            Check out {title}!
                        </Button>
                    </AnnouncementTitle>
                </Announcement>
            </div>
        </div>
    );
}