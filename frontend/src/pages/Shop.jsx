import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, setFilters, clearFilters } from '../features/products/productsSlice';
import ProductCard from '../components/products/ProductCard';
import { sampleProducts } from '../data/sampleProducts';
import MultiStepForm from '../components/forms/MultiStepForm';
import { AddProductForm } from '../components/admin/AddProductForm';

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'new', name: 'New Arrivals' },
  { id: 'trending', name: 'Trending' },
  { id: 'bestsellers', name: 'Best Sellers' },
  { id: 'sale', name: 'Sale' }
];

const priceRanges = [
  { min: null, max: null, label: 'All Prices' },
  { min: 0, max: 500, label: 'Under 500 EGP' },
  { min: 500, max: 1000, label: '500 - 1000 EGP' },
  { min: 1000, max: null, label: 'Over 1000 EGP' }
];

const sortOptions = [
  { id: 'featured', name: 'Featured' },
  { id: 'newest', name: 'Newest' },
  { id: 'price-asc', name: 'Price: Low to High' },
  { id: 'price-desc', name: 'Price: High to Low' }
];

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

const Shop = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.products);
  const [isCustomOrderModalOpen, setIsCustomOrderModalOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const { user, isSignedIn } = useUser();

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
  const userEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || null;
  const isAdmin = !!userEmail && (!!ADMIN_EMAIL ? userEmail === ADMIN_EMAIL : false);

  // Add Product form state
  const [newProd, setNewProd] = useState({
    title: '',
    price: '',
    description: '',
    category: 'men-tshirts',
    stock: '',
    sizes: { XS: false, S: false, M: false, L: false, XL: false },
    colors: { Black: false, White: false, Navy: false, Gray: false },
    image: null
  });
  const [adding, setAdding] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [addMessage, setAddMessage] = useState('');

  const [activeFilters, setActiveFilters] = useState({
    category: 'all',
    priceRange: 0,
    sortBy: 'featured'
  });

  const handleCustomOrderSubmit = (formData) => {
    // Here you would typically send the order to your backend
    console.log('Custom order submitted:', formData);
    setIsCustomOrderModalOpen(false);
    // Show success toast or notification
  };

  // Admin: Seed sample products into Firestore
  const handleSeedProducts = async () => {
    if (!isAdmin) return;
    try {
      setSeeding(true);
      const { firebaseFunctions } = await import('../config/firebase');
      let created = 0;
      for (const sp of sampleProducts) {
        try {
          await firebaseFunctions.adminCreateProduct({
            name: sp.name,
            description: sp.description,
            price: Number(sp.price),
            category: sp.category,
            stock: Number(sp.stock),
            inStock: sp.inStock,
            sizes: sp.sizes,
            colors: sp.colors,
            images: sp.images
          });
          created += 1;
        } catch (e) {
          console.error('Seed item failed', sp.name, e);
        }
      }
      // Refresh products list
      dispatch(fetchProducts());
      alert(`Seeded ${created} products.`);
    } catch (err) {
      console.error('Seed failed', err);
      alert('Seeding failed');
    } finally {
      setSeeding(false);
    }
  };

  // Load initial products
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Handle filter changes
  const handleFilterChange = (type, value) => {
    const newFilters = { ...activeFilters, [type]: value };
    setActiveFilters(newFilters);

    dispatch(
      setFilters({
        category: newFilters.category === 'all' ? null : newFilters.category,
        minPrice: priceRanges[newFilters.priceRange].min,
        maxPrice: priceRanges[newFilters.priceRange].max,
        sortBy: newFilters.sortBy
      })
    );
  };

  // Clear all filters
  const handleClearFilters = () => {
    setActiveFilters({
      category: 'all',
      priceRange: 0,
      sortBy: 'featured'
    });
    dispatch(clearFilters());
  };

  // Filtered and sorted products
  const filteredProducts = items
    .filter((product) => {
      if (activeFilters.category !== 'all' && product.category !== activeFilters.category) {
        return false;
      }

      const range = priceRanges[activeFilters.priceRange];
      if (range.min !== null || range.max !== null) {
        const price = product.discount
          ? product.price - (product.price * product.discount) / 100
          : product.price;

        if (range.min !== null && price < range.min) return false;
        if (range.max !== null && price > range.max) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const getPrice = (p) => (p.discount ? p.price - (p.price * p.discount) / 100 : p.price);

      switch (activeFilters.sortBy) {
        case 'price-asc':
          return getPrice(a) - getPrice(b);
        case 'price-desc':
          return getPrice(b) - getPrice(a);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-center mb-4"
          >
            Discover Our Collection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-center text-gray-300 mb-8"
          >
            Premium quality, sustainable fashion for everyone
          </motion.p>
          {/* CTAs removed per request */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={activeFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="relative">
              <select
                value={activeFilters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', Number(e.target.value))}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priceRanges.map((range, index) => (
                  <option key={index} value={index}>
                    {range.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Clear Filters */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearFilters}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Clear Filters
            </motion.button>
          </div>

          {/* Sort Options */}
          <div className="relative">
            <select
              value={activeFilters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Admin quick actions */}
        {isAdmin && (
          <div className="mb-4 flex items-center gap-3">
            <button
              onClick={handleSeedProducts}
              disabled={seeding}
              className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-60"
            >{seeding ? 'Seeding…' : 'Seed Sample Products'}</button>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch(fetchProducts())}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </motion.button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No products found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters to find what you're looking for.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearFilters}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Reset Filters
            </motion.button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Custom Order Modal */}
        <AnimatePresence>
          {isCustomOrderModalOpen && (
            <Modal isOpen={isCustomOrderModalOpen} onClose={() => setIsCustomOrderModalOpen(false)}>
              <div className="py-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
                  Create Your Custom Order
                </h2>
                <MultiStepForm 
                  onSubmit={handleCustomOrderSubmit}
                  onCancel={() => setIsCustomOrderModalOpen(false)}
                />
              </div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Add Product Modal (admin) */}
        <AnimatePresence>
          {isAddProductOpen && (
            <Modal isOpen={isAddProductOpen} onClose={() => setIsAddProductOpen(false)}>
              <div className="py-4">
                <div className="max-w-2xl mx-auto">
                  <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 border border-gray-800 text-white shadow-xl">
                    <h2 className="text-2xl font-extrabold mb-6">Add New Product</h2>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium mb-2">Product Image</label>
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 flex flex-col items-center justify-center text-gray-300">
                          {newProd.image ? (
                            <img alt="preview" className="w-full rounded-md mb-3 object-cover max-h-48" src={URL.createObjectURL(newProd.image)} />
                          ) : (
                            <div className="text-xs opacity-70 mb-2">Drop or select an image</div>
                          )}
                          <input type="file" accept="image/*" onChange={(e)=>setNewProd(p=>({...p,image:e.target.files?.[0] || null}))} />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm mb-1">Title</label>
                            <input className="w-full bg-transparent border border-gray-700 rounded-md p-2 focus:outline-none" placeholder="Graphic Tee #224" value={newProd.title} onChange={e=>setNewProd(p=>({...p,title:e.target.value}))} />
                          </div>
                          <div>
                            <label className="block text-sm mb-1">Price (EGP)</label>
                            <input className="w-full bg-transparent border border-gray-700 rounded-md p-2" placeholder="299" type="number" value={newProd.price} onChange={e=>setNewProd(p=>({...p,price:e.target.value}))} />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm mb-1">Description</label>
                          <textarea className="w-full bg-transparent border border-gray-700 rounded-md p-2" rows={4} placeholder="Premium cotton tee with modern fit" value={newProd.description} onChange={e=>setNewProd(p=>({...p,description:e.target.value}))} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm mb-2">Category</label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                {id:'men-tshirts', label:'T-Shirts'},
                                {id:'men-pants', label:'Pants'},
                                {id:'accessories', label:'Accessories'}
                              ].map(opt => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={()=>setNewProd(p=>({...p,category:opt.id}))}
                                  className={`px-3 py-2 rounded-lg text-sm border ${newProd.category===opt.id? 'bg-pink-600 border-pink-500':'bg-transparent border-gray-700 hover:border-gray-600'}`}
                                >
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm mb-1">Stock</label>
                            <input className="w-full bg-transparent border border-gray-700 rounded-md p-2" placeholder="e.g. 50" type="number" value={newProd.stock} onChange={e=>setNewProd(p=>({...p,stock:e.target.value}))} />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <div className="text-sm font-medium mb-2">Available Sizes</div>
                            <div className="flex flex-wrap gap-2">
                              {Object.keys(newProd.sizes).map(s=> (
                                <button key={s} type="button" onClick={()=>setNewProd(p=>({...p,sizes:{...p.sizes,[s]:!p.sizes[s]}}))} className={`px-3 py-1 rounded-md text-sm border ${newProd.sizes[s]? 'bg-white text-black border-white':'bg-transparent border-gray-700'}`}>{s}</button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-2">Available Colors</div>
                            <div className="flex flex-wrap gap-2">
                              {Object.keys(newProd.colors).map(c=> (
                                <button key={c} type="button" onClick={()=>setNewProd(p=>({...p,colors:{...p.colors,[c]:!p.colors[c]}}))} className={`px-3 py-1 rounded-md text-sm border ${newProd.colors[c]? 'bg-white text-black border-white':'bg-transparent border-gray-700'}`}>{c}</button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end items-center gap-3">
                          {addMessage && <div className={`text-sm ${adding? 'text-blue-300':'text-green-400'}`}>{addMessage}</div>}
                          <button
                            onClick={async ()=>{
                              try{
                                if(!newProd.title || !newProd.price || !newProd.category){
                                  setAddMessage('Please fill title, price, and category.');
                                  return;
                                }
                                setAdding(true); setAddMessage('Uploading product...');
                                const { firebaseFunctions } = await import('../config/firebase');
                                const images = newProd.image ? [newProd.image] : [];
                                const sizesArr = Object.keys(newProd.sizes).filter(k=>newProd.sizes[k]);
                                const colorsArr = Object.keys(newProd.colors).filter(k=>newProd.colors[k]);
                                await firebaseFunctions.adminCreateProduct({
                                  name: newProd.title || 'Untitled',
                                  description: newProd.description || '',
                                  price: Number(newProd.price) || 0,
                                  category: newProd.category, // matches submenu pages
                                  stock: Number(newProd.stock)||0,
                                  inStock: Number(newProd.stock) > 0,
                                  sizes: sizesArr,
                                  colors: colorsArr,
                                  images
                                });
                                setAddMessage('Product added successfully');
                                const target = newProd.category === 'men-tshirts' ? '/shop/tshirts'
                                  : newProd.category === 'men-pants' ? '/shop/pants'
                                  : newProd.category === 'accessories' ? '/shop/accessories'
                                  : '/shop';
                                navigate(target);

                                // reset
                                setNewProd({ title:'', price:'', description:'', category:'men-tshirts', stock:'', sizes:{ XS:false,S:false,M:false,L:false,XL:false }, colors:{ Black:false,White:false,Navy:false,Gray:false }, image:null });
                                // optionally close
                                setTimeout(()=>{ setIsAddProductOpen(false); setAddMessage(''); }, 900);
                              }catch(err){ console.error('Add product failed',err); setAddMessage(err.message || 'Add product failed'); }
                              finally{ setAdding(false); }
                            }}
                            className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-lg disabled:opacity-60"
                            disabled={adding}
                          >
                            {adding ? 'Adding...' : 'Add Product'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Shop;
