# Refonte Datakö 2026 — plan d'exécution et état d'avancement

> **Document de passation.** Il contient tout ce qu'il faut pour reprendre le chantier sans avoir
> suivi les échanges qui l'ont produit. À tenir à jour à chaque fin de phase.
>
> Voir aussi [`references-motion.md`](references-motion.md) — bibliothèque des références analysées,
> et [`styleguide.html`](styleguide.html) — le langage visuel validé au Jalon 1.

---

## ⚑ EN PRODUCTION depuis le 2026-08-12

La refonte est **en ligne** sur `xn--datak-nua.com`, via la PR #42 fusionnée dans `master`.
`feat/refonte-site-2026` a absorbé `master` en `-s ours` : l'ancien site a été intégralement
remplacé, rien n'en a été conservé.

**Ce que ça change pour la suite.** Le dépôt n'est plus un chantier : toute modification part
maintenant d'une branche courte issue de `origin/master`, avec une PR. **Ne plus partir de
`refonte/socle`** — elle porte l'histoire d'avant la réécriture des messages de commit, et la
fusionner ressusciterait 61 commits déjà retirés.

Contrôle passé en production le jour du déploiement : 13 pages testées en FR et EN, aucune image
cassée, bascule des captures fonctionnelle, `hero-datako.png` et `hero-canvas.js` bien absents.
Accueil à 333 Ko en 9 requêtes.

**Thème par défaut : sombre** (2026-08-13). Le site est parti en clair au déploiement, puis basculé
en sombre. Trois endroits portent ce choix et doivent rester d'accord : le script inline des 13
gabarits, `getTheme()` dans `js/main.js`, et le `src` statique des captures produit — qui doit
pointer la variante du thème par défaut, sinon chaque page télécharge la mauvaise avant de la
remplacer.

### Ce qui reste ouvert

| Sujet | Nature |
|---|---|
| **Mentions légales** — hébergeur non nommé, mentions d'immatriculation absentes | juridique, données d'entreprise |
| **`contact@datakö.com`** en caractères non-ASCII | à tester en conditions réelles : c'est le seul moyen de contact des pages légales |
| **Captures Fleet** clair et sombre : périodes différentes | basculer le thème change le tableau de bord, pas seulement son habillage |
| **Bande navy de Prestations** : les captures claires y jurent | la section reste sombre quel que soit le thème |
| **Deux CTA flottants** coexistent | WhatsApp et « Soumettre votre projet » |
| **M2 — récit au scroll** | jamais conçu ; critère retenu : les mêmes objets persistent et se réorganisent |

### Tranché — ne pas rouvrir

