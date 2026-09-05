# AGENTS.md - System & Agent Directives

Fichier de configuration d'agent basé sur la spécification open-source [agents.md](https://agents.md).

## 👤 Profil Actif
- **Profil Utilisateur** : **Collectivités territoriales & Juriste de droit public / privé** (Administration territoriale — DGS, secrétaire de mairie, juriste territorial, magistrat / avocat).
- **Compétence Principale Active** : `recherche-juridique` & `raisonnement-juridique-amaury-fouret` (droit français, CGCT, CGFP, jurisprudence Judilibre CE/Cass/TA/CAA, syllogisme judiciaire).

## 🧰 Compétences Juridiques Disponibles dans `.agents/skills` et `skills/`

### 1. 🏛️ Méthodologie & Raisonnement Juridique
- **[recherche-juridique](skills/droit-francais/SKILL.md)** : Méthodologie rigoureuse de recherche en droit français (Légifrance, vérification des textes en vigueur, filtres anti-hallucination, dates de référence, hiérarchie des normes).
- **[raisonnement-juridique-amaury-fouret](skills/raisonnement-juridique-amaury-fouret/SKILL.md)** : Méthodologie du magistrat français (ENM / Cour de cassation 2023) — Syllogisme inversé/déductif, office du juge, motivation enrichie, contrôle de proportionnalité, articulation texte/jurisprudence et pondération des arrêts (AP, Chambres mixtes, Bulletin).
- **[jurisprudence](skills/jurisprudence/SKILL.md)** : Stratégie de recherche jurisprudentielle ciblée via Judilibre et fonds décisionnels.
- **[recherche-legislation](skills/recherche-legislation/SKILL.md)** & **[legalfrance](skills/legalfrance/SKILL.md)** : Recherche approfondie dans les fonds LEGI, LODA, JORF et KALI.

### 2. 📑 Commande Publique & Contrats Administratifs
- **[arckit-fr-marche-public](skills/arckit-fr-marche-public/SKILL.md)** : Dossier de Consultation des Entreprises (DCE), Code de la commande publique, CCAG (FCS, PI, TIC, Travaux, MOE), seuils européens, critères d'attribution, doctrine DINUM et conformité UGAP.
- **[marches-publics-et-contrats](skills/marches-publics-et-contrats/SKILL.md)** : Passation, avenants (règle des 10%/15%/50%), sous-traitance et référés précontractuels/contractuels.

### 3. ⚖️ Contentieux & Litiges
- **[contentieux-administratif](skills/contentieux-administratif/SKILL.md)** : Recours pour Excès de Pouvoir (REP), référés d'urgence (L. 521-1, L. 521-2 CJA), déférés préfectoraux et mémoires en défense.

### 4. 🔒 Données Personnelles, Cybersécurité & Numérique Public
- **[arckit-fr-rgpd](skills/arckit-fr-rgpd/SKILL.md)** & **[cnil-compliant-cookies](skills/cnil-compliant-cookies/SKILL.md)** : Conformité RGPD, AIPD, sous-traitance, données de santé (HDS), référentiels et sanctions CNIL.
- **[arckit-fr-anssi](skills/arckit-fr-anssi/SKILL.md)**, **[arckit-fr-ebios](skills/arckit-fr-ebios/SKILL.md)**, **[arckit-fr-pssi](skills/arckit-fr-pssi/SKILL.md)**, **[arckit-fr-secnumcloud](skills/arckit-fr-secnumcloud/SKILL.md)** : Sécurité des SI, méthode EBIOS RM, PSSI, directives NIS2, qualification SecNumCloud et homologation RGS.
- **[arckit-fr-algorithme-public](skills/arckit-fr-algorithme-public/SKILL.md)** : Transparence des algorithmes publics & IA (Art. L. 311-3-1 CRPA / Loi République Numérique).
- **[arckit-fr-dinum](skills/arckit-fr-dinum/SKILL.md)** & **[arckit-fr-dr](skills/arckit-fr-dr/SKILL.md)** : Référentiels DINUM (RGAA accessibilité, RGS, RGI, RGESN), doctrine Cloud au Centre, mentions Diffusion Restreinte (DR) et archivage électronique.

### 5. 🏡 Immobilier & Notariat
- **[fr-droit-immobilier](skills/fr-droit-immobilier/SKILL.md)** & **[notaire](skills/notaire/SKILL.md)** : Baux d'habitation et commerciaux, copropriété, diagnostics obligatoires, actes authentiques, droit patrimonial et formalités foncières.

## 🔗 Dépôts de Référence Intégrés (Outillage, MCP & LegalTech)
- **Legal Skills Open** : `ThomasMoreAI/legal-skills-open/fr` (Ensemble des compétences juridiques ouvertes et méthodologies expertes).
- **Open Data Jurisprudence & Décisions Judiciaires** :
  - `antoinejeannot/jurisprudence` & `huggingface.co/datasets/antoinejeannot/jurisprudence` (Extraction automatisée et synchronisée toutes les 72h de +1,12M décisions Judilibre en formats Parquet / JSONL : Cassation, Appel, TJ).
  - **CLI local** : [`scripts/query_jurisprudence.py`](scripts/query_jurisprudence.py) (requêtage DuckDB des Parquets distants : pourvoi, dates, chambre, Bulletin — autonomie via [`requirements.txt`](requirements.txt) et le venv projet : `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`, puis `.venv/bin/python scripts/query_jurisprudence.py`).
- **API & Serveurs MCP Légifrance & Judilibre** :
  - `rdassignies/mcp-server-legifrance` & `rdassignies/pylegifrance` (Connecteurs et wrappers Python avec validation Pydantic).
  - `SocialGouv/legi-data` (Extraction et structuration JSON/TS des codes de loi).
  - `legalize-dev/legalize-fr` (Versioning Git/Markdown des textes juridiques français pour le suivi d'historique).
- **Open Data Collectivités & Secteur Public** :
  - `OpenDataFrance` & `etalab/schema.data.gouv.fr` (Schémas de données territoriales : délibérations, marchés publics, arrêtés).


## 🎯 Directives Principales
- Appliquer la méthodologie du skill `recherche-juridique` et les standards de motivation du magistrat (`raisonnement-juridique-amaury-fouret`).
- Pour les consultations portant sur la commande publique, le numérique public, le RGPD ou la cybersécurité, mobiliser immédiatement les skills spécialisés correspondants.
- S'appuyer sur les connecteurs MCP et wrappers juridiques (`droit-francais-mcp`, `pylegifrance`, `legi-data`) pour le requêtage direct et vérifié en temps réel.

