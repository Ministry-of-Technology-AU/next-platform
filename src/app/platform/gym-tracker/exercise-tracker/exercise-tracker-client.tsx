"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Plus, Trash2, ChevronRight, Dumbbell, TrendingUp, RefreshCw,
  Check, History, X, BarChart2, RotateCcw, MoveVertical, MoveHorizontal,
  ArrowUpFromLine, ArrowDownFromLine, Bike, PersonStanding, Footprints,
  Weight, SlidersHorizontal, Scissors, FlipHorizontal, Activity, Timer,
  Flame, Gauge, Ruler,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Unit = "kg" | "lbs" | "plates";
type Category = "machine" | "free" | "cardio" | "custom";

interface Exercise {
  id: string;
  name: string;
  category: Category;
  Icon: LucideIcon;
  defaultUnit: Unit;
  isCustom?: boolean;
  strapiId?: string; // for custom exercises stored in Strapi
}

interface SetRow {
  id: string;            // Strapi entry id or "new"
  setNumber: number;
  reps: number;
  weight: number | null;
  plates: number | null;
  unit: Unit;
  saving: boolean;
  saved: boolean;
}

interface CardioRow {
  id: string;            // Strapi entry id or "new"
  durationMin: number | null;
  distanceKm: number | null;
  resistance: number | null;
  calories: number | null;
  saving: boolean;
  saved: boolean;
}

interface WorkoutSession {
  id: string;
  startedAt: string;
  notes: string;
}

interface EntryRaw {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseCategory: string;
  setNumber: number | null;
  reps: number | null;
  weight: number | null;
  plates: number | null;
  unit: string | null;
  durationMin: number | null;
  distanceKm: number | null;
  resistance: number | null;
  calories: number | null;
  loggedAt: string;
}

type Screen = "home" | "exercisePicker" | "logger" | "progress" | "history";

// ─── Exercise catalogue ───────────────────────────────────────────────────────

const BUILTIN: Exercise[] = [
  // Machines
  { id: "rear-delt-pec-fly",    name: "Rear Delt / Pec Fly",    category: "machine", Icon: FlipHorizontal,    defaultUnit: "kg" },
  { id: "vertical-chest-press", name: "Vertical Chest Press",   category: "machine", Icon: Dumbbell,          defaultUnit: "kg" },
  { id: "overhead-press",       name: "Overhead Press",         category: "machine", Icon: ArrowUpFromLine,   defaultUnit: "kg" },
  { id: "triceps-extension",    name: "Triceps Extension",      category: "machine", Icon: ArrowDownFromLine, defaultUnit: "kg" },
  { id: "lateral-raise",        name: "Lateral Raise",          category: "machine", Icon: MoveHorizontal,    defaultUnit: "kg" },
  { id: "rotary-torso",         name: "Rotary Torso",           category: "machine", Icon: RotateCcw,         defaultUnit: "kg" },
  { id: "lateral-pulldown",     name: "Lateral Pulldown",       category: "machine", Icon: ArrowDownFromLine, defaultUnit: "kg" },
  { id: "leg-press",            name: "Leg Press",              category: "machine", Icon: MoveVertical,      defaultUnit: "kg" },
  { id: "abduction-adduction",  name: "Abduction / Adduction",  category: "machine", Icon: SlidersHorizontal, defaultUnit: "kg" },
  { id: "leg-curl",             name: "Leg Curl",               category: "machine", Icon: Scissors,          defaultUnit: "kg" },
  { id: "leg-extension",        name: "Leg Extension",          category: "machine", Icon: MoveVertical,      defaultUnit: "kg" },
  { id: "seated-leg-curl-ext",  name: "Seated Leg Curl / Ext",  category: "machine", Icon: Scissors,          defaultUnit: "kg" },
  { id: "lat-pulldown",         name: "Lat Pulldown",           category: "machine", Icon: ArrowDownFromLine, defaultUnit: "kg" },
  { id: "biceps-curl",          name: "Biceps Curl",            category: "machine", Icon: Activity,          defaultUnit: "kg" },
  { id: "lower-back-machine",   name: "Lower Back Machine",     category: "machine", Icon: PersonStanding,    defaultUnit: "kg" },
  { id: "abdominal-machine",    name: "Abdominal Machine",      category: "machine", Icon: Activity,          defaultUnit: "kg" },
  { id: "chest-supported-rows", name: "Chest Supported Rows",   category: "machine", Icon: ArrowDownFromLine, defaultUnit: "kg" },
  { id: "hack-squat",           name: "Hack Squat",             category: "machine", Icon: MoveVertical,      defaultUnit: "plates" },
  { id: "cable-row",            name: "Cable Row",              category: "machine", Icon: ArrowDownFromLine, defaultUnit: "kg" },
  // Free weights
  { id: "lower-back-free",      name: "Lower Back (Free)",      category: "free",    Icon: PersonStanding,    defaultUnit: "plates" },
  { id: "smith-machine",        name: "Smith Machine",          category: "free",    Icon: Weight,            defaultUnit: "kg" },
  { id: "bench-press",          name: "Bench Press",            category: "free",    Icon: Dumbbell,          defaultUnit: "plates" },
  { id: "barbell-squat",        name: "Barbell Squat",          category: "free",    Icon: MoveVertical,      defaultUnit: "plates" },
  { id: "deadlift",             name: "Deadlift",               category: "free",    Icon: ArrowUpFromLine,   defaultUnit: "plates" },
  { id: "dumbbell-curl",        name: "Dumbbell Curl",          category: "free",    Icon: Activity,          defaultUnit: "kg" },
  // Cardio
  { id: "elliptical",           name: "Elliptical",             category: "cardio",  Icon: Activity,          defaultUnit: "kg" },
  { id: "cycle-machine",        name: "Cycle Machine",          category: "cardio",  Icon: Bike,              defaultUnit: "kg" },
  { id: "rowing-machine",       name: "Rowing Machine",         category: "cardio",  Icon: ArrowDownFromLine, defaultUnit: "kg" },
  { id: "stairmaster",          name: "Stairmaster",            category: "cardio",  Icon: Footprints,        defaultUnit: "kg" },
  { id: "treadmill",            name: "Treadmill",              category: "cardio",  Icon: PersonStanding,    defaultUnit: "kg" },
];