**Le halo bleu du hero Academy est conservé** (décision d'Abdoulaye, 2026-08-12). Le
`radial-gradient(circle at 48% 34%, rgba(58,122,254,.16), transparent 43%)` de
`.academy-hero::before` reste en place, superposé à la grille technique.

J'avais signalé qu'il appartenait à la famille des *glowing gradients* écartée au cadrage initial, et
proposé deux fois de le retirer. La réponse est non : il reste. Inutile de le resoulever à chaque
passage sur cette page.

**Le rideau du footer ne peut pas se jouer en mobile** — contrainte géométrique, pas réglage.

La mécanique dévoile un footer en `position: fixed` à travers une fenêtre de `clip-path`. Or le
footer mesure **912 px de haut pour un écran de 812 px**. Vérifié en forçant la mécanique desktop à
375 px : le haut du footer se pose à `-100px` et la première rangée de liens devient définitivement
inatteignable. Aucun réglage ne rattrape ça — il faudrait raccourcir le footer sous la hauteur
d'écran, donc toucher au contenu.

Mobile a reçu **son propre moment** à la place (2026-08-12) : le mot-géant monte de 14 % et se
révèle en entrant dans le champ, une seule fois. Même intention — un footer qui arrive plutôt qu'un
footer poussé — sans la contrainte de hauteur. L'observateur vit dans `js/main.js` et **non** dans
`page-motion.js` : le footer est sur les 34 pages, or `page-motion.js` est absent de trois d'entre
elles, dont l'accueil.

---

## 1. Où le travail se fait

| | |
|---|---|
| Branche tronc | `feat/refonte-site-2026` — cible de merge, jamais de travail direct en parallèle |
| Sous-branche courante | `refonte/socle` (worktree `datako-website-claude`) |
| Base | Descendante directe de `origin/master`, 0 commit à récupérer |

Un chantier = une sous-branche = un diff relisable au jalon. Merge dans `feat/refonte-site-2026`
après validation d'Abdoulaye. **Jamais sur `master`, aucun push ni déploiement sans validation
explicite.**

### Règles de coexistence (si plusieurs intervenants)

1. **`npm run i18n:build` régénère les 26 pages.** Deux personnes qui buildent en parallèle
   produisent deux jeux de 26 fichiers qui se recouvrent — conflit certain. Un seul build par
   sous-branche, en fin de chantier.
2. **Le HTML généré ne s'édite jamais à la main.** Toujours template + dictionnaire, puis build.
3. **En cas de conflit sur un fichier généré** : ne pas résoudre à la main. Prendre un côté,
   relancer `npm run i18n:build` puis `npm run i18n:check`. Le build fait autorité.
4. Un seul propriétaire par fichier à un instant donné. Séparation naturelle :
   `src/pages/*.html` (structure) vs `src/locales/**/*.json` (texte).

---

## 2. Architecture à connaître avant de toucher au code

- `src/pages/<route>.html` — template structurel, placeholders `{{t.N}}` / `{{a.N}}`
- `src/locales/<fr|en>/<route>.json` — **tableaux positionnels** `{ text: [], attributes: [] }`.
  Retirer une entrée décale tous les index suivants : il faut renuméroter template **et** dictionnaire.
- `src/partials/header.html` · `footer.html` — chrome partagé, espace de noms `{{pt.N}}` / `{{pa.N}}`,
  dictionnaire `src/locales/<locale>/_partials.json`
- Includes : `{{> header active="solutions" }}` · `{{> footer class="home-footer" }}`
- Les partials sont résolus **avant** le dictionnaire de page et **avant** la réécriture des chemins
  EN, pour que les liens partagés reçoivent `../` et le `routeMap`.

⚠️ **`npm run i18n:extract` est désactivé** tant que `src/partials/` existe : il reconstruit les
templates depuis le HTML généré et ré-inlinerait header et footer dans chaque route.

⚠️ **Versionner les feuilles CSS modifiées** (`?v=AAAAMMJJ-n`). Sans ça le navigateur sert l'ancienne
et les modifications semblent sans effet.

---

## 3. Décisions figées

### Chaîne narrative canonique
`Dispersée → Centralisée → Structurée → Lisible → Décidée`
(EN : `Scattered → Centralized → Structured → Readable → Decided`)

- Le hero home en utilise le sous-ensemble `Dispersée / Structurée / Décidée`.
- **Prestations ne raconte plus la chaîne** : chaque expertise s'y branche (Data Engineering agit sur
  02→03, Gouvernance sur 03, Analytics sur 04, Data Science sur 04→05, IA sur 05).
- Les libellés vivent **uniquement** dans les locales. `js/home-motion.js` ne contient aucune copie :
  il lit les libellés dans le DOM et la formulation dans `data-step-message`.

### Design system (validé Jalon 1, promu dans `css/main.css`)
- **Hiérarchie par la taille, pas la graisse.** Grands titres en **400**. Les 500/600 restent
  disponibles sur les petits éléments quand la lisibilité l'exige.
- **Familjen Grotesk conservée.** Trio Grotesk + IBM Plex Mono + Instrument Serif conservé — c'est un
  actif identitaire. L'italique serif est réservé aux moments clés, plus à chaque titre.
- `--color-bone: #ece6dd` (clair) / `#102a2f` (sombre) : respiration entre clair et navy.
  **Une bande par page, pas davantage.**
- Rythme vertical : `--sp-8: 64px` / `--sp-12: 96px` / `--sp-16: 128px`. Trois valeurs, pas douze.
- `cover-reveal` : primitive **opt-in**. H1 et moments structurants seulement. Les titres secondaires
  restent statiques — les zones calmes sont un choix.
