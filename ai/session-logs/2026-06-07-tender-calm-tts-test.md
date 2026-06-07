# Session Log: Tender Calm TTS Test

Date: 2026-06-07
Actor/tool: codex

## User Request

Generate and play a TTS test for:

> 괜찮아. 지금은 조금 힘들어도, 우리 천천히 다시 해보면 돼.

Requested tone: tender, calm, and clear.

## Result

- Gemini TTS was not generated because `GEMINI_API_KEY` was not present in the
  local environment.
- Created a local macOS TTS preview with the Korean `Yuna` voice at a slower
  rate.
- Played the generated `.m4a` with `afplay`.

## Files Created

- `ai/tts-previews/tender-calm-clear-yuna.aiff`
- `ai/tts-previews/tender-calm-clear-yuna.m4a`

## Commands

```bash
say -v Yuna -r 135 -o ai/tts-previews/tender-calm-clear-yuna.aiff \
  "괜찮아. 지금은 조금 힘들어도, 우리 천천히 다시 해보면 돼."

afconvert -f m4af -d aac \
  ai/tts-previews/tender-calm-clear-yuna.aiff \
  ai/tts-previews/tender-calm-clear-yuna.m4a

afplay ai/tts-previews/tender-calm-clear-yuna.m4a
```

## Notes

This is useful as a fast local tone prototype. For production-quality tenderness,
compare against Gemini TTS or another high-quality Korean TTS provider once an
API key is available.
