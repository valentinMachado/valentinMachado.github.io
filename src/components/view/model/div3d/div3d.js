"use strict";

function epsilon(value) {
	return Math.abs(value) < 1e-10 ? 0 : value;
}

function getObjectCSSMatrix(matrix3) {

	var elements = matrix3.elements;
	var matrix3d = 'matrix3d(' +
		epsilon(elements[0]) + ',' +
		epsilon(elements[1]) + ',' +
		0 + ',' +
		epsilon(elements[2]) + ',' +
		epsilon(elements[3]) + ',' +
		epsilon(elements[4]) + ',' +
		0 + ',' +
		epsilon(elements[5]) + ',' +
		0 + ',' +
		0 + ',' +
		1 + ',' +
		0 + ',' +
		epsilon(elements[6]) + ',' +
		epsilon(elements[7]) + ',' +
		0 + ',' +
		epsilon(elements[8]) +
		')';

	return matrix3d;
}

//composite of a Div3D
function Css3D(container, content, position, quaternion, scale) {

	this.container = container;

	this.position = position //vec3
	this.quaternion = quaternion //quaternion
	this.scale = scale //vec2

	this.points = this.computePoints()
	this.projectedPoints = [];

	this.html = document.createElement("div")
	this.html.classList.add("css3d")
	this.html.style.width = "100px";
	this.html.style.height = "100px";
	this.html.appendChild(content)

	//DEBUG
	// this.debugPoints = [
	// 	document.createElement("div"),
	// 	document.createElement("div"),
	// 	document.createElement("div"),
	// 	document.createElement("div")
	// ]
	// this.debugPoints.forEach(function(p) {
	// 	p.classList.add("debug")
	// 	this.container.appendChild(p)
	// }.bind(this));
	// this.debugPoints[0].style.background = "red";
	// this.debugPoints[1].style.background = "green";
	// this.debugPoints[2].style.background = "yellow";
	// this.debugPoints[3].style.background = "orange";
}

Css3D.prototype.computePoints = function() {

	let result = [];

	result.push(new THREE.Vector3(-this.scale.x * 0.5, this.scale.y * 0.5, 0))
	result.push(new THREE.Vector3(this.scale.x * 0.5, this.scale.y * 0.5, 0))
	result.push(new THREE.Vector3(this.scale.x * 0.5, -this.scale.y * 0.5, 0))
	result.push(new THREE.Vector3(-this.scale.x * 0.5, -this.scale.y * 0.5, 0))

	result.forEach(function(p) {
		p.applyQuaternion(this.quaternion)
		p.add(this.position)
	}.bind(this));

	let a = result[2].clone().sub(result[0])
	let b = result[1].clone().sub(result[0])
	this.planeNormal = a.cross(b).normalize()

	return result;
}

Css3D.prototype.getHalfSize = function() {
	return new THREE.Vector2(this.container.clientWidth * 0.5, this.container.clientHeight * 0.5);
}

Css3D.prototype.computeProjectedPoints = function(viewScene) {
	this.projectedPoints.length = 0;
	let size = this.getHalfSize()
	let dim = 25

	for (var i = 0; i < this.points.length; i++) {
		let point = this.points[i];
		let matrix = new THREE.Matrix4()
		matrix.makeTranslation(point.x, point.y, point.z)
		let projectedPoint = point.clone()
		projectedPoint.project(viewScene.camera);

		let pp = new THREE.Vector2((1 + projectedPoint.x) * size.x, (1 - projectedPoint.y) * size.y)
		this.projectedPoints.push(pp)

		//DEBUG
		// this.debugPoints[i].style.top = (this.projectedPoints[i].y - dim) + "px"
		// this.debugPoints[i].style.left = (this.projectedPoints[i].x - dim) + "px"
	}
}

Css3D.prototype.tick = function(viewScene) {

	//update visibility
	let planeNormal = this.planeNormal
	//apply transform TODO
	let ctrl = viewScene.controls
	let cam = viewScene.camera
	let eyeVector = ctrl.target.clone().sub(cam.position)
	if (planeNormal.dot(eyeVector) > 0) {

		//not visible
		this.html.style.display = "none"
		return;

	} else {
		this.html.style.display = "block"
	}

	this.computeProjectedPoints(viewScene)

	var matrix = this.computeMatrix()
	if (matrix) {
		var style = getObjectCSSMatrix(matrix);

		this.html.style.WebkitTransform = style;
		this.html.style.MozTransform = style;
		this.html.style.transform = style;
	}
}