- **Toute animation permanente doit avoir un bouton pause** avec libellé descriptif.

### Règle de composition (2026-08-12) — **un système commun, pas un template commun**

Mesuré sur les 10 heros du site : **6 pages partagent le squelette exact** — eyebrow, grand titre à
gauche, chapô, deux CTA, panneau rectangulaire à droite (index, solutions, fleet, distribution,
formations, matching). Et **l'accent serif italique est sur 8 H1 sur 10**, donc il ne signale plus rien.

Le design system fixe la **grammaire** — échelle typographique, couleurs, rythme, primitives. Il ne
doit pas fixer la **composition**. Chaque page garde la sienne, et les différences existantes se
renforcent au lieu de se lisser.

**Deux familles à rendre reconnaissables :**

| Famille | Pages | Registre |
|---|---|---|
| **Datakö corporate** | Prestations, Academy, Matching, Blog, Contact | éditorial : espace, composition, typographie. Peu ou pas d'interface |
| **Datakö produits** | Fleet, Distribution, Stations | produit visible : interface réelle, débordement du cadre, données, motion de démonstration |

La **Home fait le pont** entre les deux : elle raconte la transformation *et* montre les produits.

Ce qui doit rester différenciant, page par page, plutôt que d'être aligné : le récit animé de la Home,
les compteurs `03 / 01 / 03` de Solutions, l'entonnoir `47 → 6 → 2` de Matching, la bande bone du Blog,
la sobriété fonctionnelle de Contact.

⚠️ Conséquence sur une décision déjà prise : le `cover-reveal` a été étendu aux 3 H1 produit, ce qui
**renforce l'homogénéité**. À réexaminer — la primitive gagnerait à distinguer les familles plutôt qu'à
les unifier. Idem pour l'accent italique, à raréfier.

### Règle d'exactitude (2026-08-12) — s'applique à tout le site

**Dès qu'on touche à des concepts techniques, réglementaires ou métier : pas de formulation
spectaculaire au prix de l'exactitude.** Datakö doit donner l'impression que ceux qui ont construit le
site maîtrisent les sujets qu'ils vendent.

Cas d'école, et erreur commise puis corrigée : sur Prestations, un mapping *expertise → étapes de la
chaîne* avait été proposé (Data Engineering = 02–03, IA = 05…). **Rejeté.** La chaîne
`Dispersée → Centralisée → Structurée → Lisible → Décidée` est un **récit de transformation**, pas une
taxonomie des métiers de la Data. Assigner un segment exclusif à une discipline est réducteur et
immédiatement contestable par un praticien : le Data Engineering couvre aussi qualité, observabilité,
orchestration et serving ; l'IA peut intervenir partout dans la chaîne.

La règle qui en découle : **présenter chaque expertise par ce que Datakö réalise concrètement**, avec
des capacités associées, jamais par une classification normative de la discipline. Quelqu'un qui
travaille en Data Engineering, Data Science, BI ou IA doit pouvoir lire la page sans avoir envie de
débattre du classement.

### Discipline motion
Beaucoup de calme éditorial autour de **2 moments au niveau site + 1 patron produit** :

| Moment | Emplacement | Mécanique |
|---|---|---|
| **M1 — Convergence** | hero home | sources en spirale entrante vers le socle. Séquence unique, ~1,5 s |
| **M2 — Transformation** | récit home | 5 étapes pilotées au scroll — **mécanique non arrêtée, recherche ouverte** |
| **M3 — Démonstration produit** | patron, une instance par page produit | Fleet : WhatsApp → cockpit · Distribution : « Une saisie. Toute la réglementation. » · Stations : journée → clôture |

**Le H1 et les CTA sont lisibles immédiatement.** La mise en scène se joue à côté, jamais devant :
c'est une *ouverture*, pas une *intro*. Une seule fois par session.

**Pas de grosse librairie motion par réflexe.** CSS et JS natif d'abord. Précédent mesuré : ni
Databricks ni Palantir n'en charge une seule. Tout le JS du site pèse 52 Ko, GSAP + ScrollTrigger
en pèsent ~70 à eux seuls.

