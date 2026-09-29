# Déploiement

## Principe

Le site est servi par **GitHub Pages en mode « Deploy from a branch »** : branche `master`, dossier racine `/`. À chaque push sur `master`, le workflow automatique *pages build and deployment* (onglet **Actions**) publie le dépôt **tel quel**. Il n'y a ni build ni `npm install` côté GitHub.

Conséquence : le JavaScript servi est le fichier **`dist/bundle.js` commité**. Modifier `src/` sans reconstruire et commiter `dist/` ne change rien en ligne.

## Mettre en ligne

```sh
npm ci                # si les dépendances ont changé
npm run lint
npm run build         # régénère dist/ (production, minifié)
npm test              # échoue si dist/bundle.js ne correspond pas au build
git add -A
git commit -m "…"     # src/ et dist/ dans le même commit
git push origin master
```

Puis vérifier :

1. L'onglet **Actions** du dépôt : le run *pages build and deployment* du commit doit être vert (une à deux minutes).
2. Le site : <https://valentinmachado.github.io/> (vider le cache si besoin, Pages met en cache ~10 min).
3. Que le bundle en ligne est bien celui du commit :

   ```sh
   curl -s https://valentinmachado.github.io/dist/bundle.js | md5sum
   md5sum dist/bundle.js
   ```

Un commit qui ne touche que `index.html`, `style.css` ou `assets/` n'a pas besoin de build.

## Pièges

### Le bundle de dev

Le bundle de dev (non minifié, avec source maps) ne doit jamais partir en production. Historiquement, `npm run dev` l'écrivait dans `dist/bundle.js`, et un commit après une session de dev le publiait.

Aujourd'hui :

- `npm run dev` et `npm run build-dev` écrivent dans **`dist-dev/`** (ignoré par git) ; le serveur de dev le sert sous l'URL `/dist/`, donc `index.html` fonctionne sans modification.
- Seul `npm run build` écrit dans `dist/`.
- Le test `tests/build.test.js` refait un build de production et le compare octet par octet à `dist/bundle.js`. Il échoue si `dist/` est un bundle de dev, ou s'il n'a pas été reconstruit après une modification de `src/`.

Donc : **toujours lancer `npm run build` puis `npm test` avant de commiter une modification de `src/`**, et ne jamais copier `dist-dev/` dans `dist/`.

### Fins de ligne

`.gitattributes` impose LF. Sans lui, git sous Windows extrait `dist/bundle.js` en CRLF alors que webpack produit du LF, ce qui crée de faux diffs. Ne pas le retirer.

### Autres fichiers de `dist/`

- `three-inspect.bundle.js` : chunk chargé uniquement en mode debug (`window.DEBUG_3D = true` dans `src/index.js`). Il est commité mais jamais téléchargé par les visiteurs.
- `*.LICENSE.txt` : licences extraites par le minifieur.
- `output.clean` est activé : chaque build supprime les chunks obsolètes, pensez à commiter les suppressions (`git add -A`).

### Jekyll

En mode « Deploy from a branch », Pages passe le dépôt dans Jekyll, qui ignore les fichiers et dossiers commençant par `_`. Aucun n'est utilisé aujourd'hui. Si ça change, ajouter un fichier vide `.nojekyll` à la racine.

### Dependabot

Dependabot tente à chaque push une mise à jour de `svelte` (dépendance de `three-inspect`, outil de debug) et échoue, car `three-inspect` n'accepte pas de version corrigée. C'est sans impact sur le site : svelte ne se retrouve que dans le chunk de debug.

## Revenir en arrière

```sh
git revert <commit>
git push origin master
```

Le déploiement suivant remet l'ancienne version en ligne.
