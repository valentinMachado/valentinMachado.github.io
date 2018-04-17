"use strict";

var idCount = 0;
var idMap = {};

function Div3D(html) {

	this.id = idCount;
	idMap[this.id] = this;
	idCount++;

	this.html = html;

	this._createIconMeshes();

	this.parent = null;

	this.children = [];
}

Div3D.getDiv3dFromId = function(id) {
	return idMap[id];
}

Div3D.prototype.appendChild = function(d3D) {
	d3D.parent = this;
	this.children.push(d3D);
};

//abstract method
Div3D.prototype._createIconMeshes = function() {

	this.iconMeshes = [];

	//default meshes
	var geometry = new THREE.BoxGeometry(1, 1, 1);
	var material = new THREE.MeshStandardMaterial({

		color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
		roughness: 0.5,
		metalness: 0,
		flatShading: true

	});
	var cube = new THREE.Mesh(geometry, material);
	cube.castShadow = true;
	cube.receiveShadow = true;

	this.iconMeshes.push(cube);
};