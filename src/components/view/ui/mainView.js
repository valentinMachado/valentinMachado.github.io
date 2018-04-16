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
};

MainView.prototype.initialize = function(canvas) {

	//init ui
	this.canvas = canvas;

	//append canvas to DOM
	this.root.appendChild(canvas);

	//attach a vScene to a view
	this.viewLeft.setViewScene(wE3D.components.selectedView.viewScene);
	this.viewRight.setViewScene(wE3D.components.explorerView.viewScene);

	//handle orbit control
	this.canvas.addEventListener("pointerdown", function(event) {
		this.dragging = true;
		var x = event.offsetX / this.canvas.clientWidth;
		this.updateOrbitControls(x);
	}.bind(this));
	this.canvas.addEventListener("pointermove", function(event) {
		if (this.dragging) return;
		var x = event.offsetX / this.canvas.clientWidth;
		this.updateOrbitControls(x);
	}.bind(this));
	this.canvas.addEventListener("pointerup", function(event) {
		this.dragging = false;
	}.bind(this));

};

MainView.prototype.onResize = function(w, h) {
	this.viewLeft.onResize(0, h, 0, this.ratioBetweenViews * w);
	this.viewRight.onResize(0, h, this.ratioBetweenViews * w, w);
};

//x is ratio 0->1
MainView.prototype.updateOrbitControls = function(x) {
	var isOnRightView = false;
	if (x > this.ratioBetweenViews) {
		isOnRightView = true;
	}
	this.viewRight.viewScene.controls.enabled = isOnRightView;
	this.viewLeft.viewScene.controls.enabled = !isOnRightView;
};