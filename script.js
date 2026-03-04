// 🎤 Voice Input (Web Speech API)
function startSpeech() {

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Speech recognition not supported. Use Chrome or Chromium.");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = function(event) {
        document.getElementById("symptoms").value =
            event.results[0][0].transcript;
    };

    recognition.onerror = function(event) {
        console.error("Speech error:", event.error);
    };
}


// 🧠 AI Simulation + Video Switch
function analyze() {

    const input = document.getElementById("symptoms").value.toLowerCase();
    const resultDiv = document.getElementById("result");

    if (input.trim() === "") {
        resultDiv.innerHTML = "Please describe your symptoms.";
        return;
    }

    let explanation = "";
    let videoFile = "assets/default.mp4";

    // ---- AI LOGIC ----
    if (input.includes("chest") || input.includes("heart")) {

        explanation = "Chest pain may indicate cardiovascular strain or reduced oxygen supply. Clinical evaluation such as ECG is recommended.";
        videoFile = "assets/heart.mp4";

    } else if (input.includes("head") || input.includes("brain")) {

        explanation = "Headache may result from neurological stress, dehydration, or vascular changes.";
        videoFile = "assets/brain.mp4";

    } else if (input.includes("lung") || input.includes("breath")) {

        explanation = "Breathing difficulty may indicate pulmonary inflammation or airway obstruction.";
        videoFile = "assets/lungs.mp4";

    } else {

        explanation = "Symptoms require further diagnostic evaluation to determine physiological causes.";
        videoFile = "assets/default.mp4";
    }

    // Display explanation
    resultDiv.innerHTML = explanation;

    // 🔊 Speak explanation
    speak(explanation);

    // 🎥 Switch hologram videos
    const videos = document.querySelectorAll(".ghost-video");

    videos.forEach(video => {
        video.src = videoFile;
        video.load();
        video.play();
    });
}


// 🔊 Text-to-Speech
function speak(text) {

    if (!('speechSynthesis' in window)) {
        console.log("TTS not supported.");
        return;
    }

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}
