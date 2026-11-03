# 📬 Modèle d'Email de Rendu pour MyBestSim

**À :** contact@mybestsim.com  
**Objet :** Test technique Stagiaire Développeur IA & Automatisation — Mouaffak Chouaibi

---

Bonjour l'équipe MyBestSim,

Un grand merci pour ce test technique passionnant ! J'ai pris énormément de plaisir à concevoir une solution complète, robuste et directement alignée avec votre mission et vos enjeux opérationnels quotidiens.

Voici les livrables demandés ainsi que le détail de ma démarche :

---

### 🌐 1. Les Liens des Livrables en Ligne

- **Dashboard Data & Plateforme Interactive (Partie 1)** :  
  👉 **[https://mybestsim-analytics.surge.sh](https://mybestsim-analytics.surge.sh)** *(ou lien GitHub Pages ci-dessous)*  
  *(Accompagné d'un explorateur de recherche dynamique sur les 5 056 offres, graphiques Chart.js et export CSV).*

- **Article de Blog SEO « Internet en croisière : quelle eSIM choisir ? » (Partie 2)** :  
  👉 **[https://mybestsim-analytics.surge.sh/article-seo.html](https://mybestsim-analytics.surge.sh/article-seo.html)**  
  *(Accessible directement via ce lien ou via l'onglet dédié du dashboard, avec simulateur interactif, balisage Schema.org FAQPage et suggestions de prompts visuels).*

- **Code Source Complet sur GitHub (Optionnel)** :  
  👉 **[https://github.com/MouaffakCh/test-stage-mybestsim](https://github.com/MouaffakCh/test-stage-mybestsim)**

---

### 📊 2. Synthèse Express des Réponses du Test (Partie 1)

1. **Nombre total de cartes eSIM** : **5 056 produits** (agrégés sur 18 fournisseurs).
2. **Nombre de produits à plus de 100 €** : **56 offres** (soit 1.11% du catalogue, correspondant au segment premium long séjour).
3. **Fourchette de prix globale** : **5.36 € à 154.63 €** (amplitude : 149.27 €).
4. **Moyenne de data (Go) par carte** : **14.49 Go** sur les 4 403 offres volumiques, avec **653 forfaits illimités** (12.91% du catalogue) identifiés et valorisés séparément pour ne pas fausser la métrique.
5. **Prix moyen global** : **29.30 €** (prix médian : 20.70 €).
6. **Répartition par fournisseur** : Airalo domine avec 722 offres (14.28%), suivi d'Ubigi (562 offres, 11.12%), eSIMX (432 offres) et Saily (382 offres). Les 18 partenaires sont tous représentés et analysés en détail.
7. **Statistiques bonus à forte valeur ajoutée** :
   - *Prix moyen au Go* : **3.17 € / Go** (JamboSIM et Yesim sont les plus compétitifs à moins de 2.95 €/Go).
   - *Réseau 5G* : 34.7% des offres sont en 5G avec un prix moyen de 33.22 € (+22% vs 4G à 27.22 €).
   - *Rechargeabilité* : 54.1% des offres proposent le rechargement sans surcoût tarifaire moyen.

---

### 🤖 3. Comment j'ai utilisé l'IA pendant ce test

J'ai utilisé l'IA comme un **Senior Pair Programmer & Lead Data Engineer** :
- **Audit de données & Proactivité** : Dès l'ingestion brute, nous avons détecté que la colonne `data_gb` contenait 653 valeurs manquantes (`NaN`). L'IA m'a aidé à vérifier qu'il s'agissait des forfaits à data illimitée (`data_display = "Illimité"`), ce qui a guidé notre décision de séparer forfaits volumiques et illimités.
- **Automatisation & Qualité logicielle** : Développement d'un pipeline ETL modulaire orienté objet (`automated_daily_etl.py`), d'une suite de 7 tests unitaires (`test_pipeline.py`) et d'un workflow CI/CD GitHub Actions automatisant l'ingestion quotidienne à 04:00 UTC.
- **Rédaction & Stratégie SEO** : Analyse de l'intention de recherche et benchmark de la concurrence (Wise, MonPetitForfait) pour identifier l'angle manquant sur le web : **l'alerte rouge sur le roaming maritime satellite (Cellular at Sea)** qui cause des factures surprises de plusieurs milliers d'euros, tout en intégrant le balisage structuré JSON-LD.

---

### 💡 4. Choix assumés

- **Traitement de la data illimitée (Q4)** : Assigner une valeur artificielle (comme 999 Go) aurait dénaturé la moyenne volumique. Le choix assumé a été de donner la moyenne stricte des forfaits quantifiables (14.49 Go) tout en quantifiant précisément la part d'illimité (12.91%).
- **Livrable unifié en production** : J'ai fait le choix de livrer une véritable application web moderne plutôt qu'un document statique, intégrant à la fois les tableaux de bord décisionnels, le moteur de recherche interactif et l'article SEO.

Je reste à votre entière disposition pour échanger de vive voix lors d'un entretien et vous présenter cette réalisation en détail !

Bien cordialement,  
**Mouaffak Chouaibi**  
📞 +33 (ou votre numéro)  
✉️ mouaffakch21@gmail.com  
💼 [Profil LinkedIn]
