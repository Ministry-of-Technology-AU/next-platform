import { memo } from "react";
import { ComponentRowViewProps } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LETTERS, parseNum, getLetterFromPercentage, computeRow } from "../data";

export const ComponentRowView = memo(function ComponentRowView({
  courseId,
  gc,
  updateComponentField,
  onLetterChange,
  removeComponentFromCourse,
}: ComponentRowViewProps) {
  const { pctStr, letter } = computeRow(gc);
  return (
    <div className="grid grid-cols-12 gap-2 items-center py-1">
      <div className="col-span-3">
        <Input
          value={gc.name}
          onChange={(e) => updateComponentField(courseId, gc.id, "name", e.target.value)}
          placeholder="e.g., Midterm"
        />
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          inputMode="decimal"
          value={gc.score}
          onChange={(e) => {
            const val = e.target.value;
            updateComponentField(courseId, gc.id, "score", val);
            const n = parseNum(val);
            const t = parseNum(gc.total);
            if (Number.isFinite(n) && Number.isFinite(t) && t > 0) {
              const p = (n / t) * 100;
              updateComponentField(courseId, gc.id, "letter", getLetterFromPercentage(p));
            }
          }}
          placeholder="e.g., 86"
        />
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          inputMode="decimal"
          value={gc.total}
          onChange={(e) => {
            const val = e.target.value;
            updateComponentField(courseId, gc.id, "total", val);
            const s = parseNum(gc.score);
            const t = parseNum(val);
            if (Number.isFinite(s) && Number.isFinite(t) && t > 0) {
              const p = (s / t) * 100;
              updateComponentField(courseId, gc.id, "letter", getLetterFromPercentage(p));
            }
          }}
          placeholder="e.g., 100"
        />
      </div>
      <div className="col-span-2">
        <Select value={gc.letter || undefined} onValueChange={(v) => onLetterChange(courseId, gc.id, v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {LETTERS.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          inputMode="decimal"
          value={gc.weight}
          onChange={(e) => updateComponentField(courseId, gc.id, "weight", e.target.value)}
          placeholder="e.g., 30"
        />
      </div>
      <div className="col-span-1 flex flex-col items-end gap-1 text-right">
        <div className="text-sm tabular-nums">
          {pctStr}{pctStr && "%"} {pctStr && <span className="text-muted-foreground">/ {letter}</span>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Remove component"
          onClick={() => removeComponentFromCourse(courseId, gc.id)}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});