const CAT_LABEL: Record<string, string> = { machine: "Machines", free: "Free Weights", cardio: "Cardio", custom: "My Exercises" };
const CAT_ORDER: Category[] = ["custom", "machine", "free", "cardio"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function fmtWeight(weight: number | null, plates: number | null, unit: Unit | string | null) {
  if (unit === "plates") return `${plates ?? 0} plates/side`;
  if (unit === "lbs") return `${weight ?? 0} lbs`;
  return `${weight ?? 0} kg`;
}

function normalizeEntry(d: unknown): EntryRaw {
  const r = d as { id?: string | number; attributes?: Partial<EntryRaw> } & Partial<EntryRaw>;
  const a = r.attributes ?? r;
  return {
    id: String(r.id ?? ""),
    exerciseId: a.exerciseId ?? "",
    exerciseName: a.exerciseName ?? "",
    exerciseCategory: a.exerciseCategory ?? "",
    setNumber: a.setNumber ?? null,
    reps: a.reps ?? null,
    weight: a.weight ?? null,
    plates: a.plates ?? null,
    unit: a.unit ?? null,
    durationMin: a.durationMin ?? null,
    distanceKm: a.distanceKm ?? null,
    resistance: a.resistance ?? null,
    calories: a.calories ?? null,
    loggedAt: a.loggedAt ?? "",
  };
}

function normalizeSession(d: unknown): WorkoutSession {
  const r = d as { id?: string | number; attributes?: Partial<WorkoutSession> } & Partial<WorkoutSession>;
  const a = r.attributes ?? r;
  return { id: String(r.id ?? ""), startedAt: a.startedAt ?? "", notes: a.notes ?? "" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ExIcon({ Icon, className }: { Icon: LucideIcon; className?: string }) {
  return <Icon className={className ?? "h-5 w-5"} />;
}

function UnitToggle({ unit, onChange }: { unit: Unit; onChange: (u: Unit) => void }) {
  return (
    <div className="inline-flex rounded-full border border-border bg-muted/40 p-0.5 text-xs">
      {(["kg", "lbs", "plates"] as Unit[]).map((u) => (
        <button key={u} type="button" onClick={() => onChange(u)}
          className={`px-2.5 py-1 rounded-full transition-colors font-medium ${unit === u ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
          {u}
        </button>
      ))}
    </div>
  );
}

// ─── Set row (strength) ───────────────────────────────────────────────────────

function SetRowEditor({ set, onUpdate, onSave, onDelete }: {
  set: SetRow;
  onUpdate: (p: Partial<SetRow>) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 py-2.5 border-b border-border last:border-0">
      <span className="w-5 text-center text-sm font-semibold text-muted-foreground shrink-0">{set.setNumber}</span>

      <div className="flex-1 flex items-center gap-2 flex-wrap">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-muted-foreground">Reps</span>
          <Input type="number" min={0} value={set.reps || ""} placeholder="0"
            onChange={(e) => onUpdate({ reps: parseInt(e.target.value) || 0, saved: false })}
            className="w-14 h-8 text-center text-sm p-1" />
        </div>

        {set.unit === "plates" ? (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-muted-foreground">Plates/side</span>
            <Input type="number" min={0} step={0.5} value={set.plates ?? ""} placeholder="0"
              onChange={(e) => onUpdate({ plates: parseFloat(e.target.value) || null, saved: false })}
              className="w-20 h-8 text-center text-sm p-1" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-muted-foreground">Weight ({set.unit})</span>
            <Input type="number" min={0} step={0.5} value={set.weight ?? ""} placeholder="0"
              onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) || null, saved: false })}
              className="w-20 h-8 text-center text-sm p-1" />
          </div>
        )}

        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-muted-foreground">Unit</span>
          <UnitToggle unit={set.unit} onChange={(u) => onUpdate({ unit: u, saved: false })} />
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button type="button" onClick={onSave} disabled={set.saving}
          className={`p-1.5 rounded-full transition-colors ${set.saved ? "text-green-600 dark:text-green-400" : "text-muted-foreground hover:text-primary"}`}>
          {set.saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </button>
        <button type="button" onClick={onDelete}
          className="p-1.5 rounded-full text-muted-foreground hover:text-destructive transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Cardio logger ────────────────────────────────────────────────────────────

function CardioEditor({ cardio, onUpdate, onSave, onDelete }: {
  cardio: CardioRow;
  onUpdate: (p: Partial<CardioRow>) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const field = (label: string, icon: LucideIcon, value: number | null, key: keyof CardioRow, step = 1, placeholder = "0") => (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
        <ExIcon Icon={icon} className="h-3 w-3" /> {label}
      </div>
      <Input type="number" min={0} step={step} value={value ?? ""} placeholder={placeholder}
        onChange={(e) => onUpdate({ [key]: parseFloat(e.target.value) || null, saved: false })}
        className="w-20 h-8 text-center text-sm p-1" />
    </div>
  );

  return (
    <div className="py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-2 flex-wrap">
        {field("Duration (min)", Timer, cardio.durationMin, "durationMin")}
        {field("Distance (km)", Ruler, cardio.distanceKm, "distanceKm", 0.1)}
        {field("Resistance", Gauge, cardio.resistance, "resistance")}
        {field("Calories", Flame, cardio.calories, "calories")}

        <div className="flex items-center gap-1 ml-auto mt-3">
          <button type="button" onClick={onSave} disabled={cardio.saving}
            className={`p-1.5 rounded-full transition-colors ${cardio.saved ? "text-green-600 dark:text-green-400" : "text-muted-foreground hover:text-primary"}`}>
            {cardio.saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onDelete}
            className="p-1.5 rounded-full text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create custom exercise inline form ───────────────────────────────────────

function CreateExerciseForm({ onCreate, onCancel, loading }: {
  onCreate: (name: string, category: Category, unit: Unit) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("free");
  const [unit, setUnit] = useState<Unit>("kg");

  return (
    <Card className="rounded-2xl border border-primary/30 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <p className="font-semibold text-sm">New Exercise</p>
        <Input autoFocus value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Exercise name" className="rounded-xl"
          onKeyDown={(e) => e.key === "Enter" && name.trim() && onCreate(name.trim(), category, unit)} />

        <div className="flex gap-4 flex-wrap">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Category</p>
            <div className="flex gap-1 flex-wrap">
              {(["machine", "free", "cardio"] as Category[]).map((c) => (
                <button key={c} type="button" onClick={() => setCategory(c)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${category === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                  {CAT_LABEL[c]}
                </button>
              ))}
            </div>
          </div>
          {category !== "cardio" && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Default unit</p>
              <UnitToggle unit={unit} onChange={setUnit} />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" disabled={!name.trim() || loading} onClick={() => onCreate(name.trim(), category, unit)}>
            {loading ? <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1" />}
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}><X className="h-3.5 w-3.5 mr-1" /> Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ExerciseTrackerClient() {
  const [screen, setScreen] = useState<Screen>("home");
  const [error, setError] = useState<string | null>(null);

  // Session
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Exercise picker
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [customLoading, setCustomLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Logger
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [sets, setSets] = useState<SetRow[]>([]);
  const [cardio, setCardio] = useState<CardioRow | null>(null);
  const [lastEntries, setLastEntries] = useState<EntryRaw[]>([]);
  const [loggerLoading, setLoggerLoading] = useState(false);

  // Progress
  const [historyData, setHistoryData] = useState<EntryRaw[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Past sessions
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<EntryRaw[]>([]);
  const [expandedLoading, setExpandedLoading] = useState(false);

  const allExercises: Exercise[] = [...customExercises, ...BUILTIN];

  // ── API ──────────────────────────────────────────────────────────────────

  const get = useCallback(async (params: Record<string, string>) => {
    const res = await fetch("/api/platform/gym-tracker/exercises?" + new URLSearchParams(params), { cache: "no-store" });
    const json = await res.json() as { success: boolean; data?: unknown; error?: string };
    if (!json.success) throw new Error(json.error ?? "Request failed");
    return json.data;
  }, []);

  const post = useCallback(async (body: Record<string, unknown>) => {
    const res = await fetch("/api/platform/gym-tracker/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json() as { success: boolean; data?: unknown; error?: string };
    if (!json.success) throw new Error(json.error ?? "Request failed");
    return json.data;
  }, []);

  // ── Custom exercises ─────────────────────────────────────────────────────

  const loadCustomExercises = useCallback(async () => {
    setCustomLoading(true);
    try {
      const data = await get({ mode: "customExercises" }) as unknown[];
      setCustomExercises(data.map((d) => {
        const r = d as { id?: string | number; attributes?: { name?: string; category?: string; defaultUnit?: string }; name?: string; category?: string; defaultUnit?: string };
        const a = r.attributes ?? r;
        return {
          id: `custom-${r.id}`,
          strapiId: String(r.id),
          name: a.name ?? "",
          category: (a.category as Category) ?? "free",
          Icon: Dumbbell,
          defaultUnit: (a.defaultUnit as Unit) ?? "kg",
          isCustom: true,
        };
      }));
    } catch { /* non-critical */ }
    setCustomLoading(false);
  }, [get]);

  useEffect(() => { void loadCustomExercises(); }, [loadCustomExercises]);

  async function createCustomExercise(name: string, category: Category, unit: Unit) {
    setCreateLoading(true);
    try {
      const data = await post({ action: "createCustomExercise", customName: name, customCategory: category, customDefaultUnit: unit }) as { id?: string | number; attributes?: { name?: string; category?: string; defaultUnit?: string }; name?: string; category?: string; defaultUnit?: string };
      const a = data.attributes ?? data;
      const ex: Exercise = {
        id: `custom-${data.id}`,
        strapiId: String(data.id),
        name: a.name ?? name,
        category: (a.category as Category) ?? category,
        Icon: Dumbbell,
        defaultUnit: (a.defaultUnit as Unit) ?? unit,
        isCustom: true,
      };
      setCustomExercises((prev) => [ex, ...prev]);
      setShowCreateForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create exercise");
    }
    setCreateLoading(false);
  }

  async function deleteCustomExercise(ex: Exercise) {
    if (!ex.strapiId) return;
    try {
      await post({ action: "deleteCustomExercise", customExerciseId: ex.strapiId });
      setCustomExercises((prev) => prev.filter((e) => e.id !== ex.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete exercise");
    }
  }

  // ── Session ───────────────────────────────────────────────────────────────

  async function startSession() {
    setSessionLoading(true);
    setError(null);
    try {
      const data = await post({ action: "createSession" });
      setSession(normalizeSession(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start session");
    }
    setSessionLoading(false);
  }

  async function endSession() {
    if (!session) return;
    try { await post({ action: "endSession", sessionId: session.id }); } catch { /* silent */ }
    setSession(null);
    setSets([]);
    setCardio(null);
    setSelectedExercise(null);
    setScreen("home");
  }

  // ── Logger ────────────────────────────────────────────────────────────────

  async function openLogger(ex: Exercise) {
    setSelectedExercise(ex);
    setSets([]);
    setCardio(null);
    setLastEntries([]);
    setLoggerLoading(true);
    setScreen("logger");

    try {
      // Load last workout entries for this exercise as reference
      const data = await get({ mode: "lastWorkout", exerciseId: ex.id }) as unknown[];
      setLastEntries(data.map(normalizeEntry));

      // Load current session entries for this exercise
      if (session) {
        const sessionData = await get({ mode: "entries", sessionId: session.id }) as unknown[];
        const mine = sessionData.map(normalizeEntry).filter((e) => e.exerciseId === ex.id);

        if (ex.category === "cardio") {
          const c = mine[0];
          if (c) {
            setCardio({ id: c.id, durationMin: c.durationMin, distanceKm: c.distanceKm, resistance: c.resistance, calories: c.calories, saving: false, saved: true });
          } else {
            setCardio({ id: "new", durationMin: null, distanceKm: null, resistance: null, calories: null, saving: false, saved: false });
          }
        } else {
          if (mine.length > 0) {
            setSets(mine.map((e, i) => ({
              id: e.id,
              setNumber: i + 1,
              reps: e.reps ?? 0,
              weight: e.weight,
              plates: e.plates,
              unit: (e.unit as Unit) ?? ex.defaultUnit,
              saving: false,
              saved: true,
            })));
          }
        }
      }
    } catch { /* non-critical */ }

    setLoggerLoading(false);
  }

  // ── Set operations ────────────────────────────────────────────────────────

  function addSet() {
    const prev = sets[sets.length - 1];
    setSets((s) => [...s, {
      id: "new",
      setNumber: s.length + 1,
      reps: prev?.reps ?? 0,
      weight: prev?.weight ?? null,
      plates: prev?.plates ?? null,
      unit: prev?.unit ?? selectedExercise?.defaultUnit ?? "kg",
      saving: false,
      saved: false,
    }]);
  }

  function patchSet(idx: number, patch: Partial<SetRow>) {
    setSets((s) => s.map((r, i) => i === idx ? { ...r, ...patch } : r));
  }

  async function saveSet(idx: number) {
    if (!session || !selectedExercise) return;
    const set = sets[idx];
    patchSet(idx, { saving: true });
    try {
      const isNew = set.id === "new";
      const data = await post({
        action: "saveEntry",
        ...(isNew ? {} : { entryId: set.id }),
        sessionId: session.id,
        exerciseId: selectedExercise.id,
        exerciseName: selectedExercise.name,
        exerciseCategory: selectedExercise.category,
        setNumber: set.setNumber,
        reps: set.reps,
        weight: set.weight,
        plates: set.plates,
        unit: set.unit,
      }) as { id?: string | number };
      patchSet(idx, { saving: false, saved: true, id: isNew ? String(data.id ?? "new") : set.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save set");
      patchSet(idx, { saving: false });
    }
  }

  async function deleteSet(idx: number) {
    const set = sets[idx];
    if (set.id !== "new") {
      try { await post({ action: "deleteEntry", entryId: set.id }); } catch { /* silent */ }
    }
    setSets((s) => s.filter((_, i) => i !== idx).map((r, i) => ({ ...r, setNumber: i + 1 })));
  }

  // ── Cardio operations ─────────────────────────────────────────────────────

  function patchCardio(patch: Partial<CardioRow>) {
    setCardio((c) => c ? { ...c, ...patch } : c);
  }

  async function saveCardio() {
    if (!session || !selectedExercise || !cardio) return;
    patchCardio({ saving: true });
    try {
      const isNew = cardio.id === "new";
      const data = await post({
        action: "saveEntry",
        ...(isNew ? {} : { entryId: cardio.id }),
        sessionId: session.id,
        exerciseId: selectedExercise.id,
        exerciseName: selectedExercise.name,
        exerciseCategory: selectedExercise.category,
        durationMin: cardio.durationMin,
        distanceKm: cardio.distanceKm,
        resistance: cardio.resistance,
        calories: cardio.calories,
      }) as { id?: string | number };
      patchCardio({ saving: false, saved: true, id: isNew ? String(data.id ?? "new") : cardio.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save cardio");
      patchCardio({ saving: false });
    }
  }

  // ── Progress ──────────────────────────────────────────────────────────────

  async function openProgress(ex: Exercise) {
    setSelectedExercise(ex);
    setHistoryLoading(true);
    setScreen("progress");
    try {
      const data = await get({ mode: "history", exerciseId: ex.id }) as unknown[];
      setHistoryData(data.map(normalizeEntry));
    } catch { setHistoryData([]); }
    setHistoryLoading(false);
  }

  function buildStrengthChart(data: EntryRaw[]) {
    const byDate: Record<string, { date: string; maxWeight: number; totalReps: number }> = {};
    data.forEach((e) => {
      const date = e.loggedAt ? new Date(e.loggedAt).toLocaleDateString() : "?";
      const val = e.unit === "plates" ? (e.plates ?? 0) : (e.weight ?? 0);
      if (!byDate[date]) byDate[date] = { date, maxWeight: 0, totalReps: 0 };
      byDate[date].maxWeight = Math.max(byDate[date].maxWeight, val);
      byDate[date].totalReps += e.reps ?? 0;
    });
    return Object.values(byDate).slice(-20);
  }

  function buildCardioChart(data: EntryRaw[]) {
    return data.map((e) => ({
      date: e.loggedAt ? new Date(e.loggedAt).toLocaleDateString() : "?",
      duration: e.durationMin ?? 0,
      distance: e.distanceKm ?? 0,
      calories: e.calories ?? 0,
    })).slice(-20);
  }

  // ── History ───────────────────────────────────────────────────────────────

  async function openHistory() {
    setSessionsLoading(true);
    setScreen("history");
    try {
      const data = await get({ mode: "sessions" }) as unknown[];
      setSessions(data.map(normalizeSession));
    } catch { setSessions([]); }
    setSessionsLoading(false);
  }

  async function toggleExpandSession(id: string) {
    if (expandedSession === id) { setExpandedSession(null); return; }
    setExpandedSession(id);
    setExpandedLoading(true);
    try {
      const data = await get({ mode: "entries", sessionId: id }) as unknown[];
      setExpandedEntries(data.map(normalizeEntry));
    } catch { setExpandedEntries([]); }
    setExpandedLoading(false);
  }

  async function deleteSession(id: string) {
    try { await post({ action: "deleteSession", sessionId: id }); } catch { /* silent */ }
    setSessions((s) => s.filter((x) => x.id !== id));
    if (expandedSession === id) setExpandedSession(null);
  }

  // ── Filtered exercises ────────────────────────────────────────────────────

  const filtered = allExercises.filter((ex) =>
    (filterCat === "all" || ex.category === filterCat) &&
    ex.name.toLowerCase().includes(search.toLowerCase())
  );
  const grouped = CAT_ORDER.reduce<Record<string, Exercise[]>>((acc, cat) => {
    const items = filtered.filter((e) => e.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  // ─────────────────────────────────────────────────────────────────────────
  // Screens
  // ─────────────────────────────────────────────────────────────────────────

  const ErrorBanner = error ? (
    <Card className="rounded-2xl border-red-300/40 bg-red-500/5 mb-4">
      <CardContent className="p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
        <span className="flex-1">{error}</span>
        <button type="button" onClick={() => setError(null)}><X className="h-3.5 w-3.5" /></button>
      </CardContent>
    </Card>
  ) : null;

  // ── HOME ──────────────────────────────────────────────────────────────────

  if (screen === "home") {
    return (
      <div className="space-y-5 max-w-2xl mx-auto">
        {ErrorBanner}

        {session && (
          <Card className="rounded-3xl border-green-500/30 bg-green-500/5">
            <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-semibold text-green-700 dark:text-green-400">Workout in progress</p>
                <p className="text-xs text-muted-foreground mt-0.5">Started {fmtTime(session.startedAt)}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setScreen("exercisePicker")}>Log Exercise</Button>
                <Button size="sm" variant="outline" onClick={() => void endSession()}>Finish</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!session && (
            <Card className="rounded-3xl border border-border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => void startSession()}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg">Start Workout</p>
                  <p className="text-sm text-muted-foreground">Begin a new session</p>
                </div>
                {sessionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </CardContent>
            </Card>
          )}

          <Card className="rounded-3xl border border-border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => void openHistory()}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                <History className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">Past Workouts</p>
                <p className="text-sm text-muted-foreground">View workout history</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-border cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setScreen("exercisePicker")}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">View Progress</p>
                <p className="text-sm text-muted-foreground">Charts for any exercise</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── EXERCISE PICKER ───────────────────────────────────────────────────────

  if (screen === "exercisePicker") {
    const isLogging = !!session;
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        {ErrorBanner}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setScreen("home")}><ArrowLeft className="h-5 w-5" /></Button>
          <h2 className="text-2xl font-semibold flex-1">{isLogging ? "Log Exercise" : "View Progress"}</h2>
          <Button size="sm" variant="outline" onClick={() => setShowCreateForm((v) => !v)}>
            <Plus className="h-4 w-4 mr-1" /> Custom
          </Button>
        </div>

        {showCreateForm && (
          <CreateExerciseForm
            onCreate={(name, cat, unit) => void createCustomExercise(name, cat, unit)}
            onCancel={() => setShowCreateForm(false)}
            loading={createLoading}
          />
        )}

        <Input placeholder="Search exercises..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-xl" />

        <div className="flex gap-2 flex-wrap">
          {["all", "custom", "machine", "free", "cardio"].map((cat) => (
            <button key={cat} type="button" onClick={() => setFilterCat(cat)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${filterCat === cat ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
              {cat === "all" ? "All" : CAT_LABEL[cat]}
            </button>
          ))}
          {customLoading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground my-auto" />}
        </div>

        <div className="space-y-5">
          {Object.entries(grouped).map(([cat, exercises]) => (
            <div key={cat}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{CAT_LABEL[cat]}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {exercises.map((ex) => (
                  <div key={ex.id} className="flex items-center gap-1">
                    <button type="button"
                      onClick={() => { if (isLogging) void openLogger(ex); else void openProgress(ex); }}
                      className="flex-1 flex items-center gap-3 p-3 rounded-2xl border border-border hover:border-primary/50 hover:bg-muted/40 transition-all text-left">
                      <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <ExIcon Icon={ex.Icon} className="h-4 w-4 text-foreground/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ex.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ex.category === "cardio" ? "Duration · Distance · Calories" : ex.defaultUnit}
                        </p>
                      </div>
                      {isLogging
                        ? <Dumbbell className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        : <BarChart2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                    </button>
                    {ex.isCustom && (
                      <button type="button" onClick={() => void deleteCustomExercise(ex)}
                        className="p-2 rounded-xl text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No exercises match your search.</p>
          )}
        </div>
      </div>
    );
  }

  // ── LOGGER ────────────────────────────────────────────────────────────────

  if (screen === "logger" && selectedExercise) {
    const isCardio = selectedExercise.category === "cardio";
    const unsaved = isCardio ? (cardio && !cardio.saved ? 1 : 0) : sets.filter((s) => !s.saved).length;

    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        {ErrorBanner}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setScreen("exercisePicker")}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <ExIcon Icon={selectedExercise.Icon} className="h-5 w-5 text-foreground/70" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">{selectedExercise.name}</h2>
              <p className="text-xs text-muted-foreground">{session ? `Session started ${fmtTime(session.startedAt)}` : "No active session"}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void openProgress(selectedExercise)}>
            <TrendingUp className="h-4 w-4 mr-1" /> Progress
          </Button>
        </div>

        {/* Last workout reference */}
        {lastEntries.length > 0 && (
          <Card className="rounded-2xl border border-border bg-muted/30">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <History className="h-3 w-3" /> Last time
                <span className="ml-1 font-normal normal-case">
                  {lastEntries[0]?.loggedAt ? `· ${fmtDate(lastEntries[0].loggedAt)}` : ""}
                </span>
              </p>
              {isCardio ? (
                <div className="flex gap-4 text-sm flex-wrap">
                  {lastEntries[0]?.durationMin && <span><Timer className="h-3 w-3 inline mr-1" />{lastEntries[0].durationMin} min</span>}
                  {lastEntries[0]?.distanceKm && <span><Ruler className="h-3 w-3 inline mr-1" />{lastEntries[0].distanceKm} km</span>}
                  {lastEntries[0]?.resistance && <span><Gauge className="h-3 w-3 inline mr-1" />Resistance {lastEntries[0].resistance}</span>}
                  {lastEntries[0]?.calories && <span><Flame className="h-3 w-3 inline mr-1" />{lastEntries[0].calories} cal</span>}
                </div>
              ) : (
                <div className="space-y-1">
                  {lastEntries.slice(0, 5).map((e, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground w-5 text-right">{i + 1}</span>
                      <span className="font-medium">{e.reps} reps</span>
                      <span className="text-muted-foreground">·</span>
                      <span>{fmtWeight(e.weight, e.plates, e.unit)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Log card */}
        <Card className="rounded-3xl border border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isCardio ? <Timer className="h-4 w-4 text-muted-foreground" /> : <Activity className="h-4 w-4 text-muted-foreground" />}
                <span className="font-semibold">{isCardio ? "Cardio Log" : "Sets"}</span>
                {unsaved > 0 && <Badge variant="secondary" className="text-xs">{unsaved} unsaved</Badge>}
              </div>
            </div>

            {loggerLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground justify-center py-6">
                <RefreshCw className="h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : isCardio ? (
              cardio && (
                <CardioEditor
                  cardio={cardio}
                  onUpdate={patchCardio}
                  onSave={() => void saveCardio()}
                  onDelete={() => setCardio({ id: "new", durationMin: null, distanceKm: null, resistance: null, calories: null, saving: false, saved: false })}
                />
              )
            ) : (
              <>
                {sets.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No sets yet — add your first set below.</p>
                )}
                {sets.map((set, idx) => (
                  <SetRowEditor key={`${set.id}-${idx}`} set={set}
                    onUpdate={(p) => patchSet(idx, p)}
                    onSave={() => void saveSet(idx)}
                    onDelete={() => void deleteSet(idx)}
                  />
                ))}
                <Button variant="outline" className="w-full mt-3 rounded-xl" onClick={addSet} disabled={!session}>
                  <Plus className="h-4 w-4 mr-2" />
                  {session ? "Add Set" : "Start a session first"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {session && (
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setScreen("exercisePicker")}>
              <Plus className="h-4 w-4 mr-2" /> Another Exercise
            </Button>
            <Button className="flex-1" onClick={() => void endSession()}>
              <Check className="h-4 w-4 mr-2" /> Finish Workout
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ── PROGRESS ──────────────────────────────────────────────────────────────

  if (screen === "progress" && selectedExercise) {
    const isCardio = selectedExercise.category === "cardio";
    const strengthData = isCardio ? [] : buildStrengthChart(historyData);
    const cardioData = isCardio ? buildCardioChart(historyData) : [];

    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        {ErrorBanner}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setScreen("exercisePicker")}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <ExIcon Icon={selectedExercise.Icon} className="h-5 w-5 text-foreground/70" />
            </div>
            <h2 className="text-xl font-semibold">{selectedExercise.name}</h2>
          </div>
        </div>

        {historyLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground justify-center py-12">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading history...
          </div>
        ) : historyData.length === 0 ? (
          <Card className="rounded-3xl border border-border">
            <CardContent className="p-8 text-center text-muted-foreground text-sm">
              No data yet. Log some {isCardio ? "cardio sessions" : "sets"} to see your progress.
            </CardContent>
          </Card>
        ) : isCardio ? (
          <>
            <Card className="rounded-3xl border border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4"><Timer className="h-5 w-5 text-primary" /><h3 className="font-semibold text-lg">Duration over time</h3></div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cardioData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} unit=" min" />
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                      <Line type="monotone" dataKey="duration" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4"><Flame className="h-5 w-5 text-orange-500" /><h3 className="font-semibold text-lg">Calories burned</h3></div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cardioData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                      <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="rounded-3xl border border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-primary" /><h3 className="font-semibold text-lg">Max weight over time</h3></div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={strengthData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: unknown) => [String(v), "Max weight"]} />
                      <Line type="monotone" dataKey="maxWeight" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4"><BarChart2 className="h-5 w-5 text-green-600" /><h3 className="font-semibold text-lg">Total reps per session</h3></div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={strengthData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                      <Line type="monotone" dataKey="totalReps" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Raw log table */}
            <Card className="rounded-3xl border border-border">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">All logged sets</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {[...historyData].reverse().map((e, i) => (
                    <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0 text-sm">
                      <span className="text-muted-foreground text-xs w-20 shrink-0">
                        {e.loggedAt ? new Date(e.loggedAt).toLocaleDateString([], { month: "short", day: "numeric" }) : "—"}
                      </span>
                      <span>Set {e.setNumber}</span>
                      <span className="font-medium">{e.reps} reps</span>
                      <span className="text-muted-foreground">·</span>
                      <span>{fmtWeight(e.weight, e.plates, e.unit)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  }

  // ── HISTORY ───────────────────────────────────────────────────────────────

  if (screen === "history") {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        {ErrorBanner}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { setExpandedSession(null); setScreen("home"); }}><ArrowLeft className="h-5 w-5" /></Button>
          <h2 className="text-2xl font-semibold">Past Workouts</h2>
        </div>

        {sessionsLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground justify-center py-8">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : sessions.length === 0 ? (
          <Card className="rounded-3xl border border-border">
            <CardContent className="p-8 text-center text-muted-foreground text-sm">No past workouts yet.</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((sess) => {
              const isExpanded = expandedSession === sess.id;
              // Group entries by exercise
              const byExercise = expandedEntries.reduce<Record<string, EntryRaw[]>>((acc, e) => {
                const key = e.exerciseName || e.exerciseId;
                acc[key] = acc[key] ?? [];
                acc[key].push(e);
                return acc;
              }, {});

              return (
                <Card key={sess.id} className="rounded-2xl border border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <button type="button" className="flex-1 text-left" onClick={() => void toggleExpandSession(sess.id)}>
                        <p className="font-semibold">{fmtDate(sess.startedAt)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{fmtTime(sess.startedAt)}{sess.notes ? ` · ${sess.notes}` : ""}</p>
                      </button>
                      <Button size="icon" variant="ghost" onClick={() => void toggleExpandSession(sess.id)}>
                        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => void deleteSession(sess.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border">
                        {expandedLoading ? (
                          <div className="flex items-center gap-2 text-muted-foreground text-sm"><RefreshCw className="h-3 w-3 animate-spin" /> Loading...</div>
                        ) : expandedEntries.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No entries recorded.</p>
                        ) : (
                          <div className="space-y-3">
                            {Object.entries(byExercise).map(([exName, entries]) => {
                              const exDef = allExercises.find((e) => e.name === exName || e.id === exName);
                              const isC = entries[0]?.exerciseCategory === "cardio";
                              return (
                                <div key={exName}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                                      <ExIcon Icon={exDef?.Icon ?? Dumbbell} className="h-3.5 w-3.5 text-foreground/70" />
                                    </div>
                                    <p className="text-sm font-semibold">{exName}</p>
                                    {exDef && (
                                      <button type="button" onClick={() => void openProgress(exDef)}
                                        className="ml-auto text-xs text-muted-foreground hover:text-primary flex items-center gap-0.5">
                                        <TrendingUp className="h-3 w-3" /> Progress
                                      </button>
                                    )}
                                  </div>
                                  {isC ? (
                                    <div className="pl-8 flex gap-3 text-xs text-muted-foreground flex-wrap">
                                      {entries[0]?.durationMin && <span>{entries[0].durationMin} min</span>}
                                      {entries[0]?.distanceKm && <span>{entries[0].distanceKm} km</span>}
                                      {entries[0]?.resistance && <span>Resistance {entries[0].resistance}</span>}
                                      {entries[0]?.calories && <span>{entries[0].calories} cal</span>}
                                    </div>
                                  ) : (
                                    entries.map((e, i) => (
                                      <div key={i} className="flex items-center gap-3 text-sm pl-8 py-0.5">
                                        <span className="text-muted-foreground w-4">{e.setNumber}</span>
                                        <span>{e.reps} reps</span>
                                        <span className="text-muted-foreground">·</span>
                                        <span>{fmtWeight(e.weight, e.plates, e.unit)}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
}
