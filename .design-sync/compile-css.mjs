import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const inPath = 'src/app/globals.css';
const outPath = '.ds-sync/compiled/globals.css';

const css = readFileSync(inPath, 'utf8');
const result = await postcss([tailwind()]).process(css, { from: inPath, to: outPath });
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, result.css);
console.log(`wrote ${outPath} (${(result.css.length / 1024).toFixed(1)} KB)`);
