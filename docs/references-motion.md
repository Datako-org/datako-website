# Références motion & direction visuelle — refonte 2026

Bibliothèque de références analysées pour la refonte. **Ce sont des références de mécanique, pas
d'identité visuelle.** Règle constante : on reprend des déclencheurs, des courbes et des structures ;
on ne copie ni le graphisme, ni les assets, ni le code.

Rappel de la discipline validée : beaucoup de calme éditorial autour de **2 moments au niveau site**
(hero, récit) **+ 1 patron produit** instancié une fois par page produit.

---

## Réf 01 — Cercles en orbite + sphère de particules
**Source** : 21st.dev (`orbiting-circles-02`) · **Statut : à adapter** · **Destination : hero home (M1)**

**Mécanique.** Anneaux concentriques, pastilles en orbite, chaque pastille contre-tournant à la même
vitesse que son anneau pour rester droite. Masse centrale coupée par le bas du cadre.

| | |
|---|---|
| ✅ Reprendre | La **contre-rotation** (indispensable : nos sources sont des étiquettes de texte, pas des logos ronds) · les anneaux concentriques comme profondeur · la masse centrale coupée par le bas (effet d'échelle) |
| 🔧 Adapter | **L'orbite doit devenir une spirale entrante.** Une orbite est perpétuelle et ne converge jamais — elle contredit la promesse « dispersé → décidé ». Les sources partent des anneaux extérieurs et s'amarrent au socle. Séquence unique, pas de boucle |
| ❌ Rejeter | La sphère de particules (effet « IA générique ») · les logos en pastilles (cliché « nos intégrations », ferait passer Datakö pour un concurrent de Zapier) · le mouvement infini |

**Coût** : CSS pur (`@keyframes` + `rotate()`), aucune librairie.

**Note** : pour la matière centrale, l'actif existe déjà en interne — le **réseau de points sur la carte
de la Guinée** de l'écran de connexion Fleet Manager. Même densité visuelle qu'une sphère de particules,
mais signifiante.

---

## Réf 02 — Produit comme objet central / mise en scène smartphone
**Source** : landing Salse (Dribbble) · **Statut : intéressante, retenue** · **Destination : moment WhatsApp → Fleet (M3, page Fleet)**

**Ce qui est intéressant** : le produit traité comme **objet central, très grand, très propre, avec
beaucoup d'espace autour**. Pas de décor, pas de bruit.

**Mise en scène retenue (décidée par Abdoulaye) :**

> **À gauche** — « Le terrain parle. Datakö structure. » + courte explication : un conducteur ou un
> responsable répond simplement depuis WhatsApp.
>
> **À droite** — un smartphone incliné, mockup 3D très propre, flottant sur fond Datakö, avec la
> conversation qui se joue réellement : `Camion ?` → réponse · `Dépôt ?` → réponse ·
> `Destination ?` → réponse · `Quantité ?` → réponse
>
> **Puis au scroll** — le téléphone se décale, une capture du cockpit Fleet apparaît à côté. À chaque
> réponse WhatsApp, l'information correspondante apparaît dans le cockpit.
>
> Lecture obtenue : **WhatsApp → données structurées → cockpit mis à jour.**

| | |
|---|---|
| ✅ Reprendre | Produit en objet central, grand, isolé · beaucoup de vide autour · inclinaison légère du device |
| ❌ Rejeter | **La main photoréaliste** — bascule immédiatement en publicité fintech / app grand public, incohérent avec le reste du site |

### Contraintes techniques à respecter

1. **Le contenu de l'écran doit être du DOM, pas une image.** Raison décisive : le site est **bilingue
   FR/EN** et généré depuis `src/locales/`. Une capture raster d'une conversation en français **ne peut
   pas être traduite**. Le cadre du téléphone peut être une image/SVG ; l'écran doit être du HTML —
   ce qui le rend aussi net à tout zoom et animable message par message.
2. **Ne pas rétrécir le téléphone** à l'arrivée du cockpit : le texte de la conversation deviendrait
   illisible, alors que le pouvoir de la scène tient à ce qu'on **lise** l'échange. Préférer : le
   téléphone se décale, le cockpit entre par la droite.
3. **Risque d'enchaînement** : conversation jouée *puis* transition au scroll = deux séquences chaînées.
   Un visiteur qui scrolle vite rate la conversation. Soit la conversation est elle-même pilotée au
   scroll, soit elle est courte (3 échanges maximum).
4. **Mobile** : supprimer le cadre du téléphone. Un mockup de téléphone affiché sur un téléphone est
   redondant et gaspille la largeur. Conversation en pleine largeur, cockpit en dessous.

---

## Réf 03 — Footer cinématique
**Source** : 21st.dev (`motion-footer`) · **Statut : partiellement retenue** · **Destination : footer global**

| | |
|---|---|
| ✅ Reprendre | Le **« curtain reveal »** : footer en `position: fixed` pleine hauteur, découvert par le contenu qui remonte. CSS pur, aucun JS · le **mot-géant « DATAKÖ » en filigrane** (présence de marque, pas animation) · le retour en haut de page |
| 🔧 Adapter | Le magnétisme : **uniquement sur le CTA final**, facteur réduit (~0.15), sans bascule 3D, neutralisé en `prefers-reduced-motion`. Jamais sur les liens utilitaires (un lien « Mentions légales » qui se dérobe sous le curseur est hostile) · hauteur en `dvh`, pas `vh` |
| ❌ Rejeter | Le **marquee de slogans** en boucle (remplissage, réflexe SaaS générique) · l'**aurora glow qui respire** (interdit posé dès le premier brief) · le badge « Crafted with ❤ » (emoji-icône + signature d'agence) · **GSAP** : ~70 Ko pour un parallax, un stagger et un hover — tout le JS du site pèse 52 Ko |

