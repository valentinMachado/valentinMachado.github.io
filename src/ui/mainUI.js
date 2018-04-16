"use strict";

function MainUI() {

	//views of the application
	this.viewLeft = new View();
	this.viewRight = new View();

	//root of the ui
	this.root = document.getElementById("webExplorer3D");
};

MainUI.prototype.initialize = function() {

	//init ui

	//append canvas to DOM
	this.root.appendChild(this.viewLeft.canvas);
	this.root.appendChild(this.viewRight.canvas);


	//resize ui
	this.onResize();

	console.info("%cUI initialized", "color:#00FF00;");
};

MainUI.prototype.onResize = function() {

	this.viewLeft.onResize();
	this.viewRight.onResize();

	//DEBUG
	this.viewRight.clear("red");
	this.viewLeft.clear("green");
};