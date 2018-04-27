"use strict";


function AbstractView(elToListen) {

	this.viewScene = new ViewScene(elToListen);

	this.outline = null;

	//div under mouse
	this.divHovered = null;
};

WebExplorerUtility.JsUtility.makeHerit(AbstractView, AbstractController);

//static
const raycaster = new THREE.Raycaster();
AbstractView.prototype.intersect = function(mousePos, mesh) {

	if (!mesh.visible) return false;

	raycaster.setFromCamera(mousePos, this.viewScene.camera);
	return raycaster.intersectObject(mesh); //not recursive
};

AbstractView.prototype.setOutline = function(mesh) {
	var scene = this.viewScene.scene;

	if (this.outline) {
		scene.remove(this.outline);
		this.outline = null;
	}

	if (!mesh) return;

	this.outline = new THREE.Mesh(mesh.geometry, WebExplorerUtility.MaterialUtility.outlineMat);
	var position = new THREE.Vector3();
	position.setFromMatrixPosition(mesh.matrixWorld);
	this.outline.position.copy(position);
	this.outline.scale.multiplyScalar(1.1);
	scene.add(this.outline);
};

AbstractView.prototype.updateDivHovered = function() {

	var mainView = wE3D.ui;
	if (this.viewScene.controls.enabled) {
		var info = this.fetchDivUnderMouse(mainView.mousePos);
		this.divHovered = info.div;

		if (this.divHovered) {
			this.setOutline(info.mesh);
			document.body.style.cursor = "pointer";
		} else {
			this.setOutline(null);
			document.body.style.cursor = "auto";
		}

	} else {
		this.divHovered = null;
		this.setOutline(null);
	}

};