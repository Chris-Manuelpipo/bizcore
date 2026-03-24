# MODÉLISATION MATHÉMATIQUE - BIZCORE

## 1. FORMALISATION DU PROBLÈME

### 1.1 Définition des ensembles

Soit le système BizCore modélisé par les ensembles fondamentaux suivants :

#### Ensembles d'entités principales

| Ensemble | Description | Type d'identifiant |
|----------|-------------|-------------------|
| $P$ | Ensemble des Personnes | $id_P \in \text{UUID}$ |
| $A$ | Ensemble des Acteurs | $id_A \in \text{UUID}$ |
| $B$ | Ensemble des Businesses (métiers) | $id_B \in \text{UUID}$ |
| $S$ | Ensemble des ServicesCatalogue | $id_S \in \text{UUID}$ |
| $R$ | Ensemble des Resources | $id_R \in \text{UUID}$ |
| $Po$ | Ensemble des Portfolios | $id_{Po} \in \text{UUID}$ |
| $SR$ | Ensemble des ServiceRequests | $id_{SR} \in \text{UUID}$ |
| $I$ | Ensemble des Invoices | $id_I \in \text{UUID}$ |
| $BR$ | Ensemble des BusinessRules | $id_{BR} \in \text{UUID}$ |
| $U$ | Ensemble des AppUsers | $id_U \in \text{UUID}$ |
| $C$ | Ensemble des SupportedCurrencies | $code_C \in \{XAF, XOF, NGN, KES, GHS, USD, EUR, GBP\}$ |

#### Décomposition de l'ensemble des Acteurs

$$A = A_{consumer} \cup A_{provider}$$

où :
- $A_{consumer}$ = ensemble des consommateurs (demandeurs de services)
- $A_{provider}$ = ensemble des fournisseurs (prestataires)

Intersection possible :
$$A_{consumer} \cap A_{provider} \neq \emptyset$$

Un même acteur peut avoir les deux rôles (personne pouvant à la fois consommer et fournir des services).

#### Attributs des entités

**Personne** $p \in P$ :
$$p = (id_P, \text{firstName}, \text{lastName}, \text{email}, \text{phone}, \text{country}, \text{createdAt})$$

**Acteur** $a \in A$ :
$$a = (id_A, \text{person}, \text{role}, \text{bio}, \text{isActive}, \text{createdAt})$$
où $\text{role} \in \{CONSUMER, PROVIDER\}$

**Business** $b \in B$ :
$$b = (id_B, \text{name}, \text{domain}, \text{description}, \text{neededEducation}, \text{neededTraining}, \text{createdAt})$$

**ServiceCatalogue** $s \in S$ :
$$s = (id_S, \text{business}, \text{name}, \text{description}, \text{basePrice}, \text{currency}, \text{isAvailable}, \text{createdAt})$$

**Resource** $r \in R$ :
$$r = (id_R, \text{business}, \text{name}, \text{type}, \text{quantityAvailable}, \text{description}, \text{createdAt})$$

**Portfolio** $po \in Po$ :
$$po = (id_{Po}, \text{actor}, \text{title}, \text{description}, \text{businesses}, \text{createdAt})$$
où $\text{businesses} \subseteq B$

**ServiceRequest** $sr \in SR$ :
$$sr = (id_{SR}, \text{consumer}, \text{provider}, \text{business}, \text{serviceName}, \text{description}, \text{status}, \text{requestedAt}, \text{fulfilledAt})$$

**Invoice** $i \in I$ :
$$i = (id_I, \text{serviceRequest}, \text{amount}, \text{currency}, \text{status}, \text{issuedAt}, \text{paidAt})$$

**BusinessRule** $br \in BR$ :
$$br = (id_{BR}, \text{business}, \text{ruleKey}, \text{ruleValue}, \text{description}, \text{createdAt})$$

### 1.2 Variables de décision

#### Variables binaires de matching

