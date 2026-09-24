import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function TofuIcon({
  className,
  ...props
}: { className?: string } & Omit<React.ComponentProps<typeof Image>, "src" | "alt">) {
  return (
    <Image
      src="/tofu.svg"
      alt="Tofu"
      width={16}
      height={16}
      unoptimized
      className={cn("size-4 object-contain inline-block", className)}
      {...props}
    />
  );
}
