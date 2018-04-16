"use strict";

//component use to see in detail the selected element

function SelectedView() {

	this._super();

	this.viewScene = new ViewScene();

	this.displayedMeshes = [];
};

WebExplorerUtility.JsUtility.makeHerit(SelectedView, AbstractView);

SelectedView.prototype.initialize = function() {

	//display root
	this.display(wE3D.divs3d);

	this.viewScene.scene.background = new THREE.Color(0.1, 0.1, 0.1);

	//init listeners

};

SelectedView.prototype.display = function(parent) {

	let scene = this.viewScene.scene;

	this.displayedMeshes.forEach(function(m) {
		scene.remove(m);
	});

	//put the parent a the center and child around
	parent.iconMeshes.forEach(function(m) {

		m = m.clone();
		m.position.x = 0;
		m.position.y = 0;
		m.position.z = 0;
		scene.add(m);
	});

};