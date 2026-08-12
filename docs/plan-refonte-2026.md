# Refonte Datakö 2026 — plan d'exécution et état d'avancement

> **Document de passation.** Il contient tout ce qu'il faut pour reprendre le chantier sans avoir
> suivi les échanges qui l'ont produit. À tenir à jour à chaque fin de phase.
>
> Voir aussi [`references-motion.md`](references-motion.md) — bibliothèque des références analysées,
> et [`styleguide.html`](styleguide.html) — le langage visuel validé au Jalon 1.

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
| **3 — Home statique** | composition définitive, **sans** M1 ni M2 | 🔶 en cours |
| **4 — Fleet** | page pilote + M3 (WhatsApp → cockpit) | ⬜ |
| **5 — Distribution** | page nouvelle, dépend du dataset de démo | ⬜ |
| **6 — Stations** | alignement + reprise des captures | ⬜ |
| **7 — Solutions / Prestations / Matching / Academy** | hub à 3 solutions · expertises branchées sur la chaîne · hero Matching à refaire | ⬜ |
| **8 — M1 puis M2** | prototypes isolés validés avant intégration | ⬜ |
| **9 — Passe finale** | responsive · a11y · perf (LCP/CLS) · reduced-motion · `i18n:check` | ⬜ |

### Chantier parallèle — non bloquant pour 0 à 4
**Dataset de démo** : organisation dédiée, données fictives mais réalistes pour Distribution et
Stations. Produit par Abdoulaye. Bloque uniquement la **finalisation des captures** Distribution et
Stations. Toutes les captures marketing en **thème sombre**.

---

## 5. Jalons de validation

| # | On montre | État |
|---|---|---|
| 1 | Styleguide — typo, couleurs, spacing, primitives | ✅ validé |
| 2 | Chrome global + pages legacy au niveau | ✅ montré |
| 3 | Home statique | 🔶 en cours |
| 4 | Fleet complète + M3 | ⬜ |
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
