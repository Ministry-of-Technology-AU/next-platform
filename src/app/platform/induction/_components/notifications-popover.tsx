import * as React from 'react';
import Link from 'next/link';
import { Bell, Calendar, ArrowRight } from 'lucide-react';
import { PopulatedResponseRecord } from '@/lib/forms/strapi-forms';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface NotificationsPopoverProps {
  applications: PopulatedResponseRecord[];
}

export function NotificationsPopover({ applications }: NotificationsPopoverProps) {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const notifications = applications.map(app => {
    const org = app.form?.organisation;
    const deadlineStr = app.form?.endDate || org?.induction_end;
    const deadline = deadlineStr ? new Date(deadlineStr) : null;
    const interviewUrl = app.interviewDetails?.bookingUrl;
    
    if (app.applicationStatus === 'advanced' || app.applicationStatus === 'approved' || app.applicationStatus === 'rejected') {
      const statusTitle =
        app.applicationStatus === 'advanced'
          ? 'Application Advanced!'
          : app.applicationStatus === 'approved'
          ? 'Application Approved!'
          : 'Application Update';
      
      const message =
        app.applicationStatus === 'advanced' && interviewUrl
          ? `${org?.name || 'Organisation'} has advanced you. Click to schedule your interview slot.`
          : `${org?.name || 'Organisation'} has updated your application status to ${app.applicationStatus}.`;

      return {
        id: `update-${app.id}`,
        title: statusTitle,
        message,
        type: app.applicationStatus,
        url: interviewUrl || `/platform/induction`,
        date: new Date(app.lastSavedAt || now)
      };
    }
    
    if (app.state === 'draft' && deadline && deadline > now && deadline <= threeDaysFromNow) {
      return {
        id: `deadline-${app.id}`,
        title: 'Deadline Approaching',
        message: `Your draft application for ${org?.name} is due on ${deadline.toLocaleDateString()}.`,
        type: 'warning',
        url: app.form?.uid ? `/platform/forms/${app.form.uid}` : `/platform/induction`,
        date: now
      };
    }
    
    return null;
  }).filter(Boolean).sort((a, b) => b!.date.getTime() - a!.date.getTime());

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full h-10 w-10 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <Bell className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-neutral-900" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 border-neutral-200 dark:border-neutral-800">
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
          <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">Application Updates</h4>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-neutral-500">No new updates right now.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif, i) => (
                <Link
                  key={notif!.id}
                  href={notif!.url}
                  className={`p-4 ${i !== notifications.length - 1 ? 'border-b border-neutral-100 dark:border-neutral-800' : ''} hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors block`}
                >
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1 flex items-center justify-between">
                    <span>{notif!.title}</span>
                    <ArrowRight className="h-3 w-3 opacity-60" />
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {notif!.message}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
