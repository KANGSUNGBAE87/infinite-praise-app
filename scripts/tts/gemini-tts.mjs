#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const defaultModel = "gemini-2.5-flash-preview-tts";
const defaultVoice = "Kore";

const situationDirection = {
  endured: "The listener has endured the day and needs quiet witness, not pressure.",
  started: "The listener barely started and needs the small beginning to be noticed.",
  finished: "The listener completed something and needs permission to put it down.",
  rested: "The listener rested and needs the rest to feel legitimate.",
  held_back: "The listener held back anger or impulse and needs that restraint seen.",
  cared: "The listener did basic self-care and needs ordinary care to feel important.",
  brave: "The listener acted despite fear and needs courage acknowledged without exaggeration."
};

const moodDirection = {
  tired: "gentle, low-energy, slow, warm, with small pauses",
  anxious: "steady, grounding, careful, no future guarantees",
  numb: "soft, quiet, accepting, without forcing emotion",
  proud: "warm, lightly smiling, letting pride stay",
  angry: "firm but calm, respecting boundaries",
  guilty: "gentle, nonjudgmental, easing guilt without dismissing it",
  calm: "quiet, simple, unforced",
  energize: "warm rally energy, bigger and brighter, but not shouting"
};

const usage = `Usage:
  node scripts/tts/gemini-tts.mjs --dry-run --text "문장" --situation rested --mood guilty
  GEMINI_API_KEY=... node scripts/tts/gemini-tts.mjs --text "문장" --out ai/tts-previews/sample.wav --situation rested --mood guilty

Options:
  --text        Korean line to speak exactly as written. Required.
  --situation   endured | started | finished | rested | held_back | cared | brave
  --mood        tired | anxious | numb | proud | angry | guilty | calm | energize
  --out         Output wav path. Default: ai/tts-previews/gemini-preview.wav
  --voice       Gemini prebuilt voice name. Default: Kore
  --model       Gemini TTS model. Default: ${defaultModel}
  --dry-run     Print request JSON without calling the API.
`;

const readArgs = (argv) => {
  const args = {
    out: "ai/tts-previews/gemini-preview.wav",
    voice: defaultVoice,
    model: defaultModel,
    dryRun: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (!arg?.startsWith("--")) {
      continue;
    }

    const key = arg.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    args[key] = value;
    index += 1;
  }

  return args;
};

const createPrompt = ({ text, situation, mood, voice, model }) => {
  if (!text) {
    throw new Error("--text is required");
  }
  if (!situationDirection[situation]) {
    throw new Error(`Unsupported --situation: ${situation ?? ""}`);
  }
  if (!moodDirection[mood]) {
    throw new Error(`Unsupported --mood: ${mood ?? ""}`);
  }

  return {
    provider: "gemini",
    model,
    voice,
    text,
    prompt: [
      "Read the Korean line exactly as written.",
      "Do not add words, do not translate, and do not explain.",
      situationDirection[situation],
      `Delivery style: ${moodDirection[mood]}.`,
      "Make it feel like a scene line spoken by someone who noticed what the listener went through."
    ].join(" ")
  };
};

const createGeminiBody = ({ text, prompt, voice }) => ({
  contents: [
    {
      parts: [
        {
          text: `${prompt}\n\nLine to speak exactly:\n${text}`
        }
      ]
    }
  ],
  generationConfig: {
    responseModalities: ["AUDIO"],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: voice
        }
      }
    }
  }
});

const writeUInt32 = (buffer, value, offset) => {
  buffer.writeUInt32LE(value, offset);
};

const writeUInt16 = (buffer, value, offset) => {
  buffer.writeUInt16LE(value, offset);
};

const createWavFromPcm = (pcm, sampleRate = 24000, channels = 1, bitsPerSample = 16) => {
  const header = Buffer.alloc(44);
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;

  header.write("RIFF", 0);
  writeUInt32(header, 36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  writeUInt32(header, 16, 16);
  writeUInt16(header, 1, 20);
  writeUInt16(header, channels, 22);
  writeUInt32(header, sampleRate, 24);
  writeUInt32(header, byteRate, 28);
  writeUInt16(header, blockAlign, 32);
  writeUInt16(header, bitsPerSample, 34);
  header.write("data", 36);
  writeUInt32(header, pcm.length, 40);

  return Buffer.concat([header, pcm]);
};

const findAudioData = (payload) => {
  const parts = payload?.candidates?.[0]?.content?.parts ?? [];
  const audioPart = parts.find((part) => part.inlineData?.data);

  if (!audioPart) {
    throw new Error("Gemini response did not include inline audio data");
  }

  return Buffer.from(audioPart.inlineData.data, "base64");
};

const synthesize = async ({ apiKey, request, out }) => {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${apiKey}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(createGeminiBody(request))
  });

  if (!response.ok) {
    throw new Error(`Gemini TTS failed: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  const pcm = findAudioData(payload);
  const wav = createWavFromPcm(pcm);
  const outputPath = resolve(out);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, wav);

  return {
    ...request,
    out: outputPath,
    bytes: wav.length
  };
};

const main = async () => {
  try {
    const args = readArgs(process.argv.slice(2));
    const request = createPrompt(args);

    if (args.dryRun) {
      console.log(JSON.stringify(request, null, 2));
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required unless --dry-run is used");
    }

    const result = await synthesize({ apiKey, request, out: args.out });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error(usage);
    process.exitCode = 1;
  }
};

await main();
