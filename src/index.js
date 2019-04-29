"use strict";

//load here to avoid async stuff
let structureJSON = {
	"label": "Valentin Machado",
	"modelId": "casa",
	"child": [{
		"label": "Etudes",
		"modelId": "thinker",
		"child": [{
			"label": "Lycee",
			"child": [],
			"type": "html3d",
			"html": "J'ai effectué mon lycée, à Nîmes au <a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://www.lyc-lamour-nimes.ac-montpellier.fr/\">lycée Phillipe Lamour</a>. J'ai choisi l'option science en seconde, et j'ai pris l'option spé maths en terminal parce que j'aime bien la science vous voyez"
		}, {
			"label": "Classe preparatoire",
			"child": [],
			"type": "html3d",
			"html": "Je me suis ensuite orienter en classe de MPSI parce les ciences patincoufin au lycée <a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://www.lyc-daudet-nimes.ac-montpellier.fr/content/cpge\">lycée Alphonse Daudet</a>"
		}, {
			"label": "cpe lyon",
			"child": [],
			"type": "link",
			"url": "https://www.cpe.fr/"
		}, {
			"label": "queens university",
			"child": [],
			"type": "div3d"
		}],
		"type": "div3d"
	}, {
		"type": "div3d",
		"label": "Experience pro",
		"modelId": "computer",
		"child": [{
			"type": "div3d",
			"label": "IHMTEK",
			"child": [{
				"type": "link",
				"label": "site",
				"url": "https://www.ihmtek.com/",
				"child": []
			}, {
				"type": "link",
				"label": "Ludomuse",
				"url": "https://docs.google.com/presentation/d/e/2PACX-1vQBTJDzJ_ycIXlUt6RQOGRqZdib38s_Xn74M9MKl-cwDWc6RUDXhLwSf_OJYJjgIos1VSZI_spXbyEm/embed?start=false&loop=false&delayms=3000",
				"child": []
			}]
		}, {
			"type": "div3d",
			"label": "Wanadev",
			"child": [{
				"type": "link",
				"label": "site",
				"url": "https://www.wanadev.fr/",
				"child": []
			}, {
				"type": "link",
				"label": "popup house",
				"url": "https://www.popup-house.com/fr/my-popup/",
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
					"title": "water post pro",
					"child": []
				}, {
					"type": "html3d",
					"label": "explication",
					"html": "<p>Ceci est un test de text</p><img src=\"./src/assets/img/loading.png\" ></img>",
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
		"label": "Projet personnel",
		"modelId":"barrel",
		"child": [{
			"type": "div3d",
			"label": "programmation",
			"modelId": "computer",
			"child": [{
					"type": "div3d",
					"label": "Souk",
					"modelId": "diamond",
					"child": [{
						"type": "link",
						"label": "Play it!",
						"url": "./src/assets/build/souk/souk.html",
						"child": []
					}]
				}, {
					"type": "div3d",
					"label": "Steampong",
					"modelId":"gear",
					"child": [{
						"type": "html3d",
						"label": "Context",
						"html": "<a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://globalgamejam.org/2014/games/steam-pong\">Steampong</a> is a game made at the Global Game Jam 2014. The team was composed of only 3 people : a programmer, an artist and myself as a sound designer. We worked together on the game design. The whole content has been produced within a 48h period including full graphics, 3 music themes and the whole game code.The game received positive feedbacks from the audience.",
						"child": []
					}, {
						"type": "video",
						"label": "Trailer",
						"path": "./src/assets/video/ggj2014-steam-pong.mp4",
						"title": "Trailer SteamPong",
						"width": 1280,
						"height": 720,
						"child": []
					}, {
						"type": "link",
						"label": "OST",
						"modelId": "radio",
						"url": "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/21336300&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true",
						"child": []
					}]
				}, {
					"type": "div3d",
					"label": "demon",
					"modelId": "pillar",
					"child": [{
						"type": "link",
						"label": "play game !",
						"url": "./src/assets/build/demon/index.html",
						"child": []
					}]
				}, {
					"type": "div3d",
					"label": "portfolio",
					"child": []
				}, {
					"type": "div3d",
					"label": "walls",
					"modelId": "wall",
					"child": []
				}, {
					"type": "div3d",
					"modelId": "chest",
					"label": "dongeon dragon",
					"child": []
				}

			]
		}, {
			"type": "div3d",
			"label": "musique",
			"modelId": "speaker",
			"child": [{
				"type": "link",
				"label": "Ma Chandelle Verte",
				"modelId": "radio",
				"url": "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/524173593&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true",
				"child": []
			}, {
				"type": "html3d",
				"label": "Playlist",
				"modelId": "radio",
				"html": "<img src = \"./src/assets/img/playlist.png\"> Les playlist du jailln et de la mache - Playlist on a particular theme or music genre. <a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://vimeo.com/album/5527011\"> website</a> <br> <iframe src=\"https://player.vimeo.com/video/330845878\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen></iframe><iframe src=\"https://player.vimeo.com/video/315117555\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen></iframe><iframe src=\"https://player.vimeo.com/video/307960107\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen></iframe><iframe src=\"https://player.vimeo.com/video/303532748\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen></iframe><iframe src=\"https://player.vimeo.com/video/298485745\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen></iframe><iframe src=\"https://player.vimeo.com/video/299649347\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen></iframe><iframe src=\"https://player.vimeo.com/video/298484622\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen></iframe>",
				"child": []
			}, {
				"type": "link",
				"label": "Soundcloud",
				"modelId": "radio",
				"url": "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/26062108&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true",
				"child": []
			}]
		}]
	}, {
		"type": "html3d",
		"label": "cv",
		"child": [],
		"html": "<embed src=\"./src/assets/pdf/CV.pdf\" width=\"100%\" height=\"100%\" />"
	}, {
		"type": "div3d",
		"label": "contact",
		"child": []
	}],
	"type": "div3d"
};

// let structureJSON = {
// 	"type": "div3d",
// 	"label": "Naïs Collet",
// 	"child": []
// }

window.wE3D = new WebExplorer3D({
	minDim: 50,
	modelData: [{
		id: "barrel",
		file: "barrel.obj"
	}, {
		id: "computer",
		file: "computer.obj"
	}, {
		id: "chest",
		file: "chest.obj"
	}, {
		id: "speaker",
		file: "speaker.obj"
	}, {
		id: "radio",
		file: "radio.obj"
	}, {
		id: "diamond",
		file: "diamond.obj"
	}, {
		id: "thinker",
		file: "thinker.obj"
	}, {
		id: "casa",
		file: "casa.obj"
	}, {
		id: "wall",
		file: "wall.obj"
	}, {
		id: "pillar",
		file: "pillar.obj"
	}, {
		id: "gear",
		file: "gear.obj"
	}]
});

try {
	console.info("%cInitialize app ...", "color:#0000FF;");

	//add a loading screen
	var loadingHtml = WebExplorerUtility.HtmlUtility.createLoadingScreen()
	var wE3DHtml = document.getElementById("webExplorer3D")
	wE3DHtml.appendChild(loadingHtml);

	//wait image of the loading screen to be load to begin to load app
	loadingHtml.image.addEventListener('load', function() {

		//load model 3d
		WebExplorerUtility.HtmlUtility.writeLoadingScreen("App loading...")
		wE3D.load()
			.then(function() {
				WebExplorerUtility.HtmlUtility.writeLoadingScreen("Model loading...")
				return WebExplorerUtility.ModelUtility.load();
			})
			.then(function() {
				WebExplorerUtility.HtmlUtility.writeLoadingScreen("Material loading...")
				return WebExplorerUtility.MaterialUtility.load();
			})
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