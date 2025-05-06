import { verifyToken } from '../../../lib/auth';

export default function handler(req, res) {
  const token = req.cookies.auth;
  
  if (!token) {
    return res.status(200).json({ isLoggedIn: false });
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(200).json({ isLoggedIn: false });
  }

  return res.status(200).json({ isLoggedIn: true, user: decoded });
}