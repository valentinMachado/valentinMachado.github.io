"use strict";

//component use to handle the exploration view (going throught the 3D DOM)

function ExplorerView(canvas) {

	this._super(canvas);

};
//just after constructor
WebExplorerUtility.JsUtility.makeHerit(ExplorerView, AbstractView);

ExplorerView.prototype.initialize = function() {

	var scene = this.viewScene.scene;

	var textureLoader = new THREE.TextureLoader();
	scene.background = textureLoader.load("./src/assets/space-bg.jpg");

	//add tree meshes to scene
	scene.add(wE3D.divs3d.iconObject);
};

ExplorerView.prototype.tick = function() {
	if (this.divHovered) {
		this.divHovered.iconObject.rotation.y += wE3D.dt;
	}
};

ExplorerView.prototype.setCurrentDiv3D = function(div) {
	this.currentDiv3D = div;
	this.display(div);
	wE3D.controllers.selectedView.display(div);
};

ExplorerView.prototype.display = function(parent) {
	debugger

	this.clearDisplayDiv3D();

	var scene = this.viewScene.scene;
	var displayDiv3D = this.displayDiv3D;

	//put the parent a the center and child around
	displayDiv3D[parent.id] = [];
	parent.iconMeshes.forEach(function(m) {

		m = m.clone();
		m.scale.set(1.5, 1.5, 1.5);
		m.position.x = 0;
		m.position.y = 0;
		m.position.z = 0;

		displayDiv3D[parent.id].push(m);

		scene.add(m);
	});

	var radius = 3;
	for (var i = parent.children.length - 1; i >= 0; i--) {
		var c = parent.children[i];
		var angle = i * 2 * Math.PI / parent.children.length;

		displayDiv3D[c.id] = [];

		c.iconMeshes.forEach(function(m) {

			m = m.clone();
			m.position.x = radius * Math.cos(angle);
			m.position.z = radius * Math.sin(angle);

			displayDiv3D[c.id].push(m);

			scene.add(m);
		});
	}

};

ExplorerView.prototype.fetchDivUnderMouse = function(mousePos) {

	var minDist = Infinity;
	var divHovered = null;

	WebExplorerUtility.Div3dUtility.traverse(wE3D.divs3d, function(d) {

		var intersect = this.intersect(mousePos, d.iconObject);
		if (intersect.length) {
			for (var j = intersect.length - 1; j >= 0; j--) {
				var info = intersect[j];
				if (info.distance < minDist) {
					//intersect
					divHovered = d;
					minDist = info.distance;
				}
			}
		}
	}.bind(this));

	return divHovered;
};

ExplorerView.prototype.makeCameraFocus = function(d) {

	var object = d.iconObject;
	var camera = this.viewScene.camera;
	var controls = this.viewScene.controls;

	var worldPos = new THREE.Vector3();
	worldPos.setFromMatrixPosition(this.divHovered.iconObject.matrixWorld);

	//right zoom
	var dist = 3 * Div3D.maxDegree / d.degree;
	var dir = worldPos.clone().sub(this.viewScene.camera.position);
	var l = dir.length();
	dir.normalize();
	var finalPos = this.viewScene.camera.position.clone();
	finalPos.add(dir.multiplyScalar(l - dist));

	TWEEN.removeAll(); // remove previous tweens if needed

	// backup original rotation
	var startRotation = camera.quaternion.clone();

	// final rotation (with lookAt)
	camera.lookAt(worldPos);
	var endRotation = camera.quaternion.clone();

	// revert to original rotation
	camera.quaternion.copy(startRotation);

	// Tween
	controls.enabled = false;
	var lookAtTween = new TWEEN.Tween(camera.quaternion)
		.to(endRotation, 600)
		.onComplete(function() {
			controls.target = worldPos.clone();
			controls.update();
			controls.enabled = true;
		})
		.start();

	var zoomTween = new TWEEN.Tween(camera.position)
		.to(finalPos, 600)
		.start();
};

//x,y are in ratio into this view
// ExplorerView.prototype.onPointerMove = function(mousePos, event) {
// 	this.divHovered = this.fetchDivUnderMouse(mousePos);
// };

ExplorerView.prototype.onPointerDown = function(mousePos, event) {
	this.divHovered = this.fetchDivUnderMouse(mousePos);

	//camera focus
	if (this.divHovered) {

		this.makeCameraFocus(this.divHovered);

	}
};

// ExplorerView.prototype.onPointerUp = function(mousePos, event) {
// 	if (event.which === 3) {
// 		//previous
// 		if (this.currentDiv3D.parent) this.setCurrentDiv3D(this.currentDiv3D.parent);
// 	} else {
// 		this.divHovered = this.fetchDivUnderMouse(mousePos);
// 		if (this.divHovered) this.setCurrentDiv3D(this.divHovered);
// 	}
// }