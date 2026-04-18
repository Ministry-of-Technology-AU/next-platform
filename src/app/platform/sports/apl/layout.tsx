'use client';

import { ReactNode, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CloudRain } from 'lucide-react';

export default function APLLayout({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  // useEffect(() => {
  //   let timeoutId: NodeJS.Timeout;

  //   if (!isOpen) {
  //     // relaunch every 30s if dismissed
  //     timeoutId = setTimeout(() => {
  //       setIsOpen(true);
  //     }, 15000);
  //   }

  //   return () => {
  //     if (timeoutId) clearTimeout(timeoutId);
  //   };
  // }, [isOpen]);

  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={true}>
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <CloudRain className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">Tool Temporarily Suspended</DialogTitle>
            <DialogDescription className="text-base mt-2">
              This tool is temporarily suspended because of the weather. We'll try to get back online ASAP
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog> */}
      <main className="flex-1 w-full max-w-7xl mx-auto relative">
        {children}
      </main>
    </div>
  );
}




