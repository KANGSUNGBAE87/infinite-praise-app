import { describe, expect, it } from "vitest";
import {
  getNagTemplatesByIntensity,
  getTemplateById,
  getTemplatesByMode,
  messageTemplates
} from "../src/domain/reminders/templates";

const bannedNagSubstrings = [
  "한심",
  "의지",
  "망한다",
  "살 빼",
  "왜 맨날",
  "치료",
  "상담",
  "진단",
  "우울 개선",
  "불안 개선"
];

describe("reminder message templates v0.1", () => {
  it("keeps release template records complete and excludes custom templates", () => {
    const ids = new Set<string>();

    for (const template of messageTemplates) {
      expect(template.id).toMatch(/^[a-z0-9-]+$/);
      expect(ids.has(template.id), template.id).toBe(false);
      ids.add(template.id);

      expect(["praise", "nag"]).toContain(template.mode);
      expect(template.mode).not.toBe("custom");
      expect(template.displayText.trim()).toBe(template.displayText);
      expect(template.displayText.length).toBeGreaterThan(0);
      expect(template.notificationText.trim()).toBe(template.notificationText);
      expect(template.notificationText.length).toBeGreaterThan(0);
      expect(Array.isArray(template.tags)).toBe(true);
      expect(template.tags.length).toBeGreaterThan(0);
      expect(template.status).toBe("release");

      if ("voiceCandidate" in template) {
        expect(typeof template.voiceCandidate).toBe("boolean");
      }
    }
  });

  it("includes the v0.1 release counts for praise and nag intensities", () => {
    expect(getTemplatesByMode("praise")).toHaveLength(5);
    expect(getNagTemplatesByIntensity("soft")).toHaveLength(5);
    expect(getNagTemplatesByIntensity("direct")).toHaveLength(5);
  });

  it("does not ship strong nag templates in v0.1", () => {
    expect(
      messageTemplates.some(
        (template) => (template.intensity as string | undefined) === "strong"
      )
    ).toBe(false);
    expect(() => getNagTemplatesByIntensity("strong")).toThrow(/Unsupported nag intensity/);
  });

  it("keeps nag copy free of shame and diagnosis phrasing", () => {
    const nagTemplates = getTemplatesByMode("nag");

    for (const template of nagTemplates) {
      const searchableText = [
        template.displayText,
        template.notificationText,
        template.voiceCandidate ?? ""
      ].join(" ");

      for (const banned of bannedNagSubstrings) {
        expect(searchableText, `${template.id} contains ${banned}`).not.toContain(banned);
      }
    }
  });

  it("looks up templates by mode, intensity, and id", () => {
    const praiseTemplates = getTemplatesByMode("praise");
    const softNagTemplates = getNagTemplatesByIntensity("soft");
    const directNagTemplates = getNagTemplatesByIntensity("direct");

    expect(praiseTemplates.every((template) => template.mode === "praise")).toBe(true);
    expect(softNagTemplates.every((template) => template.intensity === "soft")).toBe(true);
    expect(directNagTemplates.every((template) => template.intensity === "direct")).toBe(true);
    expect(getTemplatesByMode("custom")).toEqual([]);

    expect(getTemplateById(praiseTemplates[0]?.id ?? "")).toBe(praiseTemplates[0]);
    expect(getTemplateById("missing-template")).toBeUndefined();
  });
});
