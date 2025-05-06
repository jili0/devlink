import dbConnect from '../../../lib/db';
import Link from '../../../models/Link';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid link ID' });
  }
  
  try {
    await dbConnect();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ message: 'Database connection failed' });
  }

  // Check authentication for all methods except GET
  if (req.method !== 'GET') {
    const token = req.cookies.auth;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - no token provided' });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - invalid token' });
    }
  }

  // GET - Get a specific link
  if (req.method === 'GET') {
    try {
      const link = await Link.findById(id);
      if (!link) {
        return res.status(404).json({ message: 'Link not found' });
      }
      return res.status(200).json(link);
    } catch (error) {
      console.error('Error fetching link:', error);
      return res.status(500).json({ message: 'Failed to fetch link' });
    }
  }

  // PUT - Update a link
  if (req.method === 'PUT') {
    try {
      const { title, url, category } = req.body;
      
      // Validate required fields
      if (!title && !url && !category) {
        return res.status(400).json({ message: 'At least one field (title, url, or category) is required' });
      }
      
      // Prepare update data
      const updateData = {};
      if (title) updateData.title = title;
      if (url) updateData.url = url;
      if (category) updateData.category = category;
      
      const updatedLink = await Link.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedLink) {
        return res.status(404).json({ message: 'Link not found' });
      }

      return res.status(200).json(updatedLink);
    } catch (error) {
      console.error('Error updating link:', error);
      return res.status(500).json({ message: 'Failed to update link' });
    }
  }

  // DELETE - Delete a link
  if (req.method === 'DELETE') {
    try {
      const deletedLink = await Link.findByIdAndDelete(id);
      
      if (!deletedLink) {
        return res.status(404).json({ message: 'Link not found' });
      }

      // Reorder remaining links in the same category
      const category = deletedLink.category;
      const links = await Link.find({ category, order: { $gt: deletedLink.order } });
      
      // Use Promise.all for concurrent updates
      await Promise.all(
        links.map(link => 
          Link.findByIdAndUpdate(link._id, { order: link.order - 1 })
        )
      );

      return res.status(200).json({ 
        message: 'Link deleted successfully',
        deletedLink // Include the deleted link in response for reference
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      return res.status(500).json({ message: 'Failed to delete link' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}