"use strict";

//component use to see in detail the selected element

function SelectedView(canvas) {

	this._super(canvas);

	this.currentObject = null;
};

WebExplorerUtility.JsUtility.makeHerit(SelectedView, AbstractView);

SelectedView.prototype.initialize = function() {

	var scene = this.viewScene.scene;

	scene.background = new THREE.Color(0.65, 0.65, 0.65);
};

SelectedView.prototype.display = function(parent) {

	var scene = this.viewScene.scene;

	//remove
	if (this.currentObject) {
		scene.remove(this.currentObject);
	}

	this.currentObject = parent.selectedObject;
	scene.add(this.currentObject);
};