$$x_{a_c, a_p, b} \in \{0, 1\} \quad \forall a_c \in A_{consumer}, a_p \in A_{provider}, b \in B$$

où $x_{a_c, a_p, b} = 1$ si le consumer $a_c$ est mis en relation avec le provider $a_p$ pour le métier $b$.

#### Variables de sélection de service

$$y_{sr, s} \in \{0, 1\} \quad \forall sr \in SR, s \in S$$

où $y_{sr, s} = 1$ si la demande de service $sr$ correspond au service catalogue $s$.

#### Variables d'allocation de ressources

$$z_{sr, r} \in \mathbb{N} \quad \forall sr \in SR, r \in R$$

représentant la quantité de ressource $r$ allouée à la demande $sr$.

#### Variables d'état

$$\sigma_{sr} \in \Sigma_{SR} = \{PENDING, ACCEPTED, IN_PROGRESS, FULFILLED, CANCELLED\}$$

$$\sigma_i \in \Sigma_I = \{PENDING, PAID, CANCELLED\}$$

### 1.3 Fonction objectif

#### 1.3.1 Objectif principal : Maximiser le nombre de transactions réussies

$$\max \sum_{sr \in SR} \mathbb{1}_{\sigma_{sr} = FULFILLED}$$

où $\mathbb{1}_{\text{condition}}$ est la fonction indicatrice valant 1 si la condition est vraie, 0 sinon.

#### 1.3.2 Objectif secondaire : Maximiser le chiffre d'affaires

$$\max \sum_{i \in I} amount(i) \cdot \mathbb{1}_{\sigma_i = PAID}$$

#### 1.3.3 Fonction objectif combinée (multi-objectif)

$$\max \quad \alpha \cdot \sum_{sr \in SR} \mathbb{1}_{\sigma_{sr} = FULFILLED} + \beta \cdot \sum_{i \in I} amount(i) \cdot \mathbb{1}_{\sigma_i = PAID} - \gamma \cdot \sum_{sr \in SR} duration(sr)$$

où :
- $\alpha$ : poids du nombre de transactions (qualité de service)
- $\beta$ : poids du chiffre d'affaires (rentabilité)
- $\gamma$ : poids de la durée (efficacité opérationnelle)

$$\alpha + \beta + \gamma = 1, \quad \alpha, \beta, \gamma \geq 0$$

---

## 2. CONTRAINTES DU SYSTÈME

### 2.1 Contraintes de cardinalité

#### 2.1.1 Unicité de l'email (Person)

$$\forall p_1, p_2 \in P : \quad p_1.\text{email} = p_2.\text{email} \implies p_1 = p_2$$

Formulation logique :
$$\forall p_1, p_2 \in P, p_1 \neq p_2 : \quad p_1.\text{email} \neq p_2.\text{email}$$

#### 2.1.2 Cardinalité Person → Actor (1:N)

$$\forall p \in P : \quad |\{a \in A : a.\text{person} = p\}| \geq 0$$

Une personne peut avoir zéro, un ou plusieurs acteurs :
$$f: P \to 2^A$$

#### 2.1.3 Cardinalité Actor → Portfolio (1:1)

$$\forall a \in A : \quad \exists! \, po \in Po : po.\text{actor} = a$$

Chaque acteur a exactement un portfolio :
$$g: A \to Po \quad \text{(bijection partielle)}$$

#### 2.1.4 Cardinalité Portfolio → Business (N:M)

$$\forall po \in Po : \quad po.\text{businesses} \subseteq B$$

$$\forall b \in B : \quad |\{po \in Po : b \in po.\text{businesses}\}| \geq 0$$

Relation many-to-many représentée par :
$$h: Po \to 2^B$$

#### 2.1.5 Cardinalité ServiceRequest → Invoice (1:1)

$$\forall sr \in SR : \quad \exists! \, i \in I : i.\text{serviceRequest} = sr$$

$$\forall i \in I : \quad \exists! \, sr \in SR : i.\text{serviceRequest} = sr$$

