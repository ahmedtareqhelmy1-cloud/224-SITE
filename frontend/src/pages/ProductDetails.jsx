import React, {useEffect, useMemo, useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { addToCart } from '../features/cart/cartSlice'

export default function ProductDetails(){
  const {id} = useParams()
  const [p,setP] = useState(null)
  const [view, setView] = useState('front')
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('details')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const PAYMOB_URL = import.meta.env.VITE_PAYMOB_CHECKOUT_URL || 'https://paymob.xyz/cpG3CeBs/'

  useEffect(()=>{
    (async ()=>{
      try{
        const fb = await import('../config/firebase').then(m=>m.firebaseFunctions)
        if(id){
          const prod = await fb.getProductById(id)
          setP(prod)
          // pick defaults
          const sizes = (prod.sizes || prod.sizeOptions || [])
          const colors = (prod.colors || prod.colorOptions || [])
          setSize(sizes[0] || '')
          setColor(colors[0] || '')
          // default view
          const keys = prod.images ? (Array.isArray(prod.images) ? prod.images.map((_,i)=>String(i)) : Object.keys(prod.images)) : []
          if(keys.length) setView(keys[0])
        } else {
          const res = await fb.getProducts()
          const list = res?.products || []
          const prod = list[0] || null
          setP(prod)
        }
      }catch(err){
        console.error('Error loading product details:', err)
        setP(null)
      }
    })()
  },[id])

  // Build a stable list of {key,url} for gallery and color-image matching
  const galleryPairs = useMemo(()=>{
    if(!p) return []
    if(Array.isArray(p.images)) return p.images.map((url,idx)=>({key:String(idx), url}))
    if(typeof p.images === 'object' && p.images){
      const order = ['front','back','left','right','detail1','detail2']
      const keys = Object.keys(p.images)
      keys.sort((a,b)=> order.indexOf(a) - order.indexOf(b))
      return keys.map(k=> ({key:k, url:p.images[k]})).filter(x=>!!x.url)
    }
    return p.image ? [{key:'0', url:p.image}] : []
  },[p])

  const gallery = useMemo(()=> galleryPairs.map(x=>x.url), [galleryPairs])

  if(!p) return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">Loading…</div>

  const price = p.discount ? Math.round(p.price - (p.price * p.discount)/100) : p.price
  const total = price * Math.max(1, qty)


  const handleBuyNow = ()=>{
    window.open(PAYMOB_URL, '_blank')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg">
            <AnimatePresence mode="wait">
              <motion.img
                key={view}
                src={Array.isArray(p.images) ? p.images[Number(view)||0] : (p.images?.[view] || gallery[0])}
                alt={p.name}
                className="w-full h-[560px] object-cover"
                initial={{opacity:0}}
                animate={{opacity:1}}
                exit={{opacity:0}}
                transition={{duration:0.25}}
                onError={(e)=>{ const base = import.meta.env.BASE_URL || '/'; e.currentTarget.src = `${base}assets/Logo.svg`; }}
              />
            </AnimatePresence>
            {p.isSoldOut && <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded">SOLD OUT</div>}
          </div>
          {/* Thumbnails / view selectors */}
          <div className="mt-4 grid grid-cols-5 gap-3">
            {galleryPairs.map(({key,url})=> (
              <button key={key} onClick={()=>setView(key)} className={`border rounded-lg overflow-hidden transition-all ${view===key?'border-pink-600 ring-2 ring-pink-600/30':'border-gray-300 dark:border-gray-700 hover:border-pink-600/60'}`}>
                <img src={url} alt={key} className="w-full h-24 object-cover" onError={(e)=>{ e.target.src='https://via.placeholder.com/200x200?text=Image' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="lg:sticky top-24 self-start">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{p.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-bold">{price} EGP</span>
            {p.discount && (
              <span className="line-through text-gray-500">{p.price} EGP</span>
            )}
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{p.description}</p>

          {/* Options */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm mb-2">Size</div>
              <div className="flex flex-wrap gap-2">
                {(p.sizes || p.sizeOptions || ['S','M','L','XL']).map(s=> (
                  <button key={s} onClick={()=>setSize(s)} className={`px-3 py-2 rounded-md border text-sm ${size===s? 'bg-black text-white border-black':'border-gray-300 dark:border-gray-700'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm mb-2">Color</div>
              <div className="flex flex-wrap gap-2">
                {(p.colors || p.colorOptions || ['Black','White']).map(c=> (
                  <button key={c} onClick={()=>{
                    setColor(c)
                    // try to switch main image to the one that matches this color if present
                    const idx = galleryPairs.findIndex(({url})=> (url||'').toLowerCase().includes(String(c).toLowerCase()))
                    if(idx>=0){ setView(galleryPairs[idx].key) }
                  }} className={`px-3 py-2 rounded-md border text-sm ${color===c? 'bg-black text-white border-black':'border-gray-300 dark:border-gray-700'}`}>{c}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm mb-2">Quantity</div>
              <div className="flex items-center border rounded-lg overflow-hidden w-40">
                <button onClick={()=>setQty(q=> Math.max(1, q-1))} className="w-10 h-10 grid place-items-center text-xl">−</button>
                <div className="flex-1 text-center">{qty}</div>
                <button onClick={()=>setQty(q=> q+1)} className="w-10 h-10 grid place-items-center text-xl">+</button>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="mt-4 text-sm text-gray-500">Total: <span className="font-semibold text-gray-900 dark:text-white">{total} EGP</span></div>

          <div className="mt-6 flex gap-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={()=>{
                const currentImageUrl = Array.isArray(p.images)
                  ? p.images[Number(view)||0]
                  : (p.images?.[view] || (gallery && gallery[0]) || p.image);
                const payload = {
                  ...p,
                  quantity: qty,
                  selectedSize: size || (p.sizes?.[0] || p.sizeOptions?.[0] || 'M'),
                  selectedColor: color || (p.colors?.[0] || p.colorOptions?.[0] || 'Black'),
                  price: price,
                  thumbnail: currentImageUrl
                }
                dispatch(addToCart(payload))
              }}
              className="px-5 py-3 rounded-lg bg-black text-white hover:bg-gray-900"
            >Add to Cart</motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-3 rounded-lg bg-pink-600 text-white hover:bg-pink-700"
              onClick={handleBuyNow}
            >Buy it now</motion.button>
          </div>

          {/* Info Tabs */}
          <div className="mt-8">
            <div className="flex items-center gap-3 border-b border-white/10">
              <button className={`pb-2 text-sm ${tab==='details'?'text-white border-b-2 border-white':'text-white/60 hover:text-white'}`} onClick={()=>setTab('details')}>Details</button>
              <button className={`pb-2 text-sm ${tab==='shipping'?'text-white border-b-2 border-white':'text-white/60 hover:text-white'}`} onClick={()=>setTab('shipping')}>Shipping</button>
              <button className={`pb-2 text-sm ${tab==='returns'?'text-white border-b-2 border-white':'text-white/60 hover:text-white'}`} onClick={()=>setTab('returns')}>Returns</button>
            </div>
            {tab==='details' && (
              <div className="pt-4 text-white/80 text-sm leading-relaxed">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Premium fabric blend with soft hand feel</li>
                  <li>Tailored silhouette for everyday comfort</li>
                  <li>Care: cold wash, inside out, hang dry</li>
                </ul>
              </div>
            )}
            {tab==='shipping' && (
              <div className="pt-4 text-white/80 text-sm">
                Free shipping on orders over <strong>2999 EGP</strong>.
                Standard shipping fee is 50 EGP below the threshold.
              </div>
            )}
            {tab==='returns' && (
              <div className="pt-4 text-white/80 text-sm">
                We offer a <strong>14-day return</strong> policy for unused items in original packaging. Contact support via the Contact page to start a return.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

