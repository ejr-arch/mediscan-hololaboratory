const inputEl = document.getElementById("symptoms");
const listeningEl = document.getElementById("listeningStatus");

document.addEventListener("keydown", function (event) {
  if (!inputEl || event.target !== inputEl) return;
  if (event.shiftKey && event.key === "Enter") return;
  if (event.key === "Enter") {
    event.preventDefault();
    window.analyze();
  }
});

window.selectTopic = function (topic) {
  const input = document.getElementById("symptoms");
  input.value = topic.toLowerCase();
  window.analyze();
};

window.startSpeech = function () {
  if (
    !("webkitSpeechRecognition" in window) &&
    !("SpeechRecognition" in window)
  ) {
    alert("Speech recognition not supported. Use Chrome.");
    return;
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = "en-US";
  recognition.start();

  listeningEl.textContent = "Listening...";

  recognition.onresult = function (event) {
    inputEl.value = event.results[0][0].transcript.toLowerCase();
    listeningEl.textContent = "";
  };

  recognition.onerror = function () {
    listeningEl.textContent = "";
  };

  recognition.onend = function () {
    listeningEl.textContent = "";
  };
};

function localAnalyze(input) {
  let explanation =
    "The selected anatomical topic requires further visualization.";
  let video = "client/assets/default.mp4";
  let bodyPart = "general";

  if (
    input.includes("heart") ||
    input.includes("cardiovascular") ||
    input.includes("circulation")
  ) {
    explanation =
      "The cardiovascular system circulates blood throughout the body. The heart pumps oxygenated blood to tissues and returns deoxygenated blood to the lungs.";
    video = "client/assets/heart.mp4";
    bodyPart = "heart";
  } else if (
    input.includes("brain") ||
    input.includes("nervous") ||
    input.includes("neural")
  ) {
    explanation =
      "The nervous system controls body activities and processes information through neural networks located primarily in the brain and spinal cord.";
    video = "client/assets/brain.mp4";
    bodyPart = "brain";
  } else if (
    input.includes("lungs") ||
    input.includes("respiratory") ||
    input.includes("breathing")
  ) {
    explanation =
      "The respiratory system allows oxygen intake and carbon dioxide removal through gas exchange in the lungs.";
    video = "client/assets/lungs.mp4";
    bodyPart = "lungs";
  } else if (
    input.includes("digestive") ||
    input.includes("stomach") ||
    input.includes("digestion")
  ) {
    explanation =
      "The digestive system breaks down food into nutrients that the body can absorb and use for energy and growth.";
    video = "client/assets/stomach.mp4";
    bodyPart = "digestive";
  } else if (
    input.includes("skeletal") ||
    input.includes("bones") ||
    input.includes("skeleton")
  ) {
    explanation =
      "The skeletal system provides structural support for the body and protects vital organs.";
    video = "client/assets/skeleton.mp4";
    bodyPart = "skeletal";
  } else if (input.includes("muscle") || input.includes("muscular")) {
    explanation =
      "The muscular system allows movement of body parts through contraction and relaxation of muscles.";
    video = "client/assets/muscles.mp4";
    bodyPart = "muscles";
  } else if (input.includes("eye") || input.includes("vision")) {
    explanation =
      "The eye captures light and converts it into signals that are interpreted by the brain to form visual perception.";
    video = "client/assets/eye.mp4";
    bodyPart = "eye";
  } else if (input.includes("ear") || input.includes("hearing")) {
    explanation =
      "The ear detects sound waves and converts them into neural signals while also helping maintain body balance.";
    video = "client/assets/ear.mp4";
    bodyPart = "ear";
  } else if (input.includes("blood")) {
    explanation =
      "Blood transports oxygen, nutrients, hormones and waste materials throughout the body.";
    video = "client/assets/blood.mp4";
    bodyPart = "blood";
  }

  return { explanation, video, bodyPart };
}

window.analyze = function () {
  const inputRaw = document
    .getElementById("symptoms")
    .value.trim()
    .toLowerCase();

  if (!inputRaw) {
    alert("Please enter an anatomical topic.");
    return;
  }

  const result = localAnalyze(inputRaw);

  localStorage.setItem("mediscan_explanation", result.explanation);
  localStorage.setItem("mediscan_video", result.video);
  localStorage.setItem("mediscan_bodypart", result.bodyPart);

  window.location.href = "results.html";
};
