"use strict";

function ViewScene(elToListen) {

	//THREE scene
	this.scene = new THREE.Scene();

	//THREE camera
	this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);

	//control
	this.controls = new THREE.OrbitControls(this.camera, elToListen);
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
	// scene.lights = []

	let ambient = new THREE.HemisphereLight(0xffffff, 0xffffff)
	ambient.intensity = 0.25
	scene.add(ambient);

	var light = new THREE.DirectionalLight(0xFFF68F, 1.0);
	light.position.set(0, 10, 20);
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