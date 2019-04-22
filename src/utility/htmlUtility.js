"use strict";

window.WebExplorerUtility = window.WebExplorerUtility || {};

window.WebExplorerUtility.HtmlUtility = {

	createLoadingScreen: function() {

		var result = document.createElement("div")
		result.classList.add("loading-screen")

		//text
		let loadingLabel = document.createElement("div")
		loadingLabel.classList.add("loading-label")
		loadingLabel.innerHTML = "c'est en train de charger"

		result.appendChild(loadingLabel)

		//rolling stuff
		let loadingRoll = document.createElement("img")
		loadingRoll.classList.add("loading-roll");
		loadingRoll.src = "./src/assets/img/loading.png"
		result.appendChild(loadingRoll)

		//register
		result.image = loadingRoll

		return result;
	}


}