### 2.2 Contraintes métier

#### 2.2.1 Validité d'une demande de service

Une demande de service $sr$ est valide si et seulement si :

$$sr.\text{consumer} \in A_{consumer} \land sr.\text{provider} \in A_{provider} \land sr.\text{provider}.\text{isActive} = true$$

Formellement :
$$valid(sr) \iff \begin{cases}
sr.\text{consumer}.\text{role} = CONSUMER \\
sr.\text{provider}.\text{role} = PROVIDER \\
sr.\text{provider}.\text{isActive} = true
\end{cases}$$

#### 2.2.2 Compatibilité métier pour le matching

$$compatible(a_c, a_p, b) \iff \exists \, po \in Po : \begin{cases}
po.\text{actor} = a_p \\
b \in po.\text{businesses}
\end{cases}$$

#### 2.2.3 Disponibilité des services

$$available(s) \iff s.\text{isAvailable} = true \land s.\text{business} \in B_{active}$$

#### 2.2.4 Contraintes de ressources

$$\forall sr \in SR, \forall r \in R : \quad z_{sr, r} \leq r.\text{quantityAvailable}$$

Quantité totale utilisée :
$$\sum_{sr \in SR_{active}} z_{sr, r} \leq r.\text{quantityAvailable} \quad \forall r \in R$$

où $SR_{active} = \{sr \in SR : \sigma_{sr} \in \{ACCEPTED, IN_PROGRESS\}\}$

#### 2.2.5 Contrainte de devise

$$\forall i \in I : \quad i.\text{currency} \in C$$

$$\forall s \in S : \quad s.\text{currency} \in C$$

### 2.3 Contraintes de workflow

#### 2.3.1 Machine à états - ServiceRequest

Soit $\Sigma_{SR} = \{PENDING, ACCEPTED, IN_PROGRESS, FULFILLED, CANCELLED\}$

Les transitions valides sont :

$$\delta_{SR}: \Sigma_{SR} \times \mathcal{A} \to \Sigma_{SR}$$

où $\mathcal{A} = \{create, accept, start, fulfill, cancel\}$

| État courant | Action | État suivant |
|-------------|--------|--------------|
| $\emptyset$ | $create$ | $PENDING$ |
| $PENDING$ | $accept$ | $ACCEPTED$ |
| $PENDING$ | $cancel$ | $CANCELLED$ |
| $ACCEPTED$ | $start$ | $IN\_PROGRESS$ |
| $ACCEPTED$ | $cancel$ | $CANCELLED$ |
| $IN\_PROGRESS$ | $fulfill$ | $FULFILLED$ |
| $IN\_PROGRESS$ | $cancel$ | $CANCELLED$ |

Contrainte de transition :
$$\forall sr \in SR : \quad \sigma_{sr}^{t+1} = \delta_{SR}(\sigma_{sr}^t, action) \iff (\sigma_{sr}^t, action) \in \mathcal{T}_{valid}$$

où $\mathcal{T}_{valid}$ est l'ensemble des transitions valides définies ci-dessus.

#### 2.3.2 Machine à états - Invoice

Soit $\Sigma_I = \{PENDING, PAID, CANCELLED\}$

$$\delta_I: \Sigma_I \times \mathcal{A}_I \to \Sigma_I$$

où $\mathcal{A}_I = \{issue, pay, cancel\}$

| État courant | Action | État suivant |
|-------------|--------|--------------|
| $\emptyset$ | $issue$ | $PENDING$ |
| $PENDING$ | $pay$ | $PAID$ |
| $PENDING$ | $cancel$ | $CANCELLED$ |

Contrainte de création :
$$\forall sr \in SR : \quad \sigma_{sr} = FULFILLED \implies \exists! \, i \in I : i.\text{serviceRequest} = sr$$

#### 2.3.3 Dépendances temporelles

$$sr.\text{requestedAt} \leq sr.\text{fulfilledAt} \quad \forall sr \in SR : \sigma_{sr} = FULFILLED$$

