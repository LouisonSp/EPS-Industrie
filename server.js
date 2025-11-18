const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Stockage des salles actives
const activeRooms = new Map();

// Configuration des terrains par défaut
const defaultCourts = [
  { id: 1, name: "Terrain 1", players: ["Joueur A", "Joueur B"] },
  { id: 2, name: "Terrain 2", players: ["Joueur C", "Joueur D"] },
  { id: 3, name: "Terrain 3", players: ["Joueur E", "Joueur F"] },
  { id: 4, name: "Terrain 4", players: ["Joueur G", "Joueur H"] }
];

// Génération d'une clé de salle
app.post('/api/generate-key', (req, res) => {
  const roomKey = uuidv4().substring(0, 8).toUpperCase();
  const roomData = {
    key: roomKey,
    courts: defaultCourts.map(court => ({
      ...court,
      score: { player1: 0, player2: 0 },
      rallyPoints: [],
      scorePoints: [],
      mode: 'scoring' // 'scoring' ou 'rally'
    })),
    createdAt: new Date(),
    lastActivity: new Date()
  };
  
  activeRooms.set(roomKey, roomData);
  
  res.json({ 
    success: true, 
    roomKey,
    message: `Clé de salle générée: ${roomKey}`
  });
});

// Validation d'une clé de salle
app.get('/api/validate-key/:key', (req, res) => {
  const { key } = req.params;
  const roomData = activeRooms.get(key);
  
  if (roomData) {
    roomData.lastActivity = new Date();
    res.json({ 
      success: true, 
      roomData: {
        key: roomData.key,
        courts: roomData.courts,
        createdAt: roomData.createdAt
      }
    });
  } else {
    res.json({ 
      success: false, 
      message: "Clé de salle invalide ou expirée" 
    });
  }
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('Nouveau client connecté:', socket.id);
  
  // Rejoindre une salle
  socket.on('join-room', (roomKey) => {
    const roomData = activeRooms.get(roomKey);
    if (roomData) {
      socket.join(roomKey);
      socket.emit('room-joined', roomData);
      socket.to(roomKey).emit('user-joined', { userId: socket.id });
      console.log(`Client ${socket.id} a rejoint la salle ${roomKey}`);
    } else {
      socket.emit('room-error', { message: 'Salle introuvable' });
    }
  });
  
  // Mise à jour du score
  socket.on('update-score', (data) => {
    const { roomKey, courtId, player, points, x, y } = data;
    const roomData = activeRooms.get(roomKey);
    
    if (roomData) {
      const court = roomData.courts.find(c => c.id === courtId);
      if (court) {
        if (player === 1) {
          court.score.player1 += points;
        } else {
          court.score.player2 += points;
        }
        
        // Ajouter le point de score si les coordonnées sont fournies
        if (x !== undefined && y !== undefined) {
          court.scorePoints.push({
            x,
            y,
            player,
            timestamp: Date.now(),
            type: data.type || 'normal'
          });
        }
        
        roomData.lastActivity = new Date();
        
        io.to(roomKey).emit('score-updated', {
          courtId,
          score: court.score,
          scorePoint: x !== undefined && y !== undefined ? { x, y, player, timestamp: Date.now(), type: data.type || 'normal' } : null
        });
      }
    }
  });
  
  // Ajout d'un point d'échange
  socket.on('add-rally-point', (data) => {
    const { roomKey, courtId, x, y, timestamp } = data;
    const roomData = activeRooms.get(roomKey);
    
    if (roomData) {
      const court = roomData.courts.find(c => c.id === courtId);
      if (court) {
        court.rallyPoints.push({ x, y, timestamp });
        roomData.lastActivity = new Date();
        
        io.to(roomKey).emit('rally-point-added', {
          courtId,
          point: { x, y, timestamp }
        });
      }
    }
  });
  
  // Changement de mode (score/échange)
  socket.on('change-mode', (data) => {
    const { roomKey, courtId, mode } = data;
    const roomData = activeRooms.get(roomKey);
    
    if (roomData) {
      const court = roomData.courts.find(c => c.id === courtId);
      if (court) {
        court.mode = mode;
        if (mode === 'scoring') {
          court.rallyPoints = []; // Effacer les points d'échange
        } else {
          court.scorePoints = []; // Effacer les points de score
        }
        roomData.lastActivity = new Date();
        
        io.to(roomKey).emit('mode-changed', {
          courtId,
          mode
        });
      }
    }
  });
  
  // Réinitialisation d'un terrain
  socket.on('reset-court', (data) => {
    const { roomKey, courtId } = data;
    const roomData = activeRooms.get(roomKey);
    
    if (roomData) {
      const court = roomData.courts.find(c => c.id === courtId);
      if (court) {
        court.score = { player1: 0, player2: 0 };
        court.rallyPoints = [];
        court.scorePoints = [];
        roomData.lastActivity = new Date();
        
        io.to(roomKey).emit('court-reset', { courtId });
      }
    }
  });

  // Ajout d'un nouveau terrain
  socket.on('add-court', (data) => {
    const { roomKey } = data;
    const roomData = activeRooms.get(roomKey);
    
    if (roomData) {
      // Trouver le prochain ID disponible
      const maxId = Math.max(...roomData.courts.map(c => c.id), 0);
      const newCourtId = maxId + 1;
      
      // Créer le nouveau terrain
      const newCourt = {
        id: newCourtId,
        name: `Terrain ${newCourtId}`,
        players: [`Joueur ${String.fromCharCode(64 + newCourtId * 2 - 1)}`, `Joueur ${String.fromCharCode(64 + newCourtId * 2)}`],
        score: { player1: 0, player2: 0 },
        rallyPoints: [],
        scorePoints: [],
        mode: 'scoring'
      };
      
      // Ajouter le terrain à la salle
      roomData.courts.push(newCourt);
      roomData.lastActivity = new Date();
      
      // Notifier tous les clients de la salle
      io.to(roomKey).emit('court-added', { court: newCourt });
      
      console.log(`Nouveau terrain ${newCourtId} ajouté à la salle ${roomKey}`);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

// Nettoyage des salles inactives (plus de 2 heures)
setInterval(() => {
  const now = new Date();
  for (const [key, roomData] of activeRooms.entries()) {
    const timeDiff = now - roomData.lastActivity;
    if (timeDiff > 2 * 60 * 60 * 1000) { // 2 heures
      activeRooms.delete(key);
      console.log(`Salle ${key} supprimée (inactive)`);
    }
  }
}, 30 * 60 * 1000); // Vérification toutes les 30 minutes

// Servir les fichiers statiques du client en production (après toutes les routes API)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
