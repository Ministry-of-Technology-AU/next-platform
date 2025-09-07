"use client";

import { useState, useEffect } from "react";
import { RotateCcw, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function OrientationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isCurrentlyPortrait = window.innerHeight > window.innerWidth;
      const isSmallScreen = window.innerWidth < 768; // md breakpoint
      
      setIsPortrait(isCurrentlyPortrait && isSmallScreen);
      
      // Show dialog only on small screens in portrait mode
      if (isCurrentlyPortrait && isSmallScreen) {
        setIsOpen(true);
      }
    };

    // Small delay to ensure proper initialization
    const timer = setTimeout(checkOrientation, 100);

    // Listen for orientation changes
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", () => {
      // Larger delay to ensure the orientation change is complete
      setTimeout(checkOrientation, 300);
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  // Auto-close when switching to landscape
  useEffect(() => {
    if (!isPortrait && isOpen) {
      setIsOpen(false);
    }
  }, [isPortrait, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Rotate Your Device
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-24 border-2 border-dashed border-muted-foreground rounded-lg mb-2">
                <RotateCcw className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              For the best viewing experience, please rotate your device to landscape orientation.
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Continue Anyway
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
