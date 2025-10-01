import { memo } from "react";

// Memoized header row to prevent unnecessary re-renders
export const HeaderRow = memo(function HeaderRow() {
  return (
    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
      <div className="col-span-3">Assessment Name</div>
      <div className="col-span-2">Score</div>
      <div className="col-span-2">Total</div>
      <div className="col-span-2">Letter Grade</div>
      <div className="col-span-2">% of Class Grade</div>
      <div className="col-span-1 text-right">
        <span className="sr-only">Actions</span>
      </div>
    </div>
  );
});