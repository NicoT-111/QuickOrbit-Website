import { mkdir, copyFile, writeFile } from "node:fs/promises";

// Static entry points keep direct links and refreshes working on GitHub Pages.
for (const route of ["features", "live", "pricing", "faq", "privacy", "imprint", "terms"]) {
  await mkdir(`dist/client/${route}`, { recursive: true });
  await copyFile("dist/client/index.html", `dist/client/${route}/index.html`);
}
await copyFile("dist/client/index.html", "dist/client/404.html");
await writeFile("dist/client/.nojekyll", "");
