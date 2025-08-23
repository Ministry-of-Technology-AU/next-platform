#!/usr/bin/env node
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import * as LucideIcons from "lucide-react"; // 👈 Import all Lucide icons

const appDir = path.resolve("src/app");
const sidebarEntriesPath = path.resolve(
  "src/components/sidebar/sidebar-entries.json"
);
const sidebarTsxPath = path.resolve("src/components/sidebar/app-sidebar.tsx");

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

  // 2. Update sidebar-entries.json
  const sidebarEntries = await fs.readJSON(sidebarEntriesPath);
  const categoryObj = sidebarEntries.categories.find((c) => c.id === category);
  if (!categoryObj) {
    console.error(`❌ Category ${category} not found in sidebar-entries.json`);
    process.exit(1);
  }
  categoryObj.items.push({
    title,
    icon,
    href: `/${route}`,
  });
  await fs.writeJSON(sidebarEntriesPath, sidebarEntries, { spaces: 2 });

  // 3. Update app-sidebar.tsx
  let sidebarCode = await fs.readFile(sidebarTsxPath, "utf-8");

  // (a) Ensure icon is imported
  if (!new RegExp(`\\b${icon}\\b`).test(sidebarCode)) {
    sidebarCode = sidebarCode.replace(
      /(import\s*{\s*)([^}]*)(} from "lucide-react";)/,
      (match, start, icons, end) => {
        const newIcons = icons
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean);
        if (!newIcons.includes(icon)) newIcons.push(icon);
        return `${start}${newIcons.join(", ")}${end}`;
      }
    );
  }

  // (b) Ensure icon is added to iconMap
  // (b) Ensure icon is added to iconMap
  if (!new RegExp(`\\b${icon}:`).test(sidebarCode)) {
    sidebarCode = sidebarCode.replace(
      /const iconMap = {([^}]*)}/s,
      (match, p1) => {
        const entries = p1
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean);

        // avoid duplicates
        if (!entries.includes(icon)) {
          entries.push(icon);
        }

        return `const iconMap = {\n  ${entries.join(",\n  ")}\n}`;
      }
    );
  }

  await fs.writeFile(sidebarTsxPath, sidebarCode);

  console.log(`✅ Created page at app/${route}/page.tsx`);
  console.log(`✅ Added to category "${category}" in sidebar-entries.json`);
  console.log(`✅ Updated app-sidebar.tsx with ${icon}`);
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
