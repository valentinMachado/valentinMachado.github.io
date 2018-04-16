"use strict";

//component use to handle the exploration view (going throught the 3D DOM)

function ExplorerView() {

	this._super();

	this.viewScene = new ViewScene();

};
//just after constructor
WebExplorerUtility.JsUtility.makeHerit(ExplorerView, AbstractComponent);

ExplorerView.prototype.initialize = function() {

	var geometry = new THREE.RingGeometry(1, 5, 32);
	var material = new THREE.MeshBasicMaterial({
		color: 0x00ff00
	});
	var cube = new THREE.Mesh(geometry, material);
	this.viewScene.scene.add(cube);
	this.viewScene.camera.position.z = 5;
}