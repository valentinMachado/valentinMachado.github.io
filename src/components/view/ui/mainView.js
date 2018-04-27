"use strict";

function MainView() {

	//views of the application (init with half each)
	this.viewLeft = new Viewport("left");
	this.viewRight = new Viewport("right");

	//root of the ui
	this.root = document.getElementById("webExplorer3D");
	this.canvas = null;

	this.ratioBetweenViews = 0.5;

	this.dragging = false;

	this.controllerHovered = null;

	this.centralBar = null;

	//where is the mouse
	this.isOnRightView = true;
	this.mousePos = new THREE.Vector2();
};

MainView.prototype.initialize = function(canvas) {

	//init ui
	this.canvas = canvas;

	//append canvas to DOM
	this.root.appendChild(canvas);

	//create central button
	this.initBlocker();
	this.initCentralButton();

	//attach a vScene to a view
	this.viewLeft.setViewScene(wE3D.controllers.selectedView.viewScene);
	this.viewRight.setViewScene(wE3D.controllers.explorerView.viewScene);

	//handle orbit control
	this.canvas.addEventListener("pointerdown", function(event) {
		this.dragging = true;
		this.updateControls(event);

		this.controllerHovered.onPointerDown(this.fetchMousePosRatio(event), event);

	}.bind(this));
	this.canvas.addEventListener("pointermove", function(event) {
		if (!this.dragging) this.updateControls(event);

		this.controllerHovered.onPointerMove(this.fetchMousePosRatio(event), event); 

	}.bind(this));
	this.canvas.addEventListener("pointerup", function(event) {

		this.controllerHovered.onPointerUp(this.fetchMousePosRatio(event), event);

		this.dragging = false;
	}.bind(this));

};

MainView.prototype.initCentralButton = function(event) {

	this.centralBar = document.createElement("div");
	this.centralBar.id = "centralBar";
	this.root.appendChild(this.centralBar);

	var draggingCentralBar = false;
	this.centralBar.addEventListener("pointerdown", (event) => {
		draggingCentralBar = true;
		this.blocker.style.display = "block";
	});

	var container = document.getElementById("selected-container");

	window.addEventListener("pointermove", function(event) {
		if (draggingCentralBar) {
			var x = event.clientX / this.canvas.clientWidth;
			this.ratioBetweenViews = x;
			var w = window.innerWidth;
			var h = window.innerHeight;
			this.onResize(w, h);
		}
	}.bind(this));
	window.addEventListener("pointerup", (event) => {
		draggingCentralBar = false;
		this.blocker.style.display = "none";
	});
};
MainView.prototype.updateHtmlStyle = function(event) {
	var w = this.canvas.clientWidth;
	var h = this.canvas.clientHeight;
	this.centralBar.style.left = -this.centralBar.clientWidth / 2 + this.ratioBetweenViews * w + "px";

	var container = document.getElementById("selected-container");
	container.style.width = w * this.ratioBetweenViews + "px";
};

MainView.prototype.initBlocker = function() {
	var container = document.getElementById("selected-container");
	var blocker = document.createElement("div");
	container.appendChild(blocker);
	blocker.classList.add("blocker");
	blocker.style.display = "none";

	this.blocker = blocker;
};

MainView.prototype.fetchMousePosRatio = function(event) {
	var x = event.offsetX / this.canvas.clientWidth;
	var y = event.offsetY / this.canvas.clientHeight;

	//transform on x
	if (x > this.ratioBetweenViews) {
		x = Math.abs(x - this.ratioBetweenViews) / (1 - this.ratioBetweenViews);
		this.isOnRightView = true;
	} else {
		this.isOnRightView = false;
		x = x / this.ratioBetweenViews;
	}

	x = 2 * x - 1;
	y = 2 * y - 1;
	y *= -1;

	//update attr of the mouse
	this.mousePos.x = x;
	this.mousePos.y = y;

	return this.mousePos;
};

MainView.prototype.onResize = function(w, h) {
	this.viewLeft.onResize(0, h, 0, this.ratioBetweenViews * w);
	this.viewRight.onResize(0, h, this.ratioBetweenViews * w, w);
	this.updateHtmlStyle();
};

//x is ratio 0->1
MainView.prototype.updateControls = function(event) {

	var x = event.offsetX / this.canvas.clientWidth;
	var isOnRightView = false;
	this.controllerHovered = wE3D.controllers.selectedView;

	if (x > this.ratioBetweenViews) {
		isOnRightView = true;
		this.controllerHovered = wE3D.controllers.explorerView;
	}

	this.viewRight.viewScene.controls.enabled = isOnRightView;
	this.viewLeft.viewScene.controls.enabled = !isOnRightView;
};