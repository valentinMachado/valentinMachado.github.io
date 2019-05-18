"use strict";


function Multi(json) {
	this._super(json);

	//child
	this.multiChild = []

	//override
	this.type = "Multi";
}
WebExplorerUtility.JsUtility.makeHerit(Multi, Div3D);

Multi.prototype.initViewScene = function(viewScene) {
	var scene = viewScene.scene;
	viewScene.initSceneDefault();

	var camera = viewScene.camera;
	var controls = viewScene.controls;

	camera.position.x = 0;
	camera.position.y = 0;
	camera.position.z = 1;

	controls.target.x = 0;
	controls.target.y = 0;
	controls.target.z = 0;
	controls.update();

	scene.add(this.selectedObject)

	//play video
	this.multiChild.forEach(function(child) {
		if (child instanceof Video3D) child.html.play()
	});

};

Multi.prototype.tick = function(viewScene) {

	let hoverChild = []


	this.multiChild.forEach(function(child) {
		child.tick(viewScene)

		let object = child.selectedObject

		if (!wE3D.ui.isOnRightView) {
			let mousePos = wE3D.ui.mousePos;
			raycaster.setFromCamera(mousePos, viewScene.camera);
			let intersect = raycaster.intersectObject(object, true);
			if (intersect.length) {
				hoverChild.push(child)
			}
		}

		object.quaternion.copy(viewScene.camera.quaternion);

	}.bind(this))

	//detect hover
	if (hoverChild.length) {
		if (!this.lastHover || !hoverChild.includes(this.lastHover)) {
			this.lastHover = hoverChild[0];
		}

		let object = this.lastHover.selectedObject

		let closestPoint = WebExplorerUtility.MathUtility.fetchPosAtDistance(
			viewScene.controls.target,
			viewScene.camera.position.clone(),
			1.2 * object.userData.radius);

		object.position.x = closestPoint.x
		object.position.y = closestPoint.y
		object.position.z = closestPoint.z
	} else {
		//this.lastHover = null
	}

	//rotate other
	this.multiChild.forEach(function(child) {
		if (child == this.lastHover) return
		let object = child.selectedObject
		var forwardVector = object.position.clone().cross(object.userData.planeNormal);
		forwardVector.setLength(object.userData.speed * wE3D.dt * this.scale);
		object.position.add(forwardVector);

		//security set length
		WebExplorerUtility.MathUtility.fetchPosAtDistance(
			new THREE.Vector3(),
			object.position,
			object.userData.radius);

	}.bind(this));



};

//code take from https://stemkoski.github.io/Three.js/Video.html
Multi.prototype._createSelectedObjectFile = function() {

	var size = this.scale * 3

	this.selectedObject = new THREE.Object3D();

	//build meshes of multichild
	this.json.multiChild.forEach(function(child) {
		let div = WebExplorerUtility.Div3dUtility.createFromElement(child)
		div.degree = this.degree
		div.buildMeshes()
		div.selectedObject.position.multiplyScalar(0)
		WebExplorerUtility.ModelUtility.scale(div.selectedObject, size)
		WebExplorerUtility.Div3dUtility.placeOnOrbit(this.selectedObject,
			div.selectedObject,
			this.fetchRadiusSelectedView(),
			false)

		if (child instanceof Video3D) {
			let bbGlobal = new THREE.Box3()
			bbGlobal.setFromObject(child.selectedObject);
			let bb = child.titleMesh.geometry.boundingBox;
			child.itleMesh.position.y = (bbGlobal.max.y) + bb.max.y * 2
		}



		this.multiChild.push(div);
	}.bind(this));

};