import { Router } from 'express';
import { readJson } from '../utils/store.js';

const router = Router();

function buildCategoryTree(categories) {
  const top = categories.filter(c => !c.parentId);
  const byParent = new Map();
  for (const c of categories) {
    if (c.parentId) {
      if (!byParent.has(c.parentId)) byParent.set(c.parentId, []);
      byParent.get(c.parentId).push(c);
    }
  }
  return top.map(t => ({ ...t, children: byParent.get(t.id) || [] }));
}

// Home: list top categories and featured products (first 8)
router.get('/', async (req, res) => {
  const categories = await readJson('categories');
  const products = await readJson('products');
  const tree = buildCategoryTree(categories);
  const featured = products.slice(0, 8);
  res.render('shop/home', { title: 'Shop', tree, featured });
});

// Browse products by subcategory id
router.get('/category/:id', async (req, res) => {
  const { id } = req.params;
  const categories = await readJson('categories');
  const subcat = categories.find(c => c.id === id);
  if (!subcat) return res.status(404).send('Category not found');
  const products = await readJson('products');
  const list = products.filter(p => p.categoryId === id);
  res.render('shop/category', { title: subcat.name, subcat, products: list });
});

// Product detail
router.get('/product/:id', async (req, res) => {
  const { id } = req.params;
  const products = await readJson('products');
  const p = products.find(pr => pr.id === id);
  if (!p) return res.status(404).send('Not found');
  res.render('shop/product', { title: p.name, p });
});

// Cart helpers
function ensureCart(req) {
  if (!req.session.cart) req.session.cart = { items: [] }; // items: [{id,name,price,qty}]
  return req.session.cart;
}

router.post('/cart/add', async (req, res) => {
  const { id, qty } = req.body;
  const products = await readJson('products');
  const p = products.find(pr => pr.id === id);
  if (!p) return res.redirect('back');
  const cart = ensureCart(req);
  const q = Math.max(1, parseInt(qty || '1', 10));
  const existing = cart.items.find(it => it.id === id);
  if (existing) existing.qty += q; else cart.items.push({ id: p.id, name: p.name, price: p.price, qty: q });
  res.redirect('/cart');
});

router.post('/cart/update', (req, res) => {
  const cart = ensureCart(req);
  const { id, qty } = req.body;
  const q = Math.max(0, parseInt(qty || '1', 10));
  const idx = cart.items.findIndex(it => it.id === id);
  if (idx !== -1) {
    if (q === 0) cart.items.splice(idx, 1); else cart.items[idx].qty = q;
  }
  res.redirect('/cart');
});

router.get('/cart', (req, res) => {
  const cart = ensureCart(req);
  const total = cart.items.reduce((sum, it) => sum + it.price * it.qty, 0);
  res.render('shop/cart', { title: 'Your Cart', cart: cart.items, total });
});

router.post('/cart/clear', (req, res) => {
  req.session.cart = { items: [] };
  res.redirect('/cart');
});

router.post('/checkout', (req, res) => {
  // Dummy checkout
  req.session.cart = { items: [] };
  res.render('shop/checkout', { title: 'Checkout Complete' });
});

export default router;
