"use strict";

//code take from https://stemkoski.github.io/Three.js/Video.html

function Video3D(html) {
	this._super(html);

	this.videoCanvas = null;
	this.videoTexture = null;

	//override
	this.type = "VIDEO3D";
}
WebExplorerUtility.JsUtility.makeHerit(Video3D, Div3D);

Video3D.prototype.initViewScene = function(viewScene) {
	var scene = viewScene.scene;
	var camera = viewScene.camera;
	var controls = viewScene.controls;

	camera.position.x = 0;
	camera.position.y = 1;
	camera.position.z = 0;

	controls.update();

	//restart video
	this.html.currentTime = 0;
	this.html.play();

	scene.add(this.selectedObject);
};


Video3D.prototype._createIconObject = function() {

	var material = new THREE.MeshStandardMaterial({

		color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
		roughness: 0.5,
		metalness: 0,
		flatShading: true

	});

	var size = 0.4 * this.scale;
	var geometry = new THREE.SphereGeometry(size, 32, 32);
	var cube = new THREE.Mesh(geometry, material);


	this.iconObject = cube;
};

Video3D.prototype.tick = function() {

	var video = this.html;

	if (video.readyState === video.HAVE_ENOUGH_DATA) {
		this.videoImageContext.drawImage(video, 0, 0);
		if (this.videoTexture)
			this.videoTexture.needsUpdate = true;
	}
};

Video3D.prototype._createSelectedObjectFile = function() {

	var video = this.html;

	//load video
	video.load();

	//create canvas texture
	this.videoCanvas = document.createElement("canvas");
	this.videoCanvas.width = 1920;
	this.videoCanvas.height = 960;

	this.videoImageContext = this.videoCanvas.getContext("2d");

	//create texture
	this.videoTexture = new THREE.Texture(this.videoCanvas);
	this.videoTexture.minFilter = THREE.LinearFilter;
	this.videoTexture.magFilter = THREE.LinearFilter;

	var movieMaterial = new THREE.MeshBasicMaterial({
		map: this.videoTexture,
		overdraw: true,
		side: THREE.DoubleSide
	});
	// the geometry on which the movie will be displayed;
	// 		movie image will be scaled to fit these dimensions.
	var size = this.scale * 10;
	var movieGeometry = new THREE.PlaneGeometry(size, size, 4, 4);
	var movieScreen = new THREE.Mesh(movieGeometry, movieMaterial);
	movieScreen.rotation.x = -Math.PI / 2;

	this.selectedObject = movieScreen;
};