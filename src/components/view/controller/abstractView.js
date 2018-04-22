"use strict";


function AbstractView(canvas) {

	this.viewScene = new ViewScene(canvas);
};

WebExplorerUtility.JsUtility.makeHerit(AbstractView, AbstractController);

//static
const raycaster = new THREE.Raycaster();
AbstractView.prototype.intersect = function(mousePos, mesh) {
	raycaster.setFromCamera(mousePos, this.viewScene.camera);
	return raycaster.intersectObject(mesh); //not recursive
};

