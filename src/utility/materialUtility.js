"use strict";

window.WebExplorerUtility = window.WebExplorerUtility || {};

window.WebExplorerUtility.MaterialUtility = {

	lineMat: new THREE.LineBasicMaterial({
		color: "#0000FF",
		linewidth: 0.5
	}),

	iconMat: new THREE.MeshNormalMaterial(),

	outlineMat: new THREE.MeshBasicMaterial({
		color: 0xff0000,
		side: THREE.BackSide
	})


}