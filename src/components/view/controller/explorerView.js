"use strict";

//component use to handle the exploration view (going throught the 3D DOM)

function ExplorerView(canvas) {

	this._super(canvas);

};
//just after constructor
WebExplorerUtility.JsUtility.makeHerit(ExplorerView, AbstractView);

ExplorerView.prototype.initialize = function() {

	var scene = this.viewScene.scene;

	var textureLoader = new THREE.TextureLoader();
	scene.background = textureLoader.load("./src/assets/space-bg.jpg");
};

ExplorerView.prototype.tick = function() {
	if (this.d) {
		this.displayDiv3D[this.d.id].forEach(function(m) {
			m.rotation.y += wE3D.dt;
		});
	}
};

ExplorerView.prototype.setCurrentDiv3D = function(div) {
	this.currentDiv3D = div;
	this.display(div);
	wE3D.controllers.selectedView.display(div);
};

ExplorerView.prototype.display = function(parent) {

	this.clearDisplayDiv3D();

	var scene = this.viewScene.scene;
	var displayDiv3D = this.displayDiv3D;

	//put the parent a the center and child around
	displayDiv3D[parent.id] = [];
	parent.iconMeshes.forEach(function(m) {

		m = m.clone();
		m.position.x = 0;
		m.position.y = 0;
		m.position.z = 0;

		displayDiv3D[parent.id].push(m);

		scene.add(m);
	});

	var radius = 3;
	for (var i = parent.children.length - 1; i >= 0; i--) {
		var c = parent.children[i];
		var angle = i * 2 * Math.PI / parent.children.length;

		displayDiv3D[c.id] = [];

		c.iconMeshes.forEach(function(m) {

			m = m.clone();
			m.position.x = radius * Math.cos(angle);
			m.position.z = radius * Math.sin(angle);

			displayDiv3D[c.id].push(m);

			scene.add(m);
		});
	}

};

ExplorerView.prototype.fetchDivUnderMouse = function(mousePos) {

	var minDist = Infinity;
	var divHovered = null;

	for (let id in this.displayDiv3D) {
		var meshes = this.displayDiv3D[id];

		for (var i = meshes.length - 1; i >= 0; i--) {
			var mesh = meshes[i];
			var intersect = this.intersect(mousePos, mesh);
			if (intersect.length) {
				for (var j = intersect.length - 1; j >= 0; j--) {
					var info = intersect[j];
					if (info.distance < minDist) {
						//intersect
						divHovered = Div3D.getDiv3dFromId(id);
					}
				}
			}
		}
	}



	return divHovered;
};


//x,y are in ratio into this view
ExplorerView.prototype.onPointerMove = function(mousePos, event) {
	this.d = this.fetchDivUnderMouse(mousePos);
};

ExplorerView.prototype.onPointerDown = function(mousePos, event) {
	this.d = this.fetchDivUnderMouse(mousePos);
	if (this.d) this.setCurrentDiv3D(this.d);
};

ExplorerView.prototype.onPointerUp = function(mousePos, event) {
	//previous
	if (event.which === 3 && this.currentDiv3D.parent) {
		this.setCurrentDiv3D(this.currentDiv3D.parent);
	}
}