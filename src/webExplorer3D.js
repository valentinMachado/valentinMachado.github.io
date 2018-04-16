"use strict";

function WebExplorer3D() {

	this.ui = new MainView();

	//dt of the app
	this.dt = 0;
	this.currentFps = 60; //60 frame per second

	//components
	this.components = {
		explorerView: new ExplorerView(),
		selectedView: new SelectedView(),
	};

	//renderer
	this.renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	this.renderer.setPixelRatio(window.devicePixelRatio);

	//tree of 3d div
	this.divs3d = null;
};

WebExplorer3D.prototype.initialize = function() {

	//create 3d ui
	let inputHtml = document.getElementById("input");
	this.divs3d = WebExplorerUtility.Div3dUtility.createFromHtml(inputHtml);
	console.info("%cHTML converted", "color:#00FF00;");

	//init components
	for (var c in this.components) {
		this.components[c].initialize();
	}
	console.info("%cComponents initialized", "color:#00FF00;");

	//init ui
	this.ui.initialize(this.renderer.domElement);
	console.info("%cUI initialized", "color:#00FF00;");


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