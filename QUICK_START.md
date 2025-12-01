# 🚀 Démarrage Rapide - Déploiement

## Pour déployer rapidement sur Heroku

```bash
# 1. Installer Heroku CLI
# Télécharger depuis https://devcenter.heroku.com/articles/heroku-cli

# 2. Se connecter
heroku login

# 3. Créer l'application
heroku create votre-app-badminton

# 4. Configurer l'environnement
heroku config:set NODE_ENV=production

# 5. Déployer
git push heroku main

# 6. Ouvrir l'application
heroku open
```

## Pour déployer sur Railway

1. Allez sur [railway.app](https://railway.app)
2. Créez un nouveau projet depuis GitHub
3. Sélectionnez votre repository
4. Railway détectera automatiquement Node.js
5. Ajoutez la variable d'environnement : `NODE_ENV=production`
6. Déployez !

## Pour déployer sur Render

1. Allez sur [render.com](https://render.com)
2. Créez un nouveau "Web Service"
3. Connectez votre repository GitHub
4. Configuration :
   - **Build Command** : `npm run install-all && npm run build`
   - **Start Command** : `npm start`
   - **Environment** : `Node`
5. Ajoutez la variable : `NODE_ENV=production`
6. Déployez !

## Build local pour tester

```bash
# Installer les dépendances
npm run install-all

# Construire le client
npm run build

# Démarrer en mode production
NODE_ENV=production npm start
```

L'application sera accessible sur `http://localhost:3001`

## Important

- ✅ L'application fonctionne automatiquement avec n'importe quelle URL
- ✅ Pas besoin de configurer l'URL du serveur (détection automatique)
- ✅ Fonctionne sur le même réseau WiFi ou depuis Internet
- ✅ Socket.IO est configuré pour fonctionner en production

## Vérification

Après le déploiement, testez :
1. Ouvrir l'URL de votre application
2. Générer une nouvelle salle
3. Ouvrir la même URL sur un autre appareil (même réseau ou Internet)
4. Rejoindre la salle avec la même clé
5. Vérifier que les modifications sont synchronisées en temps réel



