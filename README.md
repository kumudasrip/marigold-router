# Marigold Router

> A private place for the stories that stay.

Marigold Router is an offline-first oral-history studio and virtual ofrenda
builder. It helps families gather stories, photographs, recipes, and voices
without pretending to recreate the people they remember.

The project is intentionally frontend-first. Memories live in the browser,
optional AI runs on the user's own machine, and missing details are refused
instead of invented.

## Features

### Archive and ofrenda

- Add written stories, photographs, and audio notes.
- Store memories locally in browser `localStorage`.
- Search the archive and filter by story, photo, or voice.
- Open a memory detail drawer with its source and tags.
- Review a lightweight memory timeline.
- Export a self-contained HTML memorial.

### Local AI studio

- Connect directly to a local Ollama server.
- Detect installed Ollama models through `/api/tags`.
- Use Gemma 4 e4b for archive thread extraction.
- Ask the Ofrenda Guide retrieval-grounded questions.
- Show source citations for Guide answers.
- Refuse questions unsupported by the archive.
- Prepare and clean oral-history transcripts locally.

### Local audio transcription

- Optional Faster-Whisper service for multilingual voice notes.
- Audio is sent only to `127.0.0.1`.
- The transcript is inserted into the memory before it is saved.
- The original audio is kept as local browser data for the demo.

## Quick start

Clone the repository:

```powershell
git clone https://github.com/kumudasrip/marigold-router.git
cd marigold-router
```

The browser app has no build step or package install.

```powershell
py -m http.server 4173
```

Open [http://localhost:4173](http://localhost:4173).

The app works without Ollama or Whisper using transparent local fallback
logic. For the complete AI experience, follow the sections below.

## Ollama setup

Marigold calls Ollama directly from the browser. No Marigold backend or cloud
AI service is involved.

1. Install Ollama from [ollama.com](https://ollama.com).
2. Confirm the model is installed:

   ```powershell
   ollama list
   ```

3. If needed, install Gemma 4 e4b:

   ```powershell
   ollama pull gemma4:e4b
   ```

4. If Ollama is not already running, allow the local Marigold origin and start
   it:

   ```powershell
   $env:OLLAMA_ORIGINS="http://localhost:4173"
   ollama serve
   ```

   If you see `bind: Only one usage of each socket address`, Ollama is already
   running. Do not start a second server. Restart it with the environment
   variable only if browser requests are blocked by CORS.

5. In Marigold's **Local AI** section:
   - Keep the Ollama endpoint as `http://localhost:11434`.
   - Choose `gemma4:e4b`.
   - Click **Test text AI**.

When connected, Ollama powers:

- Curator thread extraction as structured JSON.
- Guide answers grounded in the local archive.
- Citation selection from archive entries.
- Transcript punctuation and paragraph cleanup.

## Faster-Whisper setup

Faster-Whisper runs as a small localhost service because a normal browser
cannot load the Python speech model directly.

Open a second PowerShell window:

```powershell
cd marigold-router
py -m venv .venv-whisper
.\.venv-whisper\Scripts\Activate.ps1
python -m pip install -r requirements-whisper.txt
$env:WHISPER_MODEL="small"
python -m uvicorn whisper_service:app --host 127.0.0.1 --port 8000
```

The first start downloads the selected model. Choose a model based on the
machine:

| Model | Use |
|---|---|
| `base` | Faster and lighter CPU transcription |
| `small` | Recommended quality/speed balance |
| `medium` | Better quality, more memory and compute |

The Whisper endpoint in the app should be:

```text
http://localhost:8000
```

Check that the service is healthy:

```powershell
Invoke-WebRequest http://localhost:8000/health
```

Then open **Add a memory**, choose **Voice note**, and attach an audio file.
Whisper will transcribe it locally and Marigold will save the transcript with
the memory.

## Privacy and responsible AI

- No account or authentication is required.
- Memories remain in the current browser profile's `localStorage`.
- Ollama receives requests only through the configured local endpoint.
- Faster-Whisper receives audio only through the local transcription service.
- The Guide never speaks as or impersonates the deceased.
- Every AI answer is expected to cite archive material.
- Unsupported questions receive an explicit “not in the archive” response.
- Use synthetic or consented material for demos.

Browser storage is not encryption. Do not treat this demo as a secure vault
for highly sensitive material without adding encryption and a threat model.

## Repository layout

```text
.
├── index.html                 Main app shell and UI sections
├── styles.css                 Ofrenda visual system and responsive layout
├── app.js                    Archive state, AI adapters, and interactions
├── whisper_service.py         Optional local Faster-Whisper API
├── requirements-whisper.txt  Whisper service dependencies
├── README.md                 Setup and architecture documentation
└── .gitignore                Local environments, models, media, and exports
```

## Troubleshooting

### Ollama connection fails

- Confirm Ollama is running.
- Visit `http://localhost:11434/api/tags`.
- Confirm `gemma4:e4b` appears in the response.
- Restart Ollama with `OLLAMA_ORIGINS=http://localhost:4173` if needed.
- Refresh Marigold and click **Test text AI** again.

### Whisper transcription fails

- Confirm the service is running on port `8000`.
- Check `http://localhost:8000/health`.
- Confirm the file is a supported audio format and under 50 MB.
- Keep the Whisper PowerShell window open while transcribing.
- Use `WHISPER_MODEL=base` if the machine runs out of memory.

### Memories disappeared

Memories are tied to the browser profile and origin. Check that you are using
the same browser and `http://localhost:4173` origin. Clearing site data,
private browsing, or changing ports creates a different storage location.

## License

No license has been added yet. Unless and until a license is included, reuse and redistribution are not granted by this repository.