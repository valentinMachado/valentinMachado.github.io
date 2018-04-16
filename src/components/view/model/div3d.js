"use strict";

function Div3D(html) {

	this.html = html;

	this._createIconMeshes();

	this.children = [];
}

Div3D.prototype.appendChild = function(d3D) {
	this.children.push(d3D);
};

//abstract method
Div3D.prototype._createIconMeshes = function() {

	this.iconMeshes = [];

	//default meshes
	var geometry = new THREE.BoxGeometry(1, 1, 1);
	var material = new THREE.MeshBasicMaterial({
		color: new THREE.Color(Math.random(), Math.random(), Math.random())
	});
	var cube = new THREE.Mesh(geometry, material);

	this.iconMeshes.push(cube);
};