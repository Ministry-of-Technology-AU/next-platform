import Image from 'next/image';
import { ReactNode } from 'react';
import DeveloperCredits from '@/components/developer-credits';

interface ScoreboardLayoutProps {
    children: ReactNode;
    variant?: 'default' | 'admin';
}

import ThemeToggle from '@/components/ui/theme-toggle';

export function ScoreboardLayout({ children, variant = 'default' }: ScoreboardLayoutProps) {
    return (
        <div className={`relative w-full h-screen overflow-hidden flex flex-col items-center ${variant === 'admin' ? 'bg-background' : 'bg-black'}`}>
            {/* Background Image - Only show for default variant */}
            {variant === 'default' && (
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/scoreboard-bg.webp"
                        alt="Scoreboard Background"
                        fill
                        className="object-cover opacity-80"
                        priority
                    />
                </div>
            )}

            {/* Content Overlay */}
            <div className={`relative z-10 w-full flex-1 flex flex-col items-center justify-start p-4 lg:p-8 space-y-6 overflow-y-auto custom-scrollbar ${variant === 'admin' ? 'pt-4' : 'justify-center'}`}>

                {/* Powered By Header */}
                <div className="w-full text-center mb-2">
                    <p className={`text-xs uppercase tracking-[0.2em] font-black text-primary-bright dark:text-secondary`}>
                        Powered by Ministry of Technology
                    </p>
                </div>

                {/* Theme Toggle - Absolute Top Right */}
                <div className="absolute top-4 right-4 z-50">
                    <div className={`${variant === 'default' ? 'opacity-0 hover:opacity-100 transition-opacity' : ''}`}>
                        <ThemeToggle />
                    </div>
                </div>

                <div className="w-full max-w-5xl flex flex-col gap-6">
                    {children}
                </div>

                {/* Dev Credits Footer */}
                <div className="w-full backdrop-blur-xs">
                    <DeveloperCredits developers={[
                        {
                            name: "Soham Tulsyan",
                        },
                        {
                            name: "Eeshaja Swami"
                        },
                        {
                            name: "Amay Agarwal"
                        }
                    ]} />
                </div>
            </div>
        </div>
    );
}
