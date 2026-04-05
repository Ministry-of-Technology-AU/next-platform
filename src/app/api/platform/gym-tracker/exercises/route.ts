import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { strapiGet, strapiPost, strapiPut, strapiDelete } from '@/lib/apis/strapi';

export async function GET(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode');
  const exerciseId = searchParams.get('exerciseId');
  const sessionId = searchParams.get('sessionId');

  try {
    // All sessions for this user
    if (mode === 'sessions') {
      const data = await strapiGet('/exercise-sessions', {
        filters: { userEmail: { $eq: user.email } },
        sort: { startedAt: 'desc' },
        pagination: { limit: 100 },
      });
      return NextResponse.json({ success: true, data: data?.data ?? [] });
    }

    // All entries (sets or cardio logs) for a session
    if (mode === 'entries' && sessionId) {
      const data = await strapiGet('/exercise-entries', {
        filters: { sessionId: { $eq: sessionId }, userEmail: { $eq: user.email } },
        sort: { loggedAt: 'asc' },
        pagination: { limit: 500 },
      });
      return NextResponse.json({ success: true, data: data?.data ?? [] });
    }

    // History for one exercise (for progress graph)
    if (mode === 'history' && exerciseId) {
      const data = await strapiGet('/exercise-entries', {
        filters: { userEmail: { $eq: user.email }, exerciseId: { $eq: exerciseId } },
        sort: { loggedAt: 'asc' },
        pagination: { limit: 500 },
      });
      return NextResponse.json({ success: true, data: data?.data ?? [] });
    }

    // Last workout data for an exercise (for prefill reference)
    if (mode === 'lastWorkout' && exerciseId) {
      // Get the most recent session that has entries for this exercise
      const data = await strapiGet('/exercise-entries', {
        filters: { userEmail: { $eq: user.email }, exerciseId: { $eq: exerciseId } },
        sort: { loggedAt: 'desc' },
        pagination: { limit: 20 },
      });
      return NextResponse.json({ success: true, data: data?.data ?? [] });
    }

    // Custom exercises for this user
    if (mode === 'customExercises') {
      const data = await strapiGet('/custom-exercises', {
        filters: { userEmail: { $eq: user.email } },
        sort: { name: 'asc' },
        pagination: { limit: 200 },
      });
      return NextResponse.json({ success: true, data: data?.data ?? [] });
    }

    return NextResponse.json({ success: false, error: 'Invalid query' }, { status: 400 });
  } catch (err) {
    console.error('[exercise GET]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  const body = await req.json() as {
    action: string;
    // session
    sessionId?: string;
    notes?: string;
    // entry (set or cardio)
    entryId?: string;
    exerciseId?: string;
    exerciseName?: string;
    exerciseCategory?: string;
    setNumber?: number;
    reps?: number;
    weight?: number | null;
    plates?: number | null;
    unit?: string;
    // cardio
    durationMin?: number | null;
    distanceKm?: number | null;
    resistance?: number | null;
    calories?: number | null;
    // custom exercise
    customExerciseId?: string;
    customName?: string;
    customCategory?: string;
    customDefaultUnit?: string;
  };

  try {
    // ── Sessions ──────────────────────────────────────────────────────────

    if (body.action === 'createSession') {
      const data = await strapiPost('/exercise-sessions', {
        data: { userEmail: user.email, startedAt: new Date().toISOString(), notes: body.notes ?? '' },
      });
      return NextResponse.json({ success: true, data: data?.data });
    }

    if (body.action === 'endSession') {
      const data = await strapiPut(`/exercise-sessions/${body.sessionId}`, {
        data: { endedAt: new Date().toISOString(), notes: body.notes ?? '' },
      });
      return NextResponse.json({ success: true, data: data?.data });
    }

    if (body.action === 'deleteSession') {
      // Delete all entries for session first
      const entries = await strapiGet('/exercise-entries', {
        filters: { sessionId: { $eq: body.sessionId } },
        pagination: { limit: 500 },
      });
      const ids: string[] = (entries?.data ?? []).map((e: { id: string }) => e.id);
      await Promise.all(ids.map((id) => strapiDelete(`/exercise-entries/${id}`)));
      await strapiDelete(`/exercise-sessions/${body.sessionId}`);
      return NextResponse.json({ success: true });
    }

    // ── Entries (sets + cardio) ───────────────────────────────────────────

    if (body.action === 'saveEntry') {
      // Upsert: if entryId exists, update; otherwise create
      if (body.entryId) {
        const data = await strapiPut(`/exercise-entries/${body.entryId}`, {
          data: {
            reps: body.reps ?? null,
            weight: body.weight ?? null,
            plates: body.plates ?? null,
            unit: body.unit ?? null,
            durationMin: body.durationMin ?? null,
            distanceKm: body.distanceKm ?? null,
            resistance: body.resistance ?? null,
            calories: body.calories ?? null,
            loggedAt: new Date().toISOString(),
          },
        });
        return NextResponse.json({ success: true, data: data?.data });
      } else {
        const data = await strapiPost('/exercise-entries', {
          data: {
            sessionId: body.sessionId,
            userEmail: user.email,
            exerciseId: body.exerciseId,
            exerciseName: body.exerciseName,
            exerciseCategory: body.exerciseCategory,
            setNumber: body.setNumber ?? null,
            reps: body.reps ?? null,
            weight: body.weight ?? null,
            plates: body.plates ?? null,
            unit: body.unit ?? null,
            durationMin: body.durationMin ?? null,
            distanceKm: body.distanceKm ?? null,
            resistance: body.resistance ?? null,
            calories: body.calories ?? null,
            loggedAt: new Date().toISOString(),
          },
        });
        return NextResponse.json({ success: true, data: data?.data });
      }
    }

    if (body.action === 'deleteEntry') {
      await strapiDelete(`/exercise-entries/${body.entryId}`);
      return NextResponse.json({ success: true });
    }

    // ── Custom exercises ──────────────────────────────────────────────────

    if (body.action === 'createCustomExercise') {
      const data = await strapiPost('/custom-exercises', {
        data: {
          userEmail: user.email,
          name: body.customName,
          category: body.customCategory,
          defaultUnit: body.customDefaultUnit ?? 'kg',
        },
      });
      return NextResponse.json({ success: true, data: data?.data });
    }

    if (body.action === 'deleteCustomExercise') {
      await strapiDelete(`/custom-exercises/${body.customExerciseId}`);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('[exercise POST]', err);
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}
