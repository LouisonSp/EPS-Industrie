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
  onZoom,
  isZoomed
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMarkingScore, setIsMarkingScore] = useState(false);

  // Dimensions du terrain (proportions réelles d'un terrain de badminton)
  // En mode zoom, on agrandit le terrain
  const BASE_COURT_WIDTH = 400;
  const BASE_COURT_HEIGHT = 200;
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
  }, [court.rallyPoints, court.scorePoints, court.mode]);

  const drawCourt = (ctx: CanvasRenderingContext2D) => {
    const totalWidth = COURT_WIDTH + (OUTER_MARGIN * 2);
    const totalHeight = COURT_HEIGHT + (OUTER_MARGIN * 2);
    
    ctx.clearRect(0, 0, totalWidth, totalHeight);
    
    // Couleur de fond de la zone extérieure
    ctx.fillStyle = '#e8f4f8';
    ctx.fillRect(0, 0, totalWidth, totalHeight);
    
    // Zone du terrain (décalée par la marge)
    const courtX = OUTER_MARGIN;
    const courtY = OUTER_MARGIN;
    
    // Couleur de fond du terrain
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(courtX, courtY, COURT_WIDTH, COURT_HEIGHT);
    
    // Bordures du terrain
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(courtX, courtY, COURT_WIDTH, COURT_HEIGHT);
    
    // Ligne centrale
    ctx.beginPath();
    ctx.moveTo(courtX + COURT_WIDTH / 2, courtY);
    ctx.lineTo(courtX + COURT_WIDTH / 2, courtY + COURT_HEIGHT);
    ctx.stroke();
    
    // Zone de service (lignes horizontales)
    const serviceLineY = COURT_HEIGHT * 0.25;
    ctx.beginPath();
    ctx.moveTo(courtX, courtY + serviceLineY);
    ctx.lineTo(courtX + COURT_WIDTH, courtY + serviceLineY);
    ctx.moveTo(courtX, courtY + COURT_HEIGHT - serviceLineY);
    ctx.lineTo(courtX + COURT_WIDTH, courtY + COURT_HEIGHT - serviceLineY);
    ctx.stroke();
    
    // Zone de service (lignes verticales)
    const serviceLineX = COURT_WIDTH * 0.25;
    ctx.beginPath();
    ctx.moveTo(courtX + serviceLineX, courtY);
    ctx.lineTo(courtX + serviceLineX, courtY + serviceLineY);
    ctx.moveTo(courtX + COURT_WIDTH - serviceLineX, courtY);
    ctx.lineTo(courtX + COURT_WIDTH - serviceLineX, courtY + serviceLineY);
    ctx.moveTo(courtX + serviceLineX, courtY + COURT_HEIGHT - serviceLineY);
    ctx.lineTo(courtX + serviceLineX, courtY + COURT_HEIGHT);
    ctx.moveTo(courtX + COURT_WIDTH - serviceLineX, courtY + COURT_HEIGHT - serviceLineY);
    ctx.lineTo(courtX + COURT_WIDTH - serviceLineX, courtY + COURT_HEIGHT);
    ctx.stroke();
    
    // Légende pour la zone extérieure
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Zone de sortie', totalWidth / 2, 15);
  };

  const drawRallyPoints = (ctx: CanvasRenderingContext2D, points: RallyPoint[]) => {
    ctx.fillStyle = '#ff4444';
    points.forEach((point, index) => {
      // Convertir les coordonnées de base en coordonnées zoomées
      const x = point.x * zoomFactor;
      const y = point.y * zoomFactor;
      
      ctx.beginPath();
      ctx.arc(x, y, 4 * zoomFactor, 0, 2 * Math.PI);
      ctx.fill();
      
      // Numéro du point
      ctx.fillStyle = '#fff';
      ctx.font = `${10 * zoomFactor}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), x, y + 3 * zoomFactor);
      ctx.fillStyle = '#ff4444';
    });
    
    // Lignes entre les points (grises et fines)
    if (points.length > 1) {
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 1 * zoomFactor;
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
      const baseColor = point.player === 1 ? '#28a745' : '#dc3545';
      
      // Couleur et forme selon le type de point
      let fillColor = baseColor;
      let strokeColor = '#fff';
      let shape = 'circle';
      let isRallyPoint = false; // Pour distinguer les points marqués en mode échange
      
      // Vérifier si c'est un point marqué en mode échange (avec coordonnées)
      if (point.x !== undefined && point.y !== undefined && court.mode === 'rally') {
        isRallyPoint = true;
      }
      
      switch (point.type) {
        case 'net':
          fillColor = '#ffc107'; // Jaune pour filet
          strokeColor = '#000';
          shape = 'square';
          break;
        case 'out':
          fillColor = '#6c757d'; // Gris pour sortie
          strokeColor = '#fff';
          shape = 'triangle';
          break;
        default: // normal
          fillColor = baseColor;
          strokeColor = '#fff';
          shape = 'circle';
      }
      
      ctx.fillStyle = fillColor;
      
      if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
      } else if (shape === 'square') {
        ctx.fillRect(x - size, y - size, size * 2, size * 2);
      } else if (shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x + size, y + size);
        ctx.closePath();
        ctx.fill();
      }
      
      // Bordure
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2 * zoomFactor;
      ctx.stroke();
      
          // Si c'est un point marqué en mode échange, ajouter une icône distinctive
          if (isRallyPoint) {
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${14 * zoomFactor}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('🎯', x, y + 5 * zoomFactor);
          } else {
            // Numéro du point normal
            ctx.fillStyle = strokeColor;
            ctx.font = `bold ${10 * zoomFactor}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText((index + 1).toString(), x, y + 3 * zoomFactor);
          }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (court.mode !== 'rally') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Obtenir les coordonnées dans le système du canvas
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    // Normaliser en coordonnées de base (diviser par zoomFactor)
    const x = canvasX / zoomFactor;
    const y = canvasY / zoomFactor;

    if (isMarkingScore) {
      // Mode marquage de point final
      // Déterminer quel joueur a marqué le point selon la position
      const courtX = BASE_OUTER_MARGIN;
      const courtY = BASE_OUTER_MARGIN;
      const centerX = courtX + (BASE_COURT_WIDTH / 2);
      const player = x < centerX ? 2 : 1;
      
      // Déterminer le type de point selon la position
      let pointType: 'normal' | 'out' = 'normal';
      if (x < courtX || x > courtX + BASE_COURT_WIDTH || y < courtY || y > courtY + BASE_COURT_HEIGHT) {
        pointType = 'out';
      }
      
      onScoreUpdate(court.id, player, 1, x, y, pointType);
      setIsMarkingScore(false); // Désactiver le mode marquage
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

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Obtenir les coordonnées dans le système du canvas
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    // Normaliser en coordonnées de base (diviser par zoomFactor)
    const x = canvasX / zoomFactor;
    const y = canvasY / zoomFactor;

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
    // Si clic sur la moitié gauche (ou zone de sortie gauche), c'est le joueur 2
    // Si clic sur la moitié droite (ou zone de sortie droite), c'est le joueur 1
    const centerX = courtX + (BASE_COURT_WIDTH / 2);
    player = x < centerX ? 2 : 1;
    
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
        </div>
      </div>

      <div className="court-content">
        {court.mode === 'scoring' ? (
          <div className="scoring-mode">
            <div className="players">
              <div className="player">
                <div className="player-name">{court.players[0]}</div>
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
                <div className="player-name">{court.players[1]}</div>
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
                className="court-canvas interactive"
              />
              <p className="court-instructions">
                Cliquez sur le terrain pour marquer un point normal, ou dans la zone grise pour marquer une sortie (gauche = {court.players[1]}, droite = {court.players[0]})
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
              className="court-canvas"
            />
            
            <p className="rally-instructions">
              <strong>Instructions :</strong><br/>
              • <strong>Clic sur le terrain</strong> : Ajouter un point de trajectoire<br/>
              • <strong>🎯 Marquer le point</strong> : Cliquer sur le terrain pour marquer l'endroit exact du point final
            </p>
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
