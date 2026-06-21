import { describe, expect, it } from "vitest";
import { defaultPraiseCatalog, praiseMoods, praiseSituations } from "../src/core/praiseCatalog";

describe("default praise catalog", () => {
  it("has at least three normal candidates for every situation and mood", () => {
    for (const situation of praiseSituations) {
      for (const mood of praiseMoods) {
        const candidates = defaultPraiseCatalog.filter(
          (candidate) =>
            candidate.situation === situation &&
            candidate.mood === mood &&
            candidate.depth === "normal"
        );

        expect(candidates, `${situation}/${mood}`).toHaveLength(3);
      }
    }
  });

  it("does not reuse the same praise text", () => {
    const texts = defaultPraiseCatalog.map((candidate) => candidate.text);

    expect(new Set(texts).size).toBe(texts.length);
  });

  it("avoids one boilerplate sentence across the normal catalog", () => {
    const normalTexts = defaultPraiseCatalog
      .filter((candidate) => candidate.depth === "normal")
      .map((candidate) => candidate.text);
    const boilerplateCount = normalTexts.filter((text) =>
      text.includes("분명히 의미가 있어")
    ).length;

    expect(boilerplateCount).toBeLessThan(normalTexts.length / 3);
  });

  it("avoids copy that sounds generated or generic", () => {
    const normalText = defaultPraiseCatalog
      .filter((candidate) => candidate.depth === "normal")
      .map((candidate) => candidate.text)
      .join(" ");

    expect(normalText).not.toMatch(/작아 보일 수 있지만|좋은 장면|분명히|충분히 의미/);
  });

  it("does not rely on noun-phrase templates for most first variants", () => {
    const nounPhraseTemplateCount = defaultPraiseCatalog.filter((candidate) =>
      /것은|일은/.test(candidate.text)
    ).length;

    expect(nounPhraseTemplateCount).toBeLessThan(20);
  });

  it("keeps high-energy encouragement inside the energize mood", () => {
    const energizeText = defaultPraiseCatalog
      .filter((candidate) => candidate.mood === "energize")
      .map((candidate) => candidate.text)
      .join(" ");
    const nonEnergizeText = defaultPraiseCatalog
      .filter((candidate) => candidate.mood !== "energize")
      .map((candidate) => candidate.text)
      .join(" ");

    expect(energizeText).toMatch(/할 수 있어|잘하고 있어/);
    expect(nonEnergizeText).not.toMatch(/무조건 할 수 있어|넌 최고야/);
  });
});
