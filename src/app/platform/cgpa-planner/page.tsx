"use server";

import React from "react";
import CGPAPlanner from "./cgpa-planner";
import { cookies } from "next/headers";

import type { ParsedCGPAData } from "./types";

async function fetchCGPAData(): Promise<ParsedCGPAData | null> {
  const cookieStore = await cookies();
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/platform/cgpa-planner`, {
      cache: 'no-store',
      headers: { 'Cookie': cookieStore.toString() },
    });
    console.log('CGPAPlanner: Response status:', response.status);
    if (response.ok) {
      const result = await response.json();
      console.log('CGPAPlanner: API result:', result);
      if (result.success && result.data) {
        return result.data as ParsedCGPAData;
      } else {
        console.log('CGPAPlanner: No CGPA data found in API result.');
      }
    } else {
      console.error('CGPAPlanner: Response not OK:', response.status, await response.text());
    }
  } catch (e) {
    console.error('Error fetching CGPA Data:', e);
  }
  return null;
}


export default async function CGPAPlannerPage(){
    const cgpaData = await fetchCGPAData();
    return (<div className="mt-2 xs:mt-3 sm:mt-4 md:mt-5 mx-2 xs:mx-3 sm:mx-4 md:mx-6 mb-2 xs:mb-3 sm:mb-4">
        <CGPAPlanner data={cgpaData}/>
    </div>);
}