"use strict";


function Video3D(json) {
	this._super(json);

	this.videoCanvas = null;
	this.videoTexture = null;

	//create html
	this.html = document.createElement("video")
	//this.html.autoplay = true;
	this.html.src = this.json.path

	//override
	this.type = "VIDEO3D";
}
WebExplorerUtility.JsUtility.makeHerit(Video3D, Div3D);

Video3D.prototype.initViewScene = function(viewScene) {
	var scene = viewScene.scene;
	viewScene.initSceneDefault();
	var camera = viewScene.camera;
	var controls = viewScene.controls;

	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = this.scale * 10;

	controls.target.x = 0;
	controls.target.y = 0;
	controls.target.z = 0;


	controls.update();

	scene.add(this.selectedObject);

	this.html.play()
	this.css3dElements.forEach(function(c) {
		this.addHtmlToSelectedView(c.html)
	}.bind(this))
};

Video3D.prototype.onDisable = function(viewScene) {

	this.removeHtmlEl();
	this.html.pause();
};

Video3D.prototype.tick = function(viewScene) {

	var video = this.html;

	if (video.readyState === video.HAVE_ENOUGH_DATA) {
		this.videoImageContext.drawImage(video, 0, 0);
		if (this.videoTexture)
			this.videoTexture.needsUpdate = true;
	}

	if (video.ended) {
		video.play()
	}

	this.css3dElements.forEach(function(c) {
		c.tick(viewScene)
	})
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


	let computer = WebExplorerUtility.ModelUtility.create("computer", 5 * this.scale);

	computer.position.y = -2.08 * this.scale
	computer.position.z = -4.64 * this.scale
	computer.scale.x = ratio * computer.scale.y


	this.selectedObject = new THREE.Object3D();
	this.selectedObject.add(computer)
	this.selectedObject.add(movieScreen)

	//this.selectedObject.rotation.x = -Math.PI / 2;
	this.selectedObject.scale.setScalar(0.8)
	let bbGlobal = new THREE.Box3()
	bbGlobal.setFromObject(this.selectedObject);
	this.selectedObject.position.y += (bbGlobal.max.y) / 2

	//add title
	if (this.json.title) {

		let titleMesh = WebExplorerUtility.ModelUtility.buildLabelMesh(this.json.title, 0.8 * this.scale);
		let bb = titleMesh.geometry.boundingBox;
		//titleMesh.position.x = (bbGlobal.max.x) / 2
		titleMesh.position.y = (bbGlobal.max.y) + bb.max.y * 2
		//titleMesh.position.z = (bbGlobal.max.z) / 2
		this.titleMesh = titleMesh
		this.selectedObject.add(titleMesh);
	}

};

Video3D.prototype._buildCSS3D = function() {
	//restart video*
	var video = this.html
	//add html
	var container = document.createElement("div")

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

	playButton.onclick = function() {
		isPlaying = !isPlaying;
		if (isPlaying) {
			video.play();
		} else {
			video.pause();
		}
	}

	container.appendChild(playButton)
	container.appendChild(speakerButton)
	container.style.display = "flex"

	let bb = new THREE.Box3()
	bb.setFromObject(this.selectedObject);
	let dim = new THREE.Vector2()
	dim.x = bb.max.x - bb.min.x
	dim.y = bb.max.y - bb.min.y

	//add this ui on tv
	let ratio = 0.3
	let uiTV = new Css3D(
		document.getElementById("selected-container"),
		container,
		new THREE.Vector3(0, -dim.y * ratio, 0),
		new THREE.Quaternion(),
		new THREE.Vector2(dim.x, dim.y * ratio))

	this.css3dElements.push(uiTV)
}