**Interdits constants** : particules, halos, réseaux de neurones, dégradés lumineux décoratifs,
mouvement perpétuel, effets futuristes déconnectés de la proposition.

### Architecture de l'offre
Trois solutions métier, sous la même promesse :

| Produit | Descripteur |
|---|---|
| Datakö **Fleet** | Transport & Logistique |
| Datakö **Distribution** | Distribution de carburant — de l'approvisionnement à la position État |
| Datakö **Stations** | Stations-service |

Techniquement Distribution vit dans l'app Fleet (plan « Marketeur »), mais **le site reflète les
solutions métier, pas l'architecture logicielle** — décision explicite d'Abdoulaye.

**Garde-fous de promesse :**
- Ne PAS faire de « la créance État dépasse la marge » une promesse générale. Promesse durable :
  *connaître précisément la performance économique et la position vis-à-vis de l'État*.
- Éviter « conformité rentable » ou toute formule laissant croire que Datakö **garantit
  juridiquement** la conformité. Rester sur « pilotage économique et réglementaire ».
- Éviter « État » comme terme générique quand une formulation plus claire existe. **Ne pas toucher
  aux termes métier** comme « Position État », qui relèvent de la réalité réglementaire du produit.
- **SONAP conservé en clair** dans les captures : c'est la preuve d'expertise sectorielle. En
  revanche clients, transporteurs, utilisateurs, téléphones et SGP sont à anonymiser.

---

## 4. Phases

| Phase | Contenu | État |
|---|---|---|
| **0 — Socle** | partials header/footer · lexique canonique · code mort · hygiène de marque | ✅ fait |
| **1 — Design system** | échelle typo · teinte bone · rythme · primitive cover-reveal · styleguide | ✅ fait (Jalon 1 validé) |
| **2 — Chrome global** | footer rideau + mot-géant · Blog/merci/légales au niveau 2026 | ✅ fait |
| **3 — Home statique** | composition définitive, **sans** M1 ni M2 | ✅ fait |
| **4 — Fleet** | page pilote + M3 (WhatsApp → cockpit) + caméra + mise en scène téléphone | ✅ fait |
| **5 — Distribution** | page créée, M3 « Une saisie. Toute la réglementation. » | ✅ fait |
| **6 — Stations** | cockpit reconstruit en DOM, plus aucun `0 GNF` | ✅ fait |
| **7 — Solutions / Matching** | hub à 3 solutions ✅ · hero Matching rempli ✅ | ✅ fait |
| **8 — M1 puis M2** | M1 en prototype isolé ✅ (`docs/m1-convergence.html`) · **M2 : mécanique toujours à concevoir** ⬜ |
| **9 — Passe finale** | graisses harmonisées ✅ · contraste fils d'Ariane ✅ · **perf LCP/CLS à mesurer** ⬜ |

> La phase 7 portait « Prestations : expertises à brancher sur la chaîne ». **Rayé le 2026-08-12** sur
> décision d'Abdoulaye : c'est le mapping expertise → étapes rejeté par la règle d'exactitude (§ ci-dessus).
> Ne pas le ressusciter — la chaîne est un récit, pas une taxonomie des métiers.

### Chantier parallèle — non bloquant pour 0 à 4
**Dataset de démo** : organisation dédiée, données fictives mais réalistes pour Distribution et
Stations. Produit par Abdoulaye. Bloque uniquement la **finalisation des captures** Distribution et
Stations. Toutes les captures marketing en **thème sombre**.

---

## 5. Jalons de validation

> Les jalons ci-dessous ont été **dépassés par la mise en production du 2026-08-12** : la validation
> s'est faite en bloc sur la branche complète plutôt que jalon par jalon. Conservés pour mémoire.

| # | On montre | État |
|---|---|---|
| 1 | Styleguide — typo, couleurs, spacing, primitives | ✅ validé |
| 2 | Chrome global + pages legacy au niveau | ✅ montré |
| 3 | Home statique | ✅ en production |
| 4 | Fleet complète + M3 | ✅ en production |
| 5 | Distribution complète | ⬜ |
| 6 | M1 en prototype isolé | ⬜ |
| 7 | M2 en prototype isolé | ⬜ |
| 8 | Passe finale | ⬜ |

