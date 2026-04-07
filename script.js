document.addEventListener("DOMContentLoaded", () => {
  /* ── Element refs ── */
  const symptomsEl    = document.getElementById("symptoms");
  const resultEl      = document.getElementById("result");
  const listeningEl   = document.getElementById("listeningStatus");
  const aiIndicator   = document.getElementById("aiIndicator");
  const resultMeta    = document.getElementById("resultMeta");
  const resultTimeEl  = document.getElementById("resultTime");
  const hologramVideo = document.getElementById("hologramVideo");

  /* ── Slow down any bg-video elements ── */
  document.querySelectorAll(".bg-video").forEach(v => (v.playbackRate = 0.3));

  /* ── Enter key shortcut (not Shift+Enter) ── */
  document.addEventListener("keydown", (e) => {
    if (!symptomsEl || e.target !== symptomsEl) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      symptomsEl.blur();
      analyze();
    }
  });

  /* ─────────────────────────────────────
   *  LISTENING STATUS
   * ───────────────────────────────────── */
  function setListeningStatus(text) {
    if (!listeningEl) return;
    listeningEl.textContent = text;
  }

  /* ─────────────────────────────────────
   *  SPEECH INPUT
   * ───────────────────────────────────── */
  function startSpeech() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported. Please use Chrome or a Chromium-based browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setListeningStatus("🎤 Listening... speak now");
    recognition.onresult = (e) => {
      if (symptomsEl) symptomsEl.value = e.results[0][0].transcript;
      setListeningStatus("✅ Voice captured successfully.");
      setTimeout(() => setListeningStatus(""), 2500);
    };
    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      setListeningStatus("❌ Error: " + e.error);
      setTimeout(() => setListeningStatus(""), 2500);
    };
    recognition.onend = () => {
      /* Status cleared by onresult/onerror callbacks */
    };

    recognition.start();
  }

  /* ─────────────────────────────────────
   *  HOLOGRAM / VIDEO CONTROL
   * ───────────────────────────────────── */
  function changeHologram(videoFile) {
    if (!hologramVideo) return;
    hologramVideo.pause();
    hologramVideo.src = videoFile;
    hologramVideo.load();
    hologramVideo.play().catch(() => {});
  }

  /* Called by organ quick-select buttons */
  function changeOrgan(organ) {
    const map = {
      heart:   "client/assets/heart.mp4",
      brain:   "client/assets/brain.mp4",
      lungs:   "client/assets/lungs.mp4",
      default: "client/assets/default.mp4",
    };
    changeHologram(map[organ] || map.default);

    /* Highlight the active button */
    document.querySelectorAll(".organ-btn").forEach(btn => btn.classList.remove("active"));
    const clicked = [...document.querySelectorAll(".organ-btn")]
      .find(b => b.textContent.toLowerCase().includes(organ));
    if (clicked) clicked.classList.add("active");
  }

  /* ─────────────────────────────────────
   *  LOCAL FALLBACK ANALYSIS
   * ───────────────────────────────────── */
  function localAnalyze(input) {
    if (input.includes("chest") || input.includes("heart") || input.includes("cardiac")) {
      return {
        explanation: "⚠️ Chest pain may indicate cardiovascular strain or reduced oxygen circulation to the heart muscle. Possible conditions: angina, myocardial infarction, or pericarditis. Seek immediate medical attention if pain is severe.",
        video: "client/assets/heart.mp4",
      };
    }
    if (input.includes("head") || input.includes("brain") || input.includes("migraine") || input.includes("dizz")) {
      return {
        explanation: "🧠 Headache or dizziness may be related to neurological stress, elevated blood pressure, or vascular pressure changes. Possible conditions: tension headache, migraine, or hypertension.",
        video: "client/assets/brain.mp4",
      };
    }
    if (input.includes("lung") || input.includes("breath") || input.includes("cough") || input.includes("wheez")) {
      return {
        explanation: "🫁 Breathing difficulty or cough may indicate pulmonary inflammation or airway obstruction. Possible conditions: asthma, bronchitis, pneumonia, or COPD.",
        video: "client/assets/lungs.mp4",
      };
    }
    if (input.includes("fever") || input.includes("temperature") || input.includes("chills")) {
      return {
        explanation: "🌡️ Elevated body temperature with chills may indicate an active infection or inflammatory response. Possible conditions: viral infection, bacterial infection, or immune system reaction.",
        video: "client/assets/default.mp4",
      };
    }
    if (input.includes("stomach") || input.includes("abdomen") || input.includes("nausea") || input.includes("vomit")) {
      return {
        explanation: "🫃 Abdominal discomfort, nausea, or vomiting may indicate gastrointestinal issues. Possible conditions: gastritis, food poisoning, or irritable bowel syndrome.",
        video: "client/assets/default.mp4",
      };
    }
    return {
      explanation: "🔍 Symptoms require further diagnostic evaluation. The AI could not map your description to a specific condition in the local database. Please provide more detail or consult a healthcare professional.",
      video: "client/assets/default.mp4",
    };
  }

  /* ─────────────────────────────────────
   *  MAIN ANALYZE FUNCTION
   * ───────────────────────────────────── */
  async function analyze() {
    if (!symptomsEl || !resultEl) return;

    const inputRaw = symptomsEl.value || "";
    const input    = inputRaw.trim().toLowerCase();

    if (!input) {
      resultEl.innerHTML = `<div class="output-placeholder"><i class="fa-solid fa-exclamation-circle"></i><p>Please describe your symptoms first.</p></div>`;
      changeHologram("client/assets/default.mp4");
      return;
    }

    /* Show loading state */
    resultEl.innerHTML = `<div class="loading-state"><div class="loader-ring"></div><p>Analyzing symptoms…</p></div>`;
    if (aiIndicator) aiIndicator.innerHTML = `<span class="pulse"></span> Analyzing`;
    if (resultMeta) resultMeta.style.display = "none";

    const startTime = Date.now();
    let explanation, video;

    try {
      const res = await fetch("/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ symptoms: inputRaw }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      explanation = data.explanation;
      video       = data.video_url;
    } catch {
      /* Graceful fallback to local analysis */
      const local = localAnalyze(input);
      explanation  = local.explanation;
      video        = local.video;
    }

    /* Display result */
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    resultEl.innerHTML = `<p class="result-text">${explanation}</p>`;

    if (aiIndicator) aiIndicator.innerHTML = `<span></span> Complete`;
    if (resultMeta && resultTimeEl) {
      resultMeta.style.display = "flex";
      resultTimeEl.textContent = `${elapsed}s`;
    }

    speak(explanation);
    changeHologram(video);
  }

  /* ─────────────────────────────────────
   *  TEXT-TO-SPEECH
   * ───────────────────────────────────── */
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    const utterance  = new SpeechSynthesisUtterance(text);
    utterance.lang   = "en-US";
    utterance.rate   = 0.95;
    utterance.pitch  = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  /* ── Expose globals for inline onclick handlers ── */
  window.startSpeech = startSpeech;
  window.analyze     = analyze;
  window.changeOrgan = changeOrgan;
});
