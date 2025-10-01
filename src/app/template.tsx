"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Loader from "./loading";

const MIN_DISPLAY_MS = 1000;

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    setShowLoader(true);
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, MIN_DISPLAY_MS);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {showLoader && (
        <div className="loader-overlay" role="status" aria-live="polite">
          <Loader />
        </div>
      )}
      <div className={showLoader ? "page-shell is-loading" : "page-shell"}>
        {children}
      </div>
    </>
  );
}
