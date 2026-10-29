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

## Local AI integration

The app now has a real optional Ollama adapter and still works fully offline
without it:

1. Install Ollama from <https://ollama.com>.
2. Pull an open model, for example `ollama pull gemma4:e4b`.
3. Allow browser requests for the local app before starting Ollama:

   ```powershell
   $env:OLLAMA_ORIGINS="http://localhost:4173"
   ollama serve
   ```

4. Open the **Local AI** section, keep the endpoint at
   `http://localhost:11434`, choose the detected model, and select **Test
   connection**.

When connected, Ollama powers:

- Curator thread extraction as structured JSON
- Retrieval-grounded Guide answers with memory-number citations
- Transcript punctuation and paragraph cleanup
- Local model discovery through `/api/tags`

The browser calls Ollama directly; there is no Marigold backend. If the
connection fails, the app explicitly returns to its transparent keyword
curator and deterministic retrieval fallback. The Guide still refuses to
invent missing details.

## Responsible AI promise

- Marigold Router does not impersonate or generate responses as the deceased.
- Every answer points back to a memory source.
- Unknown questions are refused instead of filled with invented details.
- Use synthetic or consented material for demos.