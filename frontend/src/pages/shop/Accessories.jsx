import React, {useEffect, useMemo, useState} from 'react';
import ProductCard from '../../components/products/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';

export default function Accessories(){
  const [items,setItems] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);
  const [search, setSearch] = useState('');
  const [color, setColor] = useState('all');
  const [sort, setSort] = useState('featured');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState('');
  const [newProd, setNewProd] = useState({
    title:'', price:'', description:'', stock:'',
    colors:{ Black:false,White:false,Navy:false,Gray:false,Gold:false,Silver:false,Red:false,Blue:false },
    images:[]
  });
  const { isSignedIn, user } = useUser();
  const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'mohamedtareq543219@gmail.com').toLowerCase().trim();
  const USER_EMAIL = ((user?.primaryEmailAddress?.emailAddress) || (user?.emailAddresses?.[0]?.emailAddress) || '').toLowerCase().trim();
  const IS_ADMIN = isSignedIn && (USER_EMAIL === ADMIN_EMAIL || USER_EMAIL.includes('mohamedtareq543219'));
  const [uploadPct, setUploadPct] = useState(0);

  useEffect(()=>{
    (async ()=>{
      try{
        const { firebaseFunctions } = await import('../../config/firebase');
        const res = await firebaseFunctions.getProducts({ category: 'accessories', pageSize: 48 });
        setItems(res.products || []);
      }catch(err){
        console.error('Failed to load accessories', err);
        setError(err.message || 'Failed to load');
      }finally{ setLoading(false); }
    })()
  },[]);

  const filtered = useMemo(()=>{
    let r = [...items];
    if (search) r = r.filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()));
    if (color !== 'all') r = r.filter(p => Array.isArray(p.colors) ? p.colors.includes(color) : true);
    switch (sort) {
      case 'price-asc': r.sort((a,b)=> (a.price||0) - (b.price||0)); break;
      case 'price-desc': r.sort((a,b)=> (b.price||0) - (a.price||0)); break;
      case 'newest': r.sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0)); break;
      default: break;
    }
    return r;
  },[items, search, color, sort]);

  if(loading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">Loading...</div>
  if(error) return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-red-500">{error}</div>

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">Accessories</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Finish the fit with standout details.</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search accessories"
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                className="w-56 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 focus:outline-none"
              />
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
            <select value={color} onChange={(e)=>setColor(e.target.value)} className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
              <option value="all">All Colors</option>
              {['Black','White','Navy','Gray','Gold','Silver','Red','Blue'].map(c=> <option key={c} value={c}>{c}</option>)}
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
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:20}} className="bg-gray-900 text-white rounded-xl p-6 w-full max-w-2xl mx-4 border border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Add Accessory</h3>
                <button onClick={()=>setIsAddOpen(false)} className="text-gray-300">✕</button>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm mb-2">Images (drag & drop, unlimited)</label>
                  <div
                    onDragOver={(e)=>e.preventDefault()}
                    onDrop={(e)=>{ e.preventDefault(); const files=[...e.dataTransfer.files]; setNewProd(p=>({...p, images:[...p.images, ...files.filter(f=>f.type.startsWith('image/'))]})); }}
                    className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-gray-300 min-h-[180px] flex flex-col items-center justify-center gap-2"
                  >
                    <div className="text-xs opacity-70">Drag images here or choose files</div>
                    <input multiple type="file" accept="image/*" onChange={(e)=>{ const files=[...(e.target.files||[])]; setNewProd(p=>({...p, images:[...p.images, ...files]})); }} />
                    {newProd.images?.length>0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2 w-full">
                        {newProd.images.map((f,idx)=> (
                          <div key={idx} className="relative group">
                            <img alt="preview" className="rounded max-h-24 w-full object-cover" src={URL.createObjectURL(f)} />
                            <button type="button" onClick={()=> setNewProd(p=>({...p, images: p.images.filter((_,i)=>i!==idx)}))} className="absolute top-1 right-1 text-xs bg-black/60 text-white rounded px-1 opacity-0 group-hover:opacity-100">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input className="bg-transparent border border-gray-700 rounded-md p-2" placeholder="Title" value={newProd.title} onChange={e=>setNewProd(p=>({...p,title:e.target.value}))} />
                    <input className="bg-transparent border border-gray-700 rounded-md p-2" placeholder="Price (EGP)" type="number" value={newProd.price} onChange={e=>setNewProd(p=>({...p,price:e.target.value}))} />
                  </div>
                  <textarea className="w-full bg-transparent border border-gray-700 rounded-md p-2" rows={3} placeholder="Description" value={newProd.description} onChange={e=>setNewProd(p=>({...p,description:e.target.value}))} />
                  <div className="grid grid-cols-2 gap-4">
                    <input className="bg-transparent border border-gray-700 rounded-md p-2" placeholder="Stock" type="number" value={newProd.stock} onChange={e=>setNewProd(p=>({...p,stock:e.target.value}))} />
                    <div />
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-2">Available Colors</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(newProd.colors).map(c=> (
                        <button key={c} type="button" onClick={()=>setNewProd(p=>({...p,colors:{...p.colors,[c]:!p.colors[c]}}))} className={`px-3 py-1 rounded-md text-sm border ${newProd.colors[c]? 'bg-white text-black border-white':'bg-transparent border-gray-700'}`}>{c}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end items-center gap-3">
                    {addMsg && <div className={`text-sm ${adding? 'text-blue-300':'text-green-400'}`}>{addMsg}{adding && uploadPct>0 ? ` ${uploadPct}%` : ''}</div>}
                    <button
                      disabled={adding}
                      onClick={async ()=>{
                        try{
                          if(!newProd.title || !newProd.price){ setAddMsg('Please fill title and price.'); return; }
                          setAdding(true); setAddMsg('Uploading product...');
                          const { firebaseFunctions } = await import('../../config/firebase');
                          const colorsArr = Object.keys(newProd.colors).filter(k=>newProd.colors[k]);
                          // compress all images
                          const compressImage = async (file)=>{
                            try{
                              if(!file || !file.type?.startsWith('image/')) return file;
                              const dataUrl = await new Promise((res, rej)=>{ const fr = new FileReader(); fr.onload = ()=> res(fr.result); fr.onerror = rej; fr.readAsDataURL(file); });
                              const img = await new Promise((res, rej)=>{ const im = new Image(); im.onload = ()=> res(im); im.onerror = rej; im.src = dataUrl; });
                              const maxSide = 1600; let { width, height } = img; if(width>maxSide||height>maxSide){ const s=Math.min(maxSide/width,maxSide/height); width=Math.round(width*s); height=Math.round(height*s); }
                              const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height; const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0,width,height);
                              const blob = await new Promise((res)=> canvas.toBlob(res,'image/jpeg',0.82)); if(!blob) return file;
                              const name=(file.name||'image').replace(/\.(png|jpg|jpeg|webp)$/i,'')+'-compressed.jpg'; return new File([blob], name, {type:'image/jpeg'});
                            }catch{ return file; }
                          };
                          const compressedArr = await Promise.all((newProd.images||[]).map(f=>compressImage(f)));
                          await firebaseFunctions.adminCreateProduct({
                            name: newProd.title,
                            description: newProd.description || '',
                            price: Number(newProd.price)||0,
                            category: 'accessories',
                            stock: Number(newProd.stock)||0,
                            inStock: Number(newProd.stock)>0,
                            colors: colorsArr,
                            images: compressedArr
                          }, { onProgress: setUploadPct });
                          setAddMsg('Product added');
                          const res = await firebaseFunctions.getProducts({ category: 'accessories', pageSize: 48 });
                          setItems(res.products || []);
                          setTimeout(()=>{ setIsAddOpen(false); setAddMsg(''); setNewProd({title:'',price:'',description:'',stock:'',colors:{ Black:false,White:false,Navy:false,Gray:false,Gold:false,Silver:false,Red:false,Blue:false },images:[]}); }, 700);
                        }catch(err){ setAddMsg(err.message || 'Add failed'); }
                        finally{ setAdding(false); }
                      }}
                      className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white"
                    >{adding? 'Adding...' : 'Add Product'}</button>
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
