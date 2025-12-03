import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Court, RoomData, SocketEvents } from '../types';
import BadmintonCourt from './BadmintonCourt';
import { SOCKET_URL } from '../config';
import './LiveMonitor.css';

interface LiveMonitorProps {
  roomKey: string;
  onBack: () => void;
}

const LiveMonitor: React.FC<LiveMonitorProps> = ({ roomKey, onBack }) => {
  const [socket, setSocket] = useState<Socket<SocketEvents> | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [zoomedCourtId, setZoomedCourtId] = useState<number | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connecté au serveur');
      setIsConnected(true);
      newSocket.emit('join-room', roomKey);
    });

    newSocket.on('disconnect', () => {
      console.log('Déconnecté du serveur');
      setIsConnected(false);
    });

    newSocket.on('room-joined', (data: RoomData) => {
      console.log('Rejoint la salle:', data);
      setRoomData(data);
    });

    newSocket.on('score-updated', (data) => {
      setRoomData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          courts: prev.courts.map(court =>
            court.id === data.courtId
              ? {
                ...court,
                score: data.score,
                scorePoints: data.scorePoint
                  ? [...court.scorePoints, data.scorePoint]
                  : court.scorePoints
              }
              : court
          )
        };
      });
    });

    newSocket.on('player-name-updated', (data) => {
      setRoomData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          courts: prev.courts.map(court => {
            if (court.id === data.courtId) {
              const newPlayers = [...court.players];
              newPlayers[data.playerIndex] = data.name;
              return { ...court, players: newPlayers };
            }
            return court;
          })
        };
      });
    });

    newSocket.on('rally-point-added', (data) => {
      setRoomData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          courts: prev.courts.map(court =>
            court.id === data.courtId
              ? { ...court, rallyPoints: [...court.rallyPoints, data.point] }
              : court
          )
        };
      });
    });

    newSocket.on('mode-changed', (data) => {
      setRoomData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          courts: prev.courts.map(court =>
            court.id === data.courtId
              ? { ...court, mode: data.mode }
              : court
          )
        };
      });
    });

    newSocket.on('court-reset', (data) => {
      setRoomData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          courts: prev.courts.map(court =>
            court.id === data.courtId
              ? {
                ...court,
                score: { player1: 0, player2: 0 },
                rallyPoints: [],
                scorePoints: []
              }
              : court
          )
        };
      });
    });

    newSocket.on('court-added', (data) => {
      setRoomData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          courts: [...prev.courts, data.court]
        };
      });
    });

    newSocket.on('user-joined', () => {
      setConnectedUsers(prev => prev + 1);
    });

    newSocket.on('room-error', (data) => {
      console.error('Erreur de salle:', data.message);
      alert(data.message);
    });

    return () => {
      newSocket.close();
    };
  }, [roomKey]);

  const handleScoreUpdate = (courtId: number, player: 1 | 2, points: number, x?: number, y?: number, type?: 'normal' | 'net' | 'out') => {
    if (socket) {
      socket.emit('update-score', { roomKey, courtId, player, points, x, y, type });
    }
  };

  const handleRallyPointAdd = (courtId: number, x: number, y: number) => {
    if (socket) {
      socket.emit('add-rally-point', {
        roomKey,
        courtId,
        x,
        y,
        timestamp: Date.now()
      });
    }
  };

  const handleModeChange = (courtId: number, mode: 'scoring' | 'rally') => {
    if (socket) {
      socket.emit('change-mode', { roomKey, courtId, mode });
    }
  };

  const handleCourtReset = (courtId: number) => {
    if (socket) {
      socket.emit('reset-court', { roomKey, courtId });
    }
  };

  const handleAddCourt = () => {
    if (socket) {
      socket.emit('add-court', { roomKey });
    }
  };

  const handlePlayerNameUpdate = (courtId: number, playerIndex: number, name: string) => {
    if (socket) {
      socket.emit('update-player-name', { roomKey, courtId, playerIndex, name });
    }
  };

  if (!roomData) {
    return (
      <div className="loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>Connexion à la salle...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-monitor">
      <div className="monitor-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            ← Retour
          </button>
          <h1>🏸 Surveillance en Direct</h1>
        </div>
        <div className="header-right">
          {!zoomedCourtId && (
            <button className="add-court-btn" onClick={handleAddCourt}>
              ➕ Ajouter un terrain
            </button>
          )}
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </div>
          <div className="room-info">
            Salle: <strong>{roomKey}</strong>
          </div>
        </div>
      </div>

      {zoomedCourtId ? (
        <div className="zoomed-court-container">
          <div className="zoom-header">
            <button className="zoom-out-btn" onClick={() => setZoomedCourtId(null)}>
              ← Retour à la vue d'ensemble
            </button>
          </div>
          <div className="zoomed-court-wrapper">
            {roomData.courts
              .filter(court => court.id === zoomedCourtId)
              .map(court => (
                <BadmintonCourt
                  key={court.id}
                  court={court}
                  roomKey={roomKey}
                  onScoreUpdate={handleScoreUpdate}
                  onRallyPointAdd={handleRallyPointAdd}
                  onModeChange={handleModeChange}
                  onCourtReset={handleCourtReset}
                  onPlayerNameUpdate={handlePlayerNameUpdate}
                  onZoom={() => setZoomedCourtId(null)}
                  isZoomed={true}
                />
              ))}
          </div>
        </div>
      ) : (
        <div className="courts-grid">
          {roomData.courts.map(court => (
            <BadmintonCourt
              key={court.id}
              court={court}
              roomKey={roomKey}
              onScoreUpdate={handleScoreUpdate}
              onRallyPointAdd={handleRallyPointAdd}
              onModeChange={handleModeChange}
              onCourtReset={handleCourtReset}
              onPlayerNameUpdate={handlePlayerNameUpdate}
              onZoom={() => setZoomedCourtId(court.id)}
              isZoomed={false}
            />
          ))}
        </div>
      )}

      {!zoomedCourtId && (
        <div className="monitor-footer">
          <p>
            💡 <strong>Instructions:</strong>
            Cliquez sur "Score" pour marquer les points, ou "Échanges" pour tracer les trajectoires du volant.
            Tous les utilisateurs connectés voient les modifications en temps réel.
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveMonitor;