**Statut dans la discipline** : structurel, **pas un 4ᵉ grand moment**. Budget « micro-interactions »,
à condition de rester sobre : curtain + mot-géant + CTA, rien qui boucle.

**Prérequis** : unifier le footer d'abord. `blog.html`, `merci.html`, `mentions-legales.html` et
`politique-confidentialite.html` embarquent encore l'ancien footer 2025.

---

## Réf 04 — Caméra 3D au-dessus d'un dashboard
**Source** : Dribbble (dashboard Sleena) · **Statut : à adapter, sous condition** · **Destination : hero des 3 pages produit**

**Mécanique.** Une caméra virtuelle se déplace au-dessus d'une interface unique : perspective inclinée,
panoramique, zoom sur un détail, retour au plan large. Des infobulles apparaissent quand la caméra
s'approche. CSS pur (`perspective` + transforms 3D).

**⚠️ Risque principal** : c'est la mécanique la plus **générique** des quatre (Linear, Vercel, Framer,
toute startup SaaS). Telle quelle, elle banalise Datakö.

**🔧 La condition qui la rend non générique** : la caméra ne bouge pas pour faire joli, elle bouge pour
**répondre à une question**. Sur la page Distribution, le trajet porte l'argument :

| Mouvement | Ce qu'on lit |
|---|---|
| Plan large | Le cockpit entier |
| Approche 1 | `Résultat opérationnel −4 100 000 GNF` — *l'activité paraît déficitaire* |
| Approche 2 | `Position État +15 184 400 GNF` |
| Recul | `Résultat économique +11 100 000 GNF` — *elle ne l'est pas* |

Personne ne peut copier ce trajet : il dépend de ce que le produit calcule.

**Contraintes** : inclinaison modeste, **remise à plat dès qu'un chiffre doit être lu** · résolution
(les captures actuelles font 44–48 Ko en WebP, un zoom ×3 les détruit → exports haute résolution ou
reconstruction en DOM/SVG) · **mobile** : pas de caméra, KPI recadrés et empilés.

