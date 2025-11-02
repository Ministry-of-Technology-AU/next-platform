import { DialogTitle, DialogContent, DialogHeader, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import * as React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

export default function FeedbackDialog({ isOpen, onClose, pageName }: { isOpen: boolean; onClose: () => void; pageName?: string }) {
    const [feedback, setFeedback] = React.useState('');
    const [isPageSpecific, setIsPageSpecific] = React.useState(false);
    const [sending, setSending] = React.useState(false);
    const [sent, setSent] = React.useState(false);

    const resolvedPageName = React.useMemo(() => {
      if (isPageSpecific) {
        if (pageName) return pageName;
        if (typeof window !== 'undefined') return window.location.pathname || 'current page';
        return 'current page';
      }
      return 'general';
    }, [isPageSpecific, pageName]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!feedback.trim()) return;
      setSending(true);
      try {
        const res = await fetch('/api/platform/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback, page: isPageSpecific ? resolvedPageName : 'general' }),
        });
        if (!res.ok) throw new Error('Failed to send feedback');
        setSent(true);
        setFeedback('');
        // close after a short delay to show success
        setTimeout(() => {
          setSent(false);
          onClose();
        }, 800);
      } catch (err) {
        console.error(err);
        // keep dialog open for retry
      } finally {
        setSending(false);
      }
    };

    return(
        <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Your Feedback</DialogTitle>
                <DialogDescription>
                  We appreciate your feedback! Please share your thoughts or
                  report issues.
                </DialogDescription>
                <form className="mt-4" onSubmit={handleSubmit}>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full p-2 border border-border rounded-md"
                    rows={4}
                    placeholder="Type your feedback here..."
                  />

                  <div className="mt-3 flex items-center gap-2">
                    <Checkbox
                      id="feedback-page-specific"
                      checked={isPageSpecific}
                      onCheckedChange={(val) => setIsPageSpecific(Boolean(val))}
                    />
                    <label htmlFor="feedback-page-specific" className="text-sm">This feedback is page-specific</label>
                  </div>

                  {isPageSpecific && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Writing Feedback for <span className="font-medium">{resolvedPageName}</span>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Button type="submit" disabled={sending}>
                      {sending ? 'Sending...' : sent ? 'Sent' : 'Submit'}
                    </Button>
                  </div>
                </form>
              </DialogHeader>
            </DialogContent>
    )
}