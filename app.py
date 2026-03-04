from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    body_part = data.get("body_part", "").lower()

    # Simulated AI decision
    if "heart" in body_part or "chest" in body_part:
        video = "/assets/heart.mp4"
    elif "brain" in body_part or "head" in body_part:
        video = "/assets/brain.mp4"
    elif "lung" in body_part:
        video = "/assets/lungs.mp4"
    else:
        video = "/assets/default.mp4"

    return jsonify({"video_url": video})


if __name__ == "__main__":
    app.run(debug=True)
