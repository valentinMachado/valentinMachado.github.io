"use strict";

function MainView() {

	//views of the application (init with half each)
	this.viewLeft = new Viewport("left");
	this.viewRight = new Viewport("right");

	//root of the ui
	this.root = document.getElementById("webExplorer3D");
	this.canvas = null;

	this.ratioBetweenViews = 0.5;
};

MainView.prototype.initialize = function(canvas) {

	//init ui
	this.canvas = canvas;

	//append canvas to DOM
	this.root.appendChild(canvas);
};

MainView.prototype.onResize = function(w, h) {
	this.viewLeft.onResize(0, h, 0, this.ratioBetweenViews * w);
	this.viewRight.onResize(0, h, this.ratioBetweenViews * w, w);
};