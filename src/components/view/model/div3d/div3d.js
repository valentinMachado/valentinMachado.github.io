"use strict";


var idCount = 1;
var idMap = {};

Div3D.maxDegree = 1;

function Div3D(json) {

	this.id = idCount;
	idMap[this.id] = this;
	idCount++;

	//html
	this.json = json;
	this.htmlElements = [];

	//div3d parent
	this.parent = null;

	//div3d child
	this.children = [];

	//meshes
	this.iconObject = null;
	this.selectedObject = null;
	this.labelObject = null

	//what degree into the tree
	this.degree = 1;
	this.scale = 0;

	//type
	this.type = "DIV3D";
}

Div3D.getDiv3dFromId = function(id) {
	return idMap[id];
}

Div3D.prototype.appendChild = function(d3D) {
	d3D.parent = this;
	this.children.push(d3D);
};

Div3D.prototype.removeHtmlEl = function() {
	var container = document.getElementById("selected-container");

	//container.style.display = "none";

	this.htmlElements.forEach((el) => {
		container.removeChild(el);
	});

	this.htmlElements.length = 0;
};

Div3D.prototype.addHtmlToSelectedView = function(el) {
	this.htmlElements.push(el);
	var container = document.getElementById("selected-container");
	container.appendChild(el);

	//enable container if one el is add
	//container.style.display = "block";
};

Div3D.prototype.isFolder = function() {
	return this.children.length;
};

Div3D.prototype.showIcon = function(show) {
	[this].concat(this.children).forEach(function(div) {
		div.iconObject.visible = show;
	});
};

Div3D.prototype.countDegree = function(d3D) {
	//count degree into tree
	var currentDiv = this;
	while (currentDiv.parent) {
		currentDiv = currentDiv.parent;
		this.degree++;
	}
	Div3D.maxDegree = Math.max(Div3D.maxDegree, this.degree);
};

Div3D.prototype.buildMeshes = function() {

	//compute scale
	this.scale = Div3D.maxDegree / this.degree;

	this._createIconObject();
	//common mesh decoration
	if (this.json.label) {
		var label = WebExplorerUtility.ModelUtility.buildLabelMesh(this.json.label,this.scale);

		//position
		var bb = new THREE.Box3();
		bb.setFromObject(label);

		//label.position.x -= bb.max.x * 0.5;
		label.position.y += (bb.max.y - bb.min.y) * 0.5;

		bb.setFromObject(this.iconObject)
		label.position.y += (bb.max.y - bb.min.y) * 0.6;

		this.labelObject = label

		this.iconObject.add(label);
	}

	if (this.isFolder()) {
		//folder
		this._createSelectedObjectFolder();
	} else {
		//file
		this._createSelectedObjectFile();
	}

	//register into parent
	if (this.parent) {

		//add iconobject to its iconobj
		this.iconObject.position.y = -this.fetchDistToChildPlane();
		var index = this.parent.children.indexOf(this);
		var angle = index * 2 * Math.PI / this.parent.children.length;
		var radius = 3 * this.scale;
		this.iconObject.position.x = radius * this.scale * Math.cos(angle);
		this.iconObject.position.z = radius * this.scale * Math.sin(angle);
		this.parent.iconObject.add(this.iconObject);

		//add its iconobj to its selected obj
		var clone = this.iconObject.clone();
		//random position on a sphere
		var random1 = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
		WebExplorerUtility.MathUtility.fetchPosAtDistance(
			this.parent.selectedObject.position,
			random1,
			this.fetchRadiusSelectedView());
		clone.position.copy(random1);
		//register its plane
		var random2 = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
		clone.userData.planeNormal = random2.cross(random1);
		clone.userData.speed = Math.random() * 0.5 + 1.5;
		clone.userData.radius = this.fetchRadiusSelectedView();
		//create a line
		var geometry = new THREE.Geometry();
		geometry.vertices.push(clone.position);
		geometry.vertices.push(this.parent.selectedObject.position);

		this.parent.selectedObject.add(new THREE.Line(geometry, WebExplorerUtility.MaterialUtility.lineMat));
		this.parent.selectedObject.add(clone);

		//clone register its div so in selectedview only deal with meshes
		clone.userData.divId = this.id;
	}

	//update
	this.iconObject.updateMatrixWorld(true)
};
Div3D.prototype.fetchRadiusSelectedView = function() {
	return 9 * this.scale;
};

Div3D.prototype.fetchDistToChildPlane = function() {
	return 7 * this.scale;
};

Div3D.prototype.initViewScene = function(viewScene) {
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

	scene.add(this.selectedObject);
};

//abstract method
Div3D.prototype._createSelectedObjectFolder = function() {

	this.selectedObject = this.iconObject.clone();
	this.selectedObject.position.x = 0;
	this.selectedObject.position.y = 0;
	this.selectedObject.position.z = 0;
};

Div3D.prototype._createSelectedObjectFile = function() {

	var material = new THREE.MeshStandardMaterial({
		color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
		roughness: 0.5,
		metalness: 0,
		flatShading: true
	});

	var geometry = new THREE.SphereGeometry(5 * Math.random() + 1, 32, 32);
	var cube = new THREE.Mesh(geometry, material);
	console.info(JSON.stringify(this.json) + " is an empty file")

	this.selectedObject = cube;
};

Div3D.prototype._createIconObject = function() {

	var size = 0.5 * this.scale;

	if (this.json.modelId) {
		this.iconObject = WebExplorerUtility.ModelUtility.create(this.json.modelId, size);
	} else {

		if (this.isFolder()) {
			this.iconObject = WebExplorerUtility.ModelUtility.create("cube", size);
		} else {
			this.iconObject = WebExplorerUtility.ModelUtility.create("sphere", size);
		}
	}
};

Div3D.prototype.tick = function() {};

Div3D.prototype.onDisable = function(viewScene) {
	this.removeHtmlEl();
};