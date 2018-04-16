"use strict";

function WebExplorer3D() {

	this.ui = new MainUI();

};

WebExplorer3D.prototype.initialize = function() {

	//init ui
	this.ui.initialize();

	//window event
	window.onresize = this.onResize.bind(this);
};

WebExplorer3D.prototype.onResize = function() {
	this.ui.onResize();
};