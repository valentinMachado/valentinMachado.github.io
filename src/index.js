"use strict";

let structureJSON = {
	"label": "Valentin Machado",
	"child": [{
		"label": "Mon etudes",
		"child": [{
			"label": "lycée ph Lamour",
			"child": [{
				"type": "link",
				"label": "Site",
				"url": "https://www.lyc-lamour-nimes.ac-montpellier.fr/",
				"child": []
			}],
			"type": "div3d"
		}, {
			"label": "cpge daudet",
			"child": [],
			"type": "div3d"
		}, {
			"label": "cpe lyon",
			"child": [],
			"type": "div3d"
		}, {
			"label": "queens university",
			"child": [],
			"type": "div3d"
		}],
		"type": "div3d"
	}, {
		"type": "div3d",
		"label": "Experience pro",
		"child": [{
			"type": "div3d",
			"label": "IHMTEK",
			"child": [{
				"type": "link",
				"label": "site",
				"url": "http://www.ihmtek.com/",
				"child": []
			}]
		}, {
			"type": "div3d",
			"label": "Wanadev",
			"child": [{
				"type": "link",
				"label": "site",
				"url": "http://www.wanadev.fr/",
				"child": []
			}, {
				"type": "div3d",
				"label": "water simu",
				"child": [{
					"type": "video",
					"label": "demo video",
					"path": "./src/assets/video/water.mp4",
					"width": 480,
					"height": 480,
					"child": []
				}]
			}, {
				"type": "div3d",
				"label": "radiosity",
				"child": [{
					"type": "video",
					"label": "demo video",
					"path": "./src/assets/video/radiosity.mp4",
					"width": 1920,
					"height": 960,
					"child": []
				}]
			}]
		}]
	}, {
		"type": "div3d",
		"label": "projet perso",
		"child": [{
			"type": "div3d",
			"label": "programmation",
			"child": [

				{
					"type": "div3d",
					"label": "souk",
					"child": []
				}, {
					"type": "div3d",
					"label": "demon",
					"child": []
				}, {
					"type": "div3d",
					"label": "maze",
					"child": []
				}, {
					"type": "div3d",
					"label": "portfolio",
					"child": []
				}, {
					"type": "div3d",
					"label": "steampong",
					"child": []
				}, {
					"type": "div3d",
					"label": "dongeon dragon",
					"child": []
				}

			]
		}, {
			"type": "div3d",
			"label": "musique",
			"child": [{
				"type": "div3d",
				"label": "mcv",
				"child": [{
					"type": "div3d",
					"label": "site",
					"child": []
				}]
			}, {
				"type": "div3d",
				"label": "machette",
				"child": [{
					"type": "link",
					"label": "site",
					"url": "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/26062108&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
					"child": []
				}]
			}]
		}]
	}, {
		"type": "div3d",
		"label": "cv",
		"child": []
	}, {
		"type": "div3d",
		"label": "contact",
		"child": []
	}],
	"type": "div3d"
};

window.wE3D = new WebExplorer3D();

try {
	console.info("%cInitialize app ...", "color:#0000FF;");

	//add a loading screen
	var loadingHtml = WebExplorerUtility.HtmlUtility.createLoadingScreen()
	var wE3DHtml = document.getElementById("webExplorer3D")
	wE3DHtml.appendChild(loadingHtml);

	//wait image of the loading screen to be load to begin to load app
	loadingHtml.image.addEventListener('load', function() {

		wE3D.load()
			.then(function() {

				wE3D.initialize(structureJSON);

				//remove loading screen
				wE3DHtml.removeChild(loadingHtml)

				console.info("%c... ok!", "color:#0000FF;");
			})
	});

} catch (e) {
	console.error(e);
}