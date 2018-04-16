"use strict";

window.WebExplorerUtility = window.WebExplorerUtility || {};

window.WebExplorerUtility.JsUtility = {

	//take two class as argument and make them herit
	makeHerit: function(child, parent) {
		child.prototype = Object.create(parent.prototype);
		child.prototype.constructor = child;
		// "_super" is NOT part of ES5, its a convention
		// defined by the developer
		// set the "_super" to the Person constructor function
		child.prototype._super = parent;
	}

}