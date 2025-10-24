import React, {useEffect, useMemo, useRef, useState} from 'react';
import ProductCard from '../../components/products/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';

export default function Tshirts(){
  const [items,setItems] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [size, setSize] = useState('all');
  const [color, setColor] = useState('all');
  const [sort, setSort] = useState('featured');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState('');
  const [newProd, setNewProd] = useState({
    title:'', price:'', description:'', stock:'',
    sizes:{ XS:false,S:false,M:false,L:false,XL:false },
    colors:{ Black:false,White:false,Navy:false,Gray:false },
    images:[]
  });
  const { isSignedIn, user } = useUser();
  const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'mohamedtareq543219@gmail.com').toLowerCase().trim();
  const USER_EMAIL = ((user?.primaryEmailAddress?.emailAddress) || (user?.emailAddresses?.[0]?.emailAddress) || '').toLowerCase().trim();
  const IS_ADMIN = isSignedIn && (USER_EMAIL === ADMIN_EMAIL || USER_EMAIL.includes('mohamedtareq543219'));
  const [uploadPct, setUploadPct] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [gender, setGender] = useState('Unisex');
  const [category, setCategory] = useState('men-tshirts');
  const [discount, setDiscount] = useState('');
  const fileInputRef = useRef(null);

  // Compress image client-side to speed up uploads (max 1600px, ~82% quality)
  const compressImage = async (file) => {
    try{
      if(!file || !file.type?.startsWith('image/')) return file;
      const dataUrl = await new Promise((res, rej)=>{
        const fr = new FileReader();
        fr.onload = ()=> res(fr.result);
        fr.onerror = rej;
        fr.readAsDataURL(file);
      });
      const img = await new Promise((res, rej)=>{
        const im = new Image();
        im.onload = ()=> res(im);
        im.onerror = rej;
        im.src = dataUrl;
      });
      const maxSide = 1600;
      let { width, height } = img;
      if (width > maxSide || height > maxSide){
        const scale = Math.min(maxSide/width, maxSide/height);
        width = Math.round(width*scale); height = Math.round(height*scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const blob = await new Promise((res)=> canvas.toBlob(res, 'image/jpeg', 0.82));
      if(!blob) return file;
      const name = (file.name || 'image').replace(/\.(png|jpg|jpeg|webp)$/i, '') + '-compressed.jpg';
      return new File([blob], name, { type: 'image/jpeg' });
    }catch{ return file; }
  };

  const loadItems = async ()=>{
    try{
      const { firebaseFunctions } = await import('../../config/firebase');
      const res = await firebaseFunctions.getProducts({ category: 'men-tshirts', pageSize: 48 });
      setItems(res.products || []);
    }catch(err){
      console.error('Failed to load tshirts', err);
      setError(err.message || 'Failed to load');
    }finally{ setLoading(false); }
  };

  useEffect(()=>{ loadItems(); },[]);

  // Persist filters locally
  useEffect(()=>{
    try{
      const saved = localStorage.getItem('tshirts_filters_v1');
      if(saved){
        const v = JSON.parse(saved);
        if(typeof v.search === 'string') setSearch(v.search);
        if(v.size) setSize(v.size);
        if(v.color) setColor(v.color);
        if(v.sort) setSort(v.sort);
      }
    }catch(e){}
  },[]);

  useEffect(()=>{
    try{
      localStorage.setItem('tshirts_filters_v1', JSON.stringify({search, size, color, sort}));
    }catch(e){}
  },[search,size,color,sort]);

  // Debounce search input
  useEffect(()=>{
    const t = setTimeout(()=> setDebouncedSearch(search.trim()), 250);
    return ()=> clearTimeout(t);
  },[search]);

  const filtered = useMemo(()=>{
    let r = [...items];
    if (debouncedSearch) r = r.filter(p => (p.name || '').toLowerCase().includes(debouncedSearch.toLowerCase()));
    if (size !== 'all') r = r.filter(p => Array.isArray(p.sizes) ? p.sizes.includes(size) : true);
    if (color !== 'all') r = r.filter(p => Array.isArray(p.colors) ? p.colors.includes(color) : true);
    switch (sort) {
      case 'price-asc': r.sort((a,b)=> (a.price||0) - (b.price||0)); break;
      case 'price-desc': r.sort((a,b)=> (b.price||0) - (a.price||0)); break;
      case 'newest': r.sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0)); break;
      default: break;
    }
    return r;
  },[items, search, size, color, sort]);

  if(loading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">Loading...</div>
  if(error) return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-red-500">{error}</div>

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">T-Shirts</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Street-ready tees. Premium fabrics. Bold designs.</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search t-shirts"
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                className="w-56 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 focus:outline-none"
              />
              {search && (
                <button onClick={()=>setSearch('')} className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm">Clear</button>
              )}
              <select value={sort} onChange={(e)=>setSort(e.target.value)} className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              {IS_ADMIN && (
                <button onClick={()=>setIsAddOpen(true)} className="px-4 py-2 rounded-lg bg-pink-600 text-white">Add Product</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center gap-3">
            <select value={size} onChange={(e)=>setSize(e.target.value)} className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
              <option value="all">All Sizes</option>
              {['XS','S','M','L','XL','2XL'].map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={color} onChange={(e)=>setColor(e.target.value)} className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
              <option value="all">All Colors</option>
              {['Black','White','Navy','Gray','Red','Blue','Green'].map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="ml-auto text-sm text-gray-600 dark:text-gray-300">{filtered.length} items</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(p=> <ProductCard key={p.id} product={p} />)}
        </div>
      </div>

      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div initial={{opacity:0, y:24}} animate={{opacity:1, y:0}} exit={{opacity:0, y:24}} className="relative rounded-2xl w-full max-w-3xl mx-4 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(1000px_400px_at_10%_-10%,#ec4899,transparent),radial-gradient(800px_300px_at_110%_10%,#8b5cf6,transparent)]" />
              <div className="relative bg-gray-900/95 text-white border border-gray-800 p-6 max-h-[85vh] overflow-y-auto rounded-2xl">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600/20 text-pink-300">👕</span>
                    <h3 className="text-2xl font-black tracking-tight">Add T‑Shirt</h3>
                  </div>
                  <button onClick={()=>setIsAddOpen(false)} className="text-gray-300 hover:text-white">✕</button>
                </div>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Right-style preview column (like dashboard) */}
                <div className="md:col-span-1 order-last md:order-first">
                  <label className="block text-sm mb-2">Upload Images</label>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="aspect-square w-full overflow-hidden rounded-lg ring-1 ring-white/10 grid place-items-center bg-black/20">
                      {newProd.images?.length ? (
                        <img className="object-cover w-full h-full" src={URL.createObjectURL(newProd.images[selectedIdx] || newProd.images[0])} alt="preview" />
                      ) : (
                        <div className="text-xs text-gray-400">No image</div>
                      )}
                    </div>
                    {/* Thumbs */}
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {(newProd.images||[]).map((f,idx)=> (
                        <button key={idx} onClick={()=>setSelectedIdx(idx)} className={`overflow-hidden rounded-md ring-1 ${selectedIdx===idx? 'ring-pink-500' : 'ring-white/10'}`}>
                          <img className="object-cover w-full h-16" src={URL.createObjectURL(f)} alt="thumb" />
                        </button>
                      ))}
                    </div>
                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-2">
                      <button type="button" className="px-2 py-1 text-xs rounded bg-pink-600/20 text-pink-300 border border-pink-500/40" onClick={()=>{
                        // set as cover -> move selected to index 0
                        setNewProd(p=>{
                          const arr=[...p.images]; if(selectedIdx<0||selectedIdx>=arr.length) return p; const [it]=arr.splice(selectedIdx,1); arr.unshift(it); setSelectedIdx(0); return {...p, images:arr};
                        })
                      }}>Set Cover</button>
                      <button type="button" className="px-2 py-1 text-xs rounded bg-white/10" onClick={()=>{
                        setNewProd(p=>{ const arr=[...p.images]; arr.splice(selectedIdx,1); setSelectedIdx(0); return {...p, images:arr}; })
                      }}>Remove</button>
                    </div>
                    <div
                      onDragOver={(e)=>e.preventDefault()}
                      onDrop={(e)=>{ e.preventDefault(); const files=[...e.dataTransfer.files]; setNewProd(p=>({...p, images:[...p.images, ...files.filter(f=>f.type.startsWith('image/'))]})); }}
                      className="mt-3 border-2 border-dashed border-pink-500/40 rounded-xl p-4 text-gray-300 min-h-[120px] flex flex-col items-center justify-center gap-2 hover:border-pink-400 transition-colors"
                    >
                      <div className="text-xs opacity-70">Drag images here or</div>
                      <button type="button" className="px-3 py-1.5 rounded-md bg-pink-600/30 text-pink-200 border border-pink-500/40 hover:bg-pink-600/40" onClick={()=> fileInputRef.current?.click()}>Upload Images</button>
                      <input ref={fileInputRef} className="hidden" multiple type="file" accept="image/*" onChange={(e)=>{ const files=[...(e.target.files||[])]; setNewProd(p=>({...p, images:[...p.images, ...files]})); }} />
                    </div>
                  </div>
                </div>
                {/* Form column */}
                <div className="md:col-span-2 space-y-4 order-first md:order-last">
                  <div className="grid grid-cols-2 gap-4">
                    <input className="bg-transparent border border-white/10 focus:border-pink-500/60 rounded-lg p-3 transition" placeholder="Title" value={newProd.title} onChange={e=>setNewProd(p=>({...p,title:e.target.value}))} />
                    <input className="bg-transparent border border-white/10 focus:border-pink-500/60 rounded-lg p-3 transition" placeholder="Price (EGP)" type="number" value={newProd.price} onChange={e=>setNewProd(p=>({...p,price:e.target.value}))} />
                  </div>
                  <textarea className="w-full bg-transparent border border-white/10 focus:border-pink-500/60 rounded-lg p-3 transition" rows={3} placeholder="Description" value={newProd.description} onChange={e=>setNewProd(p=>({...p,description:e.target.value}))} />
                  <div className="grid grid-cols-2 gap-4">
                    <input className="bg-transparent border border-white/10 focus:border-pink-500/60 rounded-lg p-3 transition" placeholder="Stock" type="number" value={newProd.stock} onChange={e=>setNewProd(p=>({...p,stock:e.target.value}))} />
                    <input className="bg-transparent border border-white/10 focus:border-pink-500/60 rounded-lg p-3 transition" placeholder="Discount % (optional)" type="number" value={discount} onChange={e=>setDiscount(e.target.value)} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium mb-2">Available Sizes</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(newProd.sizes).map(s=> (
                          <button key={s} type="button" onClick={()=>setNewProd(p=>({...p,sizes:{...p.sizes,[s]:!p.sizes[s]}}))} className={`px-3 py-1 rounded-md text-sm border ${newProd.sizes[s]? 'bg-pink-600 text-white border-pink-600':'bg-transparent border-white/10 hover:border-pink-500/60'}`}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Available Colors</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(newProd.colors).map(c=> (
                          <button key={c} type="button" onClick={()=>setNewProd(p=>({...p,colors:{...p.colors,[c]:!p.colors[c]}}))} className={`px-3 py-1 rounded-md text-sm border ${newProd.colors[c]? 'bg-pink-600 text-white border-pink-600':'bg-transparent border-white/10 hover:border-pink-500/60'}`}>{c}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Gender & Category */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium mb-2">Gender</div>
                      <div className="flex flex-wrap gap-2">
                        {['Men','Women','Unisex'].map(g=> (
                          <button key={g} type="button" onClick={()=>setGender(g)} className={`px-3 py-1 rounded-md text-sm border ${gender===g? 'bg-pink-600 text-white border-pink-600':'bg-transparent border-white/10 hover:border-pink-500/60'}`}>{g}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Category</div>
                      <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full bg-transparent border border-white/10 rounded-lg p-3">
                        <option className="bg-gray-900" value="men-tshirts">T‑Shirts</option>
                        <option className="bg-gray-900" value="men-pants">Pants</option>
                        <option className="bg-gray-900" value="accessories">Accessories</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end items-center gap-4 pt-2">
                    {adding && (
                      <div className="w-40 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${uploadPct}%` }} />
                      </div>
                    )}
                    {addMsg && <div className={`text-sm ${adding? 'text-pink-300':'text-green-400'}`}>{addMsg}{adding && uploadPct>0 ? ` ${uploadPct}%` : ''}</div>}
                    <button
                      disabled={adding || !newProd.title || !newProd.price || !(newProd.images?.length)}
                      onClick={async ()=>{
                        let tempId = null;
                        try{
                          if(!newProd.title || !newProd.price){ setAddMsg('Please fill title and price.'); return; }
                          setAdding(true); setAddMsg('Uploading product...');
                          const { firebaseFunctions } = await import('../../config/firebase');
                          const sizesArr = Object.keys(newProd.sizes).filter(k=>newProd.sizes[k]);
                          const colorsArr = Object.keys(newProd.colors).filter(k=>newProd.colors[k]);
                          const compressedArr = await Promise.all((newProd.images||[]).map(f=>compressImage(f)));
                          // Upload to backend proxy to avoid Storage CORS
                          const fd = new FormData();
                          (compressedArr||[]).forEach((file,i)=> fd.append('images', file, file.name || `image_${i}.jpg`));
                          const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
                          let upJson;
                          const upRes = await fetch(`${apiBase}/api/upload`, { method: 'POST', body: fd });
                          if(!upRes.ok){
                            const txt = await upRes.text().catch(()=> '');
                            throw new Error(`Upload failed (${upRes.status}): ${txt || upRes.statusText}`);
                          }
                          upJson = await upRes.json();
                          const urls = Array.isArray(upJson.urls) ? upJson.urls : [];

                          // Optimistic UI: use final URLs
                          tempId = 'tmp-'+Date.now();
                          const tempItem = {
                            id: tempId,
                            name: newProd.title,
                            description: newProd.description || '',
                            price: Number(newProd.price)||0,
                            category,
                            stock: Number(newProd.stock)||0,
                            inStock: Number(newProd.stock)>0,
                            discount: Number(discount)||0,
                            gender,
                            sizes: sizesArr,
                            colors: colorsArr,
                            images: urls
                          };
                          setItems(prev=> [tempItem, ...prev]);
                          await firebaseFunctions.adminCreateProduct({
                            name: newProd.title,
                            description: newProd.description || '',
                            price: Number(newProd.price)||0,
                            category,
                            stock: Number(newProd.stock)||0,
                            inStock: Number(newProd.stock)>0,
                            discount: Number(discount)||0,
                            gender,
                            sizes: sizesArr,
                            colors: colorsArr,
                            images: urls
                          });
                          setAddMsg('Product added');
                          await loadItems();
                          setTimeout(()=>{ setIsAddOpen(false); setAddMsg(''); setNewProd({title:'',price:'',description:'',stock:'',sizes:{XS:false,S:false,M:false,L:false,XL:false},colors:{Black:false,White:false,Navy:false,Gray:false},images:[]}); setGender('Unisex'); setCategory('men-tshirts'); setDiscount(''); setSelectedIdx(0); }, 700);
                        }catch(err){
                          console.error('Add product failed:', err);
                          setAddMsg(err?.message || 'Add failed');
                          if(tempId){ setItems(prev=> prev.filter(p=>p.id !== tempId)); }
                        }
                        finally{ setAdding(false); }
                      }}
                      className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white"
                    >{adding? 'Adding...' : 'Add Product'}</button>
                  </div>
                </div>
              </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
