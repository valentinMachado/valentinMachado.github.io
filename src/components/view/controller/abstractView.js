"use strict";

function AbstractView() {};

WebExplorerUtility.JsUtility.makeHerit(AbstractView, AbstractController);

AbstractView.prototype.initialize = function() {

	//DEBUG
	var geometry = new THREE.BoxGeometry(1, 1, 1);
	var material = new THREE.MeshBasicMaterial({
		color: 0x00ff00
	});
	var cube = new THREE.Mesh(geometry, material);
	this.viewScene.scene.add(cube);
	this.viewScene.camera.position.z = 5;
};