import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(req) {
  if (
    req.nextUrl.pathname.startsWith('/api/links') &&
    (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE')
  ) {
    const token = req.cookies.get('auth')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/links/:path*'],
};