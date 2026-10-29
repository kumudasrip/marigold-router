"""Small localhost Faster-Whisper service for Marigold Router."""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel

app = FastAPI(title="Marigold local Whisper")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4173", "http://127.0.0.1:4173"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

MODEL_SIZE = os.getenv("WHISPER_MODEL", "small")
model = WhisperModel(MODEL_SIZE, device=os.getenv("WHISPER_DEVICE", "cpu"), compute_type=os.getenv("WHISPER_COMPUTE_TYPE", "int8"))


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": MODEL_SIZE}


@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)) -> dict[str, object]:
    if not audio.content_type or not audio.content_type.startswith("audio/"):
        raise HTTPException(status_code=415, detail="Upload an audio file.")
    suffix = Path(audio.filename or "voice-note.wav").suffix or ".wav"
    temporary_path: str | None = None
    try:
        contents = await audio.read()
        if not contents:
            raise HTTPException(status_code=400, detail="The audio file is empty.")
        if len(contents) > 50 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Audio files must be smaller than 50 MB.")
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temporary_file:
            temporary_file.write(contents)
            temporary_path = temporary_file.name
        segments, info = model.transcribe(temporary_path, beam_size=5, vad_filter=True)
        text = " ".join(segment.text.strip() for segment in segments).strip()
        return {"text": text, "language": info.language, "duration": info.duration}
    except HTTPException:
        raise
    except (OSError, RuntimeError) as error:
        raise HTTPException(status_code=500, detail=f"Whisper could not process the audio: {error}") from error
    finally:
        if temporary_path:
            try:
                Path(temporary_path).unlink(missing_ok=True)
            except OSError:
                pass
