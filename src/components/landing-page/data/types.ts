import { Button } from '@/components/ui/button';

// 1. Add a type for allowed button variants and for banner buttons:
export type ButtonVariant = "default" | "outline" | "link" | "destructive" | "secondary" | "ghost" | "animated" | "animatedGhost";
// 1. Update the BannerButton type to clarify className is supported:
export type BannerButton = React.ComponentProps<typeof Button> & {
  variant?: ButtonVariant;
  className?: string; // Allows full customization
  url?: string; // Support for links (especially for JSON data from Strapi)
  style?: React.CSSProperties; // Detailed inline styling support
};

export interface Advertisement {
  id: number;
  attributes: {
    title: string;
    subtitle: string;
    description: string;
    gradient: string;
    order: number;
    banner_url?: string; // The Google Drive embed link
    buttons?: any; // JSON type in Strapi
  }
}