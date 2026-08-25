'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  Calendar,
  ClockPlus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CheckCheck,
  Inbox,
} from 'lucide-react';
import { Organization } from '../../organisations-catalog/types';
import { PopulatedResponseRecord } from '@/lib/forms/strapi-forms';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NotificationsPopoverProps {
  applications: PopulatedResponseRecord[];
  organizations?: Organization[];
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'advanced' | 'approved' | 'rejected' | 'warning' | 'info';
  url: string;
  date: Date;
  actionText?: string;
  isBroadcast?: boolean;
}

const STORAGE_KEY = 'induction_seen_notification_ids';

export function NotificationsPopover({ applications, organizations = [] }: NotificationsPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [seenIds, setSeenIds] = React.useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = React.useState(false);

  // Load seen notification IDs from localStorage on mount
  React.useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSeenIds(new Set(parsed));
        }
      }
    } catch (e) {
      console.error('Failed to parse seen notifications from localStorage', e);
    }
  }, []);

  const notifications = React.useMemo<NotificationItem[]>(() => {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const notifMap = new Map<string, NotificationItem>();

    // 1. Campus-wide Broadcast: Deadline Extensions for ALL recruiting organizations
    for (const org of organizations) {
      if (org.inductionsOpen && org.deadlineExtension) {
        const ext = org.deadlineExtension;
        const formattedDate = new Date(ext.newDeadline).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        // Keyed per cycle: an org running two drives can extend either one.
        const notifId = `deadline-ext-${org.id}-${org.cycleId ?? 'org'}-${ext.extendedAt || ext.newDeadline}`;
        
        notifMap.set(notifId, {
          id: notifId,
          title: `Deadline Extended · ${org.name}${org.cycleName ? ` (${org.cycleName})` : ''}`,
          message: `${org.name} has extended the induction application deadline to ${formattedDate}.${
            ext.reason ? ` Reason: "${ext.reason}"` : " Don't miss your chance to apply!"
          }`,
          type: 'info' as const,
          url: `/platform/inductions?tab=catalog&search=${encodeURIComponent(org.name)}`,
          date: new Date(ext.extendedAt || now),
          actionText: 'Explore & Apply',
          isBroadcast: true,
        });
      }
    }

    // 2. Personal Application Notifications (Status Updates, Interviews, Approaching Deadlines)
    for (const app of applications) {
      const org = app.form?.organisation;
      const deadlineStr = app.form?.endDate || org?.induction_end;
      const deadline = deadlineStr ? new Date(deadlineStr) : null;
      
      // Extract interview booking link from message if present as fallback
      const interviewLinkMatch = app.statusMessage?.match(
        /\/platform\/inductions?\/interviews\/[a-zA-Z0-9_-]+/i,
      );
      let interviewUrl = app.interviewDetails?.bookingUrl || (interviewLinkMatch ? interviewLinkMatch[0] : null);
      if (interviewUrl && interviewUrl.includes('/platform/induction/')) {
        interviewUrl = interviewUrl.replace('/platform/induction/', '/platform/inductions/');
      }

      if (
        app.applicationStatus === 'advanced' ||
        app.applicationStatus === 'approved' ||
        app.applicationStatus === 'rejected'
      ) {
        const isAdvanced = app.applicationStatus === 'advanced';
        const isApproved = app.applicationStatus === 'approved';

        const statusTitle = isAdvanced
          ? 'Application Advanced!'
          : isApproved
          ? 'Application Approved!'
          : 'Application Update';

        const message =
          isAdvanced && interviewUrl
            ? `${org?.name || 'Organisation'} has advanced your application. Click to select your interview slot.`
            : isAdvanced
            ? `${org?.name || 'Organisation'} has advanced your application to the next round.`
            : isApproved
            ? `Congratulations! ${org?.name || 'Organisation'} has selected you for the role.`
            : `${org?.name || 'Organisation'} has updated your application status.`;

        const actionText = isAdvanced && interviewUrl ? 'Book Slot' : 'View Update';
        const notifId = `update-${app.id}-${app.applicationStatus}-${app.currentRound || 0}`;

        notifMap.set(notifId, {
          id: notifId,
          title: statusTitle,
          message,
          type: app.applicationStatus as 'advanced' | 'approved' | 'rejected',
          url: interviewUrl || `/platform/inductions`,
          date: new Date(app.lastSavedAt || app.submittedAt || now),
          actionText,
        });
      }

      if (app.state === 'draft' && deadline && deadline > now && deadline <= threeDaysFromNow) {
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const notifId = `deadline-${app.id}-${deadline.toISOString().slice(0, 10)}`;
        notifMap.set(notifId, {
          id: notifId,
          title: 'Application Deadline Approaching',
          message: `Your draft application for ${org?.name || 'Organisation'} is due in ${
            daysLeft === 1 ? '1 day' : `${daysLeft} days`
          } (${deadline.toLocaleDateString()}).`,
          type: 'warning' as const,
          url: app.form?.uid ? `/platform/forms/${app.form.uid}` : `/platform/inductions`,
          date: now,
          actionText: 'Resume Application',
        });
      }
    }

    return Array.from(notifMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [applications, organizations]);

  // Compute unread count based on unseen notifications
  const unreadCount = React.useMemo(() => {
    if (!isMounted) return 0;
    return notifications.filter((n) => !seenIds.has(n.id)).length;
  }, [notifications, seenIds, isMounted]);

  const markAllAsRead = React.useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    const updated = new Set([...seenIds, ...allIds]);
    setSeenIds(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(updated)));
    } catch (e) {
      console.error('Failed to save seen notifications to localStorage', e);
    }
  }, [notifications, seenIds]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      // Dismiss the notification badge upon opening
      markAllAsRead();
    }
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'advanced':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info':
        return <ClockPlus className="w-4 h-4 text-amber-500" />;
      default:
        return <Calendar className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          data-tour="tour-notifications"
          className="relative rounded-xl h-10 w-10 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-xs"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs ring-2 ring-background animate-in zoom-in-50">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 rounded-2xl border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden bg-card"
      >
        <div className="p-4 border-b border-border/60 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-foreground">Application Updates</h4>
            {unreadCount > 0 ? (
              <Badge variant="secondary" className="bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 text-[10px] px-1.5 py-0 font-medium">
                {unreadCount} new
              </Badge>
            ) : null}
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[360px] overflow-y-auto divide-y divide-border/40">
          {notifications.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Inbox className="w-5 h-5 opacity-60" />
              </div>
              <p className="text-sm font-medium text-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                You'll receive notifications here when organizations update your application or post interview slots.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = !seenIds.has(notif.id);
              return (
                <Link
                  key={notif.id}
                  href={notif.url}
                  onClick={() => setOpen(false)}
                  className={`p-4 hover:bg-muted/50 transition-colors flex items-start gap-3 relative group ${
                    isUnread ? 'bg-primary/5 dark:bg-primary/10' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-foreground truncate">{notif.title}</p>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-muted-foreground">
                        {notif.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      {notif.actionText && (
                        <span className="text-[11px] font-medium text-primary flex items-center gap-0.5 group-hover:underline">
                          {notif.actionText}
                          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

