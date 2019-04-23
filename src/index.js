"use strict";

//load here to avoid async stuff
let structureJSON = {
	"label": "Valentin Machado",
	"child": [{
		"label": "Etudes",
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
		"child": [{
			"type": "div3d",
			"label": "IHMTEK",
			"child": [{
				"type": "link",
				"label": "site",
				"url": "https://www.ihmtek.com/",
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
				"type": "div3d",
				"label": "water simu",
				"child": [{
					"type": "video",
					"label": "demo video",
					"path": "./src/assets/video/water.mp4",
					"width": 480,
					"height": 480,
					"title": "radiosity",
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
		"label": "projet perso",
		"child": [{
			"type": "div3d",
			"label": "programmation",
			"child": [{
					"type": "div3d",
					"label": "souk",
					"child": [{
						"type": "link",
						"label": "play game !",
						"url": "./src/assets/build/souk/souk.html",
						"child": []
					}]
				}, {
					"type": "div3d",
					"label": "Steampong",
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
						"url": "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/21336300&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true",
						"child": []
					}]
				}, {
					"type": "div3d",
					"label": "demon",
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
					"type": "link",
					"label": "site",
					"url": "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/524173593&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true",
					"child": []
				}]
			}, {
				"type": "html3d",
				"label": "playlist",
				"html": "Je fais des playlist dispo <a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://vimeo.com/album/5527011\">ici</a>",
				"child": []
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