import React, { useState } from 'react';
import LiveMonitor from './components/LiveMonitor';
import { API_URL } from './config';
import './App.css';

function App() {
  const [roomKey, setRoomKey] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/generate-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRoomKey(data.roomKey);
      } else {
        setError(data.message || 'Erreur lors de la génération de la clé');
      }
    } catch (err) {
      setError('Impossible de se connecter au serveur. Vérifiez que le serveur est démarré.');
      console.error('Erreur:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!inputKey.trim()) {
      setError('Veuillez entrer une clé de salle');
      return;
    }

    setIsJoining(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/api/validate-key/${inputKey.trim().toUpperCase()}`);
      const data = await response.json();
      
      if (data.success) {
        setRoomKey(inputKey.trim().toUpperCase());
      } else {
        setError(data.message || 'Clé de salle invalide ou expirée');
      }
    } catch (err) {
      setError('Impossible de se connecter au serveur. Vérifiez que le serveur est démarré.');
      console.error('Erreur:', err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleBack = () => {
    setRoomKey(null);
    setInputKey('');
    setError('');
  };

  if (roomKey) {
    return <LiveMonitor roomKey={roomKey} onBack={handleBack} />;
  }

  return (
    <div className="App">
      <div className="home-screen">
        <div className="home-content">
          <h1>🏸 Badminton Live Monitor</h1>
          <p className="home-description">
            Application de surveillance en direct pour les cours de badminton.
            Suivez les scores et les trajectoires en temps réel sur plusieurs terrains.
          </p>

          <div className="key-section">
            <button
              className="generate-btn"
              onClick={handleGenerateKey}
              disabled={isGenerating}
            >
              {isGenerating ? 'Génération...' : '🎲 Générer une nouvelle salle'}
            </button>
            <p className="help-text">
              Créez une nouvelle salle et partagez la clé avec vos élèves
            </p>
          </div>

          <div className="divider">
            <span>OU</span>
          </div>

          <div className="join-section">
            <h3>Rejoindre une salle existante</h3>
            <div className="input-group">
              <input
                type="text"
                className="key-input"
                placeholder="XXXX-XXXX"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value.toUpperCase());
                  setError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleJoinRoom();
                  }
                }}
                maxLength={8}
              />
              <button
                className="join-btn"
                onClick={handleJoinRoom}
                disabled={isJoining || !inputKey.trim()}
              >
                {isJoining ? 'Connexion...' : 'Rejoindre'}
              </button>
            </div>
            {error && <p className="error-message">{error}</p>}
            <p className="join-help-text">
              Entrez la clé de salle fournie par votre professeur
            </p>
          </div>

          <div className="features">
            <h3>✨ Fonctionnalités</h3>
            <ul>
              <li>📊 Suivi des scores en temps réel</li>
              <li>🎯 Visualisation des trajectoires du volant</li>
              <li>👥 Multiples terrains simultanés</li>
              <li>🔄 Synchronisation automatique entre tous les appareils</li>
              <li>📱 Compatible mobile et tablette</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
