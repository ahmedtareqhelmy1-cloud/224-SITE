import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function DynamicPage(){
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const fb = await import('../config/firebase').then(m=> m.firebaseFunctions);
        const data = await fb.getPageBySlug(slug);
        if(!mounted) return;
        if(!data || data.published === false){ setError('Page not found'); }
        setPage(data);
      }catch(err){ if(mounted) setError(err?.message || 'Failed to load page'); }
      finally{ if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted = false };
  },[slug]);

  if(loading) return <div className="max-w-4xl mx-auto px-4 py-16">Loading…</div>;
  if(error || !page) return <div className="max-w-4xl mx-auto px-4 py-16 text-red-500">{error || 'Not found'}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <motion.h1 initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
        {page.title || page.slug}
      </motion.h1>
      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
    </div>
  )
}
