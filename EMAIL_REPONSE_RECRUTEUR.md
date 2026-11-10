# 📬 Email de Rendu du Test Technique — MyBestSim

**À :** Etienne <contact@mybestsim.com>  
**De :** Mouaffak Chouaibi <mouaffakch21@gmail.com>  
**Objet :** Rendu test pratique — Développeur IA & Automatisation — Mouaffak Chouaibi  

---

Bonjour Étienne,

Un grand merci pour ce test technique passionnant ! J'ai pris énormément de plaisir à concevoir une solution complète, rigoureuse et directement alignée avec la réalité opérationnelle et business de MyBestSim.

Conformément à vos consignes, les deux livrables ont été déployés de manière indépendante en ligne :

---

### 🌐 1. Les Liens des Livrables en Ligne

- **Livrable 1 — Dashboard Analytique & Pipeline de Données :**  
  👉 **`https://mybestsim-dashboard-mouaffak.netlify.app/`**  
  *(Ingestion vectorisée des 5 056 offres, 6 KPIs officiels, 6 graphiques Chart.js avec mise en évidence des effets de structure, explorateur interactif et export CSV).*

- **Livrable 2 — Article SEO « Internet en croisière : quelle eSIM choisir ? » :**  
  👉 **`https://mybestsim-article-mouaffak.netlify.app/`**  
  *(Article de fond de 3 164 mots, comparatif haute mer vs escales, 4 suggestions d'images éditoriales avec prompts, simulateur interactif, et balisage Schema.org Article + FAQPage).*

- **Code Source Complet (Repository GitHub) :**  
  👉 **https://github.com/Chouaibimouaffak/test-technique-mybestsim**  
  *(Pipeline Python `scripts/process_data.py`, suite de 8 tests unitaires automatisés validant tous les résultats et workflow GitHub Actions CI/CD).*

---

### 📊 2. Réponses Officielles aux Questions du Test (Partie 1)

1. **Nombre total de cartes eSIM :** **5 056 offres** (18 fournisseurs agrégés).
2. **Nombre de produits à plus de 100 € :** **56 forfaits** (soit **1,11%** du catalogue, segment premium long séjour).
3. **Fourchette de prix globale :** **5,36 € à 154,63 €** (amplitude : 149,27 €).
4. **Moyenne de data (Go) par carte :** **14,49 Go** calculés rigoureusement sur les **4 403 offres volumiques**. Les **653 forfaits illimités (12,92%)** ont été isolés et quantifiés à part pour ne pas fausser la moyenne (une imputation arbitraire à 999 Go aurait dénaturé la moyenne à plus de 140 Go).
5. **Prix moyen global :** **29,30 €** (prix médian : **20,70 €**).
6. **Répartition par fournisseur (18 marques) :** Airalo domine avec 722 offres (14,28%), suivi d'Ubigi (562 offres, 11,12%), eSIMX (432 offres) et Saily (382 offres).

---

### 🧠 3. Analyse Critique & Prises de Décision Méthodologiques

Vous nous avez invités à faire preuve d'autonomie et de créativité : voici les 4 découvertes clés que l'audit approfondi des données a révélées :

1. **Le Paradoxe de Simpson sur la 5G (+22% brut vs 0% réel) :**  
   En moyenne brute, la 5G paraît 22% plus chère que la 4G (33,22 € vs 27,22 €). C'est en réalité un **pur effet de mix** : 22,9% des offres 5G sont des forfaits illimités (très chers), contre seulement 7,6% en 4G. À offre comparable (volume fini), la 5G est au même tarif que la 4G (24,39 € vs 24,73 €, soit -1,4% !).

2. **Neutralité tarifaire des 18 Fournisseurs & Biais de catalogue :**  
   Sur des offres strictement identiques *(même destination, même volume de data, même durée)*, **les 18 fournisseurs sont tous à ±0,5% de la médiane**. Les données étant générées de façon synthétique, les disparités apparentes de prix/Go entre marques reflètent uniquement leur mix de catalogue (part de gros forfaits vs petits forfaits). Les deux seuls vrais leviers de prix sont :
   - L'économie d'échelle sur le volume (dégressivité de ~5,40 €/Go sur 1 Go à ~0,60 €/Go sur 20 Go).
   - Le type de zone : un forfait régional multi-pays coûte en moyenne **+40%** par rapport à un forfait mono-pays.

3. **Double métrique du Prix au Go :**  
   - *Moyenne simple des ratios* : **3,17 € / Go** (médiane : 2,55 €/Go, sensible aux petits forfaits).
   - *Moyenne pondérée volume (Total CA ÷ Total Go)* : **1,70 € / Go**, qui reflète la réalité économique macro du catalogue.

4. **Résolution du piège QA sur le code pays « NA » :**  
   Par défaut, Pandas convertit le code ISO `"NA"` (Amérique du Nord, 192 lignes) en valeur manquante (`NaN`). J'ai configuré `keep_default_na=False` dans le pipeline pour préserver l'intégrité de ces 192 enregistrements dans l'explorateur et les KPIs.

---

### 🔍 4. Analyse de la Concurrence & Stratégie SEO (Partie 2)

Conformément à la consigne d'analyser la concurrence pour définir la longueur et la structure de l'article :

#### Benchmark du Top 5 Google sur la requête « Internet en croisière » :
1. **Simology (« eSIM for cruise ships »)** : ~3 400 mots. Point fort : très exhaustif techniquement. Faiblesse : orienté marché américain, n'explique pas les subtilités juridiques européennes ni le piège des forfaits français.
2. **MonPetitForfait (« Avoir Internet en croisière »)** : ~1 850 mots. Point fort : bonne vulgarisation. Faiblesse : très généraliste sur les forfaits traditionnels, peu précis sur l'eSIM et sans simulateur interactif.
3. **Wise (« eSIM pour voyager en croisière »)** : ~1 200 mots. Point fort : marque forte. Faiblesse : contenu superficiel, pas de comparatif d'offres réelles.
4. **Tourdumondiste (« Forfait mobile en croisière »)** : ~1 500 mots. Axé astuces générales sans outil de calcul.
5. **MyBestSim (vos articles existants sur croisière et Caraïbes)** : ~1 500 à 1 900 mots.

#### Justification de nos choix éditoriaux :
- **Longueur cible (3 164 mots) :** Pour surclasser les concurrents français tout en rivalisant avec Simology sur le plan de l'autorité thématique, un format approfondi de ~3 000 mots est idéal pour capter la position 0 sur les requêtes informationnelles et transactionnelles.
- **Cohérence stricte avec les données CSV :** Les tarifs cités dans l'article pour Roamic et Yesim reprennent scrupuleusement les chiffres réels du catalogue (ex : Roamic Europe 1 Go à 10,68 €, 3 Go à 18,96 €, 10 Go à 25,63 € ; Yesim Europe 5 Go à 20,69 €).
- **Transparence sur les forfaits maritimes :** Le catalogue CSV fourni ne contenant aucun forfait maritime dédié, j'ai explicitement indiqué que l'offre *GigSky Cruise* est une solution externe spécialisée (sourcée sur le portail officiel de l'opérateur).
- **Suggestions d'images prêtes à l'emploi :** 4 emplacements éditoriaux intégrés (Bannière d'en-tête, Schéma des 12 milles marins UNCLOS, Photo d'escale méditerranéenne et Carte stylisée des escales Caraïbes), avec balises `<img>` optimisées et prompts IA de génération.
- **SEO Technique :** Balisage Schema.org JSON-LD complet (`Article` + `FAQPage` à 6 questions + `BreadcrumbList`), meta-description optimisée à 154 caractères et hiérarchie sémantique H2/H3 rigoureuse.

---

### 🤖 5. Comment j'ai utilisé l'IA pendant ce test

Je n'ai pas abordé l'IA comme un simple « générateur de texte », mais comme un véritable **Senior Pair Programmer & QA Reviewer** :
- **Audit de données & Sparring Partner :** L'IA m'a servi à challenger les distributions statistiques et à détecter les biais d'analyse (notamment la mise en évidence de l'effet de mix sur la 5G et la vérification du comportement de Pandas sur le code pays `NA`).
- **Architecture logicielle :** Écriture et vectorisation du pipeline Python, conception de la suite de tests unitaires automatisés (`unittest`, 8 tests validés à 100%) et mise en place de l'export synchrone (JSON + JS global) pour garantir une résilience totale 0-CORS en local comme sur le CDN.
- **Contrôle qualité & Vérification humaine :** Chaque chiffre produit par l'IA a été vérifié manuellement contre les fichiers CSV sources pour éliminer toute hallucination tarifaire.

---

Je confirme être disponible à 100% à temps plein (35h/semaine) pour la convention de stage de 6 mois à partir de mi-novembre ou décembre.

Je reste à votre entière disposition pour vous présenter cette réalisation et échanger de vive voix lors d'un entretien !

Bien cordialement,

**Mouaffak Chouaibi**  
📞 +33 7 53 08 26 51  
✉️ mouaffakch21@gmail.com  
💼 [Profil GitHub : Chouaibimouaffak](https://github.com/Chouaibimouaffak)  
🔗 [Repository GitHub du projet](https://github.com/Chouaibimouaffak/test-technique-mybestsim)
