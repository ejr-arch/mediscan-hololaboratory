from flask import Flask, request, jsonify

from flask import send_from_directory

import os

import requests

app = Flask(__name__, static_folder="client", static_url_path="/client")


ROOT_FILES = {
    "index.html",
    "boot.html",
    "home.html",
    "style.css",
    "script.js",
    "login.css",
    "login.js",
}


@app.route("/")
def root():
    return send_from_directory(".", "index.html")


@app.route("/<path:filename>")
def root_files(filename: str):
    if filename not in ROOT_FILES:
        return jsonify({"error": "Not found"}), 404
    return send_from_directory(".", filename)


def _pexels_video_url(symptoms: str) -> str | None:
    api_key = os.getenv("PEXELS_API_KEY")
    if not api_key:
        return None

    base_url = "https://api.pexels.com/videos/search"
    timeout_s = float(os.getenv("PEXELS_TIMEOUT_SECONDS", "10"))

    # Very simple keyword extraction for search terms
    text = symptoms.lower()
    query = None
    if "heart" in text or "chest" in text:
        query = "heart"
    elif "brain" in text or "head" in text:
        query = "brain"
    elif "lung" in text or "breath" in text or "breathing" in text:
        query = "lungs"
    elif "stomach" in text or "abdomen" in text:
        query = "stomach"
    elif "eye" in text or "vision" in text:
        query = "eye"
    elif "skin" in text or "rash" in text:
        query = "skin"
    else:
        query = "medical"

    try:
        resp = requests.get(
            base_url,
            headers={"Authorization": api_key},
            params={"query": query, "per_page": 1},
            timeout=(3.0, timeout_s),
        )
        if resp.status_code != 200:
            return None

        data = resp.json()
        videos = data.get("videos", [])
        if not videos:
            return None

        # Prefer a web-friendly file; fallback to first video
        video = videos[0]
        video_files = video.get("video_files", [])
        for vf in video_files:
            if vf.get("quality") == "hd" and vf.get("file_type") == "video/mp4":
                return vf["link"]
        for vf in video_files:
            if vf.get("file_type") == "video/mp4":
                return vf["link"]
        return None
    except Exception:
        return None


def _choose_video(symptoms: str) -> str:
    # Try Pexels first
    remote = _pexels_video_url(symptoms)
    if remote:
        return remote
    # Fallback to local assets
    return _local_video_url(symptoms)


def _local_video_url(symptoms: str) -> str:
    text = (symptoms or "").lower()

    if "heart" in text or "chest" in text:
        return "/client/assets/heart.mp4"
    if "brain" in text or "head" in text:
        return "/client/assets/brain.mp4"
    if "lung" in text or "breath" in text:
        return "/client/assets/lungs.mp4"

    return "/client/assets/default.mp4"


def _rule_based_explanation(symptoms: str) -> str:
    text = (symptoms or "").lower()

    if "heart" in text or "chest" in text:
        return "Chest pain may indicate cardiovascular strain or reduced oxygen circulation."
    if "brain" in text or "head" in text:
        return "Headache may be related to neurological stress or vascular pressure."
    if "lung" in text or "breath" in text:
        return "Breathing difficulty may indicate pulmonary inflammation."

    return "Symptoms require further diagnostic evaluation."


def _ollama_explanation(symptoms: str) -> str | None:
    url = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434").rstrip("/")
    model = os.getenv("OLLAMA_MODEL", "llama3.2")
    timeout_s = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "20"))

    prompt = (
        "You are MediScan, an educational health assistant for a classroom demo. "
        "Given the user's symptoms description, provide a short educational explanation (2-4 sentences). "
        "Do not claim a diagnosis. Suggest seeing a clinician if severe or persistent. "
        "No bullet points. Plain text only.\n\n"
        f"Symptoms: {symptoms.strip()}"
    )

    try:
        resp = requests.post(
            f"{url}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=(3.0, timeout_s),
        )
        if resp.status_code != 200:
            return None

        data = resp.json()
        text = (data.get("response") or "").strip()
        if not text:
            return None
        return text
    except Exception:
        return None


def _choose_response(symptoms: str):
    video_url = _choose_video(symptoms)
    explanation = _ollama_explanation(symptoms)
    if explanation is None:
        explanation = _rule_based_explanation(symptoms)

    return {"explanation": explanation, "video_url": video_url}


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(silent=True) or {}

    symptoms = data.get("symptoms")
    body_part = data.get("body_part")

    query = symptoms if symptoms is not None else (body_part or "")
    return jsonify(_choose_response(query))


if __name__ == "__main__":
    app.run(debug=True)
