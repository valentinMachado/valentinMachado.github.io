"use strict";

function Viewport(id, rect) {

	this.id = id;

	this.rect = {
		bottom: 0,
		right: 0,
		top: 0,
		left: 0
	};

	this.viewScene = null;
};


Viewport.prototype.onResize = function(top, bottom, left, right) {
	this.rect.top = top;
	this.rect.bottom = bottom;
	this.rect.left = left;
	this.rect.right = right;

	this.viewScene.onResize(bottom - top, right - left);
};

Viewport.prototype.setViewScene = function(v) {
	this.viewScene = v;
};