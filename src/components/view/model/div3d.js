"use strict";

var idCount = 0;
var idMap = {};

function Div3D(html) {

	this.id = idCount;
	idMap[this.id] = this;
	idCount++;

	this.html = html;

	this._createIconMeshes();
	this._createSelectedMeshes();

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
const loader = new THREE.FontLoader();

Div3D.prototype._createSelectedMeshes = function() {
	this.selectedMeshes = [];

	var material = new THREE.MeshStandardMaterial({

		color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
		roughness: 0.5,
		metalness: 0,
		flatShading: true

	});

	//default meshes
	var geometry = new THREE.TorusGeometry(10, 3, 16, 100);
	var cicle = new THREE.Mesh(geometry, material);
	this.selectedMeshes.push(cicle);
};

Div3D.prototype._createIconMeshes = function() {

	this.iconMeshes = [];
	var iconMeshes = this.iconMeshes;

	var material = new THREE.MeshStandardMaterial({

		color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
		roughness: 0.5,
		metalness: 0,
		flatShading: true

	});

	var html = this.html;

	// loader.load('./src/assets/fonts/helvetiker_regular.typeface.json', function(font) {



	// 	var textGeo = new THREE.TextGeometry("test", {
	// 		font: font,
	// 		size: 1,
	// 		height: 1,
	// 		curveSegments: 12,
	// 		bevelEnabled: true,
	// 		bevelThickness: 10,
	// 		bevelSize: 8,
	// 		bevelSegments: 5
	// 	});

	// 	// textGeo.computeBoundingBox();
	// 	// textGeo.computeVertexNormals();

	// 	var text = new THREE.Mesh(textGeo, material);
	// 	// iconMeshes.push(text);
	// });

	//default meshes
	var geometry = new THREE.BoxGeometry(1, 1, 1);
	var cube = new THREE.Mesh(geometry, material);
	this.iconMeshes.push(cube);
};