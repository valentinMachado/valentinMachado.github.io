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

Html3D.prototype._createIconObject = function() {

	var size = 0.4 * this.scale;
	this.iconObject = WebExplorerUtility.ModelUtility.create("barrel", size);
};

Html3D.prototype._createSelectedObjectFile = function() {

	var material = new THREE.MeshStandardMaterial({

		color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
		roughness: 0.5,
		metalness: 0,
		flatShading: true

	});

	var size = 0.4 * this.scale;
	var geometry = new THREE.SphereGeometry(size, 32, 32);
	var cube = new THREE.Mesh(geometry, material);


	this.selectedObject = cube;
};