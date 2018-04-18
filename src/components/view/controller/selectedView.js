"use strict";

//component use to see in detail the selected element

function SelectedView(canvas) {

	this._super(canvas);
};

WebExplorerUtility.JsUtility.makeHerit(SelectedView, AbstractView);

SelectedView.prototype.initialize = function() {

	this.viewScene.scene.background = new THREE.Color(0.65, 0.65, 0.65);

	//init listeners

};

SelectedView.prototype.display = function(parent) {

	this.clearDisplayDiv3D();

	//put the parent a the center and child around
	let scene = this.viewScene.scene;
	this.displayDiv3D[parent.id] = [];


	var m = parent.selectedObject.clone(); //multiple scene force to clone
	m.position.x = 0;
	m.position.y = 0;
	m.position.z = 0;

	this.displayDiv3D[parent.id].push(m);

	scene.add(m);


};