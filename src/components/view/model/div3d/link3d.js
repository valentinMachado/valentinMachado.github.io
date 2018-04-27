"use strict";


function Link3D(html) {
	this._super(html);

	//override
	this.type = "Link3D";
}
WebExplorerUtility.JsUtility.makeHerit(Link3D, Div3D);

Link3D.prototype.initViewScene = function(viewScene) {

	var container = document.getElementById("selected-container");
	container.style.display = "block";

	//create iframe
	var iframe = document.createElement('iframe');
	iframe.setAttribute("scrolling", "yes");
	iframe.setAttribute("frameborder", "no");
	iframe.setAttribute("allow", "autoplay");
	iframe.src = this.html.href;
	container.appendChild(iframe);

	//silent console of iframe
	var iframeWindow = iframe.contentWindow;
	iframeWindow.console.log = function() { /* nop */ };
	iframeWindow.console.error = function() { /* nop */ };
	iframeWindow.console.warn = function() { /* nop */ };
	iframeWindow.console.info = function() { /* nop */ };

	var link = this.html;
	link.target = "_blank";
	link.innerHTML = "Open in a new tab";

	container.appendChild(this.html);

	this.htmlElements.push(link);
	this.htmlElements.push(iframe);
};

Link3D.prototype.onDisable = function(viewScene) {
	var container = document.getElementById("selected-container");
	container.style.display = "none";

	this.htmlElements.forEach((el) => {
		container.removeChild(el);
	});

	this.htmlElements.length = 0;
};


Link3D.prototype._createIconObject = function() {

	var material = new THREE.MeshStandardMaterial({

		color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
		roughness: 0.5,
		metalness: 0,
		flatShading: true

	});

	var size = 0.4 * this.scale;
	var geometry = new THREE.SphereGeometry(size, 32, 32);
	var cube = new THREE.Mesh(geometry, material);


	this.iconObject = cube;
};

Link3D.prototype._createSelectedObjectFile = function() {

	var material = new THREE.MeshStandardMaterial({

		color: new THREE.Color().setHSL(Math.random(), 1, 0.75),
		roughness: 0.5,
		metalness: 0,
		flatShading: true

	});

	var size = 0.4 * this.scale;
	var geometry = new THREE.SphereGeometry(size, 32, 32);
	var cube = new THREE.Mesh(geometry, material);


	this.selectedObject = cube;
};