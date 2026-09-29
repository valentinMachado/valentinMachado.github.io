# Portfolio — Valentin Machado

Site personnel servi par GitHub Pages : **<https://valentinmachado.github.io/>**

Une page statique (`index.html` + `style.css`) avec un fond 3D en [three.js](https://threejs.org/). On navigue entre les sections (accueil, réalisations professionnelles, créations personnelles) à la molette, au clavier, par swipe ou via le menu. Chaque section de réalisations est un carrousel qui mène à une page de détail par projet.

## Prérequis

- Node.js **22.22+** ou **24.15+** (imposé par Vitest et jsdom)
- npm

## Installation

```sh
npm ci
```

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur local sur <http://127.0.0.1:8000/> ; rebuild du bundle de dev à chaque modification de `src/` |
| `npm run build` | Bundle de production dans `dist/` (**à commiter**, voir [DEPLOY](docs/DEPLOY.md)) |
| `npm test` | Tests Vitest + jsdom (dont : `dist/bundle.js` à jour) |
| `npm run test:watch` | Tests en mode watch |
| `npm run lint` | ESLint |
| `npm run format` / `format:check` | Prettier (écrit / vérifie) |
| `npm run reset` | Supprime `dist/`, `dist-dev/`, `node_modules/` et le lockfile, puis réinstalle |

Le port et l'hôte du serveur de dev se changent dans un fichier `.env` (voir `.env.example`).

## Structure

```
index.html          tout le contenu du site (sections, carrousels, pages de détail)
style.css           styles et animations CSS des transitions
src/                code JS, bundlé par webpack
  index.js          point d'entrée : branche la navigation, les carrousels, le fond 3D
  globalParameters.js  déclaration des steps (sections) et de la scène 3D
  Background3D.js   rendu three.js et déplacements de caméra
  StepDivController.js  transitions entre les sections HTML
  carousel.js       carrousels et en-têtes des pages de détail
  utils.js          fonctions pures (easing, direction molette/clavier/swipe…)
dist/               bundle de production, commité (servi tel quel par GitHub Pages)
assets/             images, GIF, audio
tests/              tests Vitest
bin/dev.js          serveur de dev (express)
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : fonctionnement du code, et comment ajouter un projet
- [docs/DEPLOY.md](docs/DEPLOY.md) : mise en ligne et pièges du bundle commité
- [AUDIT.md](AUDIT.md) : audit de 2026 et suivi du nettoyage
