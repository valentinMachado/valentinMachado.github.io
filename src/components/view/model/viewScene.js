"use strict";

function ViewScene() {

	//THREE scene
	this.scene = new THREE.Scene();

	//THREE camera
	this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

	//ui
	this.view = null;

	//control
	this.controls = new THREE.OrbitControls(this.camera);
	this.controls.minDistance = 2;
	this.controls.maxDistance = 50;
	// this.controls.enablePan = false;
	// this.controls.enableZoom = false;
	// this.controls.enabled = false;
};

ViewScene.prototype.onResize = function(h, w) {
	this.camera.aspect = w / h;
	this.camera.updateProjectionMatrix();
};