---

## 6. Reste à faire sur la Home statique (phase en cours)

- [x] H1 en graisse 400 + `--type-display` / `--tracking-display`
- [x] Collision `.data-source-d` × `.decision-card` corrigée (les deux étaient ancrées bas-droite)
- [x] **Ordre mobile du hero** — `display: contents` + `order`. ⚠️ Ordonner **tous** les enfants : un
      enfant sans `order` prend `order: 0` et remonte en tête (piège rencontré avec le lien diagnostic)
- [x] `cover-reveal` sur le H1 — variante `.reveal-block` obligatoire sur un titre multi-lignes,
      sinon `overflow: hidden` rogne tout après la première ligne. ⚠️ La home ne charge **pas**
      `page-motion.js` : l'observateur a dû être ajouté à `home-motion.js`
- [x] Une bande `--color-bone` sur `.home-essentials` — rythme clair → navy → bone → clôture
- [x] Versionnement des feuilles sur `index.html`
- [x] Produit qui déborde du cadre (Réf 04) — Fleet à droite, Stations à gauche, `overflow-x: clip`
      sur la section comme garde-fou
- [x] Stepper : trois états lisibles (contour / rempli sobre / rempli vif + halo)
- [x] Fin du récit : les quatre états traversés restent en trace à `opacity .08` derrière la décision
- [ ] Section produits : passer de 2 blocs alternés à **3 cartes égales** (Distribution arrive).
      ⚠️ Bloqué — ne pas créer de lien mort, la page Distribution n'existe pas encore
- [ ] **Capture Stations à reprendre** : `0 GNF` partout et thème clair sur un site sombre. Non
      retouchable — repeindre des chiffres dans une capture produit reviendrait à fabriquer des
      données. À reprendre en **thème sombre avec le dataset de démo**, ce qui règle les deux
      problèmes. Option intermédiaire proposée : panneau construit en DOM, comme les plaques du blog

## 6 bis. Où en sont les références

| Réf | Destination | État |
|---|---|---|
| 01 — cercles en orbite | Hero home (M1) | ✅ **prototype** `docs/m1-convergence.html` — orbite devenue spirale entrante, contre-rotation conservée, sphère de particules et logos rejetés. **Pas encore intégré à la home** |
| 02 — téléphone objet central | M3 Fleet | ✅ mécanique (WhatsApp → cockpit) **et** mise en scène (téléphone 460×700, incliné 6°, se redresse au survol). Main photoréaliste écartée |
| 03 — footer cinématique | Footer global | ✅ rideau `clip-path` + mot-géant. Marquee, aurora et badge écartés |
| 04 — caméra 3D | Heros produit | ✅ Fleet et Distribution — **sans zoom** : les captures pèsent 44 Ko, et au-delà de 2° les chiffres se déforment |
| 05/06 — Databricks / Palantir | Système | ✅ échelle typo (72/52/32, graisse 400), teinte bone, `cover-reveal`, produit qui déborde |

## 7. Dettes connues, non traitées

- **Deux CTA flottants** cohabitent (WhatsApp + « Soumettre votre projet ») et se superposent
  maintenant au footer révélé. À arbitrer.
- **Articles du blog datés de décembre 2025.**
- **Captures Stations à `0 GNF`** — bloqué par le dataset de démo.
- **Logos en PNG** (66–123 Ko) à passer en SVG ; images legacy lourdes non utilisées à purger
  (`hero-datako.png` 1,4 Mo, `logo_2.png` 899 Ko, `logo_old.png` 871 Ko).
- **Barres grises « PÉRIODE »** dans le récit : lues comme du contenu non chargé.
- **Hero en mode clair** : le visuel perd sa profondeur, le `+18%` vert manque de contraste.
- **Hero de Matching** : lit comme un wireframe non fini.
- **Redirection meta-refresh `academy.html`** conservée volontairement (alias hérité, liens entrants).
