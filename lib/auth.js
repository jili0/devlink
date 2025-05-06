import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;

export function createToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function setAuthCookie(res, token) {
  res.setHeader('Set-Cookie', cookie.serialize('auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'strict',
    path: '/',
  }));
}