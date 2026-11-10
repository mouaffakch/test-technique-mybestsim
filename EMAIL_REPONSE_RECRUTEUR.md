# 📬 Email de Rendu du Test Technique — MyBestSim

**À :** Etienne <contact@mybestsim.com>  
**De :** Mouaffak Chouaibi <mouaffakch21@gmail.com>  
**Objet :** Rendu test pratique — Développeur IA & Automatisation — Mouaffak Chouaibi  

---

Bonjour Étienne,

Un grand merci pour ce test technique passionnant ! J'ai pris énormément de plaisir à concevoir une solution complète, rigoureuse et directement ancrée dans les enjeux business de MyBestSim.

Conformément à vos consignes, les deux livrables ont été déployés de manière indépendante en production :

---

### 🌐 1. Les Liens des Livrables en Ligne

- **Livrable 1 — Dashboard Analytique & Pipeline ETL :**  
  👉 **`https://mybestsim-dashboard-mouaffak.netlify.app/`**  
  *(Traitement vectorisé des 5 056 offres, 6 KPIs officiels, 6 graphiques Chart.js interactifs avec détection des effets de structure, explorateur temps réel et export CSV).*

- **Livrable 2 — Article SEO « Internet en croisière : quelle eSIM choisir ? » :**  
  👉 **`https://mybestsim-article-mouaffak.netlify.app/`**  
  *(Guide pilier de 2 680 mots, comparatif haute mer vs escales, maillage interne profond avec vos articles existants, simulateur interactif en 3 clics et balisage Schema.org Article + FAQPage).*

- **Code Source Complet (Repository GitHub) :**  
  👉 **https://github.com/Chouaibimouaffak/test-technique-mybestsim**  
  *(Pipeline Python `process_data.py`, suite de 8 tests unitaires automatisés validant tous les résultats et workflow GitHub Actions CI/CD).*

---

### 📊 2. Réponses Officielles aux Questions du Test (Partie 1)

1. **Nombre total de cartes eSIM répertoriées :** **5 056 offres** (agrégées sur 18 fournisseurs).
2. **Nombre de produits à plus de 100 € :** **56 forfaits** (soit **1,11%** du catalogue, segment premium long séjour).
3. **Fourchette de prix globale :** **5,36 € à 154,63 €** (amplitude : 149,27 €).
4. **Moyenne de data (Go) par carte :** **14,49 Go** calculés rigoureusement sur les **4 403 offres volumiques**. Les **653 forfaits illimités (12,92%)** ont été volontairement isolés et quantifiés à part pour ne pas biaiser artificiellement la moyenne à plus de 140 Go.
5. **Prix moyen global :** **29,30 €** (médiane : **20,70 €**).
6. **Répartition par fournisseur (18 marques) :** Airalo est n°1 avec 722 offres (14,28%), suivi d'Ubigi (562 offres, 11,12%), eSIMX (432 offres) et Saily (382 offres).

---

### 🧠 3. Analyse Critique & Insights Métier (Prises de Décision Avancées)

Vous nous avez invités à trancher et à faire preuve d'esprit critique : voici les 4 découvertes clés que l'audit approfondi des données a révélées :

1. **Le Paradoxe de Simpson sur la 5G (+22% brut vs 0% réel) :**  
   En moyenne brute, la 5G paraît 22% plus chère que la 4G (33,22 € vs 27,22 €). C'est en réalité un **pur effet de mix de structure** : 22,9% des offres 5G sont des forfaits illimités (très chers), contre seulement 7,6% en 4G. À offre comparable (volume fini), la 5G coûte quasiment le même prix que la 4G (24,39 € vs 24,73 €, soit -1,4% !).

2. **Démystification du prix au Go & Neutralité des 18 Fournisseurs :**  
   Si JamboSIM paraît le moins cher au Go en moyenne brute, c'est uniquement parce que son catalogue est composé de plus gros volumes de data. Si l'on compare des offres strictement identiques *(même destination, même volume de data, même durée de validité)*, **les 18 fournisseurs sont tous à ±0,5% de la médiane**. Les données étant générées de façon synthétique, le vrai insight commercial pour MyBestSim est que le prix ne dépend pas de la marque partenaire, mais de deux facteurs :  
   - L'économie d'échelle sur le volume (dégressivité massive de 5,40 €/Go sur 1 Go à 0,60 €/Go sur 20 Go).  
   - La zone géographique : un forfait régional multi-pays (Europe, Asie, Caraïbes) coûte en moyenne **+40%** par rapport à un forfait mono-pays.

