"use strict";

window.WebExplorerUtility = window.WebExplorerUtility || {};

window.WebExplorerUtility.HtmlUtility = {

	loadingLabel: null,

	createLoadingScreen: function() {

		var result = document.createElement("div")
		result.classList.add("loading-screen")

		//text
		this.loadingLabel = document.createElement("div")
		this.loadingLabel.classList.add("loading-label")
		this.loadingLabel.innerHTML = "Loading..."

		result.appendChild(this.loadingLabel)

		//rolling stuff
		let loadingRoll = document.createElement("img")
		loadingRoll.classList.add("loading-roll");
		loadingRoll.src = "./src/assets/img/loading.png"
		result.appendChild(loadingRoll)

		//register
		result.image = loadingRoll

		return result;
	},

	writeLoadingScreen: function(text) {
		this.loadingLabel.innerHTML = text
	}


}