**Réserve** : caméra en hero **plus** démonstration M3 sur la même page = deux dispositifs animés. Le
hero doit rester bref (un trajet court ou une simple parallaxe souris) et laisser M3 porter la
démonstration.

---

## Réf 05 & 06 — Databricks / Palantir
**Sources** : databricks.com · palantir.com · palantir.com/platforms/foundry/ (mesurés en direct, 2026-08-12)
**Nature : références de SYSTÈME et de COMPOSITION** — pas de mécanique motion.

> Distinction de méthode actée : **Databricks / Palantir = système & composition.**
> **21st.dev / Dribbble = mécanique motion.** On ne demande pas aux uns ce qui relève des autres.

### Typographie — mesures

| | Databricks | Palantir | Datakö aujourd'hui |
|---|---|---|---|
| Police | DM Sans (1 famille) | Alliance No.1 / No.2 (1 famille, 2 coupes) | 3 familles |
| H1 | 48px / **graisse 500** | 80–100px / **graisse 400** / `ls −2 à −3,4px` | ~64px / **graisse 700** |
| Sous-titres | — | 50px / 400 / `ls −1px` | — |
| Chapô | 20px / lh 28 | 34px / 400 / `ls −1,7px` | 18,6px |
| Corps | 16px | **18px** | 16–18px |
| Micro-labels | — | 10px / 400 / `ls +0,5px` | 11,5px mono |

**Constat central : aucun des deux n'utilise de gras.** Palantir est en graisse **400 partout**, du label
de 10px au titre de 100px. Databricks plafonne à 500. La hiérarchie vient de la **taille** et de
l'**espace**, jamais de la graisse. C'est ce qui produit la sensation institutionnelle.

### Décisions typo validées

- ✅ **Conserver Familjen Grotesk.** Alliance est une licence commerciale (Degarism), Apercu Mono Pro
  aussi. Aucune garantie de meilleur résultat.
- ✅ **Tester d'abord une hiérarchie beaucoup moins dépendante du gras** : passer les titres en 400,
  monter la taille, resserrer le tracking. Familjen Grotesk charge déjà 400→700, le test est gratuit.
- ✅ **Conserver le trio Grotesk + mono + serif italique.** C'est un actif identitaire : Databricks et
  Palantir sont volontairement neutres, Datakö a une voix. (Resserrer l'usage de l'italique, cf. audit.)

### Animation de texte — mécanique Palantir extraite

`@keyframes` relevés : `cover-reveal`, `side-cover-reveal`, `right-side-cover-reveal`,
`far-right-side-cover-reveal` — puis `flicker-temp`, `flicker-stay-on`, `gothamFlicker`, `glitch`,
`fadeInUp`, `shimmer`, `horizontalScrollingCardsTrack`.

- ✅ **Reprendre le `cover-reveal`** : ce n'est pas un fondu vers le haut mais un **cache qui balaie et
  découvre le texte**. Sobre, mécanique, précis — transposable à nos titres.
- ❌ **Rejeter le flicker / glitch** : signature liée à l'imaginaire défense-renseignement de Palantir.
  Chez Datakö ça sonnerait emprunté.

### Composition

- **Databricks** — le produit **déborde du cadre** : la capture du hero est coupée par le bord droit,
  jamais entièrement contenue. Suggère qu'il y a plus à voir. Le texte reste parfaitement lisible parce
  qu'il n'occupe que ~40 % de la largeur. ✅ **Principe retenu.**
- **Palantir** — composition **asymétrique** : titre monumental à gauche, descripteur en petit aligné à
  droite dans une colonne étroite, beaucoup de vide entre les deux. ✅ **À tester.**

### Alternance des sections & espacements — mesures

**Databricks** (6 121px) : `blanc → #0B2026 → crème #F9F7F4 → blanc → #0B2026 → #1B3139`
- Leur sombre `rgb(11,32,38)` est **quasi identique au nôtre** `rgb(7,31,39)` → palette déjà juste.
- Ils intercalent un **crème `#F9F7F4`** entre blanc et sombre : évite le contraste brutal.
  **Cette teinte intermédiaire nous manque.**
