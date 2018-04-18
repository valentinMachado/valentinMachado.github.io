"use strict";

//component use to handle the exploration view (going throught the 3D DOM)

const pathLineMaterial = new THREE.LineBasicMaterial({
	color: "#0000FF",
	linewidth: 2
});

function ExplorerView(canvas) {

	this._super(canvas);

	this.pathLine = null;
};
//just after constructor
WebExplorerUtility.JsUtility.makeHerit(ExplorerView, AbstractView);

ExplorerView.prototype.initialize = function() {

	var scene = this.viewScene.scene;

	//disable pan
	this.viewScene.controls.enablePan = false; //cant modify target

	var textureLoader = new THREE.TextureLoader();
	scene.background = textureLoader.load("./src/assets/space-bg.jpg");

	//add tree meshes to scene
	scene.add(wE3D.divs3d.iconObject);
	this.setCurrentDiv3D(wE3D.divs3d);
};

ExplorerView.prototype.tick = function() {

	if (this.currentDiv3D) {
		WebExplorerUtility.Div3dUtility.traverse(this.currentDiv3D, function(d) {
			d.iconObject.rotation.y += 0.1 * wE3D.dt;
		});
	}
};

ExplorerView.prototype.updatePathLine = function() {

	var scene = this.viewScene.scene;

	//clear
	if (this.pathLine) scene.remove(this.pathLine);

	var geometry = new THREE.Geometry();

	//update geometrie of line path
	var worldPos = new THREE.Vector3();

	//all parent are visible
	var current = this.currentDiv3D;
	while (current.parent) {

		worldPos.setFromMatrixPosition(current.iconObject.matrixWorld);
		//TODO
		worldPos.y += current.fetchDistToChildPlane() * 0.5;
		geometry.vertices.push(worldPos.clone());

		current = current.parent;
	}

	worldPos.setFromMatrixPosition(current.iconObject.matrixWorld);
	worldPos.y += current.fetchDistToChildPlane() * 0.5;
	geometry.vertices.push(worldPos.clone());

	this.pathLine = new THREE.Line(geometry, pathLineMaterial);
	scene.add(this.pathLine);
};

ExplorerView.prototype.setCurrentDiv3D = function(div) {

	this.currentDiv3D = div;
	wE3D.controllers.selectedView.display(div);

	//reset visibility
	WebExplorerUtility.Div3dUtility.traverse(wE3D.divs3d, function(d) {
		d.iconObject.visible = false;
	});
	//make current + child visible
	this.currentDiv3D.showIcon(true);

	//all parent are visible
	var current = this.currentDiv3D;
	while (current.parent) {
		current = current.parent;
		// current.iconObject.visible = true;
		current.showIcon(true);
	}

	this.updatePathLine();

	this.makeCameraFocus(div);
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
	worldPos.setFromMatrixPosition(object.matrixWorld);

	var ratioView = 0.8;
	var dir = new THREE.Vector3(1, ratioView, 0); //default
	if (d.parent) {
		// var parentWorldPos = new THREE.Vector3().setFromMatrixPosition(d.parent.iconObject.matrixWorld);
		var parentWorldPos = camera.position.clone();
		dir = parentWorldPos.sub(worldPos);
		// dir.negate();
		dir.y = ratioView * Math.sqrt(dir.x * dir.x + dir.z * dir.z);
	}

	//right angle
	var finalPos = new THREE.Vector3();
	finalPos.x = worldPos.x + dir.x;
	finalPos.y = worldPos.y + dir.y;
	finalPos.z = worldPos.z + dir.z;

	//right zoom
	var dist = 5 * d.scale;
	finalPos = this.fetchPosAtDistance(worldPos, finalPos, dist);

	TWEEN.removeAll(); // remove previous tweens if needed


	// Tween
	controls.enabled = false;
	var zoomTween = new TWEEN.Tween(camera.position)
		.to(finalPos, 300).onComplete(
			function() {

			})
		.start();

	// backup original rotation
	var startRotation = camera.quaternion.clone();

	// final rotation (with lookAt)
	var oldPos = camera.position.clone();
	camera.position.x = finalPos.x;
	camera.position.y = finalPos.y;
	camera.position.z = finalPos.z;
	camera.lookAt(worldPos);
	var endRotation = camera.quaternion.clone();

	// revert to original rotation
	camera.quaternion.copy(startRotation);
	camera.position.x = oldPos.x;
	camera.position.y = oldPos.y;
	camera.position.z = oldPos.z;

	var lookAtTween = new TWEEN.Tween(camera.quaternion)
		.to(endRotation, 600)
		.onComplete(function() {

			controls.target = worldPos;
			controls.enabled = true;
			controls.update();
		})
		.start();
};

//x,y are in ratio into this view
// ExplorerView.prototype.onPointerMove = function(mousePos, event) {
// 	this.divHovered = this.fetchDivUnderMouse(mousePos);
// };

ExplorerView.prototype.onPointerDown = function(mousePos, event) {

	if (event.which === 3) {
		//right click
		if (this.currentDiv3D.parent) {
			this.setCurrentDiv3D(this.currentDiv3D.parent);
		}

	} else {

		this.divHovered = this.fetchDivUnderMouse(mousePos);

		//camera focus
		if (this.divHovered) {
			this.setCurrentDiv3D(this.divHovered);
		}
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