"use strict";

function MainView() {

	//views of the application (init with half each)
	this.viewLeft = new Viewport("left");
	this.viewRight = new Viewport("right");

	//root of the ui
	this.root = document.getElementById("webExplorer3D");
	this.canvas = null;

	this.ratioBetweenViews = 0.5;

	this.dragging = false;

	this.controllerHovered = null;
};

MainView.prototype.initialize = function(canvas) {

	//init ui
	this.canvas = canvas;

	//append canvas to DOM
	this.root.appendChild(canvas);

	//attach a vScene to a view
	this.viewLeft.setViewScene(wE3D.controllers.selectedView.viewScene);
	this.viewRight.setViewScene(wE3D.controllers.explorerView.viewScene);

	//handle orbit control
	this.canvas.addEventListener("pointerdown", function(event) {
		this.dragging = true;
		this.updateControls(event);

		this.controllerHovered.onPointerDown(this.fetchMousePosRatio(event), event);

	}.bind(this));
	this.canvas.addEventListener("pointermove", function(event) {
		if (!this.dragging) this.updateControls(event);

		this.controllerHovered.onPointerMove(this.fetchMousePosRatio(event), event); 

	}.bind(this));
	this.canvas.addEventListener("pointerup", function(event) {

		this.controllerHovered.onPointerUp(this.fetchMousePosRatio(event), event);

		this.dragging = false;
	}.bind(this));

};

MainView.prototype.fetchMousePosRatio = function(event) {
	var x = event.offsetX / this.canvas.clientWidth;
	var y = event.offsetY / this.canvas.clientHeight;

	//transform on x
	if (x > this.ratioBetweenViews) {
		x = Math.abs(x - this.ratioBetweenViews) / (1 - this.ratioBetweenViews);
	} else {
		x = x / this.ratioBetweenViews;
	}

	x = 2 * x - 1;
	y = 2 * y - 1;
	y *= -1;


	return new THREE.Vector2(x, y);
};

MainView.prototype.onResize = function(w, h) {
	this.viewLeft.onResize(0, h, 0, this.ratioBetweenViews * w);
	this.viewRight.onResize(0, h, this.ratioBetweenViews * w, w);
};

//x is ratio 0->1
MainView.prototype.updateControls = function(event) {

	var x = event.offsetX / this.canvas.clientWidth;
	var isOnRightView = false;
	this.controllerHovered = wE3D.controllers.selectedView;

	if (x > this.ratioBetweenViews) {
		isOnRightView = true;
		this.controllerHovered = wE3D.controllers.explorerView;
	}

	this.viewRight.viewScene.controls.enabled = isOnRightView;
	this.viewLeft.viewScene.controls.enabled = !isOnRightView;
};