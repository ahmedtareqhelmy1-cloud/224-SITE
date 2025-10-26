import React from 'react'

export default function MarqueeBand(){
  const items = [
    'DESIGNED BEYOND REALITY',
    'PREMIUM FABRICS',
    'BUILT IN EGYPT',
    'GLOBAL ATTITUDE',
    'LIMITED DROPS',
    'ENGINEERED COMFORT'
  ]
  return (
    <div className="relative overflow-hidden bg-black text-white py-3">
      <div className="whitespace-nowrap animate-[marquee_18s_linear_infinite] will-change-transform">
        {Array.from({length:3}).map((_,i)=> (
          <span key={i} className="mx-6 tracking-widest text-sm opacity-80">
            {items.join(' • ')}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  )
}
