import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(req) {
  // Debug-Logging in Entwicklungsumgebung
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware aufgerufen für:', req.nextUrl.pathname);
  }

  // Authentifizierung für API-Routen prüfen
  if (
    req.nextUrl.pathname.startsWith('/api/links') &&
    (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')
  ) {
    const token = req.cookies.get('auth')?.value;
    
    // In Entwicklungsumgebung Debug-Logs anzeigen
    if (process.env.NODE_ENV === 'development') {
      console.log('API-Anfrage, Token vorhanden:', !!token);
    }
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    try {
      const decoded = verifyToken(token);
      
      if (!decoded) {
        // In Entwicklungsumgebung Debug-Logs anzeigen
        if (process.env.NODE_ENV === 'development') {
          console.log('Ungültiger Token in Middleware');
        }
        
        return NextResponse.json(
          { message: 'Unauthorized - Invalid token' },
          { status: 401 }
        );
      }
      
      // In Entwicklungsumgebung Debug-Logs anzeigen
      if (process.env.NODE_ENV === 'development') {
        console.log('Authentifizierter Benutzer:', decoded.username);
      }
      
      // Berechtigung erteilt, zur nächsten Middleware oder Route weitergehen
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware-Fehler:', error);
      return NextResponse.json(
        { message: 'Unauthorized - Token validation error' },
        { status: 401 }
      );
    }
  }
  
  // Wenn keine Authentifizierung erforderlich ist oder wenn sie erfolgreich war
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/links/:path*'],
};