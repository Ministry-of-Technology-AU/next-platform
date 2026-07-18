'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormThemeRoot } from '@/components/forms/form-theme-root';
import { FormBlocks } from '@/components/forms/form-renderer';
import { visiblePages, visibleBlocks } from '@/lib/forms/conditions';
import { buildResponseValidator } from '@/lib/forms/validator';
import { isInputBlock, type FormSchema, type FileDescriptor } from '@/lib/forms/schema';
import { PageNavigator } from './_components/page-navigator';
import { SubmissionPreview } from './_components/submission-preview';
import { ConfirmationScreen } from './_components/confirmation-screen';

type Phase = 'loading' | 'filling' | 'previewing' | 'submitted' | 'already';
type Answers = Record<string, unknown>;

interface FillerClientProps {
  uid: string;
  title: string;
  schema: FormSchema;
  userEmail: string;
}

const AUTOSAVE_MS = 60_000;

function initialAnswers(schema: FormSchema): Answers {
  const a: Answers = {};
  for (const page of schema.pages) {
    for (const block of page.blocks) {
      if (isInputBlock(block) && 'defaultValue' in block && block.defaultValue !== undefined) {
        a[block.id] = block.defaultValue;
      }
    }
  }
  return a;
}

export function FillerClient({ uid, title, schema, userEmail }: FillerClientProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [answers, setAnswers] = useState<Answers>(() => initialAnswers(schema));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentPageId, setCurrentPageId] = useState(schema.pages[0]?.id ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [confirmation, setConfirmation] = useState({
    title: schema.settings.confirmationTitle,
    html: schema.settings.confirmationHtml,
  });

  const validate = useMemo(() => buildResponseValidator(schema), [schema]);
  const draftKey = `form-draft:${uid}:${userEmail}`;

  // Latest answers in a ref for beacon / unmount flush.
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const dirtyRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const responseUrl = `/api/platform/forms/${uid}/response`;

  // ----- Persistence -----

  const persistLocal = useCallback(
    (data: Answers) => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ data, savedAt: Date.now() }));
      } catch {
        /* storage full / disabled — ignore */
      }
    },
    [draftKey],
  );

  const saveDraft = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!dirtyRef.current) return;
      const data = answersRef.current;
      persistLocal(data);
      try {
        const res = await fetch(responseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data }),
        });
        if (res.ok) {
          dirtyRef.current = false;
          setSavedAt(Date.now());
          if (!opts?.silent) toast.success('Draft saved');
        } else if (!opts?.silent) {
          toast.error('Could not save draft');
        }
      } catch {
        if (!opts?.silent) toast.error('Could not save draft');
      }
    },
    [persistLocal, responseUrl],
  );

  // Mount: record visit + hydrate any existing draft (server + localStorage).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Fire-and-forget visit tracking.
      fetch(`/api/platform/forms/${uid}/visit`, { method: 'POST' }).catch(() => {});

      let serverData: Answers | null = null;
      let serverSavedAt = 0;
      try {
        const res = await fetch(responseUrl, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          const row = json?.data;
          if (row?.state === 'submitted') {
            if (!cancelled) setPhase('already');
            return;
          }
          if (row?.data && typeof row.data === 'object') {
            serverData = row.data as Answers;
            serverSavedAt = row.lastSavedAt ? Date.parse(row.lastSavedAt) : 0;
          }
        }
      } catch {
        /* offline / route not ready — fall back to local */
      }

      // Prefer the newer of localStorage vs server.
      let localData: Answers | null = null;
      let localSavedAt = 0;
      try {
        const raw = localStorage.getItem(draftKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          localData = parsed?.data ?? null;
          localSavedAt = parsed?.savedAt ?? 0;
        }
      } catch {
        /* ignore */
      }

      if (cancelled) return;
      const useLocal = localData && localSavedAt > serverSavedAt;
      const restored = useLocal ? localData : serverData;
      if (restored) {
        setAnswers((prev) => ({ ...prev, ...restored }));
        if (useLocal) {
          // Local copy is newer than the server — push it up.
          dirtyRef.current = true;
          void saveDraft({ silent: true });
        }
      }
      setPhase('filling');
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // Debounced autosave (60s), reset on every change while dirty.
  useEffect(() => {
    if (phase !== 'filling' && phase !== 'previewing') return;
    if (!dirtyRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void saveDraft({ silent: true }), AUTOSAVE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [answers, phase, saveDraft]);

  // Flush on tab hide (sendBeacon) + unmount (keepalive fetch).
  useEffect(() => {
    const flushBeacon = () => {
      if (!dirtyRef.current) return;
      const body = JSON.stringify({ data: answersRef.current });
      persistLocal(answersRef.current);
      try {
        const blob = new Blob([body], { type: 'text/plain' });
        navigator.sendBeacon(responseUrl, blob);
        dirtyRef.current = false;
      } catch {
        /* ignore */
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushBeacon();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (dirtyRef.current) {
        try {
          fetch(responseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: answersRef.current }),
            keepalive: true,
          }).catch(() => {});
        } catch {
          /* ignore */
        }
      }
    };
  }, [persistLocal, responseUrl]);

  // ----- Editing -----

  const handleChange = useCallback((blockId: string, value: unknown) => {
    dirtyRef.current = true;
    setAnswers((prev) => ({ ...prev, [blockId]: value }));
    setErrors((prev) => (prev[blockId] ? { ...prev, [blockId]: '' } : prev));
  }, []);

  const uploadFile = useCallback(
    async (file: File, blockId: string): Promise<FileDescriptor> => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('blockId', blockId);
      const res = await fetch(`/api/platform/forms/${uid}/upload`, { method: 'POST', body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.error ?? 'Upload failed');
      }
      return json.data as FileDescriptor;
    },
    [uid],
  );

  const deleteFile = useCallback(
    async (descriptor: FileDescriptor) => {
      await fetch(`/api/platform/forms/${uid}/upload`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: descriptor.publicId }),
      });
    },
    [uid],
  );

  // ----- Navigation -----

  const vPages = useMemo(() => visiblePages(schema, answers), [schema, answers]);
  const currentIndex = Math.max(0, vPages.findIndex((p) => p.id === currentPageId));
  const currentPage = vPages[currentIndex] ?? schema.pages[0];
  const isLastPage = currentIndex >= vPages.length - 1;

  const scrollToBlock = (blockId: string) => {
    requestAnimationFrame(() => {
      document.getElementById(`fb-${blockId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const validatePage = useCallback((): boolean => {
    const ids = new Set(
      visibleBlocks(currentPage, answers)
        .filter(isInputBlock)
        .map((b) => b.id),
    );
    const result = validate(answers, ids);
    if (result.ok) {
      setErrors({});
      return true;
    }
    setErrors(result.errors);
    const firstErrorId = Object.keys(result.errors)[0];
    if (firstErrorId) scrollToBlock(firstErrorId);
    return false;
  }, [answers, currentPage, validate]);

  const goNext = () => {
    if (!validatePage()) return;
    if (isLastPage) {
      setPhase('previewing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentPageId(vPages[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    if (phase === 'previewing') {
      setPhase('filling');
      return;
    }
    if (currentIndex > 0) {
      setCurrentPageId(vPages[currentIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    const ids = new Set(
      vPages.flatMap((p) => visibleBlocks(p, answers).filter(isInputBlock).map((b) => b.id)),
    );
    const result = validate(answers, ids);
    if (!result.ok) {
      setErrors(result.errors);
      setPhase('filling');
      const firstErrorId = Object.keys(result.errors)[0];
      // Move to the page holding the first error.
      const pageWithError = vPages.find((p) =>
        visibleBlocks(p, answers).some((b) => b.id === firstErrorId),
      );
      if (pageWithError) setCurrentPageId(pageWithError.id);
      if (firstErrorId) scrollToBlock(firstErrorId);
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(responseUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: answers }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setPhase('already');
        return;
      }
      if (res.status === 400 && json?.error) {
        toast.error(json.error);
        setPhase('filling');
        return;
      }
      if (!res.ok || !json?.success) {
        toast.error(json?.error ?? 'Could not submit your response.');
        return;
      }
      dirtyRef.current = false;
      try {
        localStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
      if (json.data?.confirmation) setConfirmation(json.data.confirmation);
      setPhase('submitted');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast.error('Could not submit your response.');
    } finally {
      setSubmitting(false);
    }
  };

  // ----- Render -----

  const shell = (children: React.ReactNode) => (
    <FormThemeRoot theme={schema.theme} className="min-h-dvh w-full px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-[var(--form-radius)] border border-[var(--form-border)] bg-[var(--form-surface)] p-6 shadow-sm sm:p-8">
          {children}
        </div>
        <p className="mt-4 text-center text-xs text-[var(--form-text-muted)]">
          Powered by the Ministry of Technology
        </p>
      </div>
    </FormThemeRoot>
  );

  if (phase === 'loading') {
    return shell(
      <div className="flex min-h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--form-border)] border-t-[var(--form-primary)]" />
      </div>,
    );
  }

  if (phase === 'submitted' || phase === 'already') {
    return shell(
      <ConfirmationScreen
        title={confirmation.title}
        html={confirmation.html}
        alreadyResponded={phase === 'already'}
      />,
    );
  }

  const progress =
    schema.settings.showProgressBar
      ? phase === 'previewing'
        ? 100
        : ((currentIndex + 1) / Math.max(vPages.length, 1)) * 100
      : null;

  return shell(
    <div className="space-y-6">
      <header className="space-y-1">
        <h1
          className="text-2xl font-bold text-[var(--form-text)]"
          style={{ fontFamily: 'var(--form-font-heading)' }}
        >
          {title}
        </h1>
      </header>

      {phase === 'filling' ? (
        <FormBlocks
          blocks={visibleBlocks(currentPage, answers)}
          answers={answers}
          onChange={handleChange}
          errors={errors}
          uploadFile={uploadFile}
          deleteFile={deleteFile}
        />
      ) : (
        <SubmissionPreview schema={schema} answers={answers} />
      )}

      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => saveDraft()}
          className="gap-1.5 text-[var(--form-text-muted)]"
        >
          {savedAt ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {savedAt ? 'Saved' : 'Save draft'}
        </Button>
      </div>

      <PageNavigator
        progress={progress}
        stepLabel={
          phase === 'filling' && vPages.length > 1
            ? `Step ${currentIndex + 1} of ${vPages.length}`
            : undefined
        }
        backLabel={
          phase === 'previewing' ? 'Back to edit' : currentIndex > 0 ? 'Back' : null
        }
        onBack={goBack}
        primaryLabel={
          phase === 'previewing'
            ? schema.settings.submitButtonText
            : isLastPage
              ? 'Review'
              : 'Next'
        }
        onPrimary={phase === 'previewing' ? handleSubmit : goNext}
        primaryLoading={submitting}
        primaryOutline={schema.theme.buttonStyle === 'outline'}
        showNextIcon={phase !== 'previewing'}
      />
    </div>,
  );
}
