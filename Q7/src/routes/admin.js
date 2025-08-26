import { Router } from 'express';
import { readJson, writeJson, newId } from '../utils/store.js';

const router = Router();

// Admin home
router.get('/', async (req, res) => {
  const categories = await readJson('categories');
  const products = await readJson('products');
  res.render('admin/index', { title: 'Admin', categories, products });
});

// ----- Categories (2-level via parentId) -----
router.get('/categories', async (req, res) => {
  const categories = await readJson('categories');
  res.render('admin/categories/index', { title: 'Categories', categories });
});

router.get('/categories/new', async (req, res) => {
  const categories = await readJson('categories');
  const parents = categories.filter(c => !c.parentId); // only top-level as possible parents
  res.render('admin/categories/new', { title: 'New Category', parents });
});

router.post('/categories', async (req, res) => {
  const { name, parentId } = req.body;
  const categories = await readJson('categories');
  categories.push({ id: newId(), name: String(name).trim(), parentId: parentId || null });
  await writeJson('categories', categories);
  res.redirect('/admin/categories');
});

router.get('/categories/:id/edit', async (req, res) => {
  const { id } = req.params;
  const categories = await readJson('categories');
  const cat = categories.find(c => c.id === id);
  if (!cat) return res.status(404).send('Not found');
  const parents = categories.filter(c => !c.parentId && c.id !== id);
  res.render('admin/categories/edit', { title: 'Edit Category', cat, parents });
});

router.post('/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, parentId } = req.body;
  const categories = await readJson('categories');
  const idx = categories.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).send('Not found');
  categories[idx].name = String(name).trim();
  categories[idx].parentId = parentId || null;
  await writeJson('categories', categories);
  res.redirect('/admin/categories');
});

router.post('/categories/:id/delete', async (req, res) => {
  const { id } = req.params;
  let categories = await readJson('categories');
  let products = await readJson('products');
  // Remove category and its children (2-level only)
  const childrenIds = categories.filter(c => c.parentId === id).map(c => c.id);
  const toRemove = new Set([id, ...childrenIds]);
  categories = categories.filter(c => !toRemove.has(c.id));
  products = products.filter(p => !toRemove.has(p.categoryId));
  await writeJson('categories', categories);
  await writeJson('products', products);
  res.redirect('/admin/categories');
});

// ----- Products -----
router.get('/products', async (req, res) => {
  const categories = await readJson('categories');
  const products = await readJson('products');
  res.render('admin/products/index', { title: 'Products', categories, products });
});

router.get('/products/new', async (req, res) => {
  const categories = await readJson('categories');
  const subcats = categories.filter(c => !!c.parentId); // products only in level-2
  res.render('admin/products/new', { title: 'New Product', subcats });
});

router.post('/products', async (req, res) => {
  const { name, price, categoryId, description } = req.body;
  const products = await readJson('products');
  products.push({ id: newId(), name: String(name).trim(), price: Number(price || 0), categoryId, description: description || '' });
  await writeJson('products', products);
  res.redirect('/admin/products');
});

router.get('/products/:id/edit', async (req, res) => {
  const { id } = req.params;
  const categories = await readJson('categories');
  const subcats = categories.filter(c => !!c.parentId);
  const products = await readJson('products');
  const prod = products.find(p => p.id === id);
  if (!prod) return res.status(404).send('Not found');
  res.render('admin/products/edit', { title: 'Edit Product', prod, subcats });
});

router.post('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, categoryId, description } = req.body;
  const products = await readJson('products');
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).send('Not found');
  products[idx] = { ...products[idx], name: String(name).trim(), price: Number(price || 0), categoryId, description: description || '' };
  await writeJson('products', products);
  res.redirect('/admin/products');
});

router.post('/products/:id/delete', async (req, res) => {
  const { id } = req.params;
  let products = await readJson('products');
  products = products.filter(p => p.id !== id);
  await writeJson('products', products);
  res.redirect('/admin/products');
});

export default router;
