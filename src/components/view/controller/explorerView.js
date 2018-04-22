"use strict";

//component use to handle the exploration view (going throught the 3D DOM)

const pathLineMaterial = new THREE.LineBasicMaterial({
	color: "#0000FF",
	linewidth: 2
});

function ExplorerView(canvas) {

	this._super(canvas);

	this.pathLine = null;

	//DEBUG
	// var material = new THREE.MeshStandardMaterial();
	// var geometry = new THREE.SphereGeometry(1, 32, 32);
	// this.cube = new THREE.Mesh(geometry, material);
	// this.viewScene.scene.add(this.cube);
};
//just after constructor
WebExplorerUtility.JsUtility.makeHerit(ExplorerView, AbstractView);

ExplorerView.prototype.initialize = function() {

	var scene = this.viewScene.scene;

	//disable pan
	this.viewScene.controls.enablePan = false; //cant modify target

	// var textureLoader = new THREE.TextureLoader();
	// scene.background = textureLoader.load("./src/assets/space-bg.jpg");
	this.initSkyBox();

	//add tree meshes to scene
	scene.add(wE3D.divs3d.iconObject);
	this.setCurrentDiv3D(wE3D.divs3d);
};

ExplorerView.prototype.initSkyBox = function() {
	var urlPrefix = "./src/assets/skybox/lightblue/";
	var urls = [urlPrefix + "right.png", urlPrefix + "left.png",
		urlPrefix + "top.png", urlPrefix + "bot.png",
		urlPrefix + "front.png", urlPrefix + "back.png"
	];

	// var reflectionCube = THREE.CubeTextureLoader(urls);
	var reflectionCube = THREE.ImageUtils.loadTextureCube(urls);

	reflectionCube.format = THREE.RGBFormat;
	var shader = THREE.ShaderLib["cube"];
	shader.uniforms["tCube"].value = reflectionCube;
	var material = new THREE.ShaderMaterial({
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
	});

	// build the skybox Mesh
	var skyboxMesh = new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000), material);
	// add it to the scene
	var scene = this.viewScene.scene;

	scene.add(skyboxMesh);
};

ExplorerView.prototype.tick = function() {

	if (this.currentDiv3D) {
		WebExplorerUtility.Div3dUtility.traverse(this.currentDiv3D, function(d) {
			d.iconObject.rotation.y += 0.1 * wE3D.dt;
		});
	}
};

ExplorerView.prototype.updatePathLine = function() {

	var scene = this.viewScene.scene;

	//clear
	if (this.pathLine) scene.remove(this.pathLine);

	var geometry = new THREE.Geometry();

	//update geometrie of line path
	var worldPos = new THREE.Vector3();

	//all parent are visible
	var current = this.currentDiv3D;
	while (current.parent) {

		worldPos.setFromMatrixPosition(current.iconObject.matrixWorld);
		geometry.vertices.push(worldPos.clone());
		current = current.parent;
	}

	worldPos.setFromMatrixPosition(current.iconObject.matrixWorld);
	geometry.vertices.push(worldPos.clone());

	this.pathLine = new THREE.Line(geometry, pathLineMaterial);
	scene.add(this.pathLine);
};

ExplorerView.prototype.setCurrentDiv3D = function(div) {

	this.currentDiv3D = div;

	//reset visibility
	WebExplorerUtility.Div3dUtility.traverse(wE3D.divs3d, function(d) {
		d.iconObject.visible = false;
	});
	//make current + child visible
	this.currentDiv3D.showIcon(true);

	//all parent are visible
	var current = this.currentDiv3D;
	while (current.parent) {
		current = current.parent;
		// current.iconObject.visible = true;
		current.showIcon(true);
	}

	this.updatePathLine();

	this.makeCameraFocus(div);

	//update other view
	wE3D.controllers.selectedView.setCurrentDiv3D(div);
};

ExplorerView.prototype.fetchDivUnderMouse = function(mousePos) {

	var minDist = Infinity;
	var divHovered = null;

	WebExplorerUtility.Div3dUtility.traverse(wE3D.divs3d, function(d) {

		var intersect = this.intersect(mousePos, d.iconObject);
		if (intersect.length) {
			for (var j = intersect.length - 1; j >= 0; j--) {
				var info = intersect[j];
				if (info.distance < minDist) {
					//intersect
					divHovered = d;
					minDist = info.distance;
				}
			}
		}
	}.bind(this));

	return divHovered;
};

ExplorerView.prototype.makeCameraFocus = function(d) {

	var object = d.iconObject;
	var camera = this.viewScene.camera;
	var controls = this.viewScene.controls;

	var finalTarget = new THREE.Vector3();
	finalTarget.setFromMatrixPosition(object.matrixWorld);
	finalTarget.y -= 0.35 * d.fetchDistToChildPlane(); //target at the center

	var ratioView = 0.8;
	var dir = new THREE.Vector3(1, ratioView, 0); //default
	if (d.parent) {
		// var parentWorldPos = new THREE.Vector3().setFromMatrixPosition(d.parent.iconObject.matrixWorld);
		var parentWorldPos = camera.position.clone();
		dir = parentWorldPos.sub(finalTarget);
		// dir.negate();
		dir.y = ratioView * Math.sqrt(dir.x * dir.x + dir.z * dir.z);
	}

	//right angle
	var finalPos = new THREE.Vector3();
	finalPos.x = finalTarget.x + dir.x;
	finalPos.y = finalTarget.y + dir.y;
	finalPos.z = finalTarget.z + dir.z;

	//right zoom
	var dist = 6 * d.scale;
	finalPos = WebExplorerUtility.MathUtility.fetchPosAtDistance(finalTarget, finalPos, dist);

	// Tween
	controls.enabled = false;
	var zoomTween = new TWEEN.Tween(camera.position)
		.to(finalPos, 599).onComplete(
			function() {

			})
		.start();

	// backup original rotation
	var startRotation = camera.quaternion.clone();

	// final rotation (with lookAt)
	var oldPos = camera.position.clone();
	camera.position.copy(finalPos);
	camera.lookAt(finalTarget);
	var endRotation = camera.quaternion.clone();

	// revert to original rotation
	camera.quaternion.copy(startRotation);
	camera.position.copy(oldPos);

	var lookAtTween = new TWEEN.Tween(camera.quaternion)
		.to(endRotation, 600)
		.onComplete(function() {

			controls.target = finalTarget;
			controls.enabled = true;
			controls.update();
		})
		.start();
};

//x,y are in ratio into this view
ExplorerView.prototype.onPointerMove = function(mousePos, event) {
	if (this.fetchDivUnderMouse(mousePos)) {
		document.body.style.cursor = "pointer";
	} else {
		document.body.style.cursor = "auto";
	}
};

ExplorerView.prototype.onPointerDown = function(mousePos, event) {

	if (event.which === 3) {
		//right click
		if (this.currentDiv3D.parent) {
			this.setCurrentDiv3D(this.currentDiv3D.parent);
		}

	} else {

		this.divHovered = this.fetchDivUnderMouse(mousePos);

		//camera focus
		if (this.divHovered) {
			this.setCurrentDiv3D(this.divHovered);
		}
	}

};

// ExplorerView.prototype.onPointerUp = function(mousePos, event) {
// 	if (event.which === 3) {
// 		//previous
// 		if (this.currentDiv3D.parent) this.setCurrentDiv3D(this.currentDiv3D.parent);
// 	} else {
// 		this.divHovered = this.fetchDivUnderMouse(mousePos);
// 		if (this.divHovered) this.setCurrentDiv3D(this.divHovered);
// 	}
// }