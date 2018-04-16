"use strict";

function ViewScene() {

	//THREE scene
	this.scene = new THREE.Scene();

	//THREE camera
	this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

	//ui
	this.view = null;
};

ViewScene.prototype.onResize = function(h, w) {
	this.camera.aspect = w / h;
	this.camera.updateProjectionMatrix();
};