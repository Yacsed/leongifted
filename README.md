# LeonGifted

Web app de practice pour entraîner un enfant de 2nd grade sur des compétences souvent évaluées dans les parcours Gifted (raisonnement verbal, logique non verbale, quantitatif, mémoire de travail).

## 1) Ce que contient l'app

- Interface simple enfant, en anglais US
- Sessions de 10/15/20/30 questions
- Mode `Focus Pack (Test Blanc)` avec 5 packs prédéfinis
- 4 familles d'exercices:
  - Nonverbal Patterns
  - Verbal Reasoning
  - Quantitative Reasoning
  - Working Memory
- Correction immédiate + explication courte
- Stats sauvegardées dans le navigateur (localStorage)
- Messages de motivation soccer pendant la session
- Verrou parental par PIN (PIN hashé en local dans le navigateur)
- Mobile-friendly (iPhone/Safari)

## Focus Packs (test blanc)

- Pack 1: Balanced Warmup
- Pack 2: Verbal + Nonverbal
- Pack 3: Nonverbal Intensive
- Pack 4: Verbal Intensive
- Pack 5: Final Simulation

Chaque pack donne un `practice estimate` à la fin (fort / compétitif / proche / pas encore prêt), mais ce n'est **pas** une décision officielle d'admission.

## 2) Lancer en local (sans être développeur)

Option la plus simple:
- Double-clique sur `index.html`
- L'app s'ouvre dans ton navigateur

Si ton navigateur bloque certains scripts locaux:
- Installe VS Code
- Installe l'extension "Live Server"
- Ouvre ce dossier et clique "Go Live"

## 3) Mettre sur GitHub (pas à pas)

1. Crée un repo GitHub nommé `leongifted`
2. Dans ce dossier, ouvre Terminal et lance:

```bash
git init
git add .
git commit -m "Initial LeonGifted app"
git branch -M main
git remote add origin https://github.com/TON-USERNAME/leongifted.git
git push -u origin main
```

3. Sur GitHub, va dans `Settings` > `Pages`
4. Dans `Build and deployment`:
- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`
5. Clique `Save`
6. Attends 1-3 minutes
7. Ton lien sera:
- `https://TON-USERNAME.github.io/leongifted/`

## 4) Mettre à jour plus tard

À chaque changement de fichiers:

```bash
git add .
git commit -m "Update exercises"
git push
```

GitHub Pages se met à jour automatiquement.

## 5) Routine d'entraînement conseillée (mars 2026)

- 4 à 5 sessions par semaine
- 10 à 20 minutes par session
- Alterner les types de questions
- Toujours faire expliquer la réponse à voix haute
- Finir sur une note positive (pas de session trop longue)

## 6) Important

- Cette app est une préparation générale, pas le test officiel de l'école.
- Le PIN protège l'accès de manière pratique (usage familial), mais ce n'est pas une sécurité serveur enterprise.
- Si besoin, je peux ajouter ensuite:
  - mode "timed" (chronométré)
  - niveau de difficulté progressif
  - tableau parent plus détaillé
  - export PDF des résultats
