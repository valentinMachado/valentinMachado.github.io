# CLAUDE.md

Portfolio statique (GitHub Pages) : `index.html` + `style.css` à la racine, JS three.js bundlé par webpack dans `dist/`. Fonctionnement : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Mise en ligne : [docs/DEPLOY.md](docs/DEPLOY.md).

## Commandes

- `npm test` : Vitest + jsdom (inclut la comparaison du build avec `dist/bundle.js`)
- `npm run build` : bundle de prod dans `dist/`
- `npm run lint`, `npm run format` (Prettier sur src, tests, bin, index.html, style.css)
- `npm run dev` : serveur sur http://127.0.0.1:8000/, bundle de dev dans `dist-dev/`

## Règles

- Travailler sur `master` uniquement. Ne jamais pousser sans accord explicite.
- `dist/` est commité et servi tel quel par Pages : **`npm run build` avant chaque commit qui touche `src/`**, sinon `tests/build.test.js` échoue. Ne jamais copier `dist-dev/` dans `dist/`.
- Lancer `npm test` et `npm run lint` après chaque modification. Un commit par type de changement (Conventional Commits).
- Tout changement de comportement se vérifie aussi dans un vrai navigateur (voir plus bas).
- Demander avant tout fix risqué ou ambigu.

## Pièges

- Un même id de projet (ex. `galeri3`) relie 5 endroits : `detailStepIds`, `<id>_step`, `<id>_item`, `<id>_preview_content`, `assets/img/carousel/<carousel>/<id>.png`. Voir « Ajouter un projet » dans ARCHITECTURE.md.
- L'ordre de `globalParameters.steps` fixe le sens des transitions.
- Les ids et classes HTML/CSS sont en snake_case (partagés avec les ids de steps) ; le JS est en camelCase.
- `.gitattributes` impose LF : le bundle doit rester identique à l'octet.
- `npm install -D x` prend la dernière majeure : fixer la majeure actuelle (express 4, cross-env 7, webpack-cli 5).
- jsdom ne joue pas les animations CSS : les tests appellent `el.onanimationend()` à la main. WebGL n'existe pas sous jsdom : `Background3D` n'est testé qu'au navigateur.
- Ne pas commiter `window.DEBUG_3D = true`.

## Vérification navigateur

puppeteer-core n'est pas une dépendance du projet : l'installer hors du dépôt (avec express 4 pour servir la racine en statique). Chrome : `C:/Program Files/Google/Chrome/Application/chrome.exe`, options `--use-angle=swiftshader --enable-unsafe-swiftshader`. Scénario : chargement, molette, carrousel, page de détail, retour, menu, clavier, swipe, console sans erreur ; `--disable-3d-apis` pour le fallback sans WebGL.
