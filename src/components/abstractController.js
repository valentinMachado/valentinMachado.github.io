"use strict";

function AbstractController() {};

AbstractController.prototype.initialize = function() {
	console.log("abstract init");
};

AbstractController.prototype.onPointerDown = function(mousePos, event) {
	// console.log("abstract down");
};
AbstractController.prototype.onPointerMove = function(mousePos, event) {
	// console.log("abstract move");
};
AbstractController.prototype.onPointerUp = function(mousePos, event) {
	// console.log("abstract up");
};

AbstractController.prototype.onDoubleClick = function(mousePos, event) {
	//console.log("abstract dbl click")
};