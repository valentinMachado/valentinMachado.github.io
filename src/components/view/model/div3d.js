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
}

Div3D.getDiv3dFromId = function(id) {
	return idMap[id];
}

Div3D.prototype.appendChild = function(d3D) {
	d3D.parent = this;
	this.children.push(d3D);
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

	this._createIconObject();

	//register into parent
	if (this.parent) {
		this.iconObject.position.y = -2 * Div3D.maxDegree;
		var index = this.parent.children.indexOf(this);
		var angle = index * 2 * Math.PI / this.parent.children.length;

		var radius = 5;

		this.iconObject.position.x = radius * Div3D.maxDegree / this.degree * Math.cos(angle);
		this.iconObject.position.z = radius * Div3D.maxDegree / this.degree * Math.sin(angle);

		this.parent.iconObject.add(this.iconObject);
	}

	this._createSelectedObject();
};

// //abstract method
// const loader = new THREE.FontLoader();

Div3D.prototype._createSelectedObject = function() {

	var material = new THREE.MeshStandardMaterial({

		color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
		roughness: 0.5,
		metalness: 0,
		flatShading: true

	});

	//default meshes
	var geometry = new THREE.TorusGeometry(10, 3, 16, 100);
	var cicle = new THREE.Mesh(geometry, material);
	this.selectedObject = cicle;
};

Div3D.prototype._createIconObject = function() {

	var material = new THREE.MeshStandardMaterial({

		color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
		roughness: 0.5,
		metalness: 0,
		flatShading: true

	});

	//default meshes
	var size = 0.5 * Div3D.maxDegree / this.degree;
	var geometry = new THREE.BoxGeometry(size, size, size);
	var cube = new THREE.Mesh(geometry, material);

	// WebExplorerUtility.Div3dUtility.addToVertices(cube, new THREE.Vector3(0, 2, 0));

	this.iconObject = cube;
};