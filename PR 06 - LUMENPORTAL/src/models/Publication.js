const mongoose = require('mongoose');
const { createSlug } = require('../utils/helpers');

const publicationSchema = new mongoose.Schema(
  {
    headline: {
      type: String,
      required: [true, 'Headline is required'],
      trim: true,
      maxlength: [120, 'Headline cannot exceed 120 characters']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
      maxlength: [300, 'Summary cannot exceed 300 characters']
    },
    body: {
      type: String,
      required: [true, 'Body content is required'],
      trim: true
    },
    coverImage: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic is required']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true
    },
    publishedAt: {
      type: Date
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    readingMinutes: {
      type: Number,
      default: 3,
      min: 1
    }
  },
  { timestamps: true }
);

publicationSchema.index({ headline: 'text', summary: 'text', body: 'text' });
publicationSchema.index({ status: 1, createdAt: -1 });
publicationSchema.index({ topic: 1, status: 1 });

publicationSchema.pre('validate', function assignSlug(next) {
  if (this.headline && (!this.slug || this.isModified('headline'))) {
    this.slug = createSlug(this.headline);
  }
  next();
});

publicationSchema.pre('save', function syncPublishedDate(next) {
  if (this.isModified('status')) {
    if (this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date();
    }
    if (this.status !== 'published') {
      this.publishedAt = undefined;
    }
  }
  next();
});

module.exports = mongoose.model('Publication', publicationSchema);
