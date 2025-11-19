# Guide de Déploiement - Badminton Live Monitor

Ce guide vous explique comment déployer l'application Badminton Live Monitor pour qu'elle soit accessible depuis n'importe où sur Internet.

## Prérequis

- Node.js (version 14 ou supérieure)
- npm ou yarn
- Un compte sur une plateforme de déploiement (Heroku, Railway, Render, VPS, etc.)

## Options de Déploiement

### Option 1: Déploiement sur Heroku

1. **Installer Heroku CLI** et vous connecter :
```bash
heroku login
```

2. **Créer une nouvelle application Heroku** :
```bash
heroku create votre-app-badminton
```

3. **Configurer les variables d'environnement** :
```bash
heroku config:set NODE_ENV=production
```

4. **Déployer** :
```bash
git push heroku main
```

5. **Lancer les migrations** (si nécessaire) :
```bash
heroku run npm start
```

### Option 2: Déploiement sur Railway

1. **Connecter votre repository GitHub** à Railway
2. **Configurer les variables d'environnement** :
   - `NODE_ENV=production`
   - `PORT` sera automatiquement défini par Railway
3. **Déployer** : Railway détectera automatiquement le projet Node.js

### Option 3: Déploiement sur Render

1. **Créer un nouveau Web Service** sur Render
2. **Connecter votre repository GitHub**
3. **Configuration** :
   - Build Command: `npm run install-all && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`
4. **Variables d'environnement** :
   - `NODE_ENV=production`

### Option 4: Déploiement sur un VPS (Ubuntu/Debian)

1. **Installer Node.js et npm** :
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Cloner le repository** :
```bash
git clone votre-repo
cd Badminton
```

3. **Installer les dépendances** :
```bash
npm run install-all
```

4. **Construire le client** :
```bash
npm run build
```

5. **Installer PM2** (gestionnaire de processus) :
```bash
sudo npm install -g pm2
```

6. **Démarrer l'application** :
```bash
NODE_ENV=production pm2 start server.js --name badminton-monitor
pm2 save
pm2 startup
```

7. **Configurer Nginx** (reverse proxy) :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. **Configurer SSL avec Let's Encrypt** :
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
PORT=3001
NODE_ENV=production
```

Pour le client, créez un fichier `.env` dans le dossier `client/` :

```env
REACT_APP_API_URL=https://votre-domaine.com
```

**Note** : En production, si vous ne définissez pas `REACT_APP_API_URL`, l'application utilisera automatiquement `window.location.origin`, ce qui fonctionne si le client et le serveur sont sur le même domaine.

## Build et Déploiement

### Build de production

```bash
# Installer toutes les dépendances
npm run install-all

# Construire le client React
npm run build

# Démarrer le serveur en production
NODE_ENV=production npm start
```

### Structure de déploiement

```
Badminton/
├── server.js          # Serveur Express + Socket.IO
├── package.json
├── client/
│   ├── build/         # Fichiers compilés (générés par npm run build)
│   └── src/
└── .env               # Variables d'environnement
```

## Vérification du Déploiement

1. **Vérifier que le serveur démarre** :
   - Le serveur doit écouter sur le port configuré
   - Les logs doivent indiquer "Serveur démarré sur le port X"

2. **Tester l'API** :
   - Accéder à `https://votre-domaine.com/api/generate-key` (POST)
   - Vérifier que vous recevez une réponse JSON

3. **Tester l'application** :
   - Ouvrir `https://votre-domaine.com` dans un navigateur
   - Générer une nouvelle salle
   - Rejoindre une salle depuis un autre appareil

## Dépannage

### Problème : Les connexions Socket.IO ne fonctionnent pas

**Solution** : Vérifiez que :
- CORS est correctement configuré (déjà fait dans le code)
- Le reverse proxy (Nginx) transmet correctement les WebSockets
- Les ports sont correctement ouverts dans le firewall

### Problème : L'application ne charge pas

**Solution** :
- Vérifiez que `npm run build` a été exécuté
- Vérifiez que le dossier `client/build` existe
- Vérifiez les logs du serveur pour les erreurs

### Problème : Erreur 404 sur les routes

**Solution** : Assurez-vous que la route catch-all (`app.get('*', ...)`) est définie **après** toutes les routes API dans `server.js`.

## Sécurité

- ✅ CORS est configuré pour accepter toutes les origines (adaptez selon vos besoins)
- ✅ Les salles inactives sont automatiquement supprimées après 2 heures
- ⚠️ Pour la production, considérez :
  - Ajouter une authentification
  - Limiter le nombre de salles par IP
  - Ajouter un rate limiting
  - Utiliser HTTPS (SSL/TLS)

## Support

Pour toute question ou problème, consultez les logs de l'application ou contactez le support.


