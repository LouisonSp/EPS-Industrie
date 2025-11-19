# 🚀 Guide de Déploiement sur Render

## Étape 1 : Préparer votre code sur GitHub

### 1.1 Créer un compte GitHub (si vous n'en avez pas)
- Allez sur [github.com](https://github.com)
- Créez un compte gratuit

### 1.2 Créer un nouveau repository
1. Cliquez sur le bouton **"+"** en haut à droite → **"New repository"**
2. Nommez-le : `badminton-live-monitor` (ou un autre nom)
3. Cochez **"Public"** (gratuit) ou **"Private"** (si vous avez un compte payant)
4. **Ne cochez PAS** "Initialize with README" (votre projet existe déjà)
5. Cliquez sur **"Create repository"**

### 1.3 Pousser votre code sur GitHub

Ouvrez PowerShell dans le dossier de votre projet et exécutez :

```powershell
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Faire le premier commit
git commit -m "Initial commit - Badminton Live Monitor"

# Ajouter le repository GitHub (remplacez VOTRE_NOM par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/VOTRE_NOM/badminton-live-monitor.git

# Pousser le code
git branch -M main
git push -u origin main
```

**Note** : Si c'est la première fois, GitHub vous demandera de vous connecter.

---

## Étape 2 : Créer un compte Render

1. Allez sur [render.com](https://render.com)
2. Cliquez sur **"Get Started for Free"**
3. Inscrivez-vous avec votre email ou connectez-vous avec GitHub (plus simple)

---

## Étape 3 : Créer un nouveau Web Service

1. Dans le tableau de bord Render, cliquez sur **"New +"**
2. Sélectionnez **"Web Service"**
3. Cliquez sur **"Connect account"** pour connecter votre compte GitHub
4. Autorisez Render à accéder à vos repositories

---

## Étape 4 : Configurer le Web Service

### 4.1 Sélectionner le repository
- Dans la liste, trouvez et sélectionnez `badminton-live-monitor` (ou le nom que vous avez donné)

### 4.2 Configuration du service

Remplissez les champs suivants :

- **Name** : `badminton-live-monitor` (ou un nom de votre choix)
- **Region** : Choisissez la région la plus proche (ex: `Frankfurt` pour l'Europe)
- **Branch** : `main` (ou `master` selon votre repository)
- **Root Directory** : Laissez vide (le projet est à la racine)
- **Runtime** : `Node`
- **Build Command** : 
  ```
  npm run install-all && npm run build
  ```
- **Start Command** : 
  ```
  npm start
  ```

### 4.3 Variables d'environnement

Cliquez sur **"Advanced"** et ajoutez cette variable :

- **Key** : `NODE_ENV`
- **Value** : `production`

Cliquez sur **"Add Environment Variable"**

### 4.4 Plan

- Sélectionnez **"Free"** pour commencer (gratuit mais avec limitations)
- Ou **"Starter"** ($7/mois) pour plus de ressources

---

## Étape 5 : Déployer

1. Cliquez sur **"Create Web Service"**
2. Render va automatiquement :
   - Cloner votre code
   - Installer les dépendances
   - Construire l'application
   - Démarrer le serveur

3. Attendez 5-10 minutes (première fois peut prendre plus de temps)

4. Vous verrez les logs en temps réel dans l'onglet **"Logs"**

---

## Étape 6 : Vérifier le déploiement

1. Une fois le déploiement terminé, vous verrez un message **"Your service is live"**
2. Cliquez sur l'URL fournie (ex: `https://badminton-live-monitor.onrender.com`)
3. Testez l'application :
   - Générer une nouvelle salle
   - Rejoindre une salle depuis un autre appareil

---

## ⚠️ Points importants

### Le plan gratuit Render
- ✅ Gratuit
- ⚠️ L'application s'endort après 15 minutes d'inactivité
- ⚠️ Le premier démarrage après l'endormissement peut prendre 30-60 secondes
- ⚠️ Limite de bande passante

**Solution** : Pour éviter l'endormissement, vous pouvez :
- Utiliser un service comme [UptimeRobot](https://uptimerobot.com) pour "réveiller" l'app toutes les 5 minutes
- Ou passer au plan Starter ($7/mois) qui ne s'endort jamais

### URL personnalisée

Render vous donne une URL comme : `https://badminton-live-monitor.onrender.com`

Vous pouvez :
- La garder telle quelle
- Ou connecter votre propre domaine (nécessite le plan Starter)

---

## 🔄 Mises à jour futures

Chaque fois que vous poussez du code sur GitHub :

```powershell
git add .
git commit -m "Description de vos modifications"
git push
```

Render détectera automatiquement les changements et redéploiera l'application !

---

## 🐛 Dépannage

### L'application ne démarre pas
- Vérifiez les logs dans l'onglet **"Logs"** de Render
- Vérifiez que `NODE_ENV=production` est bien défini
- Vérifiez que les commandes de build et start sont correctes

### Erreur de build
- Vérifiez que toutes les dépendances sont dans `package.json`
- Vérifiez les logs pour voir quelle étape échoue

### L'application s'endort
- C'est normal avec le plan gratuit
- Attendez 30-60 secondes au premier accès après l'endormissement
- Ou passez au plan Starter

---

## ✅ Checklist de déploiement

- [ ] Code poussé sur GitHub
- [ ] Compte Render créé
- [ ] Web Service créé
- [ ] Build Command configuré : `npm run install-all && npm run build`
- [ ] Start Command configuré : `npm start`
- [ ] Variable `NODE_ENV=production` ajoutée
- [ ] Déploiement réussi
- [ ] Application testée et fonctionnelle

---

## 🎉 Félicitations !

Votre application est maintenant accessible depuis n'importe où sur Internet !

 Partagez l'URL avec vos utilisateurs et ils pourront accéder à l'application même s'ils ne sont pas sur le même réseau WiFi.


