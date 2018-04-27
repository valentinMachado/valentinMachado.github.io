"use strict";


function Link3D(html) {
	this._super(html);

	//override
	this.type = "Link3D";
}
WebExplorerUtility.JsUtility.makeHerit(Link3D, Div3D);

Link3D.prototype.initViewScene = function(viewScene) {
	/*var scene = viewScene.scene;
	var camera = viewScene.camera;
	var controls = viewScene.controls;

	camera.position.x = 0;
	camera.position.y = 1;
	camera.position.z = 0;

	controls.update();

	scene.add(this.selectedObject);*/

	var container = document.getElementById("iframe-container");
	container.style.display = "block";

	//create iframe
	var iframe = document.createElement('iframe');
	iframe.style.width = "100%";
	iframe.style.height = "100%";
	iframe.setAttribute("scrolling", "no");
	iframe.setAttribute("frameborder", "no");
	iframe.setAttribute("allow", "autoplay");
	iframe.src = this.html.href;
	container.appendChild(iframe);
};

Link3D.prototype.onDisable = function(viewScene) {
	var container = document.getElementById("iframe-container");
	container.style.display = "none";

	//remove child
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}
};


Link3D.prototype._createIconObject = function() {

	var material = new THREE.MeshStandardMaterial({

		color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
		roughness: 0.5,
		metalness: 0,
		flatShading: true

	});

	var size = 0.4 * this.scale;
	var geometry = new THREE.SphereGeometry(size, 32, 32);
	var cube = new THREE.Mesh(geometry, material);


	this.iconObject = cube;
};

Link3D.prototype._createSelectedObjectFile = function() {

	var material = new THREE.MeshStandardMaterial({

		color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
		roughness: 0.5,
		metalness: 0,
		flatShading: true

	});

	var size = 0.4 * this.scale;
	var geometry = new THREE.SphereGeometry(size, 32, 32);
	var cube = new THREE.Mesh(geometry, material);


	this.selectedObject = cube;
};