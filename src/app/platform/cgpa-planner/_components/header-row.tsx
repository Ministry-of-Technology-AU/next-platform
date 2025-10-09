import { memo } from "react";

// Memoized header row to prevent unnecessary re-renders
export const HeaderRow = memo(function HeaderRow() {
  return (
    <>
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden md:grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
        <div className="col-span-3">Assessment Name</div>
        <div className="col-span-2">Score</div>
        <div className="col-span-2">Total</div>
        <div className="col-span-2">Letter Grade</div>
        <div className="col-span-2">% of Class Grade</div>
        <div className="col-span-1 text-right">
          <span className="sr-only">Actions</span>
        </div>
      </div>
      
      {/* Mobile Header - Visible on mobile only */}
      <div className="md:hidden text-xs font-medium text-muted-foreground mb-2">
        <p className="text-sm">Assessment Components</p>
        <p className="text-muted-foreground/70">Fill in the details for each assessment</p>
      </div>
    </>
  );
});