"use strict";

//component use to see in detail the selected element

function SelectedView(canvas) {

	this._super(canvas);

	this.currentDiv3D = null;
};

WebExplorerUtility.JsUtility.makeHerit(SelectedView, AbstractView);

SelectedView.prototype.initialize = function() {

	var scene = this.viewScene.scene;

	scene.background = new THREE.Color(0.65, 0.65, 0.65);
};

SelectedView.prototype.tick = function() {

	if (this.currentDiv3D && this.currentDiv3D.isFolder()) {

		this.currentDiv3D.selectedObject.children.forEach(function(child) {

			if (child.userData.planeNormal) {
				var forwardVector = child.position.clone().cross(child.userData.planeNormal);
				forwardVector.setLength(child.userData.speed * wE3D.dt);
				child.position.add(forwardVector);
			} else {
				//line
				child.geometry.verticesNeedUpdate = true;
			}

		});
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
	document.body.style.cursor = "auto";
};