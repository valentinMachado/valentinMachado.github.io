"use strict";

function View(id, rect) {

	this.id = id;

	this.rect = {
		bottom: 0,
		right: 0,
		top: 0,
		left: 0
	};

	this.viewScene = null;
};


View.prototype.onResize = function(top, bottom, left, right) {
	this.rect.top = top;
	this.rect.bottom = bottom;
	this.rect.left = left;
	this.rect.right = right;

	this.viewScene.onResize(bottom - top, right - left);
};

View.prototype.setViewScene = function(v) {
	this.viewScene = v;
};