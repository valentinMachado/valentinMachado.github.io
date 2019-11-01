"use strict";

/*

TODO:
-traduire en anglais


*/


//load here to avoid async stuff
let structureJSON = {
	"urlId": "home",
	"label": "Valentin Machado",
	"modelId": "casa",
	"child": [{
		"label": "Etudes",
		"urlId": "studies",
		"modelId": "thinker",
		"child": [{
			"label": "Lycee",
			"child": [],
			"type": "html3d",
			"urlId": "highschool",
			"html": "<a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://www.lyc-lamour-nimes.ac-montpellier.fr/\">Lycée Phillipe Lamour</a> (Nîmes, Gard, FRANCE) <br>2006-2009  <ul> <li>Classe de Seconde : option Sciences</li><li> Bac scientifique, option mathématiques, mention Bien</li></ul>"
		}, {
			"label": "CPGE",
			"urlId": "cpge",
			"child": [],
			"type": "html3d",
			"html": "<a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://www.lyc-daudet-nimes.ac-montpellier.fr/content/cpge\">Lycée Alphonse Daudet</a> (Nîmes, Gard, FRANCE)<br>2009-2012  <ul><li>1ère année MPSI (Mathématiques Physique Sciences de l'Ingénieur)</li><li>2ème & 3ème (5/2) année MP (Mathématiques Physique)</li></ul>"
		}, {
			"label": "CPE Lyon",
			"child": [],
			"type": "html3d",
			"urlId": "cpe",
			"html": "<a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://www.cpe.fr\">CPE</a> (Lyon, Rhône, FRANCE)<br>2012-2014 <ul><li>1ère année : filière ETI (Electronique, Télécommunication, Informatique)</li><li>2ème année : spécialisation Informatique</li><li>3ème année : Queen's University (Canada, voir dossier)</li></ul> <iframe class=\"urlDiv\" scrolling = \"yes\" frameborder=\"no\" allow=\"autoplay\" src=\"https://www.cpe.fr\">"
		}, {
			"label": "Queen's University",
			"urlId": "queens_university",
			"type": "html3d",
			"child": [],
			"html": "<a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://www.queensu.ca/\">Queen's University</a> (Kingston, Ontario, CANADA)<br>2014-2015 <ul><li>Artificial Intelligence (Intelligence artificielle)</li><li>Algorithms (Algorithmique)</li><li>Fundamentals of Software Development (Bases de développement de logiciel)</li><li>Game Design</li><li>Advanced User Interface Design (Design d'interface utilisateur avancé)</li></ul>"
		}],
		"type": "div3d"
	}, {
		"type": "div3d",
		"label": "Experiences professionnelles",
		"urlId": "professional_exp",
		"modelId": "computer",
		"child": [{
			"type": "html3d",
			"html": "<a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://www.ihmtek.com/\">IHMTEK</a> (Vienne, Isère, FRANCE)<br>2015<br> J'ai travaillé chez IHMTEK dans le cadre d'un stage d'élève ingénieur : développement d’un moteur de jeux à destination de musée (Ludomuse) implémenté sous Cocos 2d-x (C++).<br><iframe class=\"urlDiv\" scrolling = \"yes\" frameborder=\"no\" allow=\"autoplay\" src=\"https://www.ihmtek.com/\">",
			"label": "IHMTEK",
			"urlId": "ihmtek",
			"child": [{
				"type": "link",
				"label": "Ludomuse",
				"urlId": "ludomuse",
				"url": "https://docs.google.com/presentation/d/e/2PACX-1vQBTJDzJ_ycIXlUt6RQOGRqZdib38s_Xn74M9MKl-cwDWc6RUDXhLwSf_OJYJjgIos1VSZI_spXbyEm/embed?start=false&loop=false&delayms=3000",
				"child": []
			}]
		}, {
			"type": "html3d",
			"html": "<a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://www.wanadev.fr/\">Wanadev</a> (Lyon, Rhône, FRANCE) <br>2016-2018  <ul> <li>PFE (Projet de Fin d'Etudes) : Recherche et développement d’algorithme d’illumination globale en WebGL.</li><li> CDI : <ul><li>Gestion de projets</li><li>Conception & implémentation d’applications WebGL</li><li>Contact client</li></ul></li></ul><iframe class=\"urlDiv\" scrolling = \"yes\" frameborder=\"no\" allow=\"autoplay\" src=\"https://www.wanadev.fr/\">",
			"label": "Wanadev",
			"urlId": "wanadev",
			"child": [{
				"type": "html3d",
				"urlId": "popup_builder",
				"label": "Popup Builder",
				"html": "CDI : <ul><li>Gestion de projets</li><li>Conception & implémentation d’applications WebGL</li><li>Contact client</li></ul> Au cours de mon expérience à Wanadev, j'ai eu l'occasion de travailler sur plusieurs projets. Le Popup Builder (cf. ci-dessous) a cependant été celui sur lequel j'ai passé la majeure partie de mon temps. <br><br><iframe src=\"https://www.popup-house.com/fr/my-popup/\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen height=\"70%\"></iframe>",
				"child": []
			}, {
				"type": "div3d",
				"label": "R&D",
				"urlId": "wanadev_rd",
				"child": [{
					"type": "link",
					"label": "Illumination globale",
					"urlId": "radiosity",
					"url": "https://docs.google.com/presentation/d/e/2PACX-1vTo2-dyyrSwNW8yzhvimOaZyukHdWVXoGVgsnc4UovFDvVpIPU-E8vjGlnBfGjKnMEDHxP2ykJLSgWT/embed?start=false&loop=false&delayms=3000",
					"child": []
				}, {
					"type": "multi",
					"urlId": "some_video",
					"label": "Videos",
					"multiChild": [{
						"type": "video",
						"urlId": "debugger3d",
						"title": "Texture debugger BABYLON JS",
						"label": "Debugger",
						"path": "./src/assets/video/debugger3d.mp4",
						"width": 1280,
						"height": 642,
						"child": []
					}, {
						"type": "video",
						"urlId": "disktree",
						"title": "Disk tree BABYLON JS",
						"label": "Disk tree",
						"path": "./src/assets/video/disktree.mp4",
						"width": 1280,
						"height": 642,
						"child": []
					}, {
						"type": "video",
						"urlId": "gizmo",
						"title": "Gizmo BABYLON JS",
						"label": "Gizmo",
						"path": "./src/assets/video/gizmo.mp4",
						"width": 1280,
						"height": 642,
						"child": []
					}, {
						"type": "video",
						"urlId": "water_pp",
						"title": "Water post-process BABYLON JS",
						"label": "Water Post-process",
						"path": "./src/assets/video/water.mp4",
						"width": 480,
						"height": 480,
						"child": []
					}],
					"child": []
				}]
			}]
		}]
	}, {
		"type": "div3d",
		"label": "Projets personnels",
		"urlId": "personnal_project",
		"child": [{
			"type": "div3d",
			"urlId": "programming",
			"label": "Programmation",
			"modelId": "computer",
			"child": [{
					"type": "html3d",
					"label": "Souk",
					"urlId": "souk",
					"modelId": "diamond",
					"html": "Souk est un jeu réalisé dans le cadre d'une gamejam de 48h. Il a été développé sous le moteur de jeu Godot.",
					"child": [{
						"type": "link",
						"label": "Jouer a la version web",
						"urlId": "play_souk",
						"url": "./src/assets/build/souk/souk.html",
						"child": []
					}]
				}, {
					"type": "html3d",
					"label": "Le Demon",
					"urlId": "le_demon",
					"html": "Le Demon est un jeu réalisé dans le cadre d'une gamejam de 24h. Il a été développé sous le moteur de jeu Unity.",
					"child": [{
						"type": "link",
						"urlId": "play_le_demon",
						"label": "Jouer a la version web",
						"url": "./src/assets/build/demon/index.html",
						"child": []
					}]
				}, {
					"type": "html3d",
					"label": "Walls",
					"urlId": "walls",
					"modelId": "wall",
					"html": "Walls est un jeu réalisé dans le cadre d'un projet universitaire au Canada (Queen's University, voir dossier). Il a été développé en Java pour des plateformes Android. <br> <img src = \"./src/assets/img/walls.jpg\">",
					"child": [{
						"type": "video",
						"urlId": "walls_trailer",
						"label": "Trailer",
						"modelId": "computer",
						"path": "./src/assets/video/walls_trailer.mp4",
						"title": "Walls trailer",
						"width": 640,
						"height": 352,
						"child": []
					}]
				}, {
					"type": "html3d",
					"label": "Dungeon Card",
					"urlId": "dungeon_card",
					"modelId": "chest",
					"html": "Dungeon card est un jeu réalisé dans le cadre d'une gamejam de 48h. Il a été développé sous <a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://www.yoyogames.com/gamemaker\">GameMaker</a>.",
					"child": [{
						"type": "video",
						"urlId": "dungeon_trailer",
						"title": "Dungeon card trailer",
						"modelId": "computer",
						"label": "Trailer",
						"path": "./src/assets/video/dungeoncard_compressed.mp4",
						"width": 640,
						"height": 352,
						"child": []
					}]
				}

			]
		}, {
			"type": "div3d",
			"label": "Musique",
			"urlId": "music",
			"modelId": "speaker",
			"child": [{
				"type": "html3d",
				"label": "Steampong",
				"urlId": "steampong",
				"html": "<a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://globalgamejam.org/2014/games/steam-pong\">Steampong</a> est un jeu réalisé lors de la Global Game Jam 2014. L'équipe était composée de seulement trois personnes : un programmeur, un graphiste et moi-même en tant que sound designer. Tout le contenu a été produit en 48h incluant : tous les graphismes, trois musiques et le code du jeu. Celui-ci a reçu un retour très positif du jury. <img src = \"./src/assets/img/steampong.png\">",
				"modelId": "gear",
				"child": [{
					"type": "video",
					"label": "Trailer",
					"path": "./src/assets/video/ggj2014-steam-pong.mp4",
					"title": "Trailer SteamPong",
					"width": 1280,
					"height": 720,
					"child": []
				}, {
					"type": "link",
					"label": "Musique",
					"modelId": "radio",
					"url": "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/21336300&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true",
					"child": []
				}]
			}, {
				"type": "html3d",
				"label": "Ma Chandelle Verte",
				"urlId": "mcv",
				"modelId": "radio",
				"html": "Groupe de rock au lycée <br> <iframe class=\"urlDiv\" scrolling = \"yes\" frameborder=\"no\" allow=\"autoplay\" src=\"https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/524173593&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true\">",
				"child": []
			}, {
				"type": "html3d",
				"label": "Playlist",
				"urlId": "playlist_jailln_mache",
				"modelId": "radio",
				"html": "<img src = \"./src/assets/img/playlist.png\"> Les playlist du jailln et de la mache - Playlist on a particular theme or music genre. <a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://vimeo.com/album/5527011\"> website</a> <br> <iframe src=\"https://player.vimeo.com/video/343542945\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen class=\"html-video\"></iframe><iframe src=\"https://player.vimeo.com/video/342856045\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen class=\"html-video\"></iframe><iframe src=\"https://player.vimeo.com/video/330845878\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen class=\"html-video\"></iframe><iframe src=\"https://player.vimeo.com/video/315117555\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen class=\"html-video\"></iframe><iframe src=\"https://player.vimeo.com/video/307960107\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen class=\"html-video\"></iframe><iframe src=\"https://player.vimeo.com/video/303532748\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen class=\"html-video\"></iframe><iframe src=\"https://player.vimeo.com/video/298485745\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen class=\"html-video\"></iframe><iframe src=\"https://player.vimeo.com/video/299649347\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen class=\"html-video\"></iframe><iframe src=\"https://player.vimeo.com/video/298484622\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen class=\"html-video\"></iframe>",
				"child": []
			}, {
				"type": "html3d",
				"label": "Soundcloud",
				"urlId": "soundcloud",
				"modelId": "radio",
				"html": "Production musicale sous les logiciels Fruity loops & Ableton <br> <iframe class=\"urlDiv\" scrolling = \"yes\" frameborder=\"no\" allow=\"autoplay\" src=\"https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/26062108&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true\">",
				"child": []
			}]
		}]
	}, {
		"type": "div3d",
		"label": "CV",
		"urlId": "cv",
		"child": [{
			"type": "html3d",
			"urlId": "cv_french",
			"label": "Francais",
			"child": [],
			"html": "<embed src=\"./src/assets/pdf/CV_french.pdf\" width=\"100%\" height=\"100%\" />"
		}, {
			"type": "html3d",
			"urlId": "cv_english",
			"label": "English",
			"child": [],
			"html": "<embed src=\"./src/assets/pdf/CV_english.pdf\" width=\"100%\" height=\"100%\" />"
		}]
	}, {
		"type": "html3d",
		"label": "Credits",
		"urlId": "credits",
		"html": "<div>J'ai utilisé <a href=\"https://threejs.org\" target=\"_blank\" title=\"THREE.js\">THREE.js</a> comme moteur 3D et <a href=\"https://github.com/tweenjs/tween.js\" target=\"_blank\" title=\"TWEEN.js\">TWEEN.js</a> pour animer les mouvements de caméra.</div><br> <div>Les icônes ont été réalisées par <a href=\"https://www.flaticon.com/authors/roundicons\" target=\"_blank\" title=\"Roundicons\">Roundicons</a> de <a href=\"https://www.flaticon.com/\" target=\"_blank\" title=\"Flaticon\">www.flaticon.com</a>.</div></br><div>Tous les modèles 3D proviennent de <a href=\"https://www.free3d.com/\" target=\"_blank\" title=\"Free3D\">www.free3d.com</a>.<\div> ",
		"child": []
	}],
	"type": "div3d"
};

window.wE3D = new WebExplorer3D({
	minDim: 50,
	modelData: [{
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
				WebExplorerUtility.HtmlUtility.writeLoadingScreen("Models loading...")
				return WebExplorerUtility.ModelUtility.load();
			})
			.then(function() {
				WebExplorerUtility.HtmlUtility.writeLoadingScreen("Materials loading...")
				return WebExplorerUtility.MaterialUtility.load();
			})
			.then(function() {

				wE3D.initialize(structureJSON);

				//remove loading screen
				wE3DHtml.removeChild(loadingHtml)

				//add information popup
				//let beginMsg = "This is a work in progress experience, hover the i in the top right corner to know how to use the website :)"
				let beginMsg = "Portfolio expérimental en construction. Survolez le \"i\" dans le coin en haut à droite pour voir comment marche le site :)"
				alert(beginMsg)

				console.info("%c... ok!", "color:#0000FF;");
			})
	});

} catch (e) {
	console.error(e);
}