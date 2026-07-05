import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const sharedPublicEnvPath = "/Users/kangsungbae/.config/sungbae/shared-env/supabase-public.env.local";

function loadSharedPublicEnv() {
  if (!existsSync(sharedPublicEnvPath)) return {};
  const loaded: Record<string, string> = {};
  for (const rawLine of readFileSync(sharedPublicEnvPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (!key.startsWith("VITE_")) continue;
    const value = rawValue.trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
    loaded[key] = process.env[key] ?? value;
  }
  return loaded;
}

const sharedPublicEnv = loadSharedPublicEnv();

export default defineConfig({
  plugins: [react()],
  base: "/infinite-praise-app/",
  define: Object.fromEntries(
    Object.entries(sharedPublicEnv).map(([key, value]) => [
      `import.meta.env.${key}`,
      JSON.stringify(value),
    ]),
  ),
});
