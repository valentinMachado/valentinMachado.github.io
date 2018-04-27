"use strict";

function MainView() {

	//views of the application (init with half each)
	this.viewLeft = new Viewport("left");
	this.viewRight = new Viewport("right");

	//root of the ui
	this.root = document.getElementById("webExplorer3D");
	this.webGlCanvas = null;

	this.ratioBetweenViews = 0.45;

	this.dragging = false;

	this.controllerHovered = null;

	this.centralBar = null;

	//where is the mouse
	this.isOnRightView = true;
	this.mousePos = new THREE.Vector2();
};

MainView.prototype.initialize = function(webGlCanvas, cssRendererEl) {

	//init ui
	this.webGlCanvas = webGlCanvas;
	this.cssRendererEl = cssRendererEl;

	//attach a vScene to a view
	this.viewLeft.setViewScene(wE3D.controllers.selectedView.viewScene);
	this.viewRight.setViewScene(wE3D.controllers.explorerView.viewScene);

	//init DOM Element
	this.initCentralButton();
	this.initWebGlCanvas();
	this.initCssRendererEl();

};
MainView.prototype.initWebGlCanvas = function() {

	//append webGlCanvas to DOM
	this.root.appendChild(this.webGlCanvas);

	//handle orbit control
	this.webGlCanvas.addEventListener("pointerdown", function(event) {
		this.dragging = true;
		this.updateControls(event);

		this.controllerHovered.onPointerDown(this.fetchMousePosRatio(event), event);

	}.bind(this));
	this.webGlCanvas.addEventListener("pointermove", function(event) {
		if (!this.dragging) this.updateControls(event);

		this.controllerHovered.onPointerMove(this.fetchMousePosRatio(event), event); 

	}.bind(this));
	this.webGlCanvas.addEventListener("pointerup", function(event) {

		this.controllerHovered.onPointerUp(this.fetchMousePosRatio(event), event);

		this.dragging = false;
	}.bind(this));

};
MainView.prototype.initCssRendererEl = function() {
	this.cssRendererEl.id = "cssRenderer";
	this.root.appendChild(this.cssRendererEl);
};

MainView.prototype.initCentralButton = function(event) {

	this.centralBar = document.createElement("div");
	this.centralBar.id = "centralBar";
	this.root.appendChild(this.centralBar);

	var draggingCentralBar = false;
	this.centralBar.addEventListener("pointerdown", function(event) {
		draggingCentralBar = true;
	});
	this.webGlCanvas.addEventListener("pointermove", function(event) {
		if (draggingCentralBar) {
			var x = event.clientX / this.webGlCanvas.clientWidth;
			this.ratioBetweenViews = x;
			var w = window.innerWidth;
			var h = window.innerHeight;
			this.onResize(w, h);
		}
	}.bind(this));
	window.addEventListener("pointerup", function(event) {
		draggingCentralBar = false;
	});

	this.updateHtmlStyle();
};
MainView.prototype.updateHtmlStyle = function(event) {
	var w = this.webGlCanvas.clientWidth;

	//central button
	this.centralBar.style.left = -this.centralBar.clientWidth / 2 + this.ratioBetweenViews * w + "px";
};

MainView.prototype.fetchMousePosRatio = function(event) {
	var x = event.offsetX / this.webGlCanvas.clientWidth;
	var y = event.offsetY / this.webGlCanvas.clientHeight;

	//transform on x
	if (x > this.ratioBetweenViews) {
		x = Math.abs(x - this.ratioBetweenViews) / (1 - this.ratioBetweenViews);
		this.isOnRightView = true;
	} else {
		this.isOnRightView = false;
		x = x / this.ratioBetweenViews;
	}

	x = 2 * x - 1;
	y = 2 * y - 1;
	y *= -1;

	//update attr of the mouse
	this.mousePos.x = x;
	this.mousePos.y = y;

	return this.mousePos;
};

MainView.prototype.onResize = function(w, h) {
	this.viewLeft.onResize(0, h, 0, this.ratioBetweenViews * w);
	this.viewRight.onResize(0, h, this.ratioBetweenViews * w, w);
	this.updateHtmlStyle();
};

//x is ratio 0->1
MainView.prototype.updateControls = function(event) {

	var x = event.offsetX / this.webGlCanvas.clientWidth;
	var isOnRightView = false;
	this.controllerHovered = wE3D.controllers.selectedView;

	if (x > this.ratioBetweenViews) {
		isOnRightView = true;
		this.controllerHovered = wE3D.controllers.explorerView;
	}

	this.viewRight.viewScene.controls.enabled = isOnRightView;
	this.viewLeft.viewScene.controls.enabled = !isOnRightView;
};