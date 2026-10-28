# Marigold Router

Marigold Router is a private, offline-first oral-history and virtual ofrenda
builder. It helps families gather stories without pretending to recreate the
people they remember.

## Run it

No build step or package install is required. From this folder, run any local
static server, for example:

```powershell
py -m http.server 4173
```

Then open <http://localhost:4173>.

The app stores demo memories in the browser's `localStorage`. Nothing is
uploaded. Image files are kept as browser data URLs for the duration of the
local demo. Use **Export memorial** to download a self-contained HTML snapshot
that includes the gallery, citations, and a keyword-searchable guide.

## Local model integration

The interface is designed around local Ollama/Whisper workflows, but the
frontend intentionally has no network dependency. The Curator uses transparent
keyword tagging and source citations as a safe fallback when a local model is
not connected. A production adapter can replace `curateMemory()` and
`answerGuide()` in `app.js` with calls to a local Ollama or Whisper endpoint.

## Responsible AI promise

- Marigold Router does not impersonate or generate responses as the deceased.
- Every answer points back to a memory source.
- Unknown questions are refused instead of filled with invented details.
- Use synthetic or consented material for demos.