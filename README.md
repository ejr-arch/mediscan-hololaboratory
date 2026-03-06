# MediScan HoloLaboratory

![CI/CD Pipeline](https://github.com/ejr-arch/mediscan-hololaboratory/actions/workflows/main.yml/badge.svg)

MediScan HoloLaboratory is a small **educational multimedia prototype** that demonstrates:

- Text input + (browser) speech-to-text input
- Simple rule-based “analysis” of symptoms
- A hologram-style video visualization (Pepper’s Ghost-inspired presentation)

**Disclaimer:** This project is for academic demonstration only and does not provide medical advice, diagnosis, or treatment.

## Project structure

- **`index.html`**
  - Demo login screen (client-side only)
  - Redirects to `boot.html`
- **`boot.html`**
  - Boot/loading screen animation
  - Redirects to `home.html`
- **`home.html`**
  - Main UI (symptom input, speech-to-text, analysis output, hologram video)
- **`script.js`**
  - Voice input using the Web Speech API
  - Rule-based keyword matching
  - Text-to-speech output
  - Switches the hologram video based on keywords
- **`style.css`**
  - Styling for the main UI page
- **`login.css`**
  - Extracted styling for `index.html` (login page)
- **`login.js`**
  - Extracted JS for `index.html` (login page)
- **`client/assets/`**
  - Videos/images used for the UI (e.g. `default.mp4`, `heart.mp4`, `lungs.mp4`, `pulse.mp4`)
- **`app.py`**
  - Flask server for local development
  - Serves the HTML/CSS/JS pages and `/client/assets/*` files
  - Provides `POST /generate` used by the frontend
- **`requirements.txt`**
  - Python dependencies for the Flask server

## How it works

1. You open `index.html` and “log in” (demo credentials).
2. The app shows a boot screen (`boot.html`) and then loads `home.html`.
3. On `home.html`:
   - Enter symptoms in the textarea and click **Analyze** (or press Enter)
   - Or click **Start Voice Input** to fill the textarea via speech-to-text
4. The UI:
   - Generates a short educational explanation
   - Speaks the explanation with text-to-speech
   - Switches the hologram video based on detected keywords

## Demo credentials

The login page uses client-side demo validation:

- **Username:** `admin`
- **Password:** `mediscan`

## Run (static / no backend)

Because the project uses browser APIs and video assets, you’ll typically want to run it from a local web server (instead of opening the HTML file directly).

### Option A: Python built-in server

From the project root:

```bash
python3 -m http.server 8000
```

Then open:

- `http://localhost:8000/index.html`

### Option B: Any static server

Use any static file server (VSCode Live Server, nginx, etc.) and open `index.html`.

## Run (optional Flask API)

`app.py` can serve the whole demo (pages + assets) and provides an endpoint that maps symptoms to an explanation + video.

If you have **Ollama** running locally, the backend will use a **free local LLM** to generate explanations for a wide range of symptoms.
If Ollama is not available, the backend will fall back to the built-in rule-based explanation.

### Install

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Start

```bash
python3 app.py
```

This starts a dev server (by default on `http://127.0.0.1:5000`). Open:

- `http://127.0.0.1:5000/`

### API

`POST /generate`

Request JSON:

```json
{ "symptoms": "I have chest pain" }
```

Response JSON:

```json
{
  "explanation": "Chest pain may indicate cardiovascular strain or reduced oxygen circulation.",
  "video_url": "/client/assets/heart.mp4"
}
```

Note: The frontend will try the backend first, and will fall back to local rule logic if the backend isn’t running.

### Optional: Enable LLM responses with Ollama (free, local)

1. Install Ollama: https://ollama.com
2. Pull a model, for example:

```bash
ollama pull llama3.2
```

3. Start the Ollama service (it typically listens on `http://127.0.0.1:11434`).

You can configure the backend with environment variables:

- **`OLLAMA_URL`** (default: `http://127.0.0.1:11434`)
- **`OLLAMA_MODEL`** (default: `llama3.2`)
- **`OLLAMA_TIMEOUT_SECONDS`** (default: `20`)

## Browser requirements / notes

- Speech-to-text uses the **Web Speech API** and works best on Chromium-based browsers.
- Text-to-speech uses `speechSynthesis` (widely supported in modern browsers).

## Documentation

See **`srs.md`** for the Software Requirements Specification.

## Suggested improvements

The “future work” ideas are tracked in `srs.md`.
