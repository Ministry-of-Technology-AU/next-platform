'use client';
import { Banner, BannerIcon, BannerTitle, BannerAction, BannerClose } from './ui/shadcn-io/banner';
import { Info } from 'lucide-react';
import { Dialog, DialogTrigger } from './ui/dialog';
import FeedbackDialog from './navbar/FeedbackDialog';

export function NewToolBanner({ className }: { className?: string }) {
    return (
        <Banner className={`sticky top-16 z-40 w-[calc(100%+1rem)] max-w-none -ml-2 -mr-2 xs:w-[calc(100%+1.5rem)] xs:-ml-3 xs:-mr-3 sm:w-[calc(100%+2rem)] sm:-ml-4 sm:-mr-4 md:w-[calc(100%+3rem)] md:-ml-6 md:-mr-6 lg:w-[calc(100%+4rem)] lg:-ml-8 lg:-mr-8 bg-primary ${className || ''}`}>
            <BannerIcon icon={Info} />
            <BannerTitle>Welcome! This is a new tool that we've launched. We hope you find this useful. Please do let us know your thoughts!</BannerTitle>
            <Dialog>
                <DialogTrigger asChild>
                    <BannerAction>Submit Feedback</BannerAction>
                </DialogTrigger>
                <FeedbackDialog isOpen={true} onClose={() => { }} />
            </Dialog>
            <BannerClose />
        </Banner>
    );
}
