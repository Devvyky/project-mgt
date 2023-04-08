const mongoose = require('mongoose');
const slugify = require('slugify');

const projectSchema = new mongoose.Schema({
  slug: String,
  name: {
    type: String,
    required: [true, 'Please input your project name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please input your project description'],
    trim: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
    required: [true, 'Project due date is required'],
  },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  deletedAt: {
    type: Date,
  },
});

// MIDDLEWARES

// Pre save middleware to create slug
projectSchema.pre('save', function (next) {
  this.slug = slugify(`${this.name}`, { lower: true });
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
