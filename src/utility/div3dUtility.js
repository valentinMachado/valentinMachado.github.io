"use strict";

window.WebExplorerUtility = window.WebExplorerUtility || {};

window.WebExplorerUtility.Div3dUtility = {

	//font load async
	font: null,

	//take two class as argument and make them herit
	createFromHtml: function(html, firstCall) {

		var result = this.createFromElement(html);

		for (let i = 0; i < result.html.children.length; i++) {
			var child = result.html.children[i];
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

		switch (el.localName) {
			case "img":
				return new Img3D(el);
			case "a":
				return new Link3D(el);
			case "video":
				return new Video3D(el);
			default:
				return new Div3D(el);
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