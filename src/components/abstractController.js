"use strict";

function AbstractController() {};

AbstractController.prototype.onPointerDown = function(mousePos, event) {
	console.log("abstract down")
};
AbstractController.prototype.onPointerMove = function(mousePos, event) {
	console.log("abstract move");
};
AbstractController.prototype.onPointerUp = function(mousePos, event) {
	console.log("abstract up")
};