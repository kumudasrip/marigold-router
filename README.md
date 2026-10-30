# Marigold /router

> **A private place for the stories that stay.**

<img width="2512" height="1260" alt="Screenshot 2026-10-30 181418" src="https://github.com/user-attachments/assets/ab060c56-a62b-4e5a-974a-4064a05c52ce" />

<p align="center">
  An offline-first oral-history studio and virtual ofrenda for collecting memories, photographs, recipes, and voices without recreating the people behind them.
</p>

<p align="center">
  Built for <strong>Hacktoberfest 2026 Open-Source AI Challenge: Week 4</strong>
</p>

---

## The idea

Important memories often live in ordinary details: a cardamom tea ritual, a
song on the radio at dusk, a photograph from a garden, or a sentence someone
said once and never wrote down.

Marigold /router is designed to help people keep those details close. It
combines a warm, ofrenda-inspired archive with local AI tools that can help
organise and retrieve memories while keeping the data on the user's machine.

This project is intentionally **not** a digital recreation of a person. The
Guide does not speak as the deceased, invent missing details, or turn a family
archive into a fictional chatbot. When the answer is not present, it says so.

[Watch the demo 🚀](https://youtu.be/t74MdHNO8nM?si=TRmUi6bRflMOHTtK)

## Why local AI?

The archive is personal by design. Marigold uses local tools instead of a
hosted AI backend:

- **Privacy:** stories and audio do not need to leave the device.
- **Offline-first use:** the browser archive works without an account or cloud
  service.
- **User control:** Ollama models can be selected locally and replaced without
  changing the application.
- **Transparent limitations:** unsupported questions receive an explicit
  “not in the archive” response.
- **Responsible memory work:** AI helps with organisation and retrieval; it
  does not impersonate people or manufacture family history.

## Features

### A local memory archive

- Add written stories, photographs, and voice notes.
- Store memories in the current browser profile using `localStorage`.
- Search the archive and filter by story, photo, or voice.
- View source, year, tags, transcript, and memory details.
- Browse a lightweight timeline of saved entries.
- Export the archive as a standalone HTML file.

### Ofrenda Guide

- Ask questions about the memories already in the archive.
- Retrieve relevant entries using local archive context.
- Display source titles alongside grounded answers.
- Refuse clearly when the archive does not support a question.
- Never answer in the voice or identity of a deceased person.

### Local AI studio

- Connect directly to Ollama at `http://localhost:11434`.
- Discover installed models through Ollama's `/api/tags` endpoint.
- Use `gemma4:e4b` for local curation and Guide responses.
- Extract transparent thematic threads from the archive.
- Clean punctuation and paragraph breaks in pasted transcripts.
- Continue working with deterministic fallback behaviour when Ollama is
  unavailable.

### Local voice transcription

- Optionally run Faster-Whisper as a localhost service.
- Transcribe multilingual voice notes before saving them.
- Keep both the original audio and transcript in the local browser archive.
- Configure the Whisper model, device, and compute type with environment
  variables.

## Quick start

### Prerequisites

- Git
- A modern browser
- Python 3.10+ for the optional Whisper service
- [Ollama](https://ollama.com) for the local AI features
- Windows PowerShell, macOS Terminal, or a Linux shell

### 1. Clone the repository

```powershell
git clone https://github.com/kumudasrip/marigold-router.git
cd marigold-router
```

### 2. Start the browser app

Marigold is a dependency-free static frontend. No npm install or build step
is required.

```powershell
py -m http.server 4173
```

Open:

<http://localhost:4173>

The archive, search, filters, fallback Guide, and export work without Ollama
or Whisper. The local AI and transcription services are optional additions.

## Enable local Gemma AI with Ollama

Marigold calls Ollama directly from the browser. There is no Marigold backend
and no hosted AI API key.

### Install and verify the model

Install Ollama, then check the installed models:

```powershell
ollama list
```

Install the recommended model if necessary:

```powershell
ollama pull gemma4:e4b
```

Ollama normally starts in the background. If it is not running, configure the
browser origin and start it:

```powershell
$env:OLLAMA_ORIGINS="http://localhost:4173"
ollama serve
```

If PowerShell reports:

```text
bind: Only one usage of each socket address is normally permitted
```

Ollama is already running on port `11434`; do not start a second instance.
Open the app and use the existing server. Only restart Ollama with
`OLLAMA_ORIGINS` when the browser is blocked by CORS.

### Connect from Marigold

1. Open the **Local AI** section.
2. Set the endpoint to `http://localhost:11434`.
3. Select `gemma4:e4b`.
4. Click **Test text AI**.

You can verify Ollama independently with:

```powershell
Invoke-WebRequest http://localhost:11434/api/tags
```

## Enable local audio transcription with Faster-Whisper

The browser cannot load the Python speech model directly, so Marigold includes
an optional small FastAPI service that runs on your machine.

Open a second terminal:

```powershell
cd marigold-router
py -m venv .venv-whisper
.\.venv-whisper\Scripts\Activate.ps1
python -m pip install -r requirements-whisper.txt
$env:WHISPER_MODEL="small"
python -m uvicorn whisper_service:app --host 127.0.0.1 --port 8000
```

The first launch downloads the selected model. Available model choices include:

| Model | Best for |
| --- | --- |
| `base` | Lower memory use and faster CPU transcription |
| `small` | Recommended quality/speed balance |
| `medium` | Higher quality with greater memory and compute requirements |

Check the service:

```powershell
Invoke-WebRequest http://localhost:8000/health
```

The app's Whisper endpoint should be:

```text
http://localhost:8000
```

Then choose **Add a memory**, select **Voice note**, and attach an audio file.
The transcript is produced locally and saved with the memory.

### Optional Whisper configuration

```powershell
$env:WHISPER_MODEL="base"
$env:WHISPER_DEVICE="cpu"
$env:WHISPER_COMPUTE_TYPE="int8"
```

The service accepts audio files up to 50 MB and removes its temporary upload
file after transcription.

## How it works

```text
                   ┌─────────────────────────────┐
                   │        Browser archive      │
                   │  memories · search · export │
                   └──────────────┬──────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       Local fallback       Ollama / Gemma       Faster-Whisper
       retrieval + tags     curation + Guide     audio transcript
              │                   │                   │
              └───────────────────┴───────────────────┘
                                  │
                         Browser localStorage
```

1. The user adds a story, image, or audio note.
2. The browser stores the archive locally.
3. Optional Whisper converts audio to text on the same machine.
4. Optional Ollama extracts themes or answers questions from archive context.
5. The Guide returns grounded text and source references.
6. The user can export a standalone HTML memorial.

## Privacy and responsible AI

- No account or authentication is required.
- Memories are stored in the current browser profile's `localStorage`.
- Ollama requests use the configured local endpoint.
- Whisper audio is sent only to the local transcription service.
- The Guide does not impersonate the deceased.
- The Guide does not invent unsupported details.
- Demo data should be synthetic or shared with consent.
- Browser `localStorage` is not encryption and should not be treated as a
  secure vault for highly sensitive material.

## Project structure

```text
.
├── index.html                 Main application shell
├── styles.css                 Ofrenda visual system and responsive layout
├── app.js                     Archive state, AI adapters, and interactions
├── logo.png                   Marigold /router logo and favicon source
├── whisper_service.py         Optional local Faster-Whisper API
├── requirements-whisper.txt  Whisper service dependencies
├── README.md                 Project documentation
└── .gitignore                Local environments, models, media, and exports
```

## Troubleshooting

### The app looks unstyled or changes do not appear

- Hard refresh with **Ctrl + Shift + R**.
- Confirm the server is running from the repository root.
- Use the exact origin `http://localhost:4173`.
- Do not open `index.html` directly with `file://`.

### Ollama does not connect

- Confirm Ollama is running.
- Visit <http://localhost:11434/api/tags>.
- Confirm `gemma4:e4b` appears in the response.
- Set `OLLAMA_ORIGINS` before restarting Ollama if CORS blocks the browser.
- Confirm the endpoint in the Local AI panel is
  `http://localhost:11434`.

### Whisper transcription fails

- Keep the Whisper terminal running.
- Check <http://localhost:8000/health>.
- Confirm the file is audio and smaller than 50 MB.
- Try `WHISPER_MODEL=base` if the machine runs out of memory.
- Recreate the virtual environment if dependencies are incompatible with the
  selected Python installation.

### Memories appear to be missing

Memories belong to a browser profile and origin. Use the same browser and
`http://localhost:4173` address. Changing ports, clearing site data, private
browsing, or switching browsers creates a different local storage location.

## License

No license has been added yet. Unless and until a license is included, reuse and redistribution are not granted by this repository.
