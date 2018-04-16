"use strict";

function View() {

	//create canvas associate
	this.canvas = document.createElement("canvas");

	//ratio that cover on the x dim
	this.xRatio = 0.5; //half at the begining
};

View.prototype.initialize = function() {

};

View.prototype.onResize = function() {

	this.canvas.width = window.innerWidth * this.xRatio;
	this.canvas.height = window.innerHeight;
};

View.prototype.clear = function(color) {

	if (!color) color = "white";

	var context = this.canvas.getContext('2d');
	context.fillStyle = color;
	context.fillRect(0, 0, this.canvas.width, this.canvas.height);
};