"use strict";

window.WebExplorerUtility = window.WebExplorerUtility || {};

window.WebExplorerUtility.ModelUtility = {

	models: {},

	normalizeSize: 3,

	load: function() {

		console.info("%cModel loading", "color:#27AE60;");

		//create basic shape cube + sphere
		this.models["sphere"] = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32),
			WebExplorerUtility.MaterialUtility.iconMat);

		this.models["cube"] = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1),
			WebExplorerUtility.MaterialUtility.iconMat);

		return new Promise((resolve, reject) => {

			var modelData = wE3D.conf.modelData

			var objLoader = new THREE.OBJLoader();
			var count = 0;
			objLoader.setPath("./src/assets/model/");

			modelData.forEach(function(data) {

				objLoader.load(data.file, function(object) {

					console.info(data.id + " is imported")

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

	index: 0,

	fetchRandomColor: function() {

		let possibleColor = [];
		possibleColor.push(new THREE.Color(0x25b7d3))
		possibleColor.push(new THREE.Color(0xe04f5e))
		possibleColor.push(new THREE.Color(0x7ebbd2))
		possibleColor.push(new THREE.Color(0xd2cd60))
		possibleColor.push(new THREE.Color(0xff9568))
		possibleColor.push(new THREE.Color(0x97dd6a))
		possibleColor.push(new THREE.Color(0x19c6ec))
		possibleColor.push(new THREE.Color(0xced645))
		possibleColor.push(new THREE.Color(0xa5afe3))

		//let indexRand = Math.round(Math.random() * (possibleColor.length - 1))

		this.index = (this.index + 1) % (possibleColor.length - 1)

		return possibleColor[this.index]
	},

	create: function(modelTag, size) {
		if (!this.models[modelTag]) alert(modelTag + ".obj not found")
		let original = this.models[modelTag];

		let geo = original.geometry.clone()

		for (var i = geo.vertices.length - 1; i >= 0; i--) {
			geo.vertices[i].multiplyScalar(size)
		}

		let color = this.fetchRandomColor()
		geo.faces.forEach(function(face) {
			face.color = color
		})

		return new THREE.Mesh(geo, WebExplorerUtility.MaterialUtility.iconMat)
	},

	//font load async
	font: null,

	buildLabelMesh: function(string, scale) {
		var geometry = new THREE.TextGeometry(string, {
			font: this.font,
			size: 1,
			height: 0.3
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

		let result = new THREE.Mesh(geometry, WebExplorerUtility.MaterialUtility.labelMat)
		result.scale.multiplyScalar(this.normalizeSize * scale * 0.2)

		return result;
	},

	scale: function(object, scale) {
		let bb = new THREE.Box3();
		bb.setFromObject(object);
		let dim = new THREE.Vector3()
		dim.x = bb.max.x - bb.min.x
		dim.y = bb.max.y - bb.min.y
		dim.z = bb.max.z - bb.min.z

		let maxDim = Math.max(dim.x, dim.y)
		maxDim = Math.max(maxDim, dim.z)

		let ratio = scale / maxDim
		object.scale.multiplyScalar(ratio)
		// object.traverse(function(child) {
		// 	if (child.geometry) {

		// 		let found = false;

		// 		if (child.geometry.attributes && child.geometry.attributes.position) {
		// 			let vertices = child.geometry.attributes.position.array;
		// 			for (let i = 0; i < vertices.length; i += 3) {
		// 				//scale so maxDim = normalizeSize
		// 				vertices[i] *= ratio
		// 				vertices[i + 1] *= ratio
		// 				vertices[i + 2] *= ratio
		// 			}

		// 			found = true;
		// 		}

		// 		if (child.geometry.vertices) {
		// 			child.geometry.vertices.forEach(function(vertice) {
		// 				vertice.multiplyScalar(ratio);
		// 			})
		// 			child.verticesNeedUpdate = true;
		// 			found = true;
		// 		}



		// 		if (!found) console.warn("case not handle")
		// 		child.updateMatrix()
		// 	}
		// });
	},

	normalize: function(object) {
		let bb = new THREE.Box3();
		bb.setFromObject(object);
		let dim = new THREE.Vector3()
		dim.x = bb.max.x - bb.min.x
		dim.y = bb.max.y - bb.min.y
		dim.z = bb.max.z - bb.min.z

		let maxDim = Math.max(Math.max(dim.x, dim.y), dim.z)
		let normalizeSize = this.normalizeSize
		let ratio = normalizeSize / maxDim
		let singleGeo = new THREE.Geometry()

		object.traverse(function(child) {
			if (child.geometry) {

				let vertices = child.geometry.attributes.position.array;
				for (let i = 0; i < vertices.length; i += 3) {

					//reset origin
					vertices[i] -= bb.min.x + dim.x * 0.5
					vertices[i + 1] -= bb.min.y + dim.y * 0.5
					vertices[i + 2] -= bb.min.z + dim.z * 0.5

					//scale so maxDim = normalizeSize
					vertices[i] *= ratio
					vertices[i + 1] *= ratio
					vertices[i + 2] *= ratio
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