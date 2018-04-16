"use strict";

function WebExplorer3D() {

	this.ui = new MainUI();

	//dt of the app
	this.dt = 0;
	this.currentFps = 60; //60 frame per second

	//components
	this.components = {
		selectedView: new SelectedView(),
		explorerView: new ExplorerView()
	};

	//renderer
	this.renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	this.renderer.setPixelRatio(window.devicePixelRatio);
};

WebExplorer3D.prototype.initialize = function() {

	//init components
	for (var c in this.components) {
		this.components[c].initialize();
	}
	console.info("%cComponents initialized", "color:#00FF00;");

	//init ui
	this.ui.initialize(this.renderer.domElement);
	console.info("%cUI initialized", "color:#00FF00;");

	//attach a vScene to a view
	this.ui.viewLeft.setViewScene(this.components.selectedView.viewScene);
	this.ui.viewRight.setViewScene(this.components.explorerView.viewScene);

	//DEBUG
	this.components.selectedView.viewScene.scene.background = new THREE.Color(1, 0, 0);

	//window event
	window.onresize = this.onResize.bind(this);
	this.initializeAnimationFrame();

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