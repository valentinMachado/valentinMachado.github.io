"use strict";

function MainUI() {

	//views of the application (init with half each)
	this.viewLeft = new View("left");
	this.viewRight = new View("right");

	//root of the ui
	this.root = document.getElementById("webExplorer3D");
	this.canvas = null;

	this.ratioBetweenViews = 0.5;
};

MainUI.prototype.initialize = function(canvas) {

	//init ui
	this.canvas = canvas;

	//append canvas to DOM
	this.root.appendChild(canvas);
};

MainUI.prototype.onResize = function(w, h) {
	this.viewLeft.onResize(0, h, 0, this.ratioBetweenViews * w);
	this.viewRight.onResize(0, h, this.ratioBetweenViews * w, w);
};