$$i.\text{issuedAt} \leq i.\text{paidAt} \quad \forall i \in I : \sigma_i = PAID$$

$$sr.\text{fulfilledAt} = i.\text{issuedAt} \quad \text{où } i.\text{serviceRequest} = sr$$

---

## 3. MODÈLES MATHÉMATIQUES PAR DOMAINE

### 3.1 Modèle de matching Consumer-Provider

#### 3.1.1 Fonction de matching

$$m: A_{consumer} \times A_{provider} \times B \to \{0, 1\}$$

$$m(a_c, a_p, b) = 1 \iff \begin{cases}
a_c \in A_{consumer} \\
a_p \in A_{provider} \\
a_p.\text{isActive} = true \\
b \in h(g(a_p))
\end{cases}$$

où $g(a_p)$ retourne le portfolio de $a_p$, et $h(po)$ retourne l'ensemble des businesses du portfolio $po$.

#### 3.1.2 Score de matching

Fonction de score pondérée :

$$score(a_c, a_p, b) = w_1 \cdot sim_{business}(b, a_p) + w_2 \cdot rating(a_p) + w_3 \cdot availability(a_p) + w_4 \cdot proximity(a_c, a_p)$$

où :
- $sim_{business}(b, a_p) = \mathbb{1}_{b \in h(g(a_p))}$ : compatibilité métier
- $rating(a_p) \in [0, 1]$ : note moyenne du provider
- $availability(a_p) \in \{0, 1\}$ : disponibilité actuelle
- $proximity(a_c, a_p)$ : proximité géographique (normalisée)
- $w_1 + w_2 + w_3 + w_4 = 1$

#### 3.1.3 Problème d'optimisation du matching

**Entrées** :
- $a_c \in A_{consumer}$ : consumer demandeur
- $B_{target} \subseteq B$ : businesses recherchés
- $k \in \mathbb{N}^*$ : nombre maximum de résultats

**Sortie** : Ensemble de providers triés par score

$$\text{Match}(a_c, B_{target}, k) = \text{Top}_k \{(a_p, score(a_c, a_p, b)) : b \in B_{target} \land m(a_c, a_p, b) = 1\}$$

où $\text{Top}_k$ retourne les $k$ meilleurs éléments selon le score.

#### 3.1.4 Contraintes d'intégrité

$$\forall sr \in SR : \quad m(sr.\text{consumer}, sr.\text{provider}, sr.\text{business}) = 1$$

Une demande de service ne peut être créée que si le matching est valide.

### 3.2 Modèle de tarification

#### 3.2.1 Structure du prix

Soit un service $s \in S$, le prix de base est :

$$P_{base}(s) = s.\text{basePrice} \quad \text{en devise } s.\text{currency}$$

#### 3.2.2 Formule de calcul d'une facture

Pour une demande de service $sr \in SR$ avec facture $i \in I$ :

$$amount(i) = P_{base}(s^*) + P_{resources}(sr) + P_{rules}(sr, b) + P_{adjustments}(sr)$$

où :
- $s^* = \arg\max_{s \in S} sim(s, sr.\text{serviceName})$ : service catalogue le plus proche
- $b = sr.\text{business}$ : métier concerné

#### 3.2.3 Calcul des composants du prix

**Composante ressources** :

$$P_{resources}(sr) = \sum_{r \in R} z_{sr, r} \cdot unitPrice(r)$$

où $unitPrice(r)$ est le prix unitaire de la ressource (peut être défini dans les BusinessRules).

**Composante règles métier** :

Soit $BR_b = \{br \in BR : br.\text{business} = b\}$ l'ensemble des règles métier pour $b$.

$$P_{rules}(sr, b) = \sum_{br \in BR_b^{price}} apply(br, sr)$$

où $BR_b^{price} = \{br \in BR_b : br.\text{ruleKey} \text{ commence par } "PRICE_"\}$

