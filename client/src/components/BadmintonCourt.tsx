import React, { useRef, useEffect, useState } from 'react';
import { Court, RallyPoint, ScorePoint } from '../types';
import './BadmintonCourt.css';

interface BadmintonCourtProps {
  court: Court;
  roomKey: string;
  onScoreUpdate: (courtId: number, player: 1 | 2, points: number, x?: number, y?: number, type?: 'normal' | 'net' | 'out') => void;
  onRallyPointAdd: (courtId: number, x: number, y: number) => void;
  onModeChange: (courtId: number, mode: 'scoring' | 'rally') => void;
  onCourtReset: (courtId: number) => void;
  onPlayerNameUpdate: (courtId: number, playerIndex: number, name: string) => void;
  onZoom: () => void;
  isZoomed: boolean;
}

const BadmintonCourt: React.FC<BadmintonCourtProps> = ({
  court,
  roomKey,
  onScoreUpdate,
  onRallyPointAdd,
  onModeChange,
  onCourtReset,
  onPlayerNameUpdate,
  onZoom,
  isZoomed
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMarkingScore, setIsMarkingScore] = useState(false);
  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showHelp, setShowHelp] = useState(false);


  // Dimensions du terrain (proportions réelles d'un terrain de badminton)
  // En mode zoom, on agrandit le terrain
  // Ratio officiel: 13.4m / 6.1m = ~2.2
  const BASE_COURT_HEIGHT = 200;
  const BASE_COURT_WIDTH = BASE_COURT_HEIGHT * (13.4 / 6.1); // ~440px
  const BASE_OUTER_MARGIN = 40;

  const zoomFactor = isZoomed ? 2.5 : 1;
  const COURT_WIDTH = BASE_COURT_WIDTH * zoomFactor;
  const COURT_HEIGHT = BASE_COURT_HEIGHT * zoomFactor;
  const OUTER_MARGIN = BASE_OUTER_MARGIN * zoomFactor;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dessiner le terrain
    drawCourt(ctx);

    // Dessiner les points d'échange ou de score
    if (court.mode === 'rally') {
      drawRallyPoints(ctx, court.rallyPoints);
      // En mode échange, dessiner aussi les points de score (points finaux)
      drawScorePoints(ctx, court.scorePoints);
    } else {
      drawScorePoints(ctx, court.scorePoints);
    }
  }, [court.rallyPoints, court.scorePoints, court.mode, isZoomed]);

  const drawCourt = (ctx: CanvasRenderingContext2D) => {
    const totalWidth = COURT_WIDTH + (OUTER_MARGIN * 2);
    const totalHeight = COURT_HEIGHT + (OUTER_MARGIN * 2);

    ctx.clearRect(0, 0, totalWidth, totalHeight);

    // 1. Fond global (Zone de sortie)
    ctx.fillStyle = '#0f172a'; // var(--background)
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    // Zone du terrain (décalée par la marge)
    const courtX = OUTER_MARGIN;
    const courtY = OUTER_MARGIN;

    // 2. Fond du terrain (Zone de jeu)
    ctx.fillStyle = '#1e293b'; // var(--surface)
    ctx.fillRect(courtX, courtY, COURT_WIDTH, COURT_HEIGHT);

    // Configuration des lignes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2 * zoomFactor;

    // Dimensions officielles (proportions)
    // Longueur totale: 13.40m
    // Largeur totale: 6.10m
    // Largeur simple: 5.18m (marge de 0.46m de chaque côté)
    // Ligne de service court: 1.98m du filet
    // Ligne de service long double: 0.76m du fond

    // Calcul des positions en pixels
    const singleSidelineMargin = (0.46 / 6.10) * COURT_HEIGHT;
    const shortServiceLineDist = (1.98 / (13.40 / 2)) * (COURT_WIDTH / 2);
    const doubleLongServiceLineDist = (0.76 / (13.40 / 2)) * (COURT_WIDTH / 2);

    // --- LIGNES EXTÉRIEURES (Pointillés autour du terrain) ---
    // Supprimé à la demande de l'utilisateur pour l'esthétique
    // ctx.save();
    // ctx.setLineDash([5 * zoomFactor, 5 * zoomFactor]);
    // ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    // ctx.strokeRect(courtX - 10 * zoomFactor, courtY - 10 * zoomFactor, COURT_WIDTH + 20 * zoomFactor, COURT_HEIGHT + 20 * zoomFactor);
    // ctx.restore();

    // --- CONTOUR DU TERRAIN ---
    ctx.strokeRect(courtX, courtY, COURT_WIDTH, COURT_HEIGHT);

    // --- LIGNES DE SIMPLE (Latérales) ---
    // Haut
    ctx.beginPath();
    ctx.moveTo(courtX, courtY + singleSidelineMargin);
    ctx.lineTo(courtX + COURT_WIDTH, courtY + singleSidelineMargin);
    ctx.stroke();

    // Bas
    ctx.beginPath();
    ctx.moveTo(courtX, courtY + COURT_HEIGHT - singleSidelineMargin);
    ctx.lineTo(courtX + COURT_WIDTH, courtY + COURT_HEIGHT - singleSidelineMargin);
    ctx.stroke();

    // --- FILET (Centre vertical avec poteaux) ---
    const netX = courtX + (COURT_WIDTH / 2);

    // Poteaux (cercles aux extrémités)
    const poleRadius = 3 * zoomFactor;
    ctx.fillStyle = '#fff';

    // Poteau haut
    ctx.beginPath();
    ctx.arc(netX, courtY - 10 * zoomFactor, poleRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Poteau bas
    ctx.beginPath();
    ctx.arc(netX, courtY + COURT_HEIGHT + 10 * zoomFactor, poleRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Ligne du filet (dépassant un peu)
    ctx.beginPath();
    ctx.moveTo(netX, courtY - 10 * zoomFactor);
    ctx.lineTo(netX, courtY + COURT_HEIGHT + 10 * zoomFactor);
    ctx.save();
    // ctx.setLineDash([5, 5]); // Le filet est souvent représenté par une ligne pleine fine ou pointillés
    ctx.lineWidth = 1 * zoomFactor;
    ctx.stroke();
    ctx.restore();

    // --- LIGNES DE SERVICE COURT (Verticales près du filet) ---
    // Gauche
    ctx.beginPath();
    ctx.moveTo(netX - shortServiceLineDist, courtY);
    ctx.lineTo(netX - shortServiceLineDist, courtY + COURT_HEIGHT);
    ctx.stroke();

    // Droite
    ctx.beginPath();
    ctx.moveTo(netX + shortServiceLineDist, courtY);
    ctx.lineTo(netX + shortServiceLineDist, courtY + COURT_HEIGHT);
    ctx.stroke();

    // --- LIGNES DE SERVICE LONG DOUBLE (Verticales près du fond) ---
    // Gauche
    ctx.beginPath();
    ctx.moveTo(courtX + doubleLongServiceLineDist, courtY);
    ctx.lineTo(courtX + doubleLongServiceLineDist, courtY + COURT_HEIGHT);
    ctx.stroke();

    // Droite
    ctx.beginPath();
    ctx.moveTo(courtX + COURT_WIDTH - doubleLongServiceLineDist, courtY);
    ctx.lineTo(courtX + COURT_WIDTH - doubleLongServiceLineDist, courtY + COURT_HEIGHT);
    ctx.stroke();

    // --- LIGNE MÉDIANE (Horizontale, divise les zones de service) ---
    // Gauche
    ctx.beginPath();
    ctx.moveTo(courtX, courtY + (COURT_HEIGHT / 2));
    ctx.lineTo(netX - shortServiceLineDist, courtY + (COURT_HEIGHT / 2));
    ctx.stroke();

    // Droite
    ctx.beginPath();
    ctx.moveTo(netX + shortServiceLineDist, courtY + (COURT_HEIGHT / 2));
    ctx.lineTo(courtX + COURT_WIDTH, courtY + (COURT_HEIGHT / 2));
    ctx.stroke();

    // Légende pour la zone extérieure
    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)'; // var(--text-secondary)
    ctx.font = `${12 * zoomFactor}px Inter, Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Zone de sortie', totalWidth / 2, 20 * zoomFactor);
  };

  const drawRallyPoints = (ctx: CanvasRenderingContext2D, points: RallyPoint[]) => {
    points.forEach((point, index) => {
      // Convertir les coordonnées de base en coordonnées zoomées
      const x = point.x * zoomFactor;
      const y = point.y * zoomFactor;

      // Point avec effet de lueur
      ctx.beginPath();
      ctx.arc(x, y, 4 * zoomFactor, 0, 2 * Math.PI);
      ctx.fillStyle = '#f43f5e'; // Rose/Rouge vibrant
      ctx.shadowColor = 'rgba(244, 63, 94, 0.6)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0; // Reset

      // Numéro du point
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${10 * zoomFactor}px Inter, Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Dessiner le texte un peu au-dessus pour ne pas chevaucher le point
      ctx.fillText((index + 1).toString(), x, y - 8 * zoomFactor);
    });

    // Lignes entre les points
    if (points.length > 1) {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)'; // Même couleur que les points mais transparent
      ctx.lineWidth = 1.5 * zoomFactor;
      ctx.beginPath();
      const firstPoint = points[0];
      ctx.moveTo(firstPoint.x * zoomFactor, firstPoint.y * zoomFactor);
      for (let i = 1; i < points.length; i++) {
        const p = points[i];
        ctx.lineTo(p.x * zoomFactor, p.y * zoomFactor);
      }
      ctx.stroke();
    }
  };

  const drawScorePoints = (ctx: CanvasRenderingContext2D, points: ScorePoint[]) => {
    points.forEach((point, index) => {
      // Convertir les coordonnées de base en coordonnées zoomées
      const x = point.x * zoomFactor;
      const y = point.y * zoomFactor;
      const size = 6 * zoomFactor;

      // Couleur de base selon le joueur
      const baseColor = point.player === 1 ? '#22c55e' : '#ef4444'; // Green / Red

      // Couleur et forme selon le type de point
      let fillColor = baseColor;
      let strokeColor = '#fff';
      let shape = 'circle';
      let isRallyPoint = false;

      if (point.x !== undefined && point.y !== undefined && court.mode === 'rally') {
        isRallyPoint = true;
      }

      switch (point.type) {
        case 'net':
          fillColor = '#fbbf24'; // Amber/Yellow
          strokeColor = '#fff';
          shape = 'square';
          break;
        case 'out':
          fillColor = '#94a3b8'; // Slate/Grey
          strokeColor = '#ef4444'; // Bordure rouge pour signaler la faute
          shape = 'triangle';
          break;
        default: // normal
          fillColor = baseColor;
          strokeColor = '#fff';
          shape = 'circle';
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2 * zoomFactor;

      // Effet de lueur pour les points
      ctx.shadowColor = fillColor;
      ctx.shadowBlur = 8;

      if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (shape === 'square') {
        ctx.beginPath();
        ctx.rect(x - size, y - size, size * 2, size * 2);
        ctx.fill();
        ctx.stroke();
      } else if (shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x + size, y + size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.shadowBlur = 0; // Reset

      if (isRallyPoint) {
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${14 * zoomFactor}px Inter, Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎯', x, y - 12 * zoomFactor);
      } else {
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${10 * zoomFactor}px Inter, Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Ombre portée pour le texte pour lisibilité
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText((index + 1).toString(), x, y);
        ctx.shadowBlur = 0;
      }
    });
  };

  // Fonction utilitaire pour obtenir les coordonnées depuis un événement (souris ou tactile)
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    // Pour les événements souris, utiliser offsetX/offsetY si disponibles (plus précis)
    if ('offsetX' in e && typeof e.offsetX === 'number' && 'offsetY' in e && typeof e.offsetY === 'number' && !('touches' in e)) {
      // offsetX/offsetY sont déjà relatifs au canvas, mais peuvent être affectés par le scaling CSS
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.offsetX * scaleX) / zoomFactor,
        y: (e.offsetY * scaleY) / zoomFactor
      };
    }

    // Pour les événements tactiles ou si offsetX/offsetY ne sont pas disponibles
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e && e.touches.length > 0) {
      // Événement tactile - utiliser changedTouches pour plus de précision
      const touch = e.touches[0] || (e.changedTouches && e.changedTouches[0]);
      if (!touch) return null;
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else if ('clientX' in e) {
      // Événement souris
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return null;
    }

    // Calculer le ratio entre la taille réelle du canvas et sa taille affichée
    // C'est crucial pour corriger le décalage sur mobile
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Obtenir les coordonnées relatives au canvas
    // Utiliser getBoundingClientRect() qui donne la position réelle à l'écran
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    // Normaliser en coordonnées de base (diviser par zoomFactor)
    return {
      x: canvasX / zoomFactor,
      y: canvasY / zoomFactor
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (court.mode !== 'rally') return;

    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    const { x, y } = coords;

    if (isMarkingScore) {
      // Mode marquage de point final
      // Déterminer quel joueur a marqué le point selon la position
      const courtX = BASE_OUTER_MARGIN;
      const courtY = BASE_OUTER_MARGIN;
      const centerX = courtX + (BASE_COURT_WIDTH / 2);
      const clickedPlayer = x < centerX ? 2 : 1;

      // Déterminer le type de point selon la position
      let pointType: 'normal' | 'out' = 'normal';
      if (x < courtX || x > courtX + BASE_COURT_WIDTH || y < courtY || y > courtY + BASE_COURT_HEIGHT) {
        pointType = 'out';
      }

      // Pour les points sortis, inverser la logique :
      // - Sortie à gauche = erreur du joueur B (2), donc point au joueur A (1)
      // - Sortie à droite = erreur du joueur A (1), donc point au joueur B (2)
      // Pour les points normaux, garder la logique normale
      const player = pointType === 'out'
        ? (clickedPlayer === 1 ? 2 : 1) // Inverser pour les sorties
        : clickedPlayer; // Normal pour les points intérieurs

      onScoreUpdate(court.id, player, 1, x, y, pointType);
      setIsMarkingScore(false); // Désactiver le mode marquage
    } else {
      // Mode normal = ajouter un point de trajectoire
      onRallyPointAdd(court.id, x, y);
    }
  };

  const handleCanvasTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Utiliser onTouchEnd uniquement pour éviter les doubles événements
    if (e.type === 'touchstart') {
      e.preventDefault(); // Empêcher le défilement
      return;
    }

    e.preventDefault(); // Empêcher le défilement
    if (court.mode !== 'rally') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Utiliser changedTouches qui est plus fiable pour les événements tactiles
    const touch = e.changedTouches[0] || e.touches[0];
    if (!touch) return;

    const rect = canvas.getBoundingClientRect();

    // Calculer le scaling - utiliser les dimensions CSS calculées
    // Sur mobile, le canvas peut être redimensionné par CSS
    // getBoundingClientRect() donne la taille affichée réelle
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Obtenir les coordonnées - clientX/clientY sont relatifs au viewport (comme getBoundingClientRect)
    const canvasX = (touch.clientX - rect.left) * scaleX;
    const canvasY = (touch.clientY - rect.top) * scaleY;

    // Normaliser en coordonnées de base
    const x = canvasX / zoomFactor;
    const y = canvasY / zoomFactor;

    if (isMarkingScore) {
      // Mode marquage de point final
      const courtX = BASE_OUTER_MARGIN;
      const courtY = BASE_OUTER_MARGIN;
      const centerX = courtX + (BASE_COURT_WIDTH / 2);
      const clickedPlayer = x < centerX ? 2 : 1;

      let pointType: 'normal' | 'out' = 'normal';
      if (x < courtX || x > courtX + BASE_COURT_WIDTH || y < courtY || y > courtY + BASE_COURT_HEIGHT) {
        pointType = 'out';
      }

      // Pour les points sortis, inverser la logique :
      // - Sortie à gauche = erreur du joueur B (2), donc point au joueur A (1)
      // - Sortie à droite = erreur du joueur A (1), donc point au joueur B (2)
      // Pour les points normaux, garder la logique normale
      const player = pointType === 'out'
        ? (clickedPlayer === 1 ? 2 : 1) // Inverser pour les sorties
        : clickedPlayer; // Normal pour les points intérieurs

      onScoreUpdate(court.id, player, 1, x, y, pointType);
      setIsMarkingScore(false);
    } else {
      // Mode normal = ajouter un point de trajectoire
      onRallyPointAdd(court.id, x, y);
    }
  };

  const handleScoreClick = (player: 1 | 2, type: 'normal' | 'net' | 'out' = 'normal') => {
    if (court.mode !== 'scoring') return;
    onScoreUpdate(court.id, player, 1, undefined, undefined, type);
  };

  const handleCourtClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (court.mode !== 'scoring') return;

    const coords = getCanvasCoordinates(e);
    if (!coords) return;

    const { x, y } = coords;

    // Déterminer le type de point selon la position
    let pointType: 'normal' | 'out' = 'normal';
    let player: 1 | 2;

    // Vérifier si le clic est dans la zone de sortie (en dehors du terrain)
    const courtX = BASE_OUTER_MARGIN;
    const courtY = BASE_OUTER_MARGIN;

    if (x < courtX || x > courtX + BASE_COURT_WIDTH || y < courtY || y > courtY + BASE_COURT_HEIGHT) {
      pointType = 'out';
    }

    // Déterminer quel joueur a marqué le point selon la position
    const centerX = courtX + (BASE_COURT_WIDTH / 2);
    const clickedPlayer = x < centerX ? 2 : 1;

    // Pour les points sortis, inverser la logique :
    // - Sortie à gauche = erreur du joueur B (2), donc point au joueur A (1)
    // - Sortie à droite = erreur du joueur A (1), donc point au joueur B (2)
    // Pour les points normaux, garder la logique normale
    if (pointType === 'out') {
      player = clickedPlayer === 1 ? 2 : 1; // Inverser
    } else {
      player = clickedPlayer; // Normal
    }

    onScoreUpdate(court.id, player, 1, x, y, pointType);
  };

  const handleCourtTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Utiliser onTouchEnd uniquement pour éviter les doubles événements
    if (e.type === 'touchstart') {
      e.preventDefault(); // Empêcher le défilement
      return;
    }

    e.preventDefault(); // Empêcher le défilement
    if (court.mode !== 'scoring') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Utiliser changedTouches qui est plus fiable pour les événements tactiles
    const touch = e.changedTouches[0] || e.touches[0];
    if (!touch) return;

    const rect = canvas.getBoundingClientRect();

    // Calculer le scaling - utiliser les dimensions CSS calculées
    // Sur mobile, le canvas peut être redimensionné par CSS
    // getBoundingClientRect() donne la taille affichée réelle
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Obtenir les coordonnées - clientX/clientY sont relatifs au viewport (comme getBoundingClientRect)
    const canvasX = (touch.clientX - rect.left) * scaleX;
    const canvasY = (touch.clientY - rect.top) * scaleY;

    // Normaliser en coordonnées de base
    const x = canvasX / zoomFactor;
    const y = canvasY / zoomFactor;

    let pointType: 'normal' | 'out' = 'normal';
    let player: 1 | 2;

    const courtX = BASE_OUTER_MARGIN;
    const courtY = BASE_OUTER_MARGIN;

    if (x < courtX || x > courtX + BASE_COURT_WIDTH || y < courtY || y > courtY + BASE_COURT_HEIGHT) {
      pointType = 'out';
    }

    const centerX = courtX + (BASE_COURT_WIDTH / 2);
    const clickedPlayer = x < centerX ? 2 : 1;

    // Pour les points sortis, inverser la logique :
    // - Sortie à gauche = erreur du joueur B (2), donc point au joueur A (1)
    // - Sortie à droite = erreur du joueur A (1), donc point au joueur B (2)
    // Pour les points normaux, garder la logique normale
    if (pointType === 'out') {
      player = clickedPlayer === 1 ? 2 : 1; // Inverser
    } else {
      player = clickedPlayer; // Normal
    }

    onScoreUpdate(court.id, player, 1, x, y, pointType);
  };

  return (
    <div className={`badminton-court ${isZoomed ? 'zoomed' : ''}`}>
      <div className="court-header">
        <h3>{court.name}</h3>
        <div className="header-actions">
          <div className="mode-selector">
            <button
              className={`mode-btn ${court.mode === 'scoring' ? 'active' : ''}`}
              onClick={() => onModeChange(court.id, 'scoring')}
            >
              📊 Score
            </button>
            <button
              className={`mode-btn ${court.mode === 'rally' ? 'active' : ''}`}
              onClick={() => onModeChange(court.id, 'rally')}
            >
              🎯 Échanges
            </button>
          </div>
          {!isZoomed && (
            <button
              className="zoom-btn"
              onClick={onZoom}
              title="Agrandir ce terrain"
            >
              🔍 Zoom
            </button>
          )}
          <button
            className={`help-btn ${showHelp ? 'active' : ''}`}
            onClick={() => setShowHelp(!showHelp)}
            title={showHelp ? "Masquer l'aide" : "Afficher l'aide"}
          >
            ?
          </button>
        </div>
      </div>

      <div className="court-content">
        {court.mode === 'scoring' ? (
          <div className="scoring-mode">
            <div className="players">
              <div className="player">
                {editingPlayerIndex === 0 ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => {
                      if (editingName.trim()) {
                        onPlayerNameUpdate(court.id, 0, editingName.trim());
                      }
                      setEditingPlayerIndex(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editingName.trim()) {
                          onPlayerNameUpdate(court.id, 0, editingName.trim());
                        }
                        setEditingPlayerIndex(null);
                      }
                    }}
                    autoFocus
                    className="player-name-input"
                  />
                ) : (
                  <div
                    className="player-name editable"
                    onClick={() => {
                      setEditingPlayerIndex(0);
                      setEditingName(court.players[0]);
                    }}
                    title="Cliquer pour modifier le nom"
                  >
                    {court.players[0]} ✏️
                  </div>
                )}
                <div className="score-display">
                  <div className="score-buttons">
                    <button
                      className="score-btn normal"
                      onClick={() => handleScoreClick(1, 'normal')}
                      title="Point normal"
                    >
                      +
                    </button>
                    <button
                      className="score-btn net"
                      onClick={() => handleScoreClick(1, 'net')}
                      title="Point via filet"
                    >
                      🕸️
                    </button>
                    <button
                      className="score-btn out"
                      onClick={() => handleScoreClick(1, 'out')}
                      title="Point sur sortie"
                    >
                      ➡️
                    </button>
                  </div>
                  <span className="score">{court.score.player1}</span>
                </div>
              </div>
              <div className="vs">VS</div>
              <div className="player">
                {editingPlayerIndex === 1 ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => {
                      if (editingName.trim()) {
                        onPlayerNameUpdate(court.id, 1, editingName.trim());
                      }
                      setEditingPlayerIndex(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editingName.trim()) {
                          onPlayerNameUpdate(court.id, 1, editingName.trim());
                        }
                        setEditingPlayerIndex(null);
                      }
                    }}
                    autoFocus
                    className="player-name-input"
                  />
                ) : (
                  <div
                    className="player-name editable"
                    onClick={() => {
                      setEditingPlayerIndex(1);
                      setEditingName(court.players[1]);
                    }}
                    title="Cliquer pour modifier le nom"
                  >
                    {court.players[1]} ✏️
                  </div>
                )}
                <div className="score-display">
                  <div className="score-buttons">
                    <button
                      className="score-btn normal"
                      onClick={() => handleScoreClick(2, 'normal')}
                      title="Point normal"
                    >
                      +
                    </button>
                    <button
                      className="score-btn net"
                      onClick={() => handleScoreClick(2, 'net')}
                      title="Point via filet"
                    >
                      🕸️
                    </button>
                    <button
                      className="score-btn out"
                      onClick={() => handleScoreClick(2, 'out')}
                      title="Point sur sortie"
                    >
                      ➡️
                    </button>
                  </div>
                  <span className="score">{court.score.player2}</span>
                </div>
              </div>
            </div>

            <div className="interactive-court">
              <canvas
                ref={canvasRef}
                width={COURT_WIDTH + (OUTER_MARGIN * 2)}
                height={COURT_HEIGHT + (OUTER_MARGIN * 2)}
                onClick={handleCourtClick}
                onTouchStart={handleCourtTouch}
                onTouchEnd={handleCourtTouch}
                className="court-canvas interactive"
              />
              {showHelp && (
                <>
                  <p className="court-instructions">
                    Cliquez sur le terrain pour marquer un point normal, ou dans la zone grise pour marquer une sortie (sortie à gauche = erreur de {court.players[1]} → point à {court.players[0]}, sortie à droite = erreur de {court.players[0]} → point à {court.players[1]})
                  </p>

                  <div className="point-legend">
                    <div className="legend-item">
                      <div className="legend-symbol normal">●</div>
                      <span>Point normal</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-symbol net">■</div>
                      <span>Point via filet</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-symbol out">▲</div>
                      <span>Point sur sortie</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="rally-mode">
            <div className="rally-controls">
              <div className="rally-score-display">
                <div className="rally-player">
                  <span className="player-name">{court.players[0]}</span>
                  <span className="score">{court.score.player1}</span>
                </div>
                <div className="vs">VS</div>
                <div className="rally-player">
                  <span className="player-name">{court.players[1]}</span>
                  <span className="score">{court.score.player2}</span>
                </div>
              </div>


              <div className="rally-marking-controls">
                <button
                  className={`mark-score-btn ${isMarkingScore ? 'active' : ''}`}
                  onClick={() => setIsMarkingScore(!isMarkingScore)}
                  title="Cliquer sur le terrain pour marquer le point final"
                >
                  {isMarkingScore ? '🎯 Annuler' : '🎯 Marquer le point'}
                </button>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={COURT_WIDTH + (OUTER_MARGIN * 2)}
              height={COURT_HEIGHT + (OUTER_MARGIN * 2)}
              onClick={handleCanvasClick}
              onTouchStart={handleCanvasTouch}
              onTouchEnd={handleCanvasTouch}
              className="court-canvas"
            />

            {showHelp && (
              <p className="rally-instructions">
                <strong>Instructions :</strong><br />
                • <strong>Clic sur le terrain</strong> : Ajouter un point de trajectoire<br />
                • <strong>🎯 Marquer le point</strong> : Cliquer sur le terrain pour marquer l'endroit exact du point final
              </p>
            )}
          </div>
        )}
      </div>

      <div className="court-actions">
        <button
          className="reset-btn"
          onClick={() => onCourtReset(court.id)}
        >
          🔄 Réinitialiser
        </button>
      </div>
    </div>
  );
};

export default BadmintonCourt;
