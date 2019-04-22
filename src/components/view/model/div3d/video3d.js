"use strict";


function Video3D(json) {
	this._super(json);

	this.videoCanvas = null;
	this.videoTexture = null;

	//create html
	this.html = document.createElement("video")
	this.html.src = this.json.path

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

	//restart video*
	var video = this.html

	scene.add(this.selectedObject);

	//add html
	var container = document.getElementById("selected-container");

	//sound
	var speakerButton = document.createElement("div");
	speakerButton.classList.add("button");

	//init
	var soundMuted = false;
	video.muted = soundMuted;
	speakerButton.onclick = function() {
		soundMuted = !soundMuted;
		video.muted = soundMuted;
	};

	//pause/play
	var playButton = document.createElement("img");
	playButton.src = "./src/assets/img/loading.png"
	playButton.classList.add("button");

	//init
	var isPlaying = true;
	video.currentTime = 0;
	video.play();
	playButton.onclick = function() {
		isPlaying = !isPlaying;
		if (isPlaying) {
			video.play();
		} else {
			video.pause();
		}
	}

	this.addHtmlToSelectedView(speakerButton);
	this.addHtmlToSelectedView(playButton);
};

Video3D.prototype.onDisable = function(viewScene) {

	this.removeHtmlEl();
	this.html.pause();
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
	var sphere = new THREE.Mesh(geometry, material);
	this.iconObject = sphere;
};

Video3D.prototype.tick = function() {

	var video = this.html;

	if (video.readyState === video.HAVE_ENOUGH_DATA) {
		this.videoImageContext.drawImage(video, 0, 0);
		if (this.videoTexture)
			this.videoTexture.needsUpdate = true;
	}
};

//code take from https://stemkoski.github.io/Three.js/Video.html
Video3D.prototype._createSelectedObjectFile = function() {

	var video = this.html;

	//load video
	video.load();

	//create canvas texture
	this.videoCanvas = document.createElement("canvas");

	this.videoCanvas.width = this.json.width;
	this.videoCanvas.height = this.json.height;

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
	var ratio = this.json.width / this.json.height;
	var movieGeometry = new THREE.PlaneGeometry(ratio * size, size, 4, 4);
	var movieScreen = new THREE.Mesh(movieGeometry, movieMaterial);
	movieScreen.rotation.x = -Math.PI / 2;

	this.selectedObject = movieScreen;

	//add title
	if (this.json.title) {
		let titleMesh = WebExplorerUtility.Div3dUtility.buildLabelMesh("bite");
		let bb = new THREE.Box3();
		bb.setFromObject(titleMesh);
		titleMesh.position.x = -bb.max.x / 2
		titleMesh.position.y = -bb.max.y - size * 0.5
		titleMesh.position.z = -bb.max.z / 2
		this.selectedObject.add(titleMesh);
	}

};