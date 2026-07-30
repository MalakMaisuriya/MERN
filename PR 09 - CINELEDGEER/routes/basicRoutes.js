const express = require('express');
const { body } = require('express-validator');
const basic = require('../controllers/basicController');
const authorize = require('../middleware/roleMiddleware');

const makeRouter = resource => {
  const router = express.Router();
  router.get('/', basic.index(resource));
  router.get('/new', authorize('Admin'), basic.new(resource));
  router.post('/', authorize('Admin'), body('name').optional().trim(), body('firstName').optional().trim(), body('lastName').optional().trim(), basic.create(resource));
  if (resource === 'actors') router.get('/:id', basic.showActor);
  router.get('/:id/edit', authorize('Admin'), basic.edit(resource));
  router.put('/:id', authorize('Admin'), basic.update(resource));
  router.delete('/:id', authorize('Admin'), basic.destroy(resource));
  return router;
};

module.exports = makeRouter;
