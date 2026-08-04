const Task = require('../models/Task');
const User = require('../models/User');
const Category = require('../models/Category');

const seedCategories = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany([
      { name: 'Work', description: 'Work related tasks' },
      { name: 'Personal', description: 'Personal tasks' },
      { name: 'Study', description: 'Study and exams' }
    ]);
  }
};

exports.getTasks = async (req, res) => {
  try {
    await seedCategories();

    const viewAll = req.query.view === 'all' && req.user.role === 'admin';
    let tasks = [];

    if (viewAll) {
      tasks = await Task.find()
        .populate('category')
        .populate('user', 'username role')
        .sort({ createdAt: -1 });
    } else {
      const currentUser = await User.findById(req.user.id).populate({
        path: 'tasks',
        populate: [
          { path: 'category' },
          { path: 'user', select: 'username role' }
        ],
        options: { sort: { createdAt: -1 } }
      });

      if (currentUser && currentUser.tasks && currentUser.tasks.length > 0) {
        tasks = currentUser.tasks;
      } else {
        tasks = await Task.find({ user: req.user.id })
          .populate('category')
          .populate('user', 'username role')
          .sort({ createdAt: -1 });
      }
    }

    res.render('taskList', {
      title: viewAll ? 'All User Tasks' : 'My Tasks',
      tasks,
      viewAll,
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (err) {
    console.log(err);
    res.status(500).render('error', { title: 'Error', message: 'Could not load tasks' });
  }
};

exports.getTaskForm = async (req, res) => {
  try {
    await seedCategories();
    const categories = await Category.find().sort({ name: 1 });
    let users = [];

    if (req.user.role === 'admin') {
      users = await User.find({}, 'username role');
    }

    res.render('taskForm', {
      title: 'Create Task',
      task: null,
      categories,
      users,
      error: null
    });
  } catch (err) {
    console.log(err);
    res.status(500).render('error', { title: 'Error', message: 'Could not load form' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, category, status, dueDate, assignedUserId } = req.body;

    if (!title || !category) {
      const categories = await Category.find();
      const users = req.user.role === 'admin' ? await User.find({}, 'username role') : [];
      return res.render('taskForm', {
        title: 'Create Task',
        task: { title, description, category, status, dueDate },
        categories,
        users,
        error: 'Title and category are required'
      });
    }

    let ownerId = req.user.id;
    if (req.user.role === 'admin' && assignedUserId) {
      ownerId = assignedUserId;
    }

    const newTask = new Task({
      title,
      description,
      category,
      status: status || 'Pending',
      dueDate: dueDate || null,
      user: ownerId
    });

    await newTask.save();
    await User.findByIdAndUpdate(ownerId, { $push: { tasks: newTask._id } });

    res.redirect('/tasks?success=Task created');
  } catch (err) {
    console.log(err);
    res.status(500).render('error', { title: 'Error', message: 'Failed to create task' });
  }
};

exports.getEditTaskForm = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.redirect('/tasks?error=Task not found');
    }

    if (req.user.role !== 'admin' && task.user.toString() !== req.user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You can only edit your own tasks'
      });
    }

    const categories = await Category.find();
    let users = [];
    if (req.user.role === 'admin') {
      users = await User.find({}, 'username role');
    }

    res.render('taskForm', {
      title: 'Edit Task',
      task,
      categories,
      users,
      error: null
    });
  } catch (err) {
    console.log(err);
    res.status(500).render('error', { title: 'Error', message: 'Error loading task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.redirect('/tasks?error=Task not found');
    }

    if (req.user.role !== 'admin' && task.user.toString() !== req.user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You can only update your own tasks'
      });
    }

    const { title, description, category, status, dueDate, assignedUserId } = req.body;

    if (!title || !category) {
      const categories = await Category.find();
      const users = req.user.role === 'admin' ? await User.find({}, 'username role') : [];
      return res.render('taskForm', {
        title: 'Edit Task',
        task: { ...task.toObject(), title, description, category, status, dueDate },
        categories,
        users,
        error: 'Title and category required'
      });
    }

    const prevUser = task.user.toString();
    let newUser = prevUser;

    if (req.user.role === 'admin' && assignedUserId && assignedUserId !== prevUser) {
      newUser = assignedUserId;
      await User.findByIdAndUpdate(prevUser, { $pull: { tasks: task._id } });
      await User.findByIdAndUpdate(newUser, { $addToSet: { tasks: task._id } });
    }

    task.title = title;
    task.description = description;
    task.category = category;
    task.status = status;
    task.dueDate = dueDate || null;
    task.user = newUser;

    await task.save();
    res.redirect('/tasks?success=Task updated');
  } catch (err) {
    console.log(err);
    res.status(500).render('error', { title: 'Error', message: 'Failed to update task' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.redirect('/tasks?error=Task not found');
    }

    if (req.user.role !== 'admin' && task.user.toString() !== req.user.id) {
      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You can only delete your own tasks'
      });
    }

    await User.findByIdAndUpdate(task.user, { $pull: { tasks: task._id } });
    await Task.findByIdAndDelete(req.params.id);

    res.redirect('/tasks?success=Task deleted');
  } catch (err) {
    console.log(err);
    res.status(500).render('error', { title: 'Error', message: 'Failed to delete task' });
  }
};
