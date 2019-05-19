"use strict";


function Html3D(json) {
	this._super(json);

	//override
	this.type = "Html3D";
}
WebExplorerUtility.JsUtility.makeHerit(Html3D, Div3D);

Html3D.prototype._createSelectedObjectFile = function() {

	let container = document.createElement("div")
	container.innerHTML = this.json.html

	//DEBUG
	let css3d = new Css3D(
		document.getElementById("selected-container"),
		container,
		new THREE.Vector3(0, 0, 0),
		new THREE.Quaternion(),
		new THREE.Vector2(10 * this.scale, 10 * this.scale))

	this.css3dElements.push(css3d)

	this.selectedObject = new THREE.Object3D()
}

Html3D.prototype.initViewScene = function(viewScene) {

	//viewScene.controls.enableZoom = false

	this.css3dElements.forEach(function(css3d) {
		this.addHtmlToSelectedView(css3d.html);
	}.bind(this));

};

Html3D.prototype.onDisable = function(viewScene) {
	this.removeHtmlEl(); //super
	//enbale zoom again
	viewScene.controls.enableZoom = true;
}