"use strict";

window.WebExplorerUtility = window.WebExplorerUtility || {};

window.WebExplorerUtility.ModelUtility = {

	models: {},

	load: function() {

		console.info("%cModel loading", "color:#27AE60;");

		//create basic shape cube + sphere
		this.models["sphere"] = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32),
			WebExplorerUtility.MaterialUtility.iconMat);

		this.models["cube"] = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1),
			WebExplorerUtility.MaterialUtility.iconMat);

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
			modelData.push({
				id: "perso",
				folder: "./src/assets/model/Perso/",
				file: "Perso.obj"
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

	create: function(modelTag, size) {
		let original = this.models[modelTag];

		let geo = original.geometry.clone()

		for (var i = geo.vertices.length - 1; i >= 0; i--) {
			geo.vertices[i].multiplyScalar(size)
		}

		let color = new THREE.Color().setHSL(Math.random(), 1.0, 0.5);
		geo.faces.forEach(function(face) {
			face.color = color
		})

		return new THREE.Mesh(geo, WebExplorerUtility.MaterialUtility.iconMat)
	},

	//font load async
	font: null,

	buildLabelMesh: function(string) {
		var geometry = new THREE.TextGeometry(string, {
			font: this.font,
			size: 0.5,
			height: 0.15
		});

		geometry.computeBoundingBox()
		let dim = new THREE.Vector3()
		dim.x = geometry.boundingBox.max.x - geometry.boundingBox.min.x
		dim.y = geometry.boundingBox.max.y - geometry.boundingBox.min.y
		dim.z = geometry.boundingBox.max.z - geometry.boundingBox.min.z

		//center on x z
		geometry.vertices.forEach(function(vertex) {
			vertex.x -= dim.x * 0.5
			vertex.z -= dim.z * 0.5
			vertex.y -= dim.y * 0.5
		});

		return new THREE.Mesh(geometry, WebExplorerUtility.MaterialUtility.labelMat);
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

					vertices[i + 1] -= normalizeSize * 0.5
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