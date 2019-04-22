"use strict";

window.WebExplorerUtility = window.WebExplorerUtility || {};

window.WebExplorerUtility.Div3dUtility = {

	//font load async
	font: null,

	//take two class as argument and make them herit
	createFromHtml: function(json, firstCall) {

		var result = this.createFromElement(json);

		for (let i = 0; i < result.json.child.length; i++) {
			var child = result.json.child[i];
			result.appendChild(this.createFromHtml(child, false))
		}

		if (firstCall) {
			//first count degree to know the max before building
			this.traverse(result, function(d) {
				d.countDegree();
			});

			this.traverse(result, function(d) {
				d.buildMeshes();
			});
		}

		return result;
	},

	traverse: function(div3D, cb) {

		//apply function to itself
		cb(div3D);

		for (var i = div3D.children.length - 1; i >= 0; i--) {
			this.traverse(div3D.children[i], cb);
		}
	},

	createFromElement: function(el) {

		switch (el.type) {
			case "image":
				return new Img3D(el);
			case "link":
				return new Link3D(el);
			case "video":
				return new Video3D(el);
			case "div3d":
				return new Div3D(el);
			default:
				console.error("no type in json")
		}
	},

	//common mesh building
	buildLabelMesh: function(string) {
		var geometry = new THREE.TextGeometry(string, {
			font: this.font,
			size: 0.5,
			height: 0.15
		});

		return new THREE.Mesh(geometry, WebExplorerUtility.MaterialUtility.iconMat);
	}

}