//https://math.stackexchange.com/questions/296794/finding-the-transform-matrix-from-4-projected-points-with-javascript
Css3D.prototype.computeMatrix = function() {

	function solve(points) {

		if (points.length != 4) return null;

		let system = new THREE.Matrix3().set(
			points[0].x, points[1].x, points[2].x,
			points[0].y, points[1].y, points[2].y,
			1, 1, 1);

		//resolve
		system.getInverse(system)
		let solution = new THREE.Vector3(points[3].x, points[3].y, 1).applyMatrix3(system)

		return new THREE.Matrix3().set(
			solution.x * points[0].x, solution.y * points[1].x, solution.z * points[2].x,
			solution.x * points[0].y, solution.y * points[1].y, solution.z * points[2].y,
			solution.x, solution.y, solution.z)
	}



	// let p1 = new THREE.Vector2(0, 0)
	// let p2 = new THREE.Vector2(0, 100)
	// let p3 = new THREE.Vector2(100, 100)
	// let p4 = new THREE.Vector2(100, 0)

	// let A = solve([p1, p2, p3, p4])
	// if (!A) return null;

	let permu = []
	permu[0] = this.projectedPoints[0]
	permu[1] = this.projectedPoints[3]
	permu[2] = this.projectedPoints[2]
	permu[3] = this.projectedPoints[1]

	let B = solve(permu)
	if (!B) return null;

	//A.getInverse(A); //inverse A TODO compute A one time

	//precomputed A-1 for square of 1000*1000
	let A = new THREE.Matrix3().set(
		0, -0.01, 1, 0.01, -0.01, 0,
		0.01, 0, 0)

	let C = B.multiply(A)

	return C;
}

//DIV3D
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
	this.css3dElements = [];

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
		var label = WebExplorerUtility.ModelUtility.buildLabelMesh(this.json.label, this.scale);

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
		var clone;
		clone = this.iconObject.clone();

		WebExplorerUtility.Div3dUtility.placeOnOrbit(
			this.parent.selectedObject, clone, this.fetchRadiusSelectedView())

		//clone register its div so in selectedview only deal with meshes
		clone.userData.divId = this.id;
	}

	//update
	this.iconObject.updateMatrixWorld(true)
};

Div3D.prototype.buildCSS3D = function() {
	//abstarct
}

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

	//add html css 3d
	if (!this.isFolder()) {


		let container = document.createElement("div")

		let homeIcon = document.createElement("img")
		homeIcon.classList.add("right-button")
		homeIcon.src = "./src/assets/img/home.png"
		homeIcon.onclick = function(evt) {
			wE3D.controllers.explorerView.setCurrentDiv3D(wE3D.divs3d)
		}
		container.appendChild(homeIcon)
		//container.innerHTML = "TEST"

		// //DEBUG
		// let size = 6
		// let css3d = new Css3D(
		// 	document.getElementById("selected-container"),
		// 	container,
		// 	new THREE.Vector3(10, 5, 0),
		// 	new THREE.Quaternion(),
		// 	new THREE.Vector2(size, size))

		// this.css3dElements.push(css3d)

		//this.addHtmlToSelectedView(css3d.html)
	} else {
		// this.children.forEach(function(child) {
		// 	if (child instanceof Video3D)  {
		// 		child.html.play()
		// 	}
		// });
	}

};

//abstract method
Div3D.prototype._createSelectedObjectFolder = function() {

	this.selectedObject = this.iconObject.clone();
	this.selectedObject.position.x = 0;
	this.selectedObject.position.y = 0;
	this.selectedObject.position.z = 0;
};

Div3D.prototype._createSelectedObjectFile = function() {
	// let size = 6
	// var geometry = new THREE.PlaneGeometry(size, size);
	// var material = new THREE.MeshBasicMaterial({
	// 	color: 0xffff00
	// });
	// var plane = new THREE.Mesh(geometry, material);
	// plane.position.x = 10
	// plane.position.y = 5

	// this.selectedObject = plane;
	//this.selectedObject = new THREE.Object3D();

	var geometry = new THREE.SphereGeometry(5 * Math.random() + 1, 32, 32);
	var cube = new THREE.Mesh(geometry, WebExplorerUtility.MaterialUtility.iconMat);
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

Div3D.prototype.tick = function(viewScene) {

	this.css3dElements.forEach(function(el) {
		el.tick(viewScene)
	});

	// this.children.forEach(function(child) {
	// 	if (!child.isFolder()) child.tick();
	// });

};

Div3D.prototype.onDisable = function(viewScene) {
	this.removeHtmlEl();
	this.children.forEach(function(child) {
		child.onDisable(viewScene)
	})
};