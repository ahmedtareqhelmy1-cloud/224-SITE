import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tab } from '@headlessui/react';
import { useAdminStatus } from '../components/AdminCheck';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function AdminPanel() {
  const { isAdmin, isLoaded } = useAdminStatus();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customDesigns, setCustomDesigns] = useState([]);
  const [pages, setPages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    inStock: true,
    images: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const fb = await import('../config/firebase').then(m => m.firebaseFunctions);
      const productsRes = await fb.getProducts();
      const productsData = productsRes?.products || [];
      const ordersData = await fb.getAllOrders();
      const designsData = await fb.getAllCustomDesigns();
      const pagesData = await fb.getPages();
      setProducts(productsData);
      setOrders(ordersData || []);
      setCustomDesigns(designsData || []);
      setPages(pagesData || []);
      setApiAvailable(true);
    } catch (err) {
      console.error('Firebase fetch failed:', err);
      setApiAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!newProduct.name || !newProduct.price) {
        throw new Error('Product name and price are required');
      }
      // Use Firebase admin create product
      setSuccessMessage('Uploading product and images — this may take a few seconds...');
      const { firebaseFunctions: fb } = await import('../config/firebase');
      const created = await fb.adminCreateProduct({
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        category: newProduct.category,
        inStock: !!newProduct.inStock,
        images: newProduct.images || []
      });
      // update UI immediately
      setProducts(prev => [{ id: created.id, ...created }, ...prev]);
      setSuccessMessage('Product added successfully');
      setNewProduct({ name: '', description: '', price: '', category: '', inStock: true, images: [] });
    } catch (error) {
      console.error('Error adding product:', error);
      alert(error.message || 'Error adding product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update order status via Firebase
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const fb = await import('../config/firebase').then(m => m.firebaseFunctions);
      await fb.updateOrderStatus(orderId, newStatus);
      await fetchData();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Error updating order status. Please try again.');
    }
  };

  const handleDesignStatusUpdate = async (designId, newStatus) => {
    try {
      const fb = await import('../config/firebase').then(m => m.firebaseFunctions);
      await fb.updateCustomDesignStatus(designId, newStatus);
      await fetchData();
    } catch (err) {
      console.error('Error updating design status:', err);
      alert('Error updating design status. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const fb = await import('../config/firebase').then(m => m.firebaseFunctions);
      await fb.adminDeleteProduct(productId);
      await fetchData();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error deleting product. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <Tab.Group onChange={setActiveTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-indigo-900/20 p-1">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  selected
                    ? 'bg-white text-indigo-700 shadow'
                    : 'text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600'
                )
              }
            >
              Products
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  selected
                    ? 'bg-white text-indigo-700 shadow'
                    : 'text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600'
                )
              }
            >
              Orders
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  selected
                    ? 'bg-white text-indigo-700 shadow'
                    : 'text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600'
                )
              }
            >
              Custom Designs
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  selected
                    ? 'bg-white text-indigo-700 shadow'
                    : 'text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600'
                )
              }
            >
              Pages
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-4">
            <Tab.Panel>
              {/* Add Product Form (visible only to admin users) */}
              {isLoaded ? (
                isAdmin ? (
                  <div className="bg-white shadow sm:rounded-lg mb-6">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Product</h3>
                      <form onSubmit={handleProductSubmit} className="mt-5 space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Product Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            required
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                              Price
                            </label>
                            <input
                              type="number"
                              name="price"
                              id="price"
                              required
                              value={newProduct.price}
                              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                              Category
                            </label>
                            <select
                              id="category"
                              name="category"
                              required
                              value={newProduct.category}
                              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="">Select category</option>
                              <option value="men-tshirts">Men's T-Shirts</option>
                              <option value="men-pants">Men's Pants</option>
                              <option value="women-dresses">Women's Dresses</option>
                              <option value="women-tops">Women's Tops</option>
                              <option value="accessories">Accessories</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Product Images</label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setNewProduct({ ...newProduct, images: e.target.files })}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          />

                          {newProduct.images && newProduct.images.length > 0 && (
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {Array.from(newProduct.images).map((file, idx) => (
                                <div key={idx} className="relative group">
                                  <img src={URL.createObjectURL(file)} alt={`Preview ${idx + 1}`} className="h-20 w-20 object-cover rounded-lg" />
                                  <button type="button" onClick={() => {
                                    const newFiles = Array.from(newProduct.images);
                                    newFiles.splice(idx, 1);
                                    setNewProduct(p => ({ ...p, images: newFiles }));
                                  }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center mt-4">
                            <input id="inStock" name="inStock" type="checkbox" checked={!!newProduct.inStock} onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">In Stock</label>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
                        >
                          {loading ? 'Adding...' : 'Add Product'}
                        </button>
                        {successMessage && (
                          <div className="mt-4 text-green-600">
                            {successMessage}
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <p className="text-sm text-yellow-700">You must be signed in as an admin to add products.</p>
                  </div>
                )
              ) : (
                <div className="mb-6">Checking admin status...</div>
              )}

              {/* Products List */}
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Products List</h3>
                  <div className="mt-4">
                    <div className="flow-root">
                      <ul role="list" className="-my-5 divide-y divide-gray-200">
                        {products.map((product) => (
                          <motion.li
                            key={product.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-4"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <img
                                  className="h-16 w-16 rounded-md object-cover"
                                  src={product.images[0]}
                                  alt={product.name}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {product.name}
                                </p>
                                <p className="truncate text-sm text-gray-500">
                                  {product.category} - ${product.price}
                                </p>
                              </div>
                              <div>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              {/* Orders List */}
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Orders</h3>
                  <div className="mt-4">
                    <div className="flow-root">
                      <ul role="list" className="-my-5 divide-y divide-gray-200">
                        {orders.map((order) => (
                          <motion.li
                            key={order.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-4"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Order #{order.id.slice(0, 8)}
                                </p>
                                <p className="text-sm text-gray-500">{order.userEmail}</p>
                                <p className="text-sm text-gray-500">
                                  Total: ${order.total.toFixed(2)}
                                </p>
                              </div>
                              <select
                                value={order.status}
                                onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                                className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              {/* Custom Designs List */}
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Custom Design Requests</h3>
                  <div className="mt-4">
                    <div className="flow-root">
                      <ul role="list" className="-my-5 divide-y divide-gray-200">
                        {customDesigns.map((design) => (
                          <motion.li
                            key={design.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="py-4"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {design.productType} - {design.userEmail}
                                </p>
                                <p className="text-sm text-gray-500">{design.designIdea}</p>
                                {design.imageUrl && (
                                  <img
                                    src={design.imageUrl}
                                    alt="Design reference"
                                    className="mt-2 h-20 w-20 rounded-md object-cover"
                                  />
                                )}
                              </div>
                              <select
                                value={design.status}
                                onChange={(e) => handleDesignStatusUpdate(design.id, e.target.value)}
                                className="rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </div>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              {isLoaded && isAdmin ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Create Page */}
                  <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Add Page</h3>
                      <PageCreator onCreated={async()=>{ const fb = await import('../config/firebase').then(m=>m.firebaseFunctions); const list = await fb.getPages(); setPages(list||[]); }} />
                    </div>
                  </div>
                  {/* Existing Pages */}
                  <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-3">Existing Pages</h3>
                      <ul className="divide-y divide-gray-200">
                        {(pages||[]).map(p=> (
                          <li key={p.slug || p.id} className="py-3 flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{p.title || p.slug}</div>
                              <div className="text-sm text-gray-500">/p/{p.slug}</div>
                            </div>
                            <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm">Open</a>
                          </li>
                        ))}
                        {!pages?.length && <li className="py-6 text-sm text-gray-500">No pages yet.</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Only admin users can manage pages.</div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
}

function PageCreator({ onCreated }){
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('<p>Start writing your page content here...</p>');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const toSlug = (s)=> (s||'')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g,'')
    .trim()
    .replace(/\s+/g,'-')
    .replace(/-+/g,'-');

  return (
    <form onSubmit={async (e)=>{
      e.preventDefault(); setBusy(true); setMsg('');
      try{
        const s = slug || toSlug(title);
        if(!s){ setMsg('Enter a title or slug'); setBusy(false); return; }
        const fb = await import('../config/firebase').then(m=>m.firebaseFunctions);
        await fb.createPage({ title, slug: s, content, published: true });
        setMsg('Page created');
        onCreated && onCreated();
      }catch(err){ setMsg(err?.message || 'Failed to create'); }
      finally{ setBusy(false); }
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input value={slug} onChange={(e)=>setSlug(toSlug(e.target.value))} placeholder="auto-from-title" className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Content (HTML)</label>
        <textarea value={content} onChange={(e)=>setContent(e.target.value)} rows={8} className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-mono text-sm" />
      </div>
      {msg && <div className="text-sm text-indigo-600">{msg}</div>}
      <div className="flex justify-end">
        <button disabled={busy} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">{busy? 'Saving…':'Create Page'}</button>
      </div>
    </form>
  )
}