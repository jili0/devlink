import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;

// Token erstellen mit verschiedenen Ablaufzeiten basierend auf rememberMe
export function createToken(user, rememberMe = false) {
  return jwt.sign(
    { id: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: rememberMe ? '30d' : '1d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

// Verbesserte Cookie-Einstellung für bessere Kompatibilität und Sicherheit
export function setAuthCookie(res, token, rememberMe = false) {
  // Cookie-Ablaufzeit basierend auf rememberMe-Option
  const maxAge = rememberMe 
    ? 60 * 60 * 24 * 30  // 30 Tage in Sekunden
    : 60 * 60 * 24;      // 1 Tag in Sekunden

  // Domain- und Path-Werte anpassen
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    maxAge,
    path: '/',
    sameSite: 'lax', // 'lax' ist besser für die meisten Anwendungsfälle
  };

  res.setHeader('Set-Cookie', cookie.serialize('auth', token, cookieOptions));
  
  // Debug-Log
  console.log(`Auth-Cookie gesetzt: maxAge=${maxAge}, sameSite=lax, path=/`);
}