const catchAsync = require('../utils/catchAsync');
const moment = require('moment');
const { isEmpty, omit } = require('lodash');

const { Task } = require('../models/taskModel');
const Project = require('../models/projectModel');
const AppError = require('../utils/appError');

// create project
exports.createProject = catchAsync(async (req, res, next) => {
  const { name, description, startDate, dueDate } = req.body;

  const project = await Project.create({
    name,
    description,
    startDate,
    dueDate,
  });

  res.status(201).json({
    status: 'success',
    data: project,
  });
});

// List all project, filter project by name, startDate, dueDate, endDate
exports.listProject = catchAsync(async (req, res, next) => {
  const { name, startDate, dueDate } = req.query;

  const criteria = {
    isDeleted: { $ne: true },
  };

  if (!isEmpty(name)) {
    criteria.name = { $regex: name, $options: 'i' };
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

  const projects = await Project.find(criteria).populate({
    path: 'tasks',
    select: 'name description status startDate dueDate',
  });

  res.status(200).json({
    status: 'success',
    data: projects,
  });
});

// Edit projects
exports.editProject = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const project = await Project.findOne({ _id: id, isDeleted: { $ne: true } });

  if (isEmpty(project)) {
    return next(new AppError('No project found with that id 😤', 400));
  }

  // Filter out unwanted fields name that are not allowed to be updated e.g isDeleted
  const filteredBody = omit(req.body, [
    'isDeleted',
    'createdAt',
    'deletedAt',
    'dueDate',
  ]);
  const data = await Project.findOneAndUpdate(
    { _id: id },
    { ...filteredBody },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    data,
  });
});

// Delete Project
exports.deleteProject = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const project = await Project.findOne({ _id: id, isDeleted: { $ne: true } });

  if (isEmpty(project)) {
    return next(new AppError('No project found with that id 😤', 400));
  }

  project.isDeleted = true;
  project.deletedAt = moment.now();
  await project.save();

  res.status(204).json({
    status: 'success',
  });
});

// assign task to a project
exports.assignTaskToProject = catchAsync(async (req, res, next) => {
  const { projectId, taskId } = req.params;

  const [project, task] = await Promise.all([
    Project.findOne({
      _id: projectId,
      isDeleted: { $ne: true },
    }),
    Task.findOne({
      _id: taskId,
      isDeleted: { $ne: true },
    }),
  ]);

  if (isEmpty(project)) {
    return next(new AppError('No project found with that id 😤', 400));
  }

  if (isEmpty(task)) {
    return next(new AppError('No task found with that id 😤', 400));
  }

  if (task.isAssigned) {
    return next(new AppError('Task already assigned to a project 😤', 400));
  }

  task.project = project._id;
  task.isAssigned = true;
  project.tasks.push(task._id);

  await task.save();
  await project.save();

  res.status(200).json({
    status: 'success',
  });
});

exports.moveTaskToAnotherProject = catchAsync(async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const { nextProjectId } = req.body;

  const [currentProject, task, nextProject] = await Promise.all([
    Project.findOne({
      _id: projectId,
      isDeleted: { $ne: true },
    }),
    Task.findOne({
      _id: taskId,
      isDeleted: { $ne: true },
    }),
    Project.findOne({
      _id: nextProjectId,
      isDeleted: { $ne: true },
    }),
  ]);

  if (isEmpty(currentProject)) {
    return next(new AppError('No project found with that id 😤', 400));
  }

  if (isEmpty(task)) {
    return next(new AppError('No task found with that id 😤', 400));
  }

  if (isEmpty(nextProject)) {
    return next(
      new AppError('Cannot move task to non-existing project 😤', 400)
    );
  }

  // remove task id from current project
  await Project.updateOne(
    { _id: currentProject._id },
    { $pull: { tasks: taskId } }
  );

  // add it to next project
  await Project.updateOne(
    { _id: nextProject._id },
    { $addToSet: { tasks: taskId } }
  );

  // Update the project the task has been assigned to
  task.project = nextProject._id;
  await task.save();

  res.status(200).json({
    status: 'success',
  });
});
