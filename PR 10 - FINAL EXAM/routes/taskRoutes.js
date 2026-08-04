const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { requireAuth } = require('../middleware/auth');

// All task routes require authentication
router.use(requireAuth);

router.get('/', taskController.getTasks);
router.get('/new', taskController.getTaskForm);
router.post('/', taskController.createTask);
router.get('/edit/:id', taskController.getEditTaskForm);
router.post('/edit/:id', taskController.updateTask);
router.post('/delete/:id', taskController.deleteTask);

module.exports = router;
