import mongoose from 'mongoose';

const LinkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for this link'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  url: {
    type: String,
    required: [true, 'Please provide the URL for this link'],
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    // No enum to allow for custom categories
  },
  order: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Link || mongoose.model('Link', LinkSchema);