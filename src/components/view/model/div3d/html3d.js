"use strict";


function Html3D(json) {
	this._super(json);

	//override
	this.type = "Html3D";
}
WebExplorerUtility.JsUtility.makeHerit(Html3D, Div3D);

Html3D.prototype.initViewScene = function(viewScene) {

	viewScene.controls.enableZoom = false

	let container = document.createElement("div")
	container.classList.add("html-container")
	container.innerHTML = this.json.html
	this.addHtmlToSelectedView(container);
};

Html3D.prototype.onDisable = function(viewScene) {
	this.removeHtmlEl(); //super
	//enbale zoom again
	viewScene.controls.enableZoom = true
}