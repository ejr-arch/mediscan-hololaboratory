from flask import Flask, request, jsonify

from flask import send_from_directory

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


def _choose_response(symptoms: str):
    text = (symptoms or "").lower()

    if "heart" in text or "chest" in text:
        return {
            "explanation": "Chest pain may indicate cardiovascular strain or reduced oxygen circulation.",
            "video_url": "/client/assets/heart.mp4",
        }
    if "brain" in text or "head" in text:
        return {
            "explanation": "Headache may be related to neurological stress or vascular pressure.",
            "video_url": "/client/assets/brain.mp4",
        }
    if "lung" in text or "breath" in text:
        return {
            "explanation": "Breathing difficulty may indicate pulmonary inflammation.",
            "video_url": "/client/assets/lungs.mp4",
        }

    return {
        "explanation": "Symptoms require further diagnostic evaluation.",
        "video_url": "/client/assets/default.mp4",
    }


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(silent=True) or {}

    symptoms = data.get("symptoms")
    body_part = data.get("body_part")

    query = symptoms if symptoms is not None else (body_part or "")
    return jsonify(_choose_response(query))


if __name__ == "__main__":
    app.run(debug=True)
