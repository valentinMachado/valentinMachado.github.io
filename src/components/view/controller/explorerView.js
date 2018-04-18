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
	this.setCurrentDiv3D(wE3D.divs3d);
};

ExplorerView.prototype.tick = function() {

	if (this.currentDiv3D) {
		WebExplorerUtility.Div3dUtility.traverse(this.currentDiv3D, function(d) {
			d.iconObject.rotation.y += 0.1 * wE3D.dt;
		});
	}

};

ExplorerView.prototype.setCurrentDiv3D = function(div) {

	this.currentDiv3D = div;
	wE3D.controllers.selectedView.display(div);
	this.makeCameraFocus(div);

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
		current.showIcon(true);
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
	worldPos.setFromMatrixPosition(object.matrixWorld);

	//right angle
	var finalPos = new THREE.Vector3();
	finalPos.x = worldPos.x + 10;
	finalPos.y = worldPos.y + 10;
	finalPos.z = worldPos.z;

	//right zoom
	var dist = 5 * Div3D.maxDegree / d.degree;
	var dir = worldPos.clone().sub(finalPos);
	var l = dir.length();
	dir.normalize();
	finalPos.add(dir.multiplyScalar(l - dist));

	TWEEN.removeAll(); // remove previous tweens if needed


	// Tween
	controls.enabled = false;
	var zoomTween = new TWEEN.Tween(camera.position)
		.to(finalPos, 300).onComplete(
			function() {

				// backup original rotation
				var startRotation = camera.quaternion.clone();

				// final rotation (with lookAt)
				camera.lookAt(worldPos);
				var endRotation = camera.quaternion.clone();

				// revert to original rotation
				camera.quaternion.copy(startRotation);

				var lookAtTween = new TWEEN.Tween(camera.quaternion)
					.to(endRotation, 300)
					.onComplete(function() {

						controls.target = worldPos;
						controls.enabled = true;
						controls.update();
					})
					.start();
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