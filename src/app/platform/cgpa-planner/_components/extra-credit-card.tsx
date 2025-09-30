import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExtraCreditCardProps } from "../types";
import { computeRow, getLetterFromPercentage, LETTERS, parseNum } from "../data";
import { Star } from "lucide-react";

export const ExtraCreditCard = memo(function ExtraCreditCard({
  course,
  updateExtraCreditField,
  onExtraLetterChange,
}: ExtraCreditCardProps) {
  if (!course.showExtraCredit) return null;
  const ec = course.extraCredit!;
  const { pctStr, letter } = computeRow(ec);
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> Extra Credit (does not count toward 100% cap)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-3">
            <Input value={ec.name} onChange={(e) => updateExtraCreditField(course.id, "name", e.target.value)} placeholder="e.g., Bonus" />
          </div>
          <div className="col-span-2">
            <Input
              type="number"
              inputMode="decimal"
              value={ec.score}
              onChange={(e) => {
                const val = e.target.value;
                updateExtraCreditField(course.id, "score", val);
                const s = parseNum(val);
                const t = parseNum(ec.total);
                if (Number.isFinite(s) && Number.isFinite(t) && t > 0) updateExtraCreditField(course.id, "letter", getLetterFromPercentage((s / t) * 100));
              }}
              placeholder="e.g., 5"
            />
          </div>
          <div className="col-span-2">
            <Input
              type="number"
              inputMode="decimal"
              value={ec.total}
              onChange={(e) => {
                const val = e.target.value;
                updateExtraCreditField(course.id, "total", val);
                const s = parseNum(ec.score);
                const t = parseNum(val);
                if (Number.isFinite(s) && Number.isFinite(t) && t > 0) updateExtraCreditField(course.id, "letter", getLetterFromPercentage((s / t) * 100));
              }}
              placeholder="e.g., 10"
            />
          </div>
          <div className="col-span-2">
            <Select value={ec.letter || undefined} onValueChange={(v) => onExtraLetterChange(course.id, v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {LETTERS.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Input
              type="number"
              inputMode="decimal"
              value={ec.weight}
              onChange={(e) => updateExtraCreditField(course.id, "weight", e.target.value)}
              placeholder="e.g., 5"
            />
          </div>
          <div className="col-span-1 text-right text-sm tabular-nums">
            {pctStr}{pctStr && "%"} {pctStr && <span className="text-muted-foreground">/ {letter}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
