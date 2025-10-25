import React, { useEffect, useState } from 'react'

const CustomCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    const over = (e) => {
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) setHovering(true);
      else setHovering(false);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
    };
  }, []);

  return (
    <div style={{ pointerEvents: 'none' }}>
      <div
        className={`fixed z-[9999] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out ${hovering ? 'scale-110 bg-white/90 ring-4 ring-white/20' : 'bg-white/60'}`}
        style={{ left: pos.x, top: pos.y, width: hovering ? 26 : 12, height: hovering ? 26 : 12, borderRadius: '50%' }}
      />
    </div>
  )
}

export default CustomCursor
