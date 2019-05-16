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

	this.initHelpGUI();

	//create central button
	this.initBlocker();
	this.initCentralButton();

	//attach a vScene to a view
	this.viewLeft.setViewScene(wE3D.controllers.selectedView.viewScene);
	this.viewRight.setViewScene(wE3D.controllers.explorerView.viewScene);

	//handle orbit control
	window.addEventListener("pointerdown", function(event) {
		this.dragging = true;
		this.updateControls(event);
		this.controllerHovered.onPointerDown(this.fetchMousePosRatio(event), event);
	}.bind(this));
	window.ondblclick = function() {
		this.controllerHovered.onDoubleClick(this.fetchMousePosRatio(event), event);
	}.bind(this)
	window.addEventListener("pointermove", function(event) {
		if (!this.dragging) this.updateControls(event);

		this.controllerHovered.onPointerMove(this.fetchMousePosRatio(event), event); 

	}.bind(this));
	window.addEventListener("pointerup", function(event) {

		this.controllerHovered.onPointerUp(this.fetchMousePosRatio(event), event);

		this.dragging = false;
	}.bind(this));

};

MainView.prototype.initHelpGUI = function() {

	let countFromTop = 0

	let iconHelp = document.createElement("img")
	iconHelp.classList.add("right-button")
	iconHelp.src = "./src/assets/img/info.png"
	this.root.appendChild(iconHelp)

	let iconImage = document.createElement("img")
	iconImage.classList.add("help-img")
	iconImage.src = "./src/assets/img/tuto.jpeg"
	iconImage.style.transform = "scale(0)";
	this.root.appendChild(iconImage)

	iconHelp.onmouseenter = function() {
		console.log("enter help")
		iconImage.classList.remove("hide")
		iconImage.classList.add("display")
	}

	iconHelp.onmouseleave = function() {
		console.log("leave help")
		iconImage.classList.remove("display")
		iconImage.classList.add("hide")
	}
	iconHelp.style.top = wE3D.conf.minDim * countFromTop + "px"
	countFromTop++;

	//focus icon
	let focusIcon = document.createElement("img")
	focusIcon.classList.add("right-button")
	focusIcon.src = "./src/assets/img/home.png"
	this.root.appendChild(focusIcon)
	focusIcon.onclick = function(evt) {
		//reset
		let explorer = wE3D.controllers.explorerView
		explorer.setCurrentDiv3D(explorer.currentDiv3D)
	}
	focusIcon.style.top = wE3D.conf.minDim * countFromTop + "px"

	//home icon
	let homeIcon = document.createElement("img")
	homeIcon.classList.add("home-button")
	homeIcon.src = "./src/assets/img/home.png"
	this.root.appendChild(homeIcon)
	homeIcon.onclick = function(evt) {
		//reset
		wE3D.controllers.explorerView.setCurrentDiv3D(wE3D.divs3d)
	}
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

	window.addEventListener("pointermove", function(event) {
		if (draggingCentralBar) {
			var x = event.clientX / this.canvas.clientWidth;
			this.setRatio(x)
			var w = window.innerWidth;
			var h = window.innerHeight;
			this.onResize(w, h);
		}
	}.bind(this));
	window.addEventListener("pointerup", (event) => {
		draggingCentralBar = false;
		this.blocker.style.display = "none";
	});

	var leftButton = document.createElement("div");
	var rightButton = document.createElement("div");
	var buttonContainer = document.createElement("span");

	this.centralBar.appendChild(buttonContainer);
	buttonContainer.appendChild(rightButton);
	buttonContainer.appendChild(leftButton);

	rightButton.classList.add("centralBar-button");
	leftButton.classList.add("centralBar-button");

	rightButton.style.right = "0px";

	//cb
	rightButton.onclick = (event) => {
		this.setRatio(1)
		wE3D.onResize();
	};
	leftButton.onclick = (event) => {
		this.setRatio(0)
		wE3D.onResize();
	};
};
MainView.prototype.updateHtmlStyle = function(event) {
	var w = this.canvas.clientWidth;
	var h = this.canvas.clientHeight;
	this.centralBar.style.left = -this.centralBar.clientWidth / 2 + this.ratioBetweenViews * w + "px";

	var container = document.getElementById("selected-container");
	container.style.width = w * this.ratioBetweenViews + "px";
};

//to not control another view when controlling one (?)
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

MainView.prototype.setRatio = function(value) {
	var offset = 1.5 * wE3D.conf.minDim / document.body.clientWidth
	this.ratioBetweenViews = Math.max(Math.min(1 - offset, value), offset);
}