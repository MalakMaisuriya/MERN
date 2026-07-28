const mongoose = require('mongoose');

const mediaAssetSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    storedName: {
      type: String,
      required: true,
      unique: true
    },
    mimeType: {
      type: String,
      required: true
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 0
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true
    },
    altText: {
      type: String,
      trim: true,
      maxlength: [120, 'Alt text cannot exceed 120 characters']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MediaAsset', mediaAssetSchema);
