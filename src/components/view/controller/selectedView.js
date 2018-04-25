"use strict";

//component use to see in detail the selected element

function SelectedView(canvas) {

	this._super(canvas);

	this.currentDiv3D = null;
};

WebExplorerUtility.JsUtility.makeHerit(SelectedView, AbstractView);

SelectedView.prototype.initialize = function() {

	var scene = this.viewScene.scene;

	var textureLoader = new THREE.TextureLoader();
	scene.background = textureLoader.load("./src/assets/img/bg.jpg");

	//WebExplorerUtility.DebugUtility.addCoordSystem(scene);
};

SelectedView.prototype.tick = function() {


	if (this.currentDiv3D) {

		if (this.currentDiv3D.isFolder()) {

			var zero = new THREE.Vector3();

			this.currentDiv3D.selectedObject.children.forEach(function(child) {

				if (child.userData.planeNormal) {
					var forwardVector = child.position.clone().cross(child.userData.planeNormal);
					forwardVector.setLength(child.userData.speed * wE3D.dt);
					child.position.add(forwardVector);

					//security set length
					WebExplorerUtility.MathUtility.fetchPosAtDistance(
						zero,
						child.position,
						child.userData.radius);

				} else {
					//line
					child.geometry.verticesNeedUpdate = true;
				}

			});

		} else {

			this.currentDiv3D.tick();
		}

	}
};

SelectedView.prototype.setCurrentDiv3D = function(div) {

	//reset
	var scene = this.viewScene.scene;
	scene.children.length = 0;

	this.currentDiv3D = div;

	//div init scene
	div.initViewScene(this.viewScene);

	//adjust zoom camera
	this.adjustCameraZoom();

};
SelectedView.prototype.adjustCameraZoom = function() {

	var camera = this.viewScene.camera;
	var controls = this.viewScene.controls;
	controls.enabled = false;

	var finalPos = WebExplorerUtility.MathUtility.fetchPosAtDistance(
		new THREE.Vector3(),
		camera.position.clone(),
		15 * this.currentDiv3D.scale);

	var zoomTween = new TWEEN.Tween(camera.position)
		.to(finalPos, 600).onComplete(
			function() {
				controls.enabled = true;
				controls.update();
			})
		.start();

};

SelectedView.prototype.onPointerMove = function(mousePos, event) {
	if (this.fetchDivUnderMouse(mousePos)) {
		document.body.style.cursor = "pointer";
	} else {
		document.body.style.cursor = "auto";
	}
};

SelectedView.prototype.onPointerDown = function(mousePos, event) {

	var explorerController = wE3D.controllers.explorerView;

	if (event.which === 3) {
		//right click
		if (this.currentDiv3D.parent) {
			explorerController.setCurrentDiv3D(this.currentDiv3D.parent);
		}

	} else {

		this.divHovered = this.fetchDivUnderMouse(mousePos);

		//camera focus
		if (this.divHovered) {
			explorerController.setCurrentDiv3D(this.divHovered);
		}
	}
};

SelectedView.prototype.fetchDivUnderMouse = function(mousePos) {

	var minDist = Infinity;
	var divHovered = null;

	this.currentDiv3D.selectedObject.children.forEach((child) => {

		if (!child.userData.divId) return;

		var intersect = this.intersect(mousePos, child);
		if (intersect.length) {
			for (var j = intersect.length - 1; j >= 0; j--) {
				var info = intersect[j];
				if (info.distance < minDist) {
					//intersect
					divHovered = Div3D.getDiv3dFromId(child.userData.divId);
					minDist = info.distance;
				}
			}
		}
	});

	return divHovered;
};