"use strict";

function Link3D(html) {
	this._super(html);

	//is render with the css renderer
	this.useCssRenderer = true;

	//override
	this.type = "Link3D";
}
WebExplorerUtility.JsUtility.makeHerit(Link3D, Div3D);

Link3D.prototype.initViewScene = function(viewScene) {
	var scene = viewScene.scene;
	var camera = viewScene.camera;
	var controls = viewScene.controls;

	camera.position.set(500, 350, 750);

	controls.update();

	scene.add(this.selectedObject);
};

Link3D.prototype._createSelectedObjectFile = function() {

	var createCssObject = function(w, h, position, rotation, url) {
		var html = [
			'<div style="width:' + w + 'px; height:' + h + 'px;">',
			'<iframe src="' + url + '" width="' + w + '" height="' + h + '">',
			'</iframe>',
			'</div>'
		].join('\n');
		var div = document.createElement('div');
		div.innerHTML = html;
		
		var cssObject = new THREE.CSS3DObject(div);
		cssObject.position.x = position.x;
		cssObject.position.y = position.y;
		cssObject.position.z = position.z;
		cssObject.rotation.x = rotation.x;
		cssObject.rotation.y = rotation.y;
		cssObject.rotation.z = rotation.z;
		return cssObject;
	};

	this.selectedObject = createCssObject(100, 100,
		new THREE.Vector3(), new THREE.Vector3(),
		"https://threejs.org/docs/#api/core/Object3D");
};