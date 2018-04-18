"use strict";


function AbstractView(canvas) {

	this.viewScene = new ViewScene(canvas);

	//key is id of the div3d value is cloned meshes add to the scene
	this.displayDiv3D = {};

	this.initScene();
};

WebExplorerUtility.JsUtility.makeHerit(AbstractView, AbstractController);

AbstractView.prototype.initScene = function() {
	var scene = this.viewScene.scene;

	scene.add(new THREE.HemisphereLight(0xaaaaaa, 0x444444));

	var light = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 2);
	light.position.set(0, 1500, 1000);
	light.target.position.set(0, 0, 0);

	// light.castShadow = true;

	// light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(50, 1, 1200, 2500));
	// light.shadow.bias = 0.0001;

	// light.shadow.mapSize.width = 4096;
	// light.shadow.mapSize.height = 4096;

	scene.add(light);
};

//static
const raycaster = new THREE.Raycaster();
AbstractView.prototype.intersect = function(mousePos, mesh) {
	raycaster.setFromCamera(mousePos, this.viewScene.camera);
	return raycaster.intersectObject(mesh);//not recursive
};

AbstractView.prototype.clearDisplayDiv3D = function() {
	let scene = this.viewScene.scene;

	for (let id in this.displayDiv3D) {
		var meshes = this.displayDiv3D[id];
		meshes.forEach(function(m) {
			scene.remove(m);
		});
		delete this.displayDiv3D[id];
	}
};