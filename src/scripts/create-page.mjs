#!/usr/bin/env node
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import * as LucideIcons from "lucide-react"; // 👈 Import all Lucide icons

const appDir = path.resolve("src/app");
const platformTsPath = path.resolve("src/components/sidebar/platform.ts");

const categories = [
  { id: "home", title: "Home" },
  { id: "academics", title: "Academics" },
  { id: "campus-life", title: "Campus Life" },
  { id: "cultural-life", title: "Cultural Life" },
  { id: "my-resources", title: "My Resources" },
];

async function main() {
  const { pageName, icon, description, category } = await inquirer.prompt([
    { type: "input", name: "pageName", message: "Page name:" },
    { type: "input", name: "icon", message: "Lucide icon (e.g. Calendar):" },
    { type: "input", name: "description", message: "Description (optional):" },
    {
      type: "list",
      name: "category",
      message: "Choose category:",
      choices: categories.map((c) => ({ name: c.title, value: c.id })),
    },
  ]);

  // ✅ Validate icon exists in Lucide
  if (!(icon in LucideIcons)) {
    console.error(`❌ Error: "${icon}" is not a valid Lucide icon.`);
    console.error(`ℹ️  See all icons at https://lucide.dev/icons/`);
    process.exit(1);
  }

  const route = toKebab(pageName);
  const title = toTitle(pageName);
  const desc = description || "This is a placeholder description.";

  // 1. Create new page
  const pageDir = path.join(appDir, route);
  await fs.ensureDir(pageDir);

  const pageFile = path.join(pageDir, "page.tsx");
  const pageTemplate = `import PageTitle from "@/components/page-title";
import { ${icon} } from "lucide-react";

export default function ${toComponentName(route)}Page() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle
        text="${title}"
        icon={${icon}}
        subheading="${desc}"
      />
    </div>
  );
}`;
  await fs.writeFile(pageFile, pageTemplate);

  // 2. Register the tool in the platform sidebar config — the single place that
  //    holds the icon import and the entry. No icon map, no JSON mirror.
  if (await fs.pathExists(platformTsPath)) {
    let platformCode = await fs.readFile(platformTsPath, "utf-8");

    // 2a. Add the icon to the lucide-react import block if it is not there yet.
    const importMatch = platformCode.match(
      /import\s*{\s*([\s\S]*?)\s*}\s*from\s*"lucide-react";/
    );
    if (importMatch) {
      const existing = importMatch[1]
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);
      if (!existing.includes(icon)) {
        existing.push(icon);
        existing.sort((a, b) => a.localeCompare(b));
        platformCode = platformCode.replace(
          importMatch[0],
          `import {\n  ${existing.join(",\n  ")},\n} from "lucide-react";`
        );
      }
    }

    // 2b. Append the entry to the chosen category.
    const categoryRegex = new RegExp(
      `(id:\\s*["']${category}["'][\\s\\S]*?items:\\s*\\[)([\\s\\S]*?)(\\],)`,
      "m"
    );
    platformCode = platformCode.replace(categoryRegex, (match, prefix, items, suffix) => {
      const newItem = `\n        { title: "${title}", icon: ${icon}, href: "/${route}" },`;
      return `${prefix}${items.trimEnd()}${newItem}\n      ${suffix}`;
    });

    await fs.writeFile(platformTsPath, platformCode);
  }

  platform.log(`✅ Created page at app/${route}/page.tsx`);
  platform.log(`✅ Added to category "${category}" in platform.ts`);
  platform.log(`   Set roles / hideFor on the new entry if it is not for everyone.`);
}

// helpers
function toKebab(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}
function toTitle(str) {
  return str.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function toComponentName(route) {
  return route
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

main();
