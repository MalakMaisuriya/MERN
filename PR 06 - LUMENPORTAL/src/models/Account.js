const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const accountSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false
    },
    role: {
      type: String,
      enum: ['administrator', 'editor', 'viewer'],
      default: 'editor'
    },
    age: {
      type: Number,
      min: [13, 'Age must be at least 13'],
      max: [120, 'Age cannot exceed 120']
    },
    gender: {
      type: String,
      enum: ['', 'male', 'female', 'non-binary', 'other', 'prefer-not-to-say'],
      default: ''
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [240, 'Bio cannot exceed 240 characters'],
      default: ''
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLoginAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        return ret;
      }
    }
  }
);

accountSchema.methods.verifyPassword = async function verifyPassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

accountSchema.statics.hashPassword = async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 12);
};

module.exports = mongoose.model('Account', accountSchema);
