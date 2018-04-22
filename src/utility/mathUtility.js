"use strict";

window.WebExplorerUtility = window.WebExplorerUtility || {};

window.WebExplorerUtility.MathUtility = {

	fetchPosAtDistance: function(target, currentPos, dist) {
		var dir = target.clone().sub(currentPos);
		var l = dir.length();
		dir.normalize();
		return currentPos.add(dir.multiplyScalar(l - dist));
	}

}