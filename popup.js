function Init() {
	var paused = false;
	var Render = function() {
		document.getElementById("pauseresume_img").src = chrome.extension.getURL(paused ? "img/play32.png" : "img/pause32.png");
	};

	document.getElementById("narrate").addEventListener("click", function(e) { 
		chrome.tabs.query({ active: true }, function(tabs) {
			tabs.forEach(function(tab) {
				chrome.tabs.executeScript(tab.id, {file: "content_script.narrator.js" }, function(results) {
					if(results && results.every(function(o) { return o; })) {
						chrome.tabs.sendMessage(tab.id, { command: "getSelectionUtterance" });
					}
				});
			});
		});
	});

	document.getElementById("advancedlink").addEventListener("click", function(e) { 
		var el = document.getElementById("advancedsection");
		el.style.display = (getComputedStyle(el).display == "block") ? "none" : "block";
	});
	
	document.getElementById("testbutton").addEventListener("click", function(e) { 
		narrate(document.getElementById("testText").value);
		Render();
	});

	document.getElementById("stop").addEventListener("click", function(e) { 
		chrome.tts.stop();
		paused = false;
		Render();
	});
	
	document.getElementById("pauseresume").addEventListener("click", function(e) { 
		
		chrome.tts.isSpeaking(function(isSpeaking) {
			console.log("Chrome TTS: " + (isSpeaking ? "is speaking" : "is not speaking"));
			if(isSpeaking && !paused) {
				chrome.tts.pause();
				paused = true; 
				console.log("Paused.");
			} else {
				chrome.tts.resume();
				paused = false;
				console.log("Resumed.");
			}			
			Render();
		});
	});

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.utterance) {
		  narrate(request.utterance, function() { sendResponse("Narrate: OK"); });
		}
		Render();
	});
	
	Render();
}

document.addEventListener("DOMContentLoaded", Init);