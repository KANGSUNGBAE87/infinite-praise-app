import { describe, expect, it } from "vitest";
import { createI18n, isLocale, localeOptions } from "../src/i18n";

describe("i18n", () => {
  it("supports Korean and English with future locale extension points", () => {
    expect(localeOptions.map((option) => option.id)).toEqual(["ko", "en"]);
    expect(isLocale("ko")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("ja")).toBe(false);

    const en = createI18n("en");
    expect(en.t("app.title")).toBe("Praise Me");
    expect(en.t("app.subtitle")).toBe("One line a day, be a little kinder to yourself.");
  });
});
