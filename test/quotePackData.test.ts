import { describe, expect, it } from "vitest";
import audioManifest from "../src/data/audio-manifest.v0.1.json";
import quotePack from "../src/data/quote-pack.v0.1.json";

describe("칭찬해줘 QuotePack 데이터", () => {
  it("keeps the final v0.1 release pack and audio manifest aligned", () => {
    const releasePack = quotePack.releasePack;
    const assets = audioManifest.assets;
    const assetById = new Map(assets.map((asset) => [asset.id, asset]));

    expect(releasePack).toHaveLength(25);
    expect(assets).toHaveLength(25);

    for (const quote of releasePack) {
      const asset = assetById.get(quote.audioId);

      expect(asset).toBeDefined();
      expect(asset?.fileName).toBe(`${quote.audioId}.mp3`);
      expect(asset?.path).toBe(`v0.1/${quote.audioId}.mp3`);
    }
  });

  it("includes the decided direct praise line in 잘했다고 해줘", () => {
    const quote = quotePack.releasePack.find((item) => item.id === "recognize-003");

    expect(quote?.displayText).toBe("넌 최고야. 잘하고 있어.");
    expect(quote?.spokenText).toBe("넌 최고야. 지금도 충분히 잘하고 있어.");
  });
});
