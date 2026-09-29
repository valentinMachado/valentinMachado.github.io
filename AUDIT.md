# Audit — valentinMachado.github.io

_Date : 2026-09-29 · Branche auditée : `dev` (b76448f) · Aucun fichier modifié pendant l'audit._

## Contexte

Portfolio statique servi par **GitHub Pages** : `index.html` + `style.css` à la racine, JS bundlé par webpack dans `dist/bundle.js` (commité, car Pages ne build pas). Fond 3D en three.js (`src/`), navigation par « steps » (molette ou boutons), deux carrousels (projets / créations perso). Serveur express local uniquement pour le dev (`bin/dev.js`).

~1 500 lignes de JS, 850 lignes de HTML, 480 lignes de CSS, 71 Mo d'assets. Aucun test, aucun linter.

**Vérifications faites** : lecture intégrale du code ; `npm ci` + `npm run build` dans une copie isolée (le bundle produit est **identique à l'octet près** au `dist/bundle.js` commité, donc le déployé correspond aux sources) ; `npm audit` ; scan des secrets sur tout l'historique git (toutes branches) ; recensement des gros fichiers de l'historique.

Les identifiants (C1, I3, M7…) servent à valider ou rejeter chaque point.

---

## 🔴 Critique

### C1 — `dev` n'a pas le contenu en production (risque d'écrasement)
`origin/master` contient 2 commits faits depuis l'interface GitHub (`96392db`, `dee5b6f` « Update index.html ») qui **ne sont pas dans `dev`** : le texte d'accueil (`index.html:35-37`) a été réécrit en ligne. Sans resynchronisation, le prochain merge `dev → master` produit un conflit, ou réintroduit l'ancien texte.
→ **À faire avant toute correction** : merger `origin/master` dans `dev`.

### C2 — Écran de chargement bloqué pour toujours en cas d'erreur
- `src/index.js:383` : `window.onload = main` ; `main` est async et **aucune erreur n'est rattrapée**.
- `src/Background3D.js:27` : `new WebGLRenderer()` lève une exception si WebGL est indisponible (vieux navigateur, GPU sur liste noire, certaines VM ou certains navigateurs durcis).
- `src/Background3D.js:218-219` : `Promise.all(promises).then(...)` sans `.catch` ; les `reject()` des lignes 140/179 ne remontent jamais.

Résultat : le visiteur reste bloqué sur « Chargement des ressources » sans rien voir, et **le contenu HTML du portfolio (qui n'a pas besoin de la 3D) est inaccessible**. Aujourd'hui aucun modèle ni texture n'est chargé (voir I8), donc seul le cas WebGL est réellement déclenchable.

### C3 — 55 Mo+ téléchargés au premier affichage
Tous les contenus des steps de détail sont dans le DOM dès le départ (`display:none` n'empêche pas le chargement) :
- 12 GIF (≈ 55 Mo au total, jusqu'à 7,9 Mo pour `covidjam.gif`) : `index.html:200, 280, 322, 333, 363, 379, 442, 660, 690, 704`.
- 11 iframes tierces chargées immédiatement (5 Vimeo, 5 YouTube, 1 Google Slides) : `index.html:220-262, 289, 397, 484, 502, 668, 790, 799`.
- `index.html:11` : script `player.vimeo.com/api/player.js` **bloquant et inutilisé** (aucune référence à `Vimeo` dans `src/`).
- Balises `<audio>` sans `preload="none"` (`valse.mp3` = 7,2 Mo) : `index.html:723-766`.
- Vignettes de carrousel en PNG trop lourdes : `about/covidjam.png` 3,6 Mo, `about/guitar.png` 2,2 Mo.

Sur mobile ou avec une connexion moyenne, c'est la cause n°1 de lenteur. Correctifs simples et sans changement visuel : `loading="lazy"` sur les `<img>`/`<iframe>`, `preload="none"` sur l'audio, retrait du script Vimeo, recompression des 2 PNG (WebP/JPEG).

---

## 🟠 Important

### Bugs

| ID | Fichier:ligne | Problème | Impact |
|---|---|---|---|
| I1 | `src/index.js:67-73` | `deltaY > 0 ? next : previous` : un événement molette **horizontal** (swipe trackpad, Shift+molette, `deltaY === 0`) déclenche `movePrevious`. | Navigation arrière involontaire sur trackpad. **Bug avéré.** |
| I2 | `src/StepDivController.js:71-86` et `src/index.js:194-203` | La promesse d'animation ne se résout que sur `animationend` ; `onerror` ne se déclenche jamais pour une animation CSS. Pas de gestion d'`animationcancel` ni de timeout. Si l'animation est annulée (élément masqué pendant la transition), `isMoving` reste à `true`. | **Probable**, rare : navigation ou carrousel figés jusqu'au rechargement. |
| I3 | `src/Background3D.js:295` | `then = now - (this.dt % 1000) / fps` : erreur de priorité, la formule attendue est `now - (this.dt % (1000 / fps))`. | Cadencement des frames faux (jitter). Peu visible. |
| I4 | `src/Background3D.js:83-86` | Écouteur `keyup` de debug **actif en production** : log de la scène et de la caméra à chaque touche. | Bruit console, fuite mémoire côté devtools. |
| I5 | `src/Background3D.js:279` | `console.log("ca lag pas mal")` dans la boucle de rendu. | Spam console sur les machines lentes. |
| I6 | `src/StepDivController.js:37` | `debugger;` laissé, suivi d'un déréférencement de `null` ligne 41. | Crash si aucune step visible (état incohérent). |
| I7 | `src/Background3D.js:135,174` | `xhr.loaded / xhr.total` : `total = 0` sans en-tête `Content-Length` donne `NaN %`. | Latent (aucun chargement actif aujourd'hui). |

### Poids du bundle / perf JS

- **I8 — `three-inspect` embarqué en production** : `src/Background3D.js:16` l'importe statiquement alors qu'il ne sert que si `DEBUG_3D` vaut `true`. Mesuré : **bundle 1,72 Mo → 609 Ko sans lui (−65 %)**. Il tire aussi `svelte`, qui a 6 CVE. Correctif : `import()` dynamique sous `if (DEBUG_3D)`.
- **I9** — 3 spotlights avec shadow map 4096×4096 (`src/globalParameters.js:287`) et `setPixelRatio(devicePixelRatio)` non plafonné (`src/Background3D.js:34`) : lourd sur les écrans HiDPI et les GPU intégrés, pour une scène de 6 cubes. Plafonner à `Math.min(dpr, 2)` et utiliser des shadow maps de 1024 suffirait.
- **I10** — `src/index.js:318` : deux `setInterval(…, 100)` permanents (un par carrousel), même quand l'onglet est en arrière-plan.

### Sécurité (surface faible : site statique, aucun input utilisateur, aucun backend en prod)

- **I11 — Serveur de dev** (`bin/dev.js:7,10`) : `express.static("./")` sert **toute la racine, y compris `.git/` et `node_modules/`**, et écoute sur toutes les interfaces (0.0.0.0:8000). Sur un réseau partagé, l'historique git est téléchargeable. Correctif : écouter sur `127.0.0.1` et refuser les dotfiles.
- **I12 — Dépendances vulnérables** : `npm audit` remonte 24 vulnérabilités (12 high). Toutes concernent la **chaîne de build/dev** (express, child-process-promise→cross-spawn, webpack, terser, postcss…) sauf `svelte` via `three-inspect`, qui finit dans le bundle (voir I8). Impact réel en prod : faible. `npm audit fix` sans `--force` en corrige une partie.
- **I13** — Aucune CSP ni SRI sur le script tiers (réglé si on retire le script Vimeo, C3). GitHub Pages ne permet pas d'en-têtes HTTP personnalisés ; seule une `<meta http-equiv="Content-Security-Policy">` est possible, ce qui est optionnel.
- `target="_blank"` sans `rel="noopener"` (`src/index.js:352-371`) : sans risque sur les navigateurs modernes (noopener implicite). Cosmétique.

### Outillage / dépendances

- **I14** — `package.json:7` : le script `reset` est cassé (`rd -r` n'est une syntaxe valide ni sous cmd ni sous PowerShell) et ne marche que sous Windows.
- **I15** — Dépendances **inutilisées** : `dotenv`, `uuid`, `css-loader`, `style-loader` (aucun `import` de CSS : `style.css` est chargé par `<link>`, la règle webpack `webpack.config.js:22-29` est morte). `child-process-promise` (vulnérable) remplaçable par `node:child_process`.
- **I16** — Mauvais classement : tout l'outillage (webpack, nodemon, express, cross-env…) est dans `dependencies` ; `three-inspect`, embarqué au runtime, est dans `devDependencies`. Seul `three` est une vraie dépendance runtime.
- **I17 — Piège de déploiement** : `npm run dev` écrit un bundle **de dev** (non minifié, avec `sourceMappingURL` vers un `.map` gitignoré) dans `dist/bundle.js`. Si on commite après une session de dev, c'est ce bundle qui part en prod. Rien ne l'empêche aujourd'hui.
- **I18** — `bin/dev.js:10-14` : Express 4 ne passe jamais d'`err` au callback de `listen` (un port occupé lève une exception non gérée) ; `bin/dev.js:17` : un build qui échoue produit une promesse rejetée non gérée.

### Historique git

- **I19** — Pack de **213 Mo** : `node_modules/` commité en 2018 (~27 000 fichiers), builds de jeux (`souk.pck` 47 Mo ×2, `.wasm` 20 Mo), textures `.tga`/`.psd` de 11 à 16 Mo, vidéos. Le clonage est lent. Le nettoyage (`git filter-repo`) implique de **réécrire l'historique et force-push master**. C'est une décision à prendre, je ne le ferai pas sans accord explicite.
- **I20** — Branches distantes obsolètes : `dependabot/npm_and_yarn/multi-9f37c16f8f` et `nanoid-3.3.8` sont basées sur un vieux master ; les merger **supprimerait tout le site** (diff : −4 038 lignes, tous les assets). Idem pour `galaxy-portfolio-back-up` (2019). À fermer ou supprimer.

---

## 🔐 Secrets

**Aucun secret trouvé**, ni dans le code actuel ni dans l'historique (toutes branches, 101+ commits).
- Motifs recherchés : clés API, tokens (GitHub, AWS, Google, OpenAI), mots de passe, URI de BDD, clés privées, fichiers `.env`/`.pem`/`.key`.
- Seules occurrences : exemples `process.env.CONSUMER_SECRET` dans des README de `node_modules` commités en 2018 (`684db20`). Ce sont des faux positifs.
- À savoir (informations publiques, pas des secrets) : l'e-mail perso est en clair dans `src/index.js:349` (`mailto:`), il peut être aspiré par des robots de spam ; les commits de 2018 portent l'adresse `vmachado@wanadev.fr`.

**Conséquence pour la phase 3** : il n'y a **rien à déplacer en variables d'environnement**. Le seul paramètre de config serait le port du serveur de dev (`8000`, `bin/dev.js:10`). Je propose `PORT` avec une valeur par défaut, plus un `.env.example` d'une ligne. `dotenv` n'est pas nécessaire.

## 📄 .gitignore

Actuel : `todo.txt`, `node_modules`, `*.vscode`, `*.vs`, `*.map`. Globalement suffisant pour ce projet. À ajouter : `.env` (préventif), `npm-debug.log*`, `.DS_Store`, `Thumbs.db`, `.idea/`. Il faut garder `dist/` versionné, puisque Pages sert le bundle commité (sauf si on passe à GitHub Actions, voir phase 5).

---

## 🟡 Cosmétique / qualité

### Code mort
- `src/AjaxTextureLoader.js` : fichier entier (utilisé seulement si `globalParameters.materials` est non vide, or il vaut `{}`). Il contient en plus 2 bugs latents : pas d'`onerror` sur l'image (l. 43) et `Object.assign({}, textureLoader, …)` perd les méthodes du prototype (l. 60).
- Chemin de chargement FBX complet (`src/Background3D.js:117-159, 229-251`) : `fbx.models` et `fbx.animations` sont vides, `createFromFBX` n'est jamais appelé. Avec lui disparaissent `resetClonedSkinnedMeshes` et `parallelTraverse` (`src/utils.js:43-78`) et l'asset `assets/fbx/blue_guy_model.fbx` (2,4 Mo, jamais référencé).
- `src/utils.js:9-30` : `bounceOut`, `bounceIn`, `bounceInOut` inutilisés.
- `src/globalParameters.js` : `raycaster` (l. 61), `loopAction` (l. 63-94), `setWorldPosition`/`setWorldEuler` (l. 164-192), code commenté (l. 266-274), 8 imports inutilisés (l. 2, 4, 7, 9, 10, 12, 13, 16).
- `src/Background3D.js:408-419` : `computeMouseCoord` inutilisé ; variable `inspector` (l. 76) inutilisée.
- `src/globalParameters.js:485-487` : `selectProject3D` de « about » ne fait qu'un `console.log`.
- `index.html:15` : classe `opacity_transition` sans règle CSS ; `index.html:128, 590` : texte « should not be displayed ».
- `webpack.config.js:7-9` : sortie UMD `library: "portfolio"` inutile pour un script de page ; commentaires l. 22 et 31 obsolètes (« show_room », « game_browser_template »).

### Doublons
- `src/globalParameters.js:501-740` : **12 steps de détail strictement identiques** (mêmes coordonnées caméra copiées-collées, callbacks vides), soit ~240 lignes remplaçables par une boucle.
- `src/globalParameters.js:298-351` : 6 créations de mesh identiques à l'angle près ; même motif répété dans le `switch` l. 405-432.
- `src/index.js:348-368` : 4 handlers de liens sociaux quasi identiques (pourraient être de simples `<a>` dans le HTML).
- Helper « animer puis attendre `animationend` » dupliqué (`StepDivController.js:71` et `index.js:194`) ; `moveNext`/`movePrevious`/`moveToStep` dupliqués entre `Background3D` et `StepDivController`.

### Fonctions trop longues
`main` dans `src/index.js` (~375 lignes), `initializeCarousel` (~220 lignes), `Background3D.load` (~220 lignes).

### Nommage / cohérence
- Mélange snake_case et camelCase dans une même structure (`initial_id`, `duration_step_move` vs `nextStepId`).
- `globalParameters.js` contient surtout de la logique de scène, pas des paramètres.
- Paramètre `_this` passé explicitement alors que les callbacks sont déjà `bind`.
- Fautes : `ambienLight` (l. 254), keyframe CSS `lol` (`style.css:74`).
- `style.css:4-5` : `--color-one` et `--color-two` identiques (blanc) ; `style.css:93-110` : préfixes `-webkit-` obsolètes.
- `return Promise.resolve` au lieu de `Promise.resolve()` : sans effet réel dans une fonction `async`, mais trompeur (`Background3D.js:323, 373, 386, 400` ; `StepDivController.js:93, 111, 130`).
- `src/index.js:13-17` : regex user-agent de 2 Ko avec `substr` (déprécié) pour afficher un `alert()` bloquant sur mobile.

### Couplage implicite fragile
Un même identifiant (ex. `galeri3`) doit être cohérent à **5 endroits** sans aucune vérification : clé de step dans `globalParameters`, `divId` `galeri3_step`, `galeri3_item` et `galeri3_preview_content` dans le HTML, `case` du switch 3D, et chemin d'image `assets/img/carousel/projects/galeri3.png` construit en dur (`src/index.js:274-278`, avec un `TODO`). Une faute de frappe fait planter l'init (`src/index.js:270, 298` sur `undefined`). C'est la **cible prioritaire des tests** de la phase 2.

### HTML / accessibilité / contenu
- `<html>` sans `lang="fr"` ; aucune `meta description` ni balise Open Graph (aperçu vide quand le lien est partagé).
- Aucun `alt` sur les `<img>` ; iframes YouTube sans `title` (`index.html:502, 668, 790, 799`).
- Navigation non utilisable au clavier : boutons et items en `<div onclick>`, icônes en `<img onclick>`. Aucune navigation tactile (molette uniquement, plus les boutons).
- Coquilles dans le contenu : « disponnible » (387), « génére » (195), « aout » (55), « passioné » (520), « Musique assisté » (528), « asisté » (605), « suffisament » (687), « professionels » (747), « moi moi-même » (679-680), « doit aussi considéré » (779), « quatres musiques correspondantent » (785), « un Tetris ou les blocks » (576), « projets géospatial » (90).

---

## Ce qui manque

| Sujet | État | Proposition |
|---|---|---|
| Tests | Aucun | Vitest + jsdom (voir phase 2) |
| Linter / formatter | Aucun (le code semble formaté par Prettier dans l'éditeur, sans config) | ESLint (flat config) + Prettier avec config commitée |
| Gestion d'erreurs | Absente (C2) | Fallback sans 3D : masquer l'écran de chargement et afficher le contenu HTML |
| Logs | `console.log` de debug en prod | Supprimer (site statique : pas de télémétrie à ajouter) |
| Config via env | Sans objet (rien de secret) | `PORT` pour le serveur de dev uniquement |
| CI / déploiement | Build local puis commit de `dist/` | Option : GitHub Action qui build et déploie sur Pages (évite I17 et le commit de `dist/`) |
| SEO / partage | Rien | `meta description`, OG, `lang` |

---

## Proposition pour la phase 2 (tests)

Le cœur du code dépend de WebGL et de l'animation CSS ; je propose de tester ce qui casse réellement :
1. **Test d'intégrité du site** (le plus rentable) : chaque step a sa `div` dans `index.html`, chaque `next`/`previous` pointe vers une step existante, chaque item de carrousel a sa preview et sa step, chaque `src`/`url()` local référencé existe sur disque, et l'`index.html` charge bien `dist/bundle.js`.
2. **Unitaires** : `quadraticInOut` et autres helpers purs.
3. **`StepDivController`** sous jsdom (en simulant `animationend`) : navigation next/prev/moveToStep, verrou `isMoving`, cas limites.
4. **Smoke test du build** : `webpack` en production passe et produit un bundle sans `sourceMappingURL`.

`Background3D` (WebGL) ne sera pas testé unitairement ; ses corrections seront vérifiées manuellement dans le navigateur.

## Points sur lesquels j'ai besoin de ta décision

1. **C1** : je merge `origin/master` dans `dev` au début de la phase 3 ? (recommandé)
2. **I19** : nettoyer l'historique git (réécriture + force-push) ? Par défaut : **non**.
3. **I20** : supprimer les branches distantes dependabot et `galaxy-portfolio-back-up` ? Par défaut : non, je te laisse le faire.
4. **Coquilles du contenu** : je les corrige (texte visible) ou je n'y touche pas ?
5. **Déploiement** : garder le commit de `dist/` ou passer à une GitHub Action ?

### Décisions (2026-09-29)

1. **C1** : on travaille uniquement sur `master` (fast-forward sur `origin/master`, qui contenait déjà tout `dev`). Sur master, le texte d'accueil tient sur une ligne : **les numéros de ligne de `index.html` cités après la ligne 37 sont décalés de −2**.
2. **I19** : oui, en toute fin de chantier, après sauvegarde miroir du dépôt.
3. **I20** : fait. Branches dependabot et `galaxy-portfolio-back-up` supprimées du remote ; la dernière est conservée en tag local `backup/galaxy-portfolio-back-up`.
4. **Coquilles** : à corriger.
5. **Déploiement** : on continue de commiter `dist/`.

Constat de la phase 2 : sous Windows, git (`core.autocrlf`) extrait `dist/bundle.js` en CRLF alors que webpack produit du LF. Ce n'est pas bloquant, mais un `.gitattributes` fixant `eol=lf` éviterait les faux diffs (à faire en phase 3).

---

## Suivi des corrections (phase 3)

| Point | Statut | Commit |
|---|---|---|
| Fins de ligne CRLF/LF | ✅ `.gitattributes` `eol=lf` | `chore: enforce LF…` |
| C1 | ✅ travail sur `master` uniquement ; `dev` supprimée | — |
| C2 écran de chargement bloqué | ✅ fallback sans 3D, vérifié dans Chrome avec WebGL désactivé | `fix: keep the site usable…` |
| C3 poids initial | ✅ ~60 Mo → ~5 Mo (lazy-loading, `preload="none"`, script Vimeo retiré, 2 PNG recompressés) | `perf: cut initial page weight…` |
| I1 molette horizontale | ✅ + tests | `fix: ignore horizontal wheel…` |
| I2 transitions bloquées | ✅ `playAnimation` (end, cancel, timeout) + tests | `fix: never leave … locked` |
| I3 cadencement | ✅ | `fix: correct operator precedence…` |
| I4, I5, I6 restes de debug | ✅ | `chore: remove debug leftovers…` |
| I7 progression `NaN` | ⏳ code mort, supprimé en phase 4 | — |
| I8 three-inspect en prod | ✅ import dynamique : bundle 1,72 Mo → 765 Ko | `perf: keep three-inspect out…` |
| I9 pixel ratio | ✅ plafonné à 2 | idem |
| I9 shadow maps 4096² | ❓ en attente de décision (effet visuel possible) | — |
| I10 `setInterval` des carrousels | ⏳ phase 4 | — |
| I11, I17, I18 serveur de dev | ✅ 127.0.0.1, dotfiles refusés, erreurs gérées, bundle de dev dans `dist-dev/` | `fix(dev): harden…` |
| I12, I14, I15, I16 dépendances | ✅ 24 → 2 vulnérabilités (svelte, chunk de debug uniquement) | `build(deps): …` |
| I13 CSP | ➖ non fait (optionnel sur GitHub Pages) | — |
| I19 historique git | ⏳ en toute fin de chantier | — |
| I20 branches obsolètes | ✅ supprimées | — |
| Coquilles | ✅ | `fix(content): …` |
| `lang`, `alt`, titres d'iframes, meta description | ✅ + tests | `fix(a11y): …` |
| Navigation clavier et tactile | ❓ en attente de décision (refonte des `div` cliquables en `button`/`a`) | — |
