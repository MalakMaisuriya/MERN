const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup view engine & middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// In-memory data store
let itemsStore = [
  {
    id: 1,
    name: 'Authentication Service API',
    category: 'Security',
    owner: 'Alex Morgan',
    status: 'Active',
    description: 'OAuth2 and JWT token authentication microservice handler.',
    createdAt: '2026-07-30'
  },
  {
    id: 2,
    name: 'Primary MongoDB Database Cluster',
    category: 'Database',
    owner: 'DevOps Team',
    status: 'Active',
    description: 'Main production database replica set for user data.',
    createdAt: '2026-07-29'
  },
  {
    id: 3,
    name: 'Legacy Analytics Ingestion Gateway',
    category: 'Services',
    owner: 'Sarah Jenkins',
    status: 'Inactive',
    description: 'Deprecated log collector scheduled for decommission.',
    createdAt: '2026-07-28'
  },
  {
    id: 4,
    name: 'React Frontend Dashboard App',
    category: 'Frontend',
    owner: 'UX Team',
    status: 'Active',
    description: 'Client dashboard interface build package.',
    createdAt: '2026-07-31'
  }
];

// Auto-incrementing ID counter for new records
let nextId = 5;

// Helper: Calculate Dashboard Statistics
function getDashboardStats() {
  const totalItems = itemsStore.length;
  const activeItems = itemsStore.filter(i => i.status === 'Active').length;
  const inactiveItems = itemsStore.filter(i => i.status === 'Inactive').length;
  const categories = new Set(itemsStore.map(i => i.category));
  return {
    totalItems,
    activeItems,
    inactiveItems,
    categoriesCount: categories.size
  };
}

// Routes

// Dashboard Overview Page
app.get('/', (req, res) => {
  const stats = getDashboardStats();
  const recentItems = [...itemsStore].reverse().slice(0, 5);
  res.render('dashboard', {
    stats,
    recentItems
  });
});

// Items List Management
app.get('/items', (req, res) => {
  res.render('items', {
    items: itemsStore
  });
});

// Add Item Form
app.get('/items/add', (req, res) => {
  res.render('add-item');
});

// Handle Add Item
app.post('/items/add', (req, res) => {
  const { name, category, owner, status, description } = req.body;
  if (!name || !category || !owner) {
    return res.status(400).send('Name, Category, and Owner are required fields.');
  }

  const newItem = {
    id: nextId++,
    name: name.trim(),
    category: category.trim(),
    owner: owner.trim(),
    status: status || 'Active',
    description: description ? description.trim() : '',
    createdAt: new Date().toISOString().split('T')[0]
  };

  itemsStore.push(newItem);
  res.redirect('/items');
});

// Edit Form
app.get('/items/edit/:id', (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  const item = itemsStore.find(i => i.id === itemId);

  if (!item) {
    return res.status(404).send('Record not found');
  }

  res.render('edit-item', { item });
});

// Handle Edit Form Update
app.post('/items/edit/:id', (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  const itemIndex = itemsStore.findIndex(i => i.id === itemId);

  if (itemIndex === -1) {
    return res.status(404).send('Record not found');
  }

  const { name, category, owner, status, description } = req.body;

  itemsStore[itemIndex] = {
    ...itemsStore[itemIndex],
    name: name ? name.trim() : itemsStore[itemIndex].name,
    category: category ? category.trim() : itemsStore[itemIndex].category,
    owner: owner ? owner.trim() : itemsStore[itemIndex].owner,
    status: status || itemsStore[itemIndex].status,
    description: typeof description !== 'undefined' ? description.trim() : itemsStore[itemIndex].description
  };

  res.redirect('/items');
});

// Toggle Status (Active / Inactive)
app.post('/items/status/:id', (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  const item = itemsStore.find(i => i.id === itemId);

  if (item) {
    item.status = item.status === 'Active' ? 'Inactive' : 'Active';
  }

  res.redirect('/items');
});

// Delete Record
app.post('/items/delete/:id', (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  itemsStore = itemsStore.filter(i => i.id !== itemId);
  res.redirect('/items');
});

// Settings Page
app.get('/settings', (req, res) => {
  res.render('settings');
});

app.post('/settings', (req, res) => {
  res.redirect('/settings');
});

// 404 Catch-All
app.use((req, res) => {
  res.status(404).send('<h2 style="font-family:sans-serif; text-align:center; margin-top:50px;">404 - Page Not Found</h2><p style="text-align:center;"><a href="/">Return to NodePanel Dashboard</a></p>');
});

/**
 * ----------------------------------------------------------------------------
 * Start HTTP Server Listener
 * ----------------------------------------------------------------------------
 */
app.listen(PORT, () => {
  console.log(`NodePanel Admin Server running on http://localhost:${PORT}`);
});
