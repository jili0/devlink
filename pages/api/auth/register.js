import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import { hashPassword, createToken, setAuthCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  // CORS-Header für Anfragen mit Credentials setzen
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONS-Anfragen für CORS Pre-flight behandeln
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Nur POST-Anfragen erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { username, password, rememberMe } = req.body;
  
  // Sicherheitsprüfung: Fehlende Daten
  if (!username || !password) {
    return res.status(400).json({ message: 'Benutzername und Passwort sind erforderlich' });
  }
  
  try {
    // Prüfen, ob der Benutzername bereits existiert
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Benutzername existiert bereits' });
    }

    // Passwort hashen und neuen Benutzer erstellen
    const hashedPassword = hashPassword(password);
    const user = await User.create({
      username,
      password: hashedPassword
    });

    // Token mit der entsprechenden Ablaufzeit erstellen
    const token = createToken(user, rememberMe);
    
    // Cookie mit der entsprechenden Ablaufzeit setzen
    setAuthCookie(res, token, rememberMe);

    // Debugging in Entwicklungsumgebung
    if (process.env.NODE_ENV === 'development') {
      console.log('Registrierung erfolgreich:', { 
        username: user.username, 
        rememberMe,
        tokenSet: !!token 
      });
    }

    return res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, username: user.username },
      sessionLength: rememberMe ? '30 days' : '24 hours'
    });
  } catch (error) {
    console.error('Registrierungsfehler:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}