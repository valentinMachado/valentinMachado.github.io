"use strict";

function ViewScene(canvas) {

	//THREE scene
	this.scene = new THREE.Scene();

	//THREE camera
	this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);

	//control
	this.controls = new THREE.OrbitControls(this.camera, canvas);
	this.controls.minDistance = 2;
	this.controls.maxDistance = 100;
	this.controls.zoomSpeed = 2;
	this.controls.update();
	// this.controls.enablePan = false;
	// this.controls.enableZoom = false;
	// this.controls.enabled = false;

	this.initSceneDefault();
};

ViewScene.prototype.initSceneDefault = function() {
	var scene = this.scene;

	scene.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444));

	var light = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 2);
	light.position.set(0, 1500, 1000);
	light.target.position.set(0, 0, 0);

	// light.castShadow = true;

	// light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 1200, 2500));
	// light.shadow.bias = 0.0001;

	// light.shadow.mapSize.width = 4096;
	// light.shadow.mapSize.height = 4096;

	scene.add(light);
};

ViewScene.prototype.onResize = function(h, w) {
	this.camera.aspect = w / h;
	this.camera.updateProjectionMatrix();
};