- Rythme vertical **codifié** : `padding 64px` sections courantes, `96px` sections importantes.

**Palantir** (7 200 / 12 231px) : gris clair `#EFEFEF` dominant, un seul basculement noir `#0D0E10`.
Sections immenses, respiration maximale, alternance rare.

✅ **Codifier l'alternance clair / teinte intermédiaire / sombre et les espacements.**

### Technique — le point qui tranche

**Aucun des deux sites ne charge de librairie de motion.** Ni GSAP, ni Lenis, ni Framer Motion, ni
Three.js. Vérifié sur les deux. Databricks fait tourner son site sur du CSS et du JS natif.

Et chez Databricks, **chaque animation en boucle a un bouton pause explicite**, avec libellés
descriptifs : `Pause decorative banner animation`, `Pause customer stories animation`.
✅ **Prévoir un contrôle pause pour toute animation permanente.**

---

## Synthèse — où va quoi

| Emplacement | Référence | Mécanique retenue |
|---|---|---|
| Hero home (M1) | Réf 01 | Spirale entrante + contre-rotation |
| Récit home (M2) | — | Scroll-driven, à construire (aucune référence retenue à ce jour) |
| Hero pages produit | Réf 04 | Caméra 3D à trajet narratif, brève |
| M3 — Fleet | Réf 02 | WhatsApp → cockpit |
| M3 — Distribution | — | « Une saisie. Toute la réglementation. » |
| M3 — Stations | — | Journée → clôture |
| Footer global | Réf 03 | Curtain reveal + mot-géant |

**Interdits transverses** (constants depuis le premier brief) : particules, halos, réseaux de neurones,
dégradés lumineux décoratifs, mouvement perpétuel, effets futuristes déconnectés de la proposition.

---

## Principes validés (2026-08-12)

1. **Pas de grosse librairie motion par réflexe.** CSS et JS natif d'abord ; on n'introduit une
   dépendance que si une mécanique précise le justifie réellement. Précédent mesuré : ni Databricks ni
   Palantir n'en chargent une seule. Tout le JS actuel du site pèse 52 Ko — GSAP + ScrollTrigger en
   pèsent ~70 à eux seuls.
2. **Hiérarchie par la taille et l'espace, pas par la graisse.** À tester avant toute autre décision typo.
3. **Familjen Grotesk conservée**, trio Grotesk + mono + serif italique conservé.
4. **`cover-reveal` oui, flicker/glitch non.**
5. **Le produit déborde du cadre** plutôt qu'il ne soit sagement contenu.
6. **Compositions plus asymétriques, plus respirantes.**
7. **Alternance clair / teinte intermédiaire / sombre codifiée**, espacements systématiques (64 / 96).
8. **Toute animation permanente a un bouton pause** avec libellé descriptif.

---

## Chantier séparé — M2 · Transformation d'état (récit en 5 étapes)

**Statut : recherche ouverte, aucune référence retenue.**

Décision d'Abdoulaye : **ne pas forcer Databricks ou Palantir sur cette partie.** Ni l'un ni l'autre
n'anime une transformation d'état — Databricks *montre*, Palantir *déclare*. Aucun des deux ne
démontre une chaîne qui se transforme.

Si cette mécanique doit devenir **une signature Datakö**, elle doit être conçue spécifiquement pour
notre récit `Dispersée → Centralisée → Structurée → Lisible → Décidée`.

Ce qu'on cherche : des mécaniques où **les mêmes objets persistent et se réorganisent** — pas des
objets qui apparaissent et disparaissent. La continuité est le sujet.

Exigences déjà posées : chaque étape transforme réellement la scène précédente ; **l'état final doit
être le plus dense de la séquence** (aujourd'hui c'est l'écran le plus vide) ; le stepper doit
distinguer visiblement les étapes franchies.
