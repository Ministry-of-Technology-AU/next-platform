import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

let cachedCities = null;

function getCities() {
  if (cachedCities) return cachedCities;
  const filePath = path.join(process.cwd(), 'components', 'cities.json');
  const data = fs.readFileSync(filePath, 'utf-8');
  cachedCities = JSON.parse(data);
  return cachedCities;
}


// API route disabled. No city search is provided.
export async function GET() {
  return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
