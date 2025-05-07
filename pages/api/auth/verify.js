import { verifyToken } from '../../../lib/auth';

export default function handler(req, res) {
  // Anti-Caching-Header setzen
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Das Cookie aus dem Request extrahieren
  const token = req.cookies.auth;
  
  // CORS-Header für bessere Kompatibilität
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Debugging - nur in Entwicklungsumgebung
  if (process.env.NODE_ENV === 'development') {
    console.log('Verify API aufgerufen', { 
      headerCookies: req.headers.cookie,
      tokenExists: !!token 
    });
  }
  
  if (!token) {
    return res.status(200).json({ isLoggedIn: false });
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    // Debugging - nur in Entwicklungsumgebung
    if (process.env.NODE_ENV === 'development') {
      console.log('Token konnte nicht verifiziert werden');
    }
    return res.status(200).json({ isLoggedIn: false });
  }

  // Debugging - nur in Entwicklungsumgebung
  if (process.env.NODE_ENV === 'development') {
    console.log('Gültiger Token für Benutzer:', decoded.username);
  }
  
  return res.status(200).json({ 
    isLoggedIn: true, 
    user: decoded 
  });
}