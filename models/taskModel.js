const mongoose = require('mongoose');
const slugify = require('slugify');

// Enums
const TaskStatus = {
  Available: 'available',
  Todo: 'todo',
  Done: 'done',
};

const TaskStatuses = Object.values(TaskStatus);

const taskSchema = new mongoose.Schema({
  slug: String,
  name: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
  },
  status: {
    type: String,
    default: TaskStatus.Available,
    enum: {
      values: TaskStatuses,
      message: ['Status is either available, todo, or done'],
    },
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  isAssigned: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
    required: [true, 'Task due date is required'],
  },
  doneDate: {
    type: Date,
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
  },
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
taskSchema.pre('save', function (next) {
  this.slug = slugify(`${this.name}`, { lower: true });
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = { Task, TaskStatus, TaskStatuses };
