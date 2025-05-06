import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import { comparePassword, createToken, setAuthCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || !comparePassword(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);
    setAuthCookie(res, token);

    return res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}