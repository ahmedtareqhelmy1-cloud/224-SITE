import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import ProductCard from '../components/products/ProductCard';

export default function Offers(){
  const products = useSelector(state => state.products.items || []);
  const [tab, setTab] = useState('all'); // all | tshirts | pants

  const offers = useMemo(()=>{
    const withDiscount = products.filter(p => Number(p?.discount) > 0);
    if(tab === 'tshirts') return withDiscount.filter(p => (p.category||'').toLowerCase().includes('tshirt'));
    if(tab === 'pants') return withDiscount.filter(p => (p.category||'').toLowerCase().includes('pant'));
    return withDiscount;
  },[products, tab]);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 via-purple-500/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">Offers</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">All discounted products gathered in one place.</p>
            </div>

            <div className="flex items-center gap-2">
              {[
                {key:'all', label:'All'},
                {key:'tshirts', label:'T‑Shirts'},
                {key:'pants', label:'Pants'}
              ].map(b => (
                <button
                  key={b.key}
                  onClick={()=> setTab(b.key)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-colors ${tab===b.key ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700'}`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-300">{offers.length} offer{offers.length===1?'':'s'}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {offers.length === 0 ? (
          <div className="py-24 text-center text-gray-600 dark:text-gray-300">No offers right now. Check back soon.</div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {offers.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
