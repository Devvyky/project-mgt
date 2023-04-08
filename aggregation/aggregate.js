const Project = require('../models/projectModel');
const { Task } = require('../models/taskModel');
const catchAsync = require('../utils/catchAsync');

exports.tasksAssignedDueToProjects = catchAsync(async (req, res, next) => {
  const pipeline = [
    // Lookup the projects collection to get the due date
    {
      $lookup: {
        from: 'projects',
        localField: 'project',
        foreignField: '_id',
        as: 'project',
      },
    },
    // Unwind the project array
    { $unwind: '$project' },
    // Match the due date to "today"
    {
      $match: {
        'project.dueDate': {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lt: new Date().setHours(23, 59, 59, 999),
        },
      },
    },
  ];

  const result = await Task.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.projectsWithTaskDueToday = catchAsync(async (req, res, next) => {
  const pipeline = [
    {
      $lookup: {
        from: 'tasks',
        localField: 'tasks',
        foreignField: '_id',
        as: 'tasks',
      },
    },
    {
      $unwind: '$tasks',
    },
    {
      $match: {
        'tasks.dueDate': {
          $eq: new Date().setHours(0, 0, 0, 0),
        },
      },
    },
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        description: { $first: '$description' },
        tasks: { $push: '$tasks' },
      },
    },
  ];

  const result = await Project.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});
