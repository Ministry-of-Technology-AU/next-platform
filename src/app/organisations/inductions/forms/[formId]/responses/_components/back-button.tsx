'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  fallbackUrl?: string;
  label?: string;
}

export function BackButton({
  fallbackUrl = '/organisations/inductions',
  label = 'Back',
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="gap-1.5 text-muted-foreground -ml-2 hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
