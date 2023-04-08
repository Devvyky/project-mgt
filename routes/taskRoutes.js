const express = require('express');

const taskController = require('../controllers/taskController');

const router = express.Router();

router.route('/').get(taskController.listTask).post(taskController.createTask);

router
  .route('/:id')
  .patch(taskController.editTask)
  .delete(taskController.deleteTask);

router.route('/:id/reset').patch(taskController.resetTask);

module.exports = router;