3. **Double métrique du Prix au Go :**  
   - *Moyenne arithmétique simple des ratios* : **3,17 € / Go** (médiane : 2,55 €/Go, sensible aux petits forfaits de 1 Go).  
   - *Moyenne pondérée volume (Total € divisé par Total Go)* : **1,70 € / Go**, qui reflète la réalité économique macro du catalogue.

4. **Piège QA résolu sur le code pays « NA » (Amérique du Nord) :**  
   Lors de l'ingestion par Pandas, la chaîne ISO `"NA"` (North America, 192 lignes) est interprétée par défaut comme une valeur manquante (`NaN`). J'ai configuré un parseur spécifique (`keep_default_na=False`) pour garantir l'intégrité des 192 enregistrements dans l'explorateur et le pipeline.

---

### ✍️ 4. Stratégie Éditoriale & Business sur l'Article SEO (Partie 2)

Pour maximiser l'impact business et éviter les erreurs classiques :

- **Positionnement en « Guide Pilier » (Pillar Page) :** Analysant la concurrence (Simology à ~3 500 mots), j'ai porté l'article à **2 680 mots**. Pour éviter toute cannibalisation SEO avec les deux articles déjà publiés sur MyBestSim, j'ai créé un maillage interne profond qui renvoie vers votre article généraliste *« eSIM pour la croisière et la terre »* et votre article ciblé *« eSIM pour croisière aux Caraïbes »*.
- **Alignement avec le modèle d'affiliation MyBestSim :** Plutôt que de promouvoir des acteurs sans lien, l'article met en avant vos partenaires affiliés clés (**Roamic**, **Yesim**, Orange Travel) en s'appuyant directement sur les tarifs réels issus du catalogue de la Partie 1 (ex : forfaits Roamic Europe dès 5,00 €).
- **Rigueur sur les offres & codes promo :** Aucun code promo fictif inventé. Un lien direct dirige vers votre page officielle `mybestsim.com/codes-promo`, et les tarifs réels de GigSky Cruise ont été sourcés (dès 18,49 € pour 512 Mo et 35-50 € pour les packs hybrides mer+terre).
- **SEO Technique exhaustif :** Balisage Schema.org JSON-LD complet (`Article` + `FAQPage` à 6 questions + `BreadcrumbList`), balise canonique, Open Graph, hiérarchie sémantique H2/H3 et simulateur interactif en 3 clics.

---

### 🤖 5. Comment j'ai utilisé l'IA pour ce test

Je n'ai pas utilisé l'IA comme un simple générateur de code ou de texte, mais comme un véritable **partenaire de travail (Senior Data Engineer & QA Reviewer)** :
1. **Challenge analytique & détection des biais :** L'IA m'a servi de sparring partner pour auditer les anomalies de distribution (mise en évidence du paradoxe de Simpson sur la 5G, détection de l'homogénéité artificielle des prix par fournisseur, vérification du bug `NA` sous Pandas).
2. **Architecture logicielle & automatisation :** Structuration d'un pipeline propre avec typage vectorisé Pandas, conception de la suite de tests unitaires `unittest` (8 tests couvrant 100% des invariants) et automatisation de l'export synchrone (JSON + JS global pour garantir une résilience 0-CORS en local comme sur le CDN).
3. **Rédaction assistée & alignement SEO :** Brainstorming des angles éditoriaux, structuration du plan pour couvrir l'intégralité du champ sémantique face aux concurrents de rang 1, et validation des balises Schema.org.

---

Je confirme être disponible à 100% à temps plein (35h/semaine) pour la convention de stage de 6 mois à partir de mi-novembre ou décembre.

Je reste à votre entière disposition pour vous présenter cette réalisation et échanger de vive voix lors d'un entretien !

Bien cordialement,

**Mouaffak Chouaibi**  
📞 +33 7 53 08 26 51 *(ou votre numéro de téléphone)*  
✉️ mouaffakch21@gmail.com  
💼 [Profil GitHub : Chouaibimouaffak](https://github.com/Chouaibimouaffak)  
🔗 [Repository du test](https://github.com/Chouaibimouaffak/test-technique-mybestsim)
