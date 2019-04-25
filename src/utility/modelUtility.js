"use strict";

window.WebExplorerUtility = window.WebExplorerUtility || {};

window.WebExplorerUtility.ModelUtility = {

	models: {},

	load: function() {
		return new Promise((resolve, reject) => {

			var modelData = []
			modelData.push({
				id: "barrel",
				folder: "./src/assets/model/Barrel/",
				file: "LP_Barrel.obj"
			});
			modelData.push({
				id: "pillar",
				folder: "./src/assets/model/Pillar/",
				file: "LP_Pillar.obj"
			});

			var objLoader = new THREE.OBJLoader();
			var count = 0;

			modelData.forEach(function(data) {

				objLoader.setPath(data.folder);

				objLoader.load(data.file, function(object) {
					object = this.normalize(object)
					this.models[data.id] = object

					count++;

					if (count >= modelData.length) {
						resolve();
					}
				}.bind(this));

			}.bind(this));

		});
	},

	fetch: function(modelTag, size) {
		let original = this.models[modelTag];
		let copy = original.clone()

		//normalize so its only one geo
		copy.geometry.vertices.forEach(function(vertex) {
			vertex *= size;
		});

		return copy
	},

	normalize: function(object) {
		let bb = new THREE.Box3();
		bb.setFromObject(object);
		let dim = new THREE.Vector3()
		dim.x = bb.max.x - bb.min.x
		dim.y = bb.max.y - bb.min.y
		dim.z = bb.max.z - bb.min.z

		let normalizeSize = 2
		let singleGeo = new THREE.Geometry()

		object.traverse(function(child) {
			if (child.geometry) {

				let vertices = child.geometry.attributes.position.array;
				for (let i = 0; i < vertices.length; i += 3) {
					vertices[i] *= (normalizeSize / dim.x)
					vertices[i + 1] *= (normalizeSize / dim.y)
					vertices[i + 2] *= (normalizeSize / dim.z)

					vertices[i + 1] -= normalizeSize
				}

				child.updateMatrix()

				let geometry = child.geometry
				if (!geometry.isGeometry) {
					geometry = new THREE.Geometry()
					geometry.fromBufferGeometry(child.geometry)
				}

				singleGeo.merge(geometry, child.matrix)
			}
		});

		return new THREE.Mesh(singleGeo, WebExplorerUtility.MaterialUtility.iconMat)
	}

}