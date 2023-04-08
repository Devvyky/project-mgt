const moment = require('moment');
const { isEmpty, omit } = require('lodash');

const { Task, TaskStatuses, TaskStatus } = require('../models/taskModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// create task
exports.createTask = catchAsync(async (req, res, next) => {
  const { name, description, dueDate } = req.body;

  const task = await Task.create({
    name,
    description,
    dueDate,
  });

  res.status(201).json({
    status: 'success',
    data: task,
  });
});

// List all task, filter tasks by name, status, startDate, dueDate, doneDate
exports.listTask = catchAsync(async (req, res, next) => {
  const { name, status, startDate, dueDate, doneDate } = req.query;

  const criteria = {
    isDeleted: false,
  };

  if (!isEmpty(name)) {
    criteria.name = { $regex: name, $options: 'i' };
  }

  if (!isEmpty(status)) {
    if (!TaskStatuses.includes(status)) {
      return next(new AppError('Invalid status 😤', 400));
    }
    criteria.status = status;
  }

  if (!isEmpty(startDate)) {
    criteria.startDate = {
      $gte: moment(startDate).startOf('day').toDate(),
      $lt: moment(startDate).endOf('day').toDate(),
    };
  }

  if (!isEmpty(dueDate)) {
    criteria.dueDate = {
      $gte: moment(dueDate).startOf('day').toDate(),
      $lt: moment(dueDate).endOf('day').toDate(),
    };
  }

  if (!isEmpty(doneDate)) {
    criteria.doneDate = {
      $gte: moment(doneDate).startOf('day').toDate(),
      $lt: moment(doneDate).endOf('day').toDate(),
    };
  }

  const tasks = await Task.find(criteria);

  res.status(200).json({
    status: 'success',
    data: tasks,
  });
});

// Edit Task
exports.editTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const task = await Task.findOne({ _id: id, isDeleted: { $ne: true } });

  if (isEmpty(task)) {
    return next(new AppError('No task found with that id 😤', 400));
  }

  // Filter out unwanted fields name that are not allowed to be updated e.g isDeleted
  const filteredBody = omit(req.body, [
    'isDeleted',
    'createdAt',
    'deletedAt',
    'dueDate',
  ]);

  if (filteredBody.status === TaskStatus.Todo) {
    filteredBody.startDate = moment();
  }

  if (filteredBody.status === TaskStatus.Done) {
    filteredBody.doneDate = moment();
  }

  const data = await Task.findOneAndUpdate(
    { _id: id },
    { ...filteredBody },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data,
  });
});

// Delete Task
exports.deleteTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const task = await Task.findOne({ _id: id, isDeleted: { $ne: true } });

  if (isEmpty(task)) {
    return next(new AppError('No task found with that id 😤', 400));
  }

  task.isDeleted = true;
  task.deletedAt = moment.now();
  await task.save();

  res.status(204).json({
    status: 'success',
  });
});

// reset task
exports.resetTask = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const task = await Task.findOne({ _id: id, isDeleted: { $ne: true } });

  if (isEmpty(task)) {
    return next(new AppError('No task found with that id 😤', 400));
  }

  task.startDate = undefined;
  task.doneDate = undefined;
  task.status = TaskStatus.Available;
  await task.save();

  res.status(200).json({
    status: 'success',
  });
});
