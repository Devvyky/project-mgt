const express = require('express');

const taskController = require('../controllers/taskController');
const {
  tasksAssignedDueToProjects,
  projectsWithTaskDueToday,
} = require('../aggregation/aggregate');

const router = express.Router();

router.route('/').get(taskController.listTask).post(taskController.createTask);

router
  .route('/:id')
  .patch(taskController.editTask)
  .delete(taskController.deleteTask);

router.route('/:id/reset').patch(taskController.resetTask);

router.get('/due-projects', projectsWithTaskDueToday);
module.exports = router;
