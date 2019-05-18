"use strict";

//component use to see in detail the selected element

function SelectedView(elToListen) {

	this._super(elToListen);

	//override controls

	this.viewScene.controls.maxPolarAngle = Math.PI / 2
	this.viewScene.controls.update()

	this.currentDiv3D = null;

	this.exitButton = document.createElement("img")
	this.exitButton.classList.add("exit-button")
	this.exitButton.src = "./src/assets/img/cross.png"
	var container = document.getElementById("selected-container");
	container.appendChild(this.exitButton)
	this.exitButton.style.display = "none"
	//this.exitButton.style.position = "absolute"
	this.exitButton.onclick = function(evt) {
		if (this.currentDiv3D && this.currentDiv3D.parent) {
			this.setCurrentDiv3D(this.currentDiv3D.parent)
		}
	}.bind(this)
};

WebExplorerUtility.JsUtility.makeHerit(SelectedView, AbstractView);

SelectedView.prototype.initialize = function() {

	var scene = this.viewScene.scene;

	var textureLoader = new THREE.TextureLoader();
	scene.background = textureLoader.load("./src/assets/img/bg.jpeg");

	//this.setCurrentDiv3D(wE3D.divs3d);
	//WebExplorerUtility.DebugUtility.addCoordSystem(scene);
};

SelectedView.prototype.tick = function() {


	if (this.currentDiv3D) {

		if (this.currentDiv3D.isFolder()) {

			this.currentDiv3D.selectedObject.children.forEach(function(child) {

				if (child.userData.planeNormal) {
					var forwardVector = child.position.clone().cross(child.userData.planeNormal);
					forwardVector.setLength(child.userData.speed * wE3D.dt * 0.3 * this.currentDiv3D.scale);
					child.position.add(forwardVector);

					//security set length
					WebExplorerUtility.MathUtility.fetchPosAtDistance(
						new THREE.Vector3(),
						child.position,
						child.userData.radius);

				} else {
					//line
					child.geometry.verticesNeedUpdate = true;
				}

			}.bind(this));

		}

		this.currentDiv3D.tick(this.viewScene);

	}

	this.updateDivHovered();
};

SelectedView.prototype.setCurrentDiv3D = function(div) {

	if (this.currentDiv3D) this.currentDiv3D.onDisable(this.viewScene);

	//reset
	var scene = this.viewScene.scene;
	scene.children.length = 0;

	this.currentDiv3D = div;

	//div init scene
	div.initViewScene(this.viewScene);

	//adjust zoom camera
	this.adjustCameraZoom();

	//add ui to leave selected if its not a folder
	if (!div.isFolder()) {
		this.exitButton.style.display = ""
	} else {
		this.exitButton.style.display = "none"
	}

};
SelectedView.prototype.adjustCameraZoom = function() {

	var camera = this.viewScene.camera;
	var controls = this.viewScene.controls;
	controls.enabled = false;



	var finalPos = WebExplorerUtility.MathUtility.fetchPosAtDistance(
		new THREE.Vector3(),
		camera.position.clone(),
		15 * this.currentDiv3D.scale);

	var zoomTween = new TWEEN.Tween(camera.position)
		.to(finalPos, 600).onComplete(
			function() {
				controls.enabled = true;
				controls.update();
			})
		.start();

};

/*SelectedView.prototype.onPointerMove = function(mousePos, event) {
	if (this.fetchDivUnderMouse(mousePos)) {
		document.body.style.cursor = "pointer";
	} else {
		document.body.style.cursor = "auto";
	}
};*/

SelectedView.prototype.onPointerDown = function(mousePos, event) {

	var explorerController = wE3D.controllers.explorerView;

	if (event.which === 3) {

		//right click always trigger explorer view
		if (explorerController.currentDiv3D.parent) {
			explorerController.setCurrentDiv3D(explorerController.currentDiv3D.parent);
		}

	} else {

		var info = this.fetchDivUnderMouse(mousePos);
		this.divHovered = info.div;

		//camera focus
		if (this.divHovered) {
			var explorerController = wE3D.controllers.explorerView;
			explorerController.setCurrentDiv3D(this.divHovered);
			this.setCurrentDiv3D(this.divHovered)
		}
	}
};

SelectedView.prototype.fetchDivUnderMouse = function(mousePos) {

	var minDist = Infinity;
	var divHovered = null;
	var meshIntersected = null;

	this.currentDiv3D.selectedObject.children.forEach((child) => {

		if (!child.userData.divId) return;

		var intersect = this.intersect(mousePos, child);
		if (intersect.length) {
			for (var j = intersect.length - 1; j >= 0; j--) {
				var info = intersect[j];
				if (info.distance < minDist) {
					//intersect
					divHovered = Div3D.getDiv3dFromId(child.userData.divId);
					minDist = info.distance;
					meshIntersected = info.object;
				}
			}
		}
	});

	return {
		div: divHovered,
		mesh: meshIntersected
	};
};