import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import { hashPassword, createToken, setAuthCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const { username, password } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password and create new user
    const hashedPassword = hashPassword(password);
    const user = await User.create({
      username,
      password: hashedPassword
    });

    // Create and set JWT token
    const token = createToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      message: 'Registration successful',
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}