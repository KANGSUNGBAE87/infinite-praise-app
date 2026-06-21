import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("Gemini TTS CLI", () => {
  it("prints a dry-run request without requiring an API key", async () => {
    const { stdout } = await execFileAsync("node", [
      "scripts/tts/gemini-tts.mjs",
      "--dry-run",
      "--text",
      "오늘은 여기까지 해도 돼.",
      "--situation",
      "endured",
      "--mood",
      "tired"
    ]);
    const parsed = JSON.parse(stdout);

    expect(parsed.provider).toBe("gemini");
    expect(parsed.text).toBe("오늘은 여기까지 해도 돼.");
    expect(parsed.model).toMatch(/tts/);
    expect(parsed.prompt).toContain("Korean");
  });
});