$$apply(br, sr) = \begin{cases}
valeur(br.\text{ruleValue}) & \text{si } condition(br, sr) \\
0 & \text{sinon}
\end{cases}$$

**Ajustements** (remises, majorations) :

$$P_{adjustments}(sr) = \sum_{br \in BR_b^{adjust}} adjustment(br, sr)$$

#### 3.2.4 Formule complète de tarification

$$\boxed{amount(i) = P_{base}(s^*) + \sum_{r \in R} z_{sr, r} \cdot unitPrice(r) + \sum_{br \in BR_b^{price}} apply(br, sr) + \sum_{br \in BR_b^{adjust}} adjustment(br, sr)}$$

#### 3.2.5 Conversion de devises

Soit $rate(c_1, c_2)$ le taux de change de $c_1$ vers $c_2$ :

$$convert(amount, c_1, c_2) = amount \cdot rate(c_1, c_2)$$

Contrainte de cohérence :
$$rate(c_1, c_2) \cdot rate(c_2, c_3) = rate(c_1, c_3) \quad \forall c_1, c_2, c_3 \in C$$

$$rate(c, c) = 1 \quad \forall c \in C$$

### 3.3 Modèle de gestion des ressources

#### 3.3.1 État des ressources

Pour chaque ressource $r \in R$ à un instant $t$ :

$$state(r, t) = (available_t(r), allocated_t(r), reserved_t(r))$$

avec :
- $available_t(r)$ : quantité disponible
- $allocated_t(r)$ : quantité allouée à des demandes en cours
- $reserved_t(r)$ : quantité réservée pour demandes futures

#### 3.3.2 Équation de conservation

$$r.\text{quantityAvailable} = available_t(r) + allocated_t(r) + reserved_t(r) \quad \forall t$$

#### 3.3.3 Allocation optimale

Problème : Allouer les ressources aux demandes de service pour maximiser l'utilisation

**Variables** :
$$z_{sr, r} \in \mathbb{N} \quad \forall sr \in SR_{active}, r \in R$$

**Objectif** :
$$\max \sum_{sr \in SR_{active}} \sum_{r \in R} z_{sr, r} \cdot priority(sr)$$

**Contraintes** :
$$\sum_{sr \in SR_{active}} z_{sr, r} \leq r.\text{quantityAvailable} \quad \forall r \in R$$

$$z_{sr, r} \leq demand(sr, r) \quad \forall sr \in SR_{active}, r \in R$$

où $priority(sr)$ est la priorité de la demande et $demand(sr, r)$ la demande de ressource $r$ pour $sr$.

#### 3.3.4 Seuils d'alerte

Alerte stock faible :
$$alert(r) \iff \frac{available_t(r)}{r.\text{quantityAvailable}} < \theta_{alert}$$

où $\theta_{alert} \in [0, 1]$ est le seuil d'alerte (typiquement 0.2).

### 3.4 Modèle d'optimisation des portfolios

#### 3.4.1 Couverture métier d'un portfolio

$$coverage(po) = \frac{|po.\text{businesses}|}{|B|} \in [0, 1]$$

#### 3.4.2 Pertinence d'un portfolio

$$relevance(po, b) = \begin{cases}
1 & \text{si } b \in po.\text{businesses} \\
0 & \text{sinon}
\end{cases}$$

#### 3.4.3 Recommandation de businesses

Pour un portfolio $po$, suggérer des businesses complémentaires :

$$suggest(po, k) = \text{Top}_k \{b \in B \setminus po.\text{businesses} : similarity(b, po.\text{businesses})\}$$

où :

$$similarity(b, B_{ref}) = \frac{1}{|B_{ref}|} \sum_{b' \in B_{ref}} sim(b, b')$$

