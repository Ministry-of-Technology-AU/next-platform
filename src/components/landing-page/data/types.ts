import { Button } from '@/components/ui/button';

// 1. Add a type for allowed button variants and for banner buttons:
export type ButtonVariant = "default" | "outline" | "link" | "destructive" | "secondary" | "ghost" | "animated" | "animatedGhost";
// 1. Update the BannerButton type to clarify className is supported:
export type BannerButton = React.ComponentProps<typeof Button> & {
  variant?: ButtonVariant;
  className?: string; // Allows full customization
};