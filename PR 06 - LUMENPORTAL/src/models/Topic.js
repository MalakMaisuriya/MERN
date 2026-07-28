const mongoose = require('mongoose');
const { createSlug } = require('../utils/helpers');

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
      maxlength: [60, 'Topic title cannot exceed 60 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters']
    },
    accentColor: {
      type: String,
      default: '#6366f1',
      match: [/^#([A-Fa-f0-9]{6})$/, 'Accent color must be a valid hex code']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true
    }
  },
  { timestamps: true }
);

topicSchema.pre('validate', function assignSlug(next) {
  if (this.title && (!this.slug || this.isModified('title'))) {
    this.slug = createSlug(this.title);
  }
  next();
});

module.exports = mongoose.model('Topic', topicSchema);
