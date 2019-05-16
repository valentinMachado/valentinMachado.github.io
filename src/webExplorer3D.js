"use strict";

function WebExplorer3D(conf) {

	this.conf = conf

	this.ui = new MainView();

	//dt of the app
	this.dt = 0;
	this.currentFps = 60; //60 frame per second

	//renderer
	this.renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	this.renderer.setPixelRatio(window.devicePixelRatio);
	// this.renderer.shadowMap.enabled = true;
	// this.renderer.shadowMap.type = THREE.PCFShadowMap;
	var canvas = this.renderer.domElement;
	var container = document.getElementById("selected-container");

	//controllers
	this.controllers = {
		explorerView: new ExplorerView(canvas),
		selectedView: new SelectedView(container),
	};

	//tree of 3d div
	this.divs3d = null;

	//DEBUG
	// var material = new THREE.MeshStandardMaterial();
	// var geometry = new THREE.TorusGeometry(10, 3, 16, 100);
	// var cicle = new THREE.Mesh(geometry, material);
	// this.debug = cicle;
	// this.controllers.explorerView.viewScene.scene.add(cicle);
};


WebExplorer3D.prototype.load = function() {

	//load audio
	//this.ambiantAudio = new Audio("./src/assets/sound/Atmosphere-01.wav");

	return new Promise((resolve, reject) => {

		var loader = new THREE.FontLoader();

		loader.load('./src/assets/fonts/helvetiker_regular.typeface.json', function(font) {
			WebExplorerUtility.ModelUtility.font = font;
			console.info("%cFont Loaded", "color:#27AE60;");

			//end promise
			resolve();
		});
	});
};

WebExplorer3D.prototype.getURLParameter = function(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

WebExplorer3D.prototype.initialize = function(json) {
	//create 3d ui
	this.divs3d = WebExplorerUtility.Div3dUtility.createFromHtml(json, true);
	console.info("%cJSON converted", "color:#27AE60;");
	WebExplorerUtility.Div3dUtility.traverse(this.divs3d, function(d) {
		//display
		var text = "";
		for (let i = 1; i < d.degree; i++) {
			text += "    ";
		}
		text += d.type + "_" + d.json.label;
		console.info("%c" + text, "color:#27AE60;");
	});

	//init controllers
	for (var c in this.controllers) {
		this.controllers[c].initialize();
	}
	console.info("%cControllers initialized", "color:#27AE60;");

	//init ui
	this.ui.initialize(this.renderer.domElement);
	console.info("%cUI initialized", "color:#27AE60;");

	//window event
	window.onresize = this.onResize.bind(this);
	this.initializeAnimationFrame();

	//check if param in url to focus right div
	let urlId = this.getURLParameter("urlId");

	if (urlId) {
		let urlDiv = WebExplorerUtility.Div3dUtility.fetchDiv3DByUrlId(urlId, this.divs3d);
		if (urlDiv) {
			this.controllers.explorerView.setCurrentDiv3D(urlDiv)
			this.controllers.selectedView.setCurrentDiv3D(urlDiv)
		} else {
			this.controllers.explorerView.setCurrentDiv3D(this.divs3d)
			this.controllers.selectedView.setCurrentDiv3D(this.divs3d)
		}

	} else {
		this.controllers.explorerView.setCurrentDiv3D(this.divs3d)
		this.controllers.selectedView.setCurrentDiv3D(this.divs3d)
	}

	let ratio = this.getURLParameter("ratio")
	if (ratio != null && ratio != undefined) {
		ratio = parseFloat(ratio)
		this.ui.setRatio(ratio)
	}

	//resize
	this.onResize();
};

WebExplorer3D.prototype.onResize = function() {

	var w = window.innerWidth;
	var h = window.innerHeight;

	this.renderer.setSize(w, h);
	this.ui.onResize(w, h);
};

WebExplorer3D.prototype.tick = function() {

	//update controller
	for (var c in this.controllers) {
		if (this.controllers[c].tick) {
			this.controllers[c].tick();
		}
	}

	//audio
	// if(this.controllers.selectedView.currentDiv3D.isFolder() &&
	// 	this.ambiantAudio){
	// 	this.ambiantAudio.play()
	// }else{
	// 	this.ambiantAudio.pause()
	// }

	//animation update
	TWEEN.update();

	//render viewport frames
	this.render();
};

WebExplorer3D.prototype.render = function() {

	const views = [
		this.ui.viewLeft,
		this.ui.viewRight
	];

	var renderer = this.renderer;

	renderer.setClearColor(0xffffff);
	renderer.setScissorTest(false);
	renderer.clear();

	renderer.setClearColor(0xe0e0e0);
	renderer.setScissorTest(true);

	views.forEach(function(view) {


		// get its position relative to the page's viewport
		var rect = view.rect;

		// check if it's offscreen. If so skip it
		if (rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
			rect.right < 0 || rect.left > renderer.domElement.clientWidth) {
			return; // it's off screen
		}

		// set the viewport
		var width = rect.right - rect.left;
		var height = rect.bottom - rect.top;
		var left = rect.left;
		var top = rect.top;

		renderer.setViewport(left, top, width, height);
		renderer.setScissor(left, top, width, height);

		var vScene = view.viewScene;
		renderer.render(vScene.scene, vScene.camera);

	});
};

WebExplorer3D.prototype.initializeAnimationFrame = function() {

	//code take here => http://codetheory.in/controlling-the-frame-rate-with-requestanimationframe/
	var now;
	var then = Date.now();
	var delta;

	var draw = function() {

		requestAnimationFrame(draw);

		now = Date.now();
		delta = now - then;
		this.dt = delta * 0.001;

		if (delta > 1000 / this.currentFps) {

			// update time stuffs
			then = now - (delta % 1000 / this.currentFps);

			// ... Code for Drawing the Frame ...
			this.tick();
		}

	}.bind(this);

	draw();
};