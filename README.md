# 🏸 Badminton Live Monitor

Application de surveillance en direct pour les cours de badminton destinée aux professeurs d'EPS et leurs élèves.

## 🎯 Fonctionnalités

- **Génération de clés de salle** : Le professeur peut créer une salle de surveillance avec une clé unique
- **Marquage des points en temps réel** : Suivi des scores sur chaque terrain
- **Traçage des échanges** : Visualisation des trajectoires du volant sur le terrain
- **Surveillance multi-terrains** : Jusqu'à 4 terrains simultanés
- **Synchronisation temps réel** : Tous les appareils connectés voient les modifications instantanément
- **Interface simple** : Conçue pour une utilisation facile en cours

## 🚀 Installation

### Prérequis
- Node.js (version 14 ou supérieure)
- npm

### Installation des dépendances

```bash
# Installation des dépendances du serveur
npm install

# Installation des dépendances du client
cd client
npm install
cd ..
```

## 🏃‍♂️ Démarrage

### Mode développement
```bash
# Démarrer le serveur et le client en parallèle
npm run dev
```

### Mode production
```bash
# Démarrer le serveur
npm start

# Dans un autre terminal, construire et servir le client
npm run build
```

## 📱 Utilisation

### Pour le professeur
1. Ouvrir l'application
2. Cliquer sur "Professeur" → "Créer une salle de surveillance"
3. Une clé de salle sera générée (ex: A1B2C3D4)
4. Partager cette clé avec les élèves
5. Utiliser l'interface pour marquer les points ou tracer les échanges

### Pour les élèves
1. Ouvrir l'application
2. Cliquer sur "Élève" → "Rejoindre une salle existante"
3. Entrer la clé fournie par le professeur
4. Observer les terrains en temps réel

## 🎮 Modes de surveillance

### Mode Score
- Cliquer sur les boutons "+" pour marquer les points
- Le score est mis à jour en temps réel pour tous les utilisateurs

### Mode Échanges
- Cliquer sur le terrain pour marquer les points d'impact du volant
- Les trajectoires sont tracées automatiquement
- Numérotation des points pour suivre la séquence

## 🛠️ Architecture technique

- **Backend** : Node.js + Express + Socket.IO
- **Frontend** : React + TypeScript
- **Communication temps réel** : WebSockets via Socket.IO
- **Interface** : Canvas HTML5 pour le traçage des échanges

## 📁 Structure du projet

```
badminton-live-monitor/
├── server.js              # Serveur principal
├── package.json           # Dépendances du serveur
├── client/                # Application React
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── types/         # Types TypeScript
│   │   └── App.tsx        # Composant principal
│   └── package.json       # Dépendances du client
└── README.md
```

## 🔧 Configuration

Le serveur fonctionne par défaut sur le port 3001. Pour changer le port :

```bash
PORT=3002 npm start
```

## 🎨 Personnalisation

### Modifier le nombre de terrains
Éditer le fichier `server.js` et modifier le tableau `defaultCourts`.

### Changer les noms des joueurs
Modifier les propriétés `players` dans `defaultCourts`.

### Personnaliser l'apparence
Les styles CSS sont dans les fichiers `.css` de chaque composant.

## 🐛 Dépannage

### Problème de connexion
- Vérifier que le serveur est démarré
- S'assurer que le port 3001 n'est pas utilisé par une autre application
- Vérifier la connexion réseau

### Clé de salle invalide
- Les clés expirent après 2 heures d'inactivité
- Générer une nouvelle clé si nécessaire

## 📝 Licence

MIT License - Libre d'utilisation pour les établissements éducatifs.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à proposer des améliorations ou à signaler des bugs.

