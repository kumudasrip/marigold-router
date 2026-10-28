# Marigold Router

Marigold is a private, offline-first oral-history studio and virtual ofrenda
builder. It helps families gather stories without pretending to recreate the
people they remember.

## Run it

No build step or package install is required. From this folder, run any local
static server, for example:

```powershell
py -m http.server 4173
```

Then open <http://localhost:4173>.

The app stores memories in the browser's `localStorage`. Nothing is uploaded.
Image and audio attachments are kept as browser data URLs in the local archive.
Use **Export your archive** to download a self-contained HTML snapshot with
the memories and their sources.

## What is included

- Story-led landing page with the project's responsible-AI promise
- Archive cabinet with search, format filters, timeline, and memory detail drawer
- Memory capture modal for written stories, photographs, and voice-note files
- Local Curator with suggested threads and a visible processing state
- Whisper companion surface for preparing a transcript without changing its words
- Ofrenda Guide with source-backed retrieval, natural-language intent matching,
  and explicit refusal when a detail is missing
- Local-only privacy panel and downloadable memorial export

## Local model integration

The interface is designed around local Ollama/Whisper workflows, but the
frontend intentionally has no network dependency. The Curator uses transparent
keyword tagging and source citations as a safe fallback when a local model is
not connected. The transcript panel is ready for a local Whisper adapter.
A production integration can replace `curateMemory()` and `answerGuide()` in
`app.js` with calls to local Ollama while preserving the same refusal and
citation contract.

## Responsible AI promise

- Marigold Router does not impersonate or generate responses as the deceased.
- Every answer points back to a memory source.
- Unknown questions are refused instead of filled with invented details.
- Use synthetic or consented material for demos.