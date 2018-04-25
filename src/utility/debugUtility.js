"use strict";

window.WebExplorerUtility = window.WebExplorerUtility || {};

window.WebExplorerUtility.DebugUtility = {

	addCoordSystem: function(scene) {

		var geometry = new THREE.CylinderGeometry(1, 1, 20, 32);
		var material = new THREE.MeshBasicMaterial({
			color: 0xffff00
		});
		var cylinder = new THREE.Mesh(geometry, material);
		scene.add(cylinder);

	}


}