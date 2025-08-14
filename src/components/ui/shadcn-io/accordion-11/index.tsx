'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export type Accordion11Props = React.ComponentProps<typeof Accordion>;

export const Accordion11 = ({ className, ...props }: Accordion11Props) => (
  <Accordion className={cn('w-full space-y-2', className)} {...props} />
);

export type Accordion11ItemProps = React.ComponentProps<typeof AccordionItem>;

export const Accordion11Item = ({ className, ...props }: Accordion11ItemProps) => (
  <AccordionItem 
    className={cn(
      'bg-background has-focus-visible:border-ring has-focus-visible:ring-ring/50 rounded-md border px-4 py-1 outline-none last:border-b has-focus-visible:ring-[3px]',
      className
    )} 
    {...props} 
  />
);

export type Accordion11TriggerProps = React.ComponentProps<typeof AccordionTrigger>;

export const Accordion11Trigger = ({ className, ...props }: Accordion11TriggerProps) => (
  <AccordionTrigger 
    className={cn('py-2 text-[15px] leading-6 hover:no-underline focus-visible:ring-0', className)} 
    {...props} 
  />
);

export type Accordion11ContentProps = React.ComponentProps<typeof AccordionContent>;

export const Accordion11Content = ({ className, ...props }: Accordion11ContentProps) => (
  <AccordionContent 
    className={cn('text-muted-foreground pb-2', className)} 
    {...props} 
  />
);