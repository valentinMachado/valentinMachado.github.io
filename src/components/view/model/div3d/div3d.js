"use strict";


var idCount = 0;
var idMap = {};

Div3D.maxDegree = 1;

function Div3D(html) {

	this.id = idCount;
	idMap[this.id] = this;
	idCount++;

	//html
	this.html = html;

	//div3d parent
	this.parent = null;

	//div3d child
	this.children = [];

	//meshes
	this.iconObject = null;
	this.selectedObject = null;

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

Div3D.prototype.addToVertices = function(object, vector) {

	object.geometry.vertices.forEach(function(v) {
		v.add(vector);
	});
	object.geometry.verticesNeedUpdate = true;
};

Div3D.prototype.buildMeshes = function() {

	//compute scale
	this.scale = Div3D.maxDegree / this.degree;

	this._createIconObject();

	//register into parent
	if (this.parent) {

		//add iconobject to its iconobj
		this.iconObject.position.y = -this.fetchDistToChildPlane();
		var index = this.parent.children.indexOf(this);
		var angle = index * 2 * Math.PI / this.parent.children.length;
		var radius = 3;
		this.iconObject.position.x = radius * this.scale * Math.cos(angle);
		this.iconObject.position.z = radius * this.scale * Math.sin(angle);
		this.parent.iconObject.add(this.iconObject);

		//add its iconobj to its selected obj
		var clone = this.iconObject.clone();
		this.parent.selectedObject.add(clone);
		//random position on a sphere
		var random1 = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
		WebExplorerUtility.MathUtility.fetchPosAtDistance(
			this.parent.selectedObject.position,
			random1,
			9 * this.scale);
		clone.position.copy(random1);
		//register its plane
		var random2 = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
		clone.userData.planeNormal = random2.cross(random1);
		clone.userData.speed = Math.random() * 0.5 + 1.5;
		//create a line
		var geometry = new THREE.Geometry();
		geometry.vertices.push(clone.position);
		geometry.vertices.push(this.parent.selectedObject.position);
		const pathLineMaterial = new THREE.LineBasicMaterial({
			color: "#0000FF",
			linewidth: 1
		});
		this.parent.selectedObject.add(new THREE.Line(geometry, pathLineMaterial));
	}


	if (this.isFolder()) {
		//folder
		this._createSelectedObjectFolder();
	} else {
		//file
		this._createSelectedObjectFile();
	}
};

Div3D.prototype.fetchDistToChildPlane = function() {
	return 7 * this.scale;
};

Div3D.prototype.initViewScene = function(viewScene) {
	var scene = viewScene.scene;
	viewScene.initSceneDefault();
	scene.add(this.selectedObject);
};

// //abstract method
// const loader = new THREE.FontLoader();
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


	this.selectedObject = cube;
};
Div3D.prototype._createIconObject = function() {

	var material = new THREE.MeshStandardMaterial({

		color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
		roughness: 0.5,
		metalness: 0,
		flatShading: true

	});

	//default meshes
	var size = 0.5 * this.scale;
	var geometry = new THREE.BoxGeometry(size, size, size);
	var cube = new THREE.Mesh(geometry, material);


	this.iconObject = cube;
};