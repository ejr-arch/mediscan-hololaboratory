		document.addEventListener("DOMContentLoaded", () => {

const symptomsEl = document.getElementById("symptoms");
const resultEl = document.getElementById("result");
const listeningEl = document.getElementById("listeningStatus");

/* slow background videos */

const videos = document.querySelectorAll(".bg-video");
videos.forEach(video => {
video.playbackRate = 0.3;
});


/* ENTER KEY SUBMIT */

document.addEventListener("keydown", function (event) {

if (!symptomsEl) return;
if (event.target !== symptomsEl) return;

if (event.shiftKey && event.key === "Enter") return;

if (event.key === "Enter") {
event.preventDefault();
symptomsEl.blur();
analyze();
}

});


/* LISTENING STATUS */

function setListeningStatus(text){
if(!listeningEl) return;
listeningEl.textContent = text;
}


/* VOICE INPUT */

function startSpeech(){

if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){
alert("Speech recognition not supported. Use Chrome.");
return;
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();

recognition.lang = "en-US";
recognition.start();

setListeningStatus("Listening...");

recognition.onresult = function(event){

if(symptomsEl){
symptomsEl.value = event.results[0][0].transcript;
}

setListeningStatus("");

};

recognition.onerror = function(event){
console.error("Speech error:", event.error);
setListeningStatus("");
};

recognition.onend = function(){
setListeningStatus("");
};

}


/* CHANGE HOLOGRAM VIDEO */

function changeHologram(videoFile){

const video = document.getElementById("hologramVideo");

if(!video) return;

video.pause();
video.src = videoFile;
video.load();

video.play().catch(()=>{});

}


/* LOCAL FALLBACK ANALYSIS */

function localAnalyze(input){

let explanation = "";
let video = "client/assets/default.mp4";
let bodyPart = "general";

if(input.includes("chest") || input.includes("heart")){
explanation = "Chest pain may indicate cardiovascular strain or reduced oxygen circulation.";
video = "client/assets/heart.mp4";
bodyPart = "chest";
}

else if(input.includes("head") || input.includes("brain")){
explanation = "Headache may be related to neurological stress or vascular pressure.";
video = "client/assets/brain.mp4";
bodyPart = "head";
}

else if(input.includes("lung") || input.includes("breath")){
explanation = "Breathing difficulty may indicate pulmonary inflammation.";
video = "client/assets/lungs.mp4";
bodyPart = "lungs";
}

else{
explanation = "Symptoms require further diagnostic evaluation.";
video = "client/assets/default.mp4";
bodyPart = "general";
}

return { explanation, video, bodyPart };

}


/* MAIN ANALYSIS */

async function analyze(){

if(!symptomsEl || !resultEl) return;

const inputRaw = symptomsEl.value || "";
const input = inputRaw.trim().toLowerCase();

if(!input){

resultEl.textContent = "Please describe your symptoms first.";
changeHologram("client/assets/default.mp4");

return;

}

let explanation;
let video;
let bodyPart;

try{

const res = await fetch("/generate",{

method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify({ symptoms: inputRaw })

});

if(!res.ok) throw new Error("Request failed");

const data = await res.json();

explanation = data.explanation;
video = data.video_url;
bodyPart = data.body_part || "general";

}

catch(e){

console.log("Using local fallback");

const local = localAnalyze(input);

explanation = local.explanation;
video = local.video;
bodyPart = local.bodyPart;

}


/* display result on page */

resultEl.textContent = explanation;

speak(explanation);

changeHologram(video);


/* STORE RESULT FOR RESULTS PAGE */

localStorage.setItem("mediscan_explanation", explanation);
localStorage.setItem("mediscan_video", video);
localStorage.setItem("mediscan_bodypart", bodyPart);


/* REDIRECT TO CINEMATIC RESULTS PAGE */

setTimeout(() => {

window.location.href = "results.html";

}, 2000);

}


/* TEXT TO SPEECH */

function speak(text){

if(!('speechSynthesis' in window)){
console.log("TTS not supported");
return;
}

const speech = new SpeechSynthesisUtterance(text);

speech.lang = "en-US";
speech.rate = 1;
speech.pitch = 1;

window.speechSynthesis.cancel();
window.speechSynthesis.speak(speech);

}


/* EXPOSE FUNCTIONS */

window.startSpeech = startSpeech;
window.analyze = analyze;

});
