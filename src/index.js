"use strict";

window.wE3D = new WebExplorer3D();

try {
	console.info("%cInitialize app ...", "color:#0000FF;");
	wE3D.initialize();
	console.info("%c... ok!", "color:#0000FF;");
} catch (e) {
	console.error(e);
}