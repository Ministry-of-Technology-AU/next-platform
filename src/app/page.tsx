"use client";
import PageTitle from "@/components/page-title"
import { PenBoxIcon } from "lucide-react";
import { useEffect } from "react";
import { strapiGet } from "@/apis/strapi";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <PageTitle text="Try Page" icon={PenBoxIcon} subheading="Placeholder"></PageTitle>
    </div>
  );
}
