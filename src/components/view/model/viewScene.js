"use strict";

function ViewScene(canvas) {

	//THREE scene
	this.scene = new THREE.Scene();

	//THREE camera
	this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

	//control
	this.controls = new THREE.OrbitControls(this.camera, canvas);
	this.controls.minDistance = 2;
	this.controls.maxDistance = 50;
	this.controls.update();
	// this.controls.enablePan = false;
	// this.controls.enableZoom = false;
	// this.controls.enabled = false;
};

ViewScene.prototype.onResize = function(h, w) {
	this.camera.aspect = w / h;
	this.camera.updateProjectionMatrix();
};