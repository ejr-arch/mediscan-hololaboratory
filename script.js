		document.addEventListener("DOMContentLoaded", () => {
			const symptomsEl = document.getElementById("symptoms");
			const resultEl = document.getElementById("result");
			const listeningEl = document.getElementById("listeningStatus");

			const videos = document.querySelectorAll(".bg-video");
			videos.forEach((video) => {
				video.playbackRate = 0.3;
			});

			document.addEventListener("keydown", function (event) {
				if (!symptomsEl) return;
				if (event.target !== symptomsEl) return;

				if (event.shiftKey && event.key === "Enter") {
					return;
				}

				if (event.key === "Enter") {
					event.preventDefault();
					symptomsEl.blur();
					analyze();
				}
			});

			function setListeningStatus(text) {
				if (!listeningEl) return;
				listeningEl.textContent = text;
			}

			function startSpeech() {
				if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
					alert("Speech recognition not supported. Use Chrome or Chromium.");
					return;
				}

				const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
				const recognition = new SpeechRecognition();
				recognition.lang = "en-US";
				recognition.start();
				setListeningStatus("Listening...");

				recognition.onresult = function (event) {
					if (symptomsEl) {
						symptomsEl.value = event.results[0][0].transcript;
					}
					setListeningStatus("");
				};

				recognition.onerror = function (event) {
					console.error("Speech error:", event.error);
					setListeningStatus("");
				};

				recognition.onend = function () {
					setListeningStatus("");
				};
			}

			function changeHologram(videoFile) {
				const video = document.getElementById("hologramVideo");
				if (!video) return;

				video.pause();
				video.src = videoFile;
				video.load();
				video.play().catch(() => { });
			}

			function localAnalyze(input) {
				let explanation = "";
				let video = "client/assets/default.mp4";

				if (input.includes("chest") || input.includes("heart")) {
					explanation = "Chest pain may indicate cardiovascular strain or reduced oxygen circulation.";
					video = "client/assets/heart.mp4";
				} else if (input.includes("head") || input.includes("brain")) {
					explanation = "Headache may be related to neurological stress or vascular pressure.";
					video = "client/assets/brain.mp4";
				} else if (input.includes("lung") || input.includes("breath")) {
					explanation = "Breathing difficulty may indicate pulmonary inflammation.";
					video = "client/assets/lungs.mp4";
				} else {
					explanation = "Symptoms require further diagnostic evaluation.";
					video = "client/assets/default.mp4";
				}

				return { explanation, video };
			}

			async function analyze() {
				if (!symptomsEl || !resultEl) return;
				const inputRaw = symptomsEl.value || "";
				const input = inputRaw.trim().toLowerCase();
				if (!input) {
					resultEl.textContent = "Please describe your symptoms first.";
					changeHologram("client/assets/default.mp4");
					return;
				}

				let explanation;
				let video;

				try {
					const res = await fetch("/generate", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ symptoms: inputRaw })
					});

					if (!res.ok) throw new Error("Request failed");
					const data = await res.json();
					explanation = data.explanation;
					video = data.video_url;
				} catch (e) {
					const local = localAnalyze(input);
					explanation = local.explanation;
					video = local.video;
				}

				resultEl.textContent = explanation;
				speak(explanation);
				changeHologram(video);
			}

			function speak(text) {
				if (!('speechSynthesis' in window)) {
					console.log("TTS not supported.");
					return;
				}

				const speech = new SpeechSynthesisUtterance(text);
				speech.lang = "en-US";
				speech.rate = 1;
				speech.pitch = 1;

				window.speechSynthesis.cancel();
				window.speechSynthesis.speak(speech);
			}

			window.startSpeech = startSpeech;
			window.analyze = analyze;
		});
