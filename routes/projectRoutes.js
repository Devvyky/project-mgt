const express = require('express');

const productController = require('../controllers/projectController');

const router = express.Router();

router
  .route('/')
  .get(productController.listProject)
  .post(productController.createProject);

router
  .route('/:id')
  .patch(productController.editProject)
  .delete(productController.deleteProject);

router.patch(
  '/:projectId/task/:taskId/assign',
  productController.assignTaskToProject
);

router.patch(
  '/:projectId/task/:taskId/move',
  productController.moveTaskToAnotherProject
);

module.exports = router;
