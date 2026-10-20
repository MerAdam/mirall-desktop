# Adam | Mediterrània — Application Desktop

## C'est quoi

Une appli desktop (Windows/Mac/Linux) qui ouvre ton dashboard dans une vraie fenêtre native, avec icône, menu, et support de plusieurs comptes en même temps. Elle ne fait tourner aucun serveur — c'est juste une "vitre" vers ton dashboard hébergé sur Replit (qui doit donc rester en ligne, comme aujourd'hui).

## Avant de distribuer à l'équipe — à faire une fois

1. Installe Node.js sur ton PC si ce n'est pas déjà fait (https://nodejs.org)
2. Ouvre un terminal dans ce dossier (`adam-desktop/`)
3. Installe les dépendances :
   ```
   npm install
   ```
4. Teste que ça marche :
   ```
   npm start
   ```
   Une fenêtre doit s'ouvrir avec ton dashboard dedans.

## Construire les fichiers à distribuer (installeurs)

- **Pour Windows** (depuis Windows, ou Mac/Linux avec Wine installé) :
  ```
  npm run build:win
  ```
- **Pour Mac** (doit être lancé depuis un Mac) :
  ```
  npm run build:mac
  ```
- **Pour Linux** :
  ```
  npm run build:linux
  ```

Les fichiers installeurs apparaissent dans le dossier `dist/`. C'est ÇA que tu distribues à ton équipe (un `.exe` pour Windows, un `.dmg` pour Mac, etc.) — pas le dossier de code source.

## Fonctionnalités

- **Nouvelle fenêtre / nouveau compte** : `Ctrl+N` (ou menu "Adam | Mediterrània" → "Nouvelle fenêtre") ouvre une fenêtre totalement indépendante, avec sa propre session de connexion. Tu peux donc être connecté avec 2 (ou plus) comptes staff différents en même temps, chacun dans sa fenêtre.
- **Icône dans la barre des tâches / dock**, avec menu rapide (clic droit sur l'icône en bas à droite sur Windows, ou dans la barre du haut sur Mac)
- **Notifications natives** : si le dashboard déclenche des notifications navigateur classiques, elles apparaîtront automatiquement comme de vraies notifications Windows/Mac — aucune config supplémentaire nécessaire de notre côté.

## Si tu changes l'URL du Repl plus tard

Ouvre `main.js`, modifie la ligne :
```js
const DASHBOARD_URL = "https://...";
```
puis refais `npm run build:win` (ou mac/linux) pour régénérer les installeurs avec la nouvelle URL.

## Personnaliser l'icône

J'ai mis une icône provisoire (`build/icon.png`, thème navy/or). Remplace ce fichier par ta vraie icône (512x512px, fond transparent ou plein, format PNG) quand tu en as une — pas besoin de changer le code, le nom de fichier reste le même.
