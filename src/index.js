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
		"label": "Studies",
		"urlId": "studies",
		"modelId": "thinker",
		"child": [{
			"label": "High School",
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
			"html": "<a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://www.cpe.fr\">CPE</a> (Lyon, Rhône, FRANCE)<br>2012-2014 <ul><li>1ère année : filière ETI (Electronique, Télécommunication, Informatique)</li><li>2ème année : spécialisation Informatique</li><li>3ème année : Queen's University (Canada, voir fichier)</li></ul> <iframe class=\"urlDiv\" scrolling = \"yes\" frameborder=\"no\" allow=\"autoplay\" src=\"https://www.cpe.fr\">"
		}, {
			"label": "Queen's University",
			"urlId": "queens_university",
			"type": "html3d",
			"child": [],
			"html": "<a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://www.queensu.ca/\">Queen's University</a> (Kingston, Ontario, CANADA)<br>2014-2015 <ul><li>Artificial Intelligence</li><li>Algorithms</li><li>Fundamentals of Software Development</li><li>Game Design</li><li>Advanced User Interface Design</li></ul>"
		}],
		"type": "div3d"
	}, {
		"type": "div3d",
		"label": "Professional experience",
		"urlId": "professional_exp",
		"modelId": "computer",
		"child": [{
			"type": "html3d",
			"html": "J'ai travaillé chez IHMTEK dans le cadre d'un stage d'élève ingénieur<br><iframe class=\"urlDiv\" scrolling = \"yes\" frameborder=\"no\" allow=\"autoplay\" src=\"https://www.ihmtek.com/\">",
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
			"html":"<a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://www.wanadev.fr/\">Wanadev</a> (Lyon, Rhône, FRANCE) <br>2016-2018  <ul> <li>Stage : tralali</li><li> CDI: tralali</li></ul><iframe class=\"urlDiv\" scrolling = \"yes\" frameborder=\"no\" allow=\"autoplay\" src=\"https://www.wanadev.fr/\">",
			"label": "Wanadev",
			"urlId": "wanadev",
			"child": [{
				"type": "html3d",
				"urlId": "popup_builder",
				"label": "Popup Builder",
				"html": "<iframe src=\"https://www.popup-house.com/fr/my-popup/\" frameborder=\"0\" allow=\"autoplay; fullscreen\" allowfullscreen height=\"70%\"></iframe>",
				"child": []
			}, {
				"type": "div3d",
				"label": "R&D",
				"urlId": "wanadev_rd",
				"child": [{
					"type": "link",
					"label": "Internship",
					"url": "https://docs.google.com/presentation/d/e/2PACX-1vTo2-dyyrSwNW8yzhvimOaZyukHdWVXoGVgsnc4UovFDvVpIPU-E8vjGlnBfGjKnMEDHxP2ykJLSgWT/embed?start=false&loop=false&delayms=3000",
					"child": []
				}, {
					"type": "multi",
					"urlId": "some_video",
					"label": "Some video",
					"multiChild": [{
						"type": "video",
						"urlId": "debugger3d",
						"title": "Texture debugger made with BABYLON JS",
						"label": "Debugger",
						"path": "./src/assets/video/debugger3d.mp4",
						"width": 1280,
						"height": 642,
						"child": []
					}, {
						"type": "video",
						"urlId": "disktree",
						"title": "Disk tree made with BABYLON JS",
						"label": "Disk tree",
						"path": "./src/assets/video/disktree.mp4",
						"width": 1280,
						"height": 642,
						"child": []
					}, {
						"type": "video",
						"urlId": "gizmo",
						"title": "Gizmo made with BABYLON JS",
						"label": "Gizmo",
						"path": "./src/assets/video/gizmo.mp4",
						"width": 1280,
						"height": 642,
						"child": []
					}, {
						"type": "video",
						"urlId": "water_pp",
						"title": "Water post-process made with BABYLON JS",
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
		"label": "Personnal project",
		"urlId": "personnal_project",
		"child": [{
			"type": "div3d",
			"urlId": "programming",
			"label": "Programming",
			"modelId": "computer",
			"child": [{
					"type": "html3d",
					"label": "Souk",
					"urlId": "souk",
					"modelId": "diamond",
					"html": "souk is game developped in gamejam using godot engine (lien)lister parti capture ecran expliquer regle",
					"child": [{
						"type": "link",
						"label": "Play",
						"url": "./src/assets/build/souk/souk.html",
						"child": []
					}]
				}, {
					"type": "html3d",
					"label": "Le Demon",
					"urlId": "le_demon",
					"html": "Le Demon is a game made in a gamejam using Unity (mettre lien) lister les participants expliquer regle + capture ecran",
					"child": [{
						"type": "link",
						"urlId": "play_le_demon",
						"label": "Play",
						"url": "./src/assets/build/demon/index.html",
						"child": []
					}]
				}, {
					"type": "html3d",
					"label": "Walls",
					"urlId": "walls",
					"modelId": "wall",
					"html": "Walls is a game made for a school project. It has been developped in Java for Android platform. <br> <img src = \"./src/assets/img/walls.jpg\">",
					"child": [{
						"type": "video",
						"urlId": "walls_trailer",
						"label": "Trailer",
						"modelId": "computer",
						"path": "./src/assets/video/walls_trailer.mp4",
						"title": "Queen's University school project",
						"width": 640,
						"height": 352,
						"child": []
					}]
				}, {
					"type": "html3d",
					"label": "Dungeon Card",
					"urlId": "dungeon_card",
					"modelId": "chest",
					"html": "Dungeon card is a game made in a gamejam. It has been developped on GameMaker (mettre lien).",
					"child": [{
						"type": "video",
						"urlId": "dungeon_trailer",
						"title": "Project made with GameMaker",
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
			"label": "Music",
			"urlId": "music",
			"modelId": "speaker",
			"child": [{
				"type": "html3d",
				"label": "Steampong",
				"urlId": "steampong",
				"html": "<a rel=\"noopener noreferrer\"  target=\"_blank\" href = \"https://globalgamejam.org/2014/games/steam-pong\">Steampong</a> is a game made at the Global Game Jam 2014. The team was composed of only 3 people : a programmer, an artist and myself as a sound designer. We worked together on the game design. The whole content has been produced within a 48h period including full graphics, 3 music themes and the whole game code.The game received positive feedbacks from the audience. <img src = \"./src/assets/img/steampong.png\">",
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
					"label": "Music",
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
		"type": "html3d",
		"urlId": "cv",
		"label": "CV",
		"child": [],
		"html": "<embed src=\"./src/assets/pdf/CV.pdf\" width=\"100%\" height=\"100%\" />"
	}, {
		"type": "html3d",
		"label": "Credits",
		"urlId": "credits",
		"html": "<div>All the programmation of this portfolio has been realised by myself, I used <a href=\"https://threejs.org\" target=\"_blank\" title=\"THREE.js\">THREE.js</a> as 3D engine, and <a href=\"https://github.com/tweenjs/tween.js\" target=\"_blank\" title=\"TWEEN.js\">TWEEN.js</a> for the camera animation.</div><br> <div>Icons made by <a href=\"https://www.flaticon.com/authors/roundicons\" target=\"_blank\" title=\"Roundicons\">Roundicons</a> from <a href=\"https://www.flaticon.com/\" target=\"_blank\" title=\"Flaticon\">www.flaticon.com</a></div></br><div>All 3D models are from <a href=\"https://www.free3d.com/\" target=\"_blank\" title=\"Free3D\">www.free3d.com</a><\div> ",
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
				let beginMsg = "This is a work in progress experience, hover the i int the top right corner to know how to use the website :)"
				//alert(beginMsg)

				console.info("%c... ok!", "color:#0000FF;");
			})
	});

} catch (e) {
	console.error(e);
}