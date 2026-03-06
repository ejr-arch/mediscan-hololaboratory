document.addEventListener("DOMContentLoaded", () => {
	const videos = document.querySelectorAll("video");
	videos.forEach((video) => {
		video.playbackRate = 0.3;
	});

	const form = document.getElementById("loginForm");
	if (!form) return;

	form.addEventListener("submit", function (e) {
		e.preventDefault();

		const username = document.getElementById("username").value;
		const password = document.getElementById("password").value;

		if (username === "admin" && password === "mediscan") {
			window.location.href = "boot.html";
		} else {
			document.getElementById("error").textContent = "Invalid login credentials";
		}
	});
});
