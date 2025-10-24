import React, {useEffect, useMemo, useRef, useState} from 'react';
import ProductCard from '../../components/products/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';

export default function Pants(){
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
    colors:{ Black:false,White:false,Navy:false,Gray:false,Khaki:false,Blue:false },
    images:[]
  });
  const { isSignedIn, user } = useUser();
  const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'mohamedtareq543219@gmail.com').toLowerCase().trim();
  const USER_EMAIL = ((user?.primaryEmailAddress?.emailAddress) || (user?.emailAddresses?.[0]?.emailAddress) || '').toLowerCase().trim();
  const IS_ADMIN = isSignedIn && (USER_EMAIL === ADMIN_EMAIL || USER_EMAIL.includes('mohamedtareq543219'));
  const [uploadPct, setUploadPct] = useState(0);
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

  useEffect(()=>{
    (async ()=>{
      try{
        const { firebaseFunctions } = await import('../../config/firebase');
        const res = await firebaseFunctions.getProducts({ category: 'men-pants', pageSize: 48 });
        setItems(res.products || []);
      }catch(err){
        console.error('Failed to load pants', err);
        setError(err.message || 'Failed to load');
      }finally{ setLoading(false); }
    })()
  },[]);

  // persist filters
  useEffect(()=>{
    try{
      const saved = localStorage.getItem('pants_filters_v1');
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
    try{ localStorage.setItem('pants_filters_v1', JSON.stringify({search,size,color,sort})); }catch(e){}
  },[search,size,color,sort]);

  // debounce search
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1
                className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#4C1D95] dark:via-[#7C3AED] dark:to-[#A78BFA]"
                style={{
                  ...(typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
                    ? { textShadow: '0 0 14px rgba(124,58,237,0.25)' }
                    : {})
                }}
              >
                Pants
              </h1>
              <p className="mt-2 text-gray-700 dark:text-gray-200">
                Comfort, durability, and style for every move.
              </p>
              {IS_ADMIN && (
                <button onClick={()=>setIsAddOpen(true)} className="px-4 py-2 rounded-lg bg-pink-600 text-white">Add Product</button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search pants"
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
              {['Black','White','Navy','Gray','Khaki','Blue'].map(c=> <option key={c} value={c}>{c}</option>)}
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
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(1000px_400px_at_10%_-10%,#06b6d4,transparent),radial-gradient(800px_300px_at_110%_10%,#3b82f6,transparent)]" />
              <div className="relative bg-gray-900/95 text-white border border-gray-800 p-6 max-h-[85vh] overflow-y-auto rounded-2xl">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">👖</span>
                    <h3 className="text-2xl font-black tracking-tight">Add Pants</h3>
                  </div>
                  <button onClick={()=>setIsAddOpen(false)} className="text-gray-300 hover:text-white">✕</button>
                </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm mb-2">Images (drag & drop, unlimited)</label>
                  <div
                    onDragOver={(e)=>e.preventDefault()}
                    onDrop={(e)=>{ e.preventDefault(); const files=[...e.dataTransfer.files]; setNewProd(p=>({...p, images:[...p.images, ...files.filter(f=>f.type.startsWith('image/'))]})); }}
                    className="border-2 border-dashed border-cyan-400/40 rounded-xl p-4 text-gray-300 min-h-[200px] flex flex-col items-center justify-center gap-2 hover:border-cyan-300 transition-colors bg-white/[0.02]"
                  >
                    <div className="text-xs opacity-70">Drag images here or</div>
                    <button type="button" className="px-3 py-1.5 rounded-md bg-cyan-600/30 text-cyan-200 border border-cyan-500/40 hover:bg-cyan-600/40" onClick={()=> fileInputRef.current?.click()}>Upload Images</button>
                    <input ref={fileInputRef} className="hidden" multiple type="file" accept="image/*" onChange={(e)=>{ const files=[...(e.target.files||[])]; setNewProd(p=>({...p, images:[...p.images, ...files]})); }} />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input className="bg-transparent border border-white/10 focus:border-cyan-400/60 rounded-lg p-3 transition" placeholder="Title" value={newProd.title} onChange={e=>setNewProd(p=>({...p,title:e.target.value}))} />
                    <input className="bg-transparent border border-white/10 focus:border-cyan-400/60 rounded-lg p-3 transition" placeholder="Price (EGP)" type="number" value={newProd.price} onChange={e=>setNewProd(p=>({...p,price:e.target.value}))} />
                  </div>
                  <textarea className="w-full bg-transparent border border-white/10 focus:border-cyan-400/60 rounded-lg p-3 transition" rows={3} placeholder="Description" value={newProd.description} onChange={e=>setNewProd(p=>({...p,description:e.target.value}))} />
                  <div className="grid grid-cols-2 gap-4">
                    <input className="bg-transparent border border-white/10 focus:border-cyan-400/60 rounded-lg p-3 transition" placeholder="Stock" type="number" value={newProd.stock} onChange={e=>setNewProd(p=>({...p,stock:e.target.value}))} />
                    <div />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium mb-2">Available Sizes</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(newProd.sizes).map(s=> (
                          <button key={s} type="button" onClick={()=>setNewProd(p=>({...p,sizes:{...p.sizes,[s]:!p.sizes[s]}}))} className={`px-3 py-1 rounded-md text-sm border ${newProd.sizes[s]? 'bg-cyan-500 text-white border-cyan-500':'bg-transparent border-white/10 hover:border-cyan-400/60'}`}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Available Colors</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(newProd.colors).map(c=> (
                          <button key={c} type="button" onClick={()=>setNewProd(p=>({...p,colors:{...p.colors,[c]:!p.colors[c]}}))} className={`px-3 py-1 rounded-md text-sm border ${newProd.colors[c]? 'bg-cyan-500 text-white border-cyan-500':'bg-transparent border-white/10 hover:border-cyan-400/60'}`}>{c}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end items-center gap-4 pt-2">
                    {adding && (
                      <div className="w-40 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: `${uploadPct}%` }} />
                      </div>
                    )}
                    {addMsg && <div className={`text-sm ${adding? 'text-cyan-300':'text-green-400'}`}>{addMsg}{adding && uploadPct>0 ? ` ${uploadPct}%` : ''}</div>}
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
                          const fd = new FormData();
                          (compressedArr||[]).forEach((file,i)=> fd.append('images', file, file.name || `image_${i}.jpg`));
                          const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
                          const upRes = await fetch(`${apiBase}/api/upload`, { method: 'POST', body: fd });
                          if(!upRes.ok){
                            const txt = await upRes.text().catch(()=> '');
                            throw new Error(`Upload failed (${upRes.status}): ${txt || upRes.statusText}`);
                          }
                          const upJson = await upRes.json();
                          const urls = Array.isArray(upJson.urls) ? upJson.urls : [];

                          // optimistic
                          tempId = 'tmp-'+Date.now();
                          const tempItem = {
                            id: tempId,
                            name: newProd.title,
                            description: newProd.description || '',
                            price: Number(newProd.price)||0,
                            category: 'men-pants',
                            stock: Number(newProd.stock)||0,
                            inStock: Number(newProd.stock)>0,
                            sizes: sizesArr,
                            colors: colorsArr,
                            images: urls
                          };
                          setItems(prev=> [tempItem, ...prev]);

                          await firebaseFunctions.adminCreateProduct({
                            name: newProd.title,
                            description: newProd.description || '',
                            price: Number(newProd.price)||0,
                            category: 'men-pants',
                            stock: Number(newProd.stock)||0,
                            inStock: Number(newProd.stock)>0,
                            sizes: sizesArr,
                            colors: colorsArr,
                            images: urls
                          });
                          setAddMsg('Product added');
                          const res = await firebaseFunctions.getProducts({ category: 'men-pants', pageSize: 48 });
                          setItems(res.products || []);
                          setTimeout(()=>{ setIsAddOpen(false); setAddMsg(''); setNewProd({title:'',price:'',description:'',stock:'',sizes:{XS:false,S:false,M:false,L:false,XL:false},colors:{Black:false,White:false,Navy:false,Gray:false,Khaki:false,Blue:false},images:[]}); }, 700);
                        }catch(err){
                          console.error('Pants add failed:', err);
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
