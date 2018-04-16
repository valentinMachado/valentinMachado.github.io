"use strict";

window.WebExplorerUtility = window.WebExplorerUtility || {};

window.WebExplorerUtility.Div3dUtility = {

	//take two class as argument and make them herit
	createFromHtml: function(html) {

		var result = new Div3D(html);

		// result.html.children.forEach(function(child) {});

		for (let i = 0; i < result.html.children.length; i++) {
			var child = result.html.children[i];
			result.appendChild(this.createFromHtml(child))
		}

		return result;
	}

}