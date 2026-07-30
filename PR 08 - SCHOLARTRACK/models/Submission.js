const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 3,
      maxlength: 100
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: 80
    },
    type: {
      type: String,
      required: true,
      enum: ['Assignment', 'Practical', 'Presentation', 'Mini Project', 'Report']
    },
    status: {
      type: String,
      required: true,
      enum: ['Planned', 'In Progress', 'Submitted', 'Reviewed'],
      default: 'Planned'
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    marks: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 800
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

submissionSchema.index({ title: 'text', subject: 'text', notes: 'text' });

module.exports = mongoose.model('Submission', submissionSchema);