$$sim(b, b') = \frac{|A_{provider}(b) \cap A_{provider}(b')|}{|A_{provider}(b) \cup A_{provider}(b')|}$$

où $A_{provider}(b) = \{a \in A_{provider} : b \in h(g(a))\}$

---

## 4. ALGORITHMES ET COMPLEXITÉ

### 4.1 Complexité des opérations principales

| Opération | Complexité | Description |
|-----------|-----------|-------------|
| Création Person | $O(1)$ | Insertion simple |
| Recherche Person par email | $O(1)$ | Index unique |
| Création Actor | $O(1)$ | Insertion simple |
| Association Actor-Business | $O(1)$ | Mise à jour FK |
| Matching Consumer-Provider | $O(|A_{provider}| \cdot |B|)$ | Recherche par métier |
| Création ServiceRequest | $O(1)$ | Insertion simple |
| Transition état ServiceRequest | $O(1)$ | Mise à jour champ |
| Génération Invoice | $O(|BR| + |R|)$ | Calcul avec règles |
| Recherche Portfolio | $O(1)$ | Accès direct |

### 4.2 Algorithmes de recherche et filtrage

#### 4.2.1 Recherche de providers par métier

```
Algorithme: FindProvidersByBusiness
Entrée: b ∈ B (business cible)
Sortie: Liste d'acteurs providers compatibles

1: Résultat ← ∅
2: Pour chaque po ∈ Po faire
3:     Si b ∈ po.businesses alors
4:         a ← po.actor
5:         Si a.role = PROVIDER ET a.isActive = true alors
6:             Résultat ← Résultat ∪ {a}
7:         Fin Si
8:     Fin Si
9: Fin Pour
10: Retourner Résultat
```

**Complexité** : $O(|Po|)$ dans le pire cas, $O(1)$ avec index sur businesses.

#### 4.2.2 Algorithme de matching avec score

```
Algorithme: MatchWithScore
Entrée: ac ∈ A_consumer, B_target ⊆ B, k ∈ N*
Sortie: Liste des k meilleurs providers

1: Candidats ← ∅
2: Pour chaque b ∈ B_target faire
3:     Providers ← FindProvidersByBusiness(b)
4:     Pour chaque ap ∈ Providers faire
5:         Si m(ac, ap, b) = 1 alors
6:             s ← score(ac, ap, b)
7:             Candidats ← Candidats ∪ {(ap, s)}
8:         Fin Si
9:     Fin Pour
10: Fin Pour
11: Candidats ← Trier(Candidats, comparateur=s)
12: Retourner Top_k(Candidats)
```

**Complexité** : $O(|B_{target}| \cdot (|Po| + |A_{provider}| \cdot \log |A_{provider}|))$

Avec index : $O(|B_{target}| \cdot (1 + n_b \cdot \log n_b))$ où $n_b = |A_{provider}(b)|$

#### 4.2.3 Recherche par filtres combinés

Pour une requête avec filtres $F = \{f_1, f_2, ..., f_n\}$ :

$$result(F) = \bigcap_{f \in F} applyFilter(f, Universe)$$

Optimisation par filtre le plus sélectif en premier :

$$selectivity(f) = \frac{|applyFilter(f, Universe)|}{|Universe|}$$

$$optimalOrder(F) = sort(F, selectivity) \quad \text{(ordre croissant)}$$

### 4.3 Stratégies d'optimisation

#### 4.3.1 Indexation

Index recommandés pour optimiser les requêtes fréquentes :

| Champ | Type d'index | Justification |
|-------|-------------|---------------|
| Person.email | Unique B-Tree | Recherche login, unicité |
| Actor.person_id | B-Tree | Jointure Person-Actor |
| Actor.role | B-Tree | Filtrage Consumer/Provider |
| ServiceRequest.consumer_id | B-Tree | Recherche demandes par consumer |
| ServiceRequest.provider_id | B-Tree | Recherche demandes par provider |
| ServiceRequest.status | B-Tree | Filtrage par état |
| Portfolio.actor_id | Unique B-Tree | Jointure 1:1 |
| Invoice.service_request_id | Unique B-Tree | Jointure 1:1 |
| BusinessRule.business_id | B-Tree | Recherche règles par métier |

#### 4.3.2 Pagination

Pour une liste de résultats de taille $N$ avec taille de page $p$ :

$$nbPages = \lceil \frac{N}{p} \rceil$$

$$page_k = \{e_i : (k-1) \cdot p < i \leq \min(k \cdot p, N)\}$$

Complexité : $O(p)$ par page au lieu de $O(N)$.

#### 4.3.3 Cache

Stratégie de cache pour les données fréquemment accédées :

$$cacheKey(entity, id) = entity + ":" + id$$

TTL (Time To Live) recommandés :
- Business : 1 heure (peu de changements)
- ServiceCatalogue : 30 minutes
- Portfolio : 15 minutes (changements fréquents)
- Person : 5 minutes (données sensibles)

---

## 5. INDICATEURS ET MÉTRIQUES

### 5.1 KPIs métier

#### 5.1.1 KPIs de volume

**Nombre total de demandes** sur une période $[t_1, t_2]$ :
$$N_{requests}(t_1, t_2) = |\{sr \in SR : sr.\text{requestedAt} \in [t_1, t_2]\}|$$

**Nombre de demandes finalisées** :
$$N_{fulfilled}(t_1, t_2) = |\{sr \in SR : sr.\text{fulfilledAt} \in [t_1, t_2]\}|$$

**Taux de conversion** :
$$\boxed{T_{conversion}(t_1, t_2) = \frac{N_{fulfilled}(t_1, t_2)}{N_{requests}(t_1, t_2)} \times 100\%}$$

#### 5.1.2 KPIs financiers

**Chiffre d'affaires** :
$$CA(t_1, t_2) = \sum_{\substack{i \in I : \\ i.\text{issuedAt} \in [t_1, t_2] \\ \land i.\text{status} = PAID}} i.\text{amount}$$

**Panier moyen** :
$$\boxed{PA(t_1, t_2) = \frac{CA(t_1, t_2)}{N_{paid}(t_1, t_2)}}$$

où $N_{paid}(t_1, t_2) = |\{i \in I : i.\text{paidAt} \in [t_1, t_2]\}|$

**Taux de paiement** :
$$T_{payment}(t_1, t_2) = \frac{N_{paid}(t_1, t_2)}{N_{invoiced}(t_1, t_2)} \times 100\%$$

#### 5.1.3 KPIs de performance

**Temps moyen de réalisation** :
$$\boxed{T_{avg\_completion} = \frac{1}{N_{fulfilled}} \sum_{\substack{sr \in SR : \\ \sigma_{sr} = FULFILLED}} (sr.\text{fulfilledAt} - sr.\text{requestedAt})}$$

**Temps moyen d'acceptation** :
$$T_{avg\_accept} = \frac{1}{N_{accepted}} \sum (t_{ACCEPTED} - t_{PENDING})$$

**Taux d'annulation** :
$$T_{cancel} = \frac{|\{sr \in SR : \sigma_{sr} = CANCELLED\}|}{|SR|} \times 100\%$$

#### 5.1.4 KPIs de qualité

**Taux de satisfaction** (à implémenter avec système de notation) :
$$Satisfaction = \frac{1}{N_{rated}} \sum_{sr \in SR_{rated}} rating(sr)$$

**NPS (Net Promoter Score)** :
$$NPS = \%_{promoters} - \%_{detractors}$$

### 5.2 Formules de calcul

#### 5.2.1 Agrégations par métier

Pour un business $b \in B$ donné :

$$CA_b(t_1, t_2) = \sum_{\substack{i \in I : \\ i.\text{serviceRequest}.\text{business} = b \\ \land i.\text{paidAt} \in [t_1, t_2]}} i.\text{amount}$$

**Répartition du CA par métier** :
$$\boxed{Share_b(t_1, t_2) = \frac{CA_b(t_1, t_2)}{CA(t_1, t_2)} \times 100\%}$$

#### 5.2.2 Agrégations par acteur

Pour un provider $a_p \in A_{provider}$ :

**Nombre de services réalisés** :
$$N_{services}(a_p, t_1, t_2) = |\{sr \in SR : sr.\text{provider} = a_p \land sr.\text{fulfilledAt} \in [t_1, t_2]\}|$$

**CA généré par un provider** :
$$CA_{provider}(a_p, t_1, t_2) = \sum_{\substack{i \in I : \\ i.\text{serviceRequest}.\text{provider} = a_p \\ \land i.\text{paidAt} \in [t_1, t_2]}} i.\text{amount}$$

**Panier moyen par provider** :
$$PA_{provider}(a_p) = \frac{CA_{provider}(a_p)}{N_{services}(a_p)}$$

#### 5.2.3 Métriques de croissance

**Croissance mois sur mois** :
$$\boxed{Growth_{MoM}(t) = \frac{CA(t) - CA(t-1)}{CA(t-1)} \times 100\%}$$

**Croissance annuelle** :
$$Growth_{YoY}(t) = \frac{CA(t) - CA(t-12)}{CA(t-12)} \times 100\%$$

où $CA(t)$ représente le chiffre d'affaires du mois $t$.

#### 5.2.4 Métriques d'activité

**Nombre d'acteurs actifs** :
$$A_{active}(t_1, t_2) = |\{a \in A : \exists \, sr \in SR, t \in [t_1, t_2] : a \in \{sr.\text{consumer}, sr.\text{provider}\}\}|$$

**Services par acteur** :
$$ServicesPerActor = \frac{|SR|}{|A_{active}|}$$

**Concentration du CA (indice de Gini)** :
$$G = \frac{\sum_{i=1}^{n} \sum_{j=1}^{n} |CA_i - CA_j|}{2n \sum_{i=1}^{n} CA_i}$$

où $CA_i$ est le chiffre d'affaires du provider $i$, $n = |A_{provider}|$.

#### 5.2.5 Tableau récapitulatif des formules

| Métrique | Formule | Interprétation |
|----------|---------|----------------|
| Taux de conversion | $\frac{N_{fulfilled}}{N_{requests}} \times 100$ | Efficacité du matching |
| Panier moyen | $\frac{CA}{N_{paid}}$ | Valeur moyenne transaction |
| Taux de paiement | $\frac{N_{paid}}{N_{invoiced}} \times 100$ | Recouvrement créances |
| Temps moyen réalisation | $\frac{\sum \Delta t}{N_{fulfilled}}$ | Efficacité opérationnelle |
| Part de marché métier | $\frac{CA_b}{CA} \times 100$ | Importance relative du métier |
| Croissance | $\frac{CA_t - CA_{t-1}}{CA_{t-1}} \times 100$ | Dynamique commerciale |

---

## ANNEXE : Notation et symboles

| Symbole | Signification |
|---------|---------------|
| $\forall$ | Pour tout (quantificateur universel) |
| $\exists$ | Il existe (quantificateur existentiel) |
| $\exists!$ | Il existe un unique |
| $\in$ | Appartient à |
| $\subseteq$ | Sous-ensemble de |
| $\cup$ | Union d'ensembles |
| $\cap$ | Intersection d'ensembles |
| $\setminus$ | Différence d'ensembles |
| $|A|$ | Cardinalité de l'ensemble $A$ |
| $2^A$ | Ensemble des parties de $A$ |
| $\mathbb{N}$ | Ensemble des entiers naturels |
| $\mathbb{N}^*$ | Entiers naturels non nuls |
| $\mathbb{R}$ | Ensemble des réels |
| $[a, b]$ | Intervalle fermé |
| $\to$ | Fonction / application |
| $\mapsto$ | Application définie par |
| $\implies$ | Implique |
| $\iff$ | Équivalence logique |
| $\mathbb{1}_{\text{cond}}$ | Fonction indicatrice |

---

*Document généré pour la plateforme BizCore - Version 1.0*
*Date : Mars 2026*
