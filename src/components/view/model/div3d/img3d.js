"use strict";

function Img3D(html) {
	this._super(html);

	//override
	this.type = "IMG3D";
}
WebExplorerUtility.JsUtility.makeHerit(Img3D, Div3D);

Img3D.prototype.initViewScene = function(viewScene) {
	var scene = viewScene.scene;
	var camera = viewScene.camera;
	var controls = viewScene.controls;

	camera.position.x = 0;
	camera.position.y = 1;
	camera.position.z = 0;

	controls.update();

	scene.add(this.selectedObject);
};


Img3D.prototype._createIconObject = function() {

	var material = new THREE.MeshStandardMaterial({

		color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
		roughness: 0.5,
		metalness: 0,
		flatShading: true

	});

	var size = 0.25 * this.scale;
	var geometry = new THREE.SphereGeometry(size, 32, 32);
	var cube = new THREE.Mesh(geometry, material);


	this.iconObject = cube;
};

Img3D.prototype._createSelectedObjectFile = function() {

	//put img on a plane
	var textureLoader = new THREE.TextureLoader();
	var texture = textureLoader.load(this.html.src);
	var material = new THREE.MeshBasicMaterial({
		map: texture,
		side: THREE.DoubleSide
	});
	var size = this.scale * 15;
	var geometry = new THREE.PlaneGeometry(size, size, size, 5);
	var field = new THREE.Mesh(geometry, material);
	field.rotation.x = -Math.PI / 2;

	this.selectedObject = field;
};