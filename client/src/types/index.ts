export interface Court {
  id: number;
  name: string;
  players: string[];
  score: {
    player1: number;
    player2: number;
  };
  rallyPoints: RallyPoint[];
  scorePoints: ScorePoint[];
  mode: 'scoring' | 'rally';
}

export interface ScorePoint {
  x: number;
  y: number;
  player: 1 | 2;
  timestamp: number;
  type: 'normal' | 'net' | 'out';
}

export interface RallyPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface RoomData {
  key: string;
  courts: Court[];
  createdAt: Date;
}

export interface SocketEvents {
  'join-room': (roomKey: string) => void;
  'update-player-name': (data: { roomKey: string; courtId: number; playerIndex: number; name: string }) => void;
  'add-rally-point': (data: { roomKey: string; courtId: number; x: number; y: number; timestamp: number }) => void;
  'change-mode': (data: { roomKey: string; courtId: number; mode: 'scoring' | 'rally' }) => void;
  'reset-court': (data: { roomKey: string; courtId: number }) => void;
  'add-court': (data: { roomKey: string }) => void;
  'room-joined': (roomData: RoomData) => void;
  'score-updated': (data: { courtId: number; score: { player1: number; player2: number }; scorePoint?: ScorePoint }) => void;
  'player-name-updated': (data: { courtId: number; playerIndex: number; name: string }) => void;
  'rally-point-added': (data: { courtId: number; point: RallyPoint }) => void;
  'mode-changed': (data: { courtId: number; mode: 'scoring' | 'rally' }) => void;
  'court-reset': (data: { courtId: number }) => void;
  'court-added': (data: { court: Court }) => void;
  'user-joined': (data: { userId: string }) => void;
  'room-error': (data: { message: string }) => void;
}
