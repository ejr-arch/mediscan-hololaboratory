		//make enter key send(analyze button)
		document.addEventListener("keydown", function (event) {
			if (event.key === "Enter") {
				event.preventDefault();	//stop enter from creating a new line
				document.getElementById("symptoms").blur(); //deselect textarea on pressing enter
				analyze(); //call analyze function
			}
			//make shiftkey and enter to go new line in text area but do not display output
			if (event.shiftKey && event.key === "Enter") {
				event.preventDefault();
				document.getElementById("symptoms").value += "\n";
			}

		})
		// function reduce video play speed
		const videos = document.querySelectorAll(".bg-video");
		videos.forEach(video => {
			video.playbackRate = 0.3;
		});
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

			recognition.onresult = function (event) {
				document.getElementById("symptoms").value =
					event.results[0][0].transcript;
			};

			recognition.onerror = function (event) {
				console.error("Speech error:", event.error);
			};
		}

		function changeHologram(videoFile) {
			const video = document.getElementById("hologramVideo");

			video.pause();

			video.src = videoFile;

			video.load();

			video.play().catch(() => { });
		}

		// 🧠 AI Simulation + Video Switch
		function analyze() {
			const input = document.getElementById("symptoms").value.toLowerCase();
			const result = document.getElementById("result");

			let explanation = "";
			let video = "client/assets/default.mp4";

			if (input.includes("chest") || input.includes("heart")) {
				explanation = "Chest pain may indicate cardiovascular strain or reduced oxygen circulation.";
				video = "client/assets/heart.mp4";
			}

			else if (input.includes("head") || input.includes("brain")) {
				explanation = "Headache may be related to neurological stress or vascular pressure.";
				video = "client/assets/brain.mp4";
			}

			else if (input.includes("lung") || input.includes("breath")) {
				explanation = "Breathing difficulty may indicate pulmonary inflammation.";
				video = "client/assets/lungs.mp4";
			}

			else {
				explanation = "Symptoms require further diagnostic evaluation.";
				video = "client/assets/default.mp4";
			}

			result.innerHTML = explanation;

			speak(explanation);

			changeHologram(video);
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
