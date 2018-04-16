"use strict";

//component use to handle the exploration view (going throught the 3D DOM)

function ExplorerView() {
	this.viewScene = new ViewScene();

	this.displayedMeshes = [];
};
//just after constructor
WebExplorerUtility.JsUtility.makeHerit(ExplorerView, AbstractView);

ExplorerView.prototype.initialize = function() {

	//display root
	this.display(wE3D.divs3d);

	this.viewScene.scene.background = new THREE.Color(1, 0, 0);

	//init listeners

};

ExplorerView.prototype.display = function(parent) {

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

	let radius = 3;
	for (let i = parent.children.length - 1; i >= 0; i--) {
		let c = parent.children[i];
		let angle = i * 2 * Math.PI / parent.children.length;

		c.iconMeshes.forEach(function(m) {

			m = m.clone();
			m.position.x = radius * Math.cos(angle);
			m.position.z = radius * Math.sin(angle);

			scene.add(m);
		});
	}

};