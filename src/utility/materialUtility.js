"use strict";

window.WebExplorerUtility = window.WebExplorerUtility || {};

window.WebExplorerUtility.MaterialUtility = {

	load: function() {
		console.info("%cMaterial loading", "color:#27AE60;");
		return new Promise((resolve, reject) => {

			new THREE.TextureLoader().load(
				"./src/assets/material/metal/metal.jpg",
				function(texture) {
					this.iconMat = new THREE.MeshStandardMaterial({
						map: texture,
						metalness: 0.3,
						roughness: 0.2,
						emissive: new THREE.Color(0.15, 0.15, 0.15),
						vertexColors: THREE.VertexColors
					})

					resolve();
				}.bind(this));
		});
	},

	lineMat: new THREE.LineBasicMaterial({
		color: "#FFFFFF",
		linewidth: 0.5
	}),

	iconMat: null,

	labelMat: new THREE.MeshStandardMaterial({
		color: new THREE.Color(1, 1, 1),
		roughness: 0.5,
		metalness: 0.6,
		flatShading: true,
		emissive: new THREE.Color(0.3, 0.3, 0.3)
	}),
	// iconMat: new THREE.MeshNormalMaterial(),

	outlineMat: new THREE.MeshBasicMaterial({
		color: 0xb0e0e6,
		side: THREE.BackSide
	})


}