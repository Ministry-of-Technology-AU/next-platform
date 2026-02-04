import Image from 'next/image';
import { ReactNode } from 'react';

interface ScoreboardLayoutProps {
    children: ReactNode;
}

export function ScoreboardLayout({ children }: ScoreboardLayoutProps) {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/scoreboard-bg.webp"
                    alt="Scoreboard Background"
                    fill
                    className="object-cover opacity-80"
                    priority
                />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-start w-full h-full p-4 lg:p-8 space-y-6">
                <div className="w-full max-w-5xl flex flex-col gap-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
