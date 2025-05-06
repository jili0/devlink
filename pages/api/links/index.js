import dbConnect from '../../../lib/db';
import Link from '../../../models/Link';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const links = await Link.find({}).sort({ order: 1 });
      return res.status(200).json(links);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const token = req.cookies.auth;
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = verifyToken(token);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { title, url, category } = req.body;
      const latestLink = await Link.findOne({ category }).sort({ order: -1 });
      const order = latestLink ? latestLink.order + 1 : 0;

      const link = await Link.create({
        title,
        url,
        category,
        order,
      });

      return res.status(201).json(link);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const token = req.cookies.auth;
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = verifyToken(token);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { updates } = req.body;
      
      const session = await Link.startSession();
      session.startTransaction();
      
      try {
        for (const update of updates) {
          await Link.findByIdAndUpdate(
            update.id,
            { 
              category: update.category,
              order: update.order 
            },
            { session }
          );
        }
        
        await session.commitTransaction();
        session.endSession();
        
        return res.status(200).json({ message: 'Link order updated successfully' });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}