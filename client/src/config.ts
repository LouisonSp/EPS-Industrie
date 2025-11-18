// Configuration de l'application
// En développement, utilise localhost
// En production, utilise l'URL du serveur actuel (window.location.origin)

const getApiUrl = (): string => {
  // Si une URL personnalisée est définie, l'utiliser
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // En développement, utilise localhost:3001
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
  }
  
  // En production, utilise l'URL actuelle (même domaine)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback (ne devrait jamais arriver)
  return 'http://localhost:3001';
};

export const API_URL = getApiUrl();
export const SOCKET_URL = getApiUrl();

