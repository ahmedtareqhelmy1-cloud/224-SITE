import React, { useEffect } from 'react'

const LiveBackground = () => {
  useEffect(() => {
    const el = document.documentElement;
    const move = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1; // -1..1
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      el.style.setProperty('--mouse-x', `${x}`);
      el.style.setProperty('--mouse-y', `${y}`);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      {/* animated gradient that responds to mouse via CSS variables */}
      <div className="absolute inset-0 opacity-70 bg-[radial-gradient(ellipse_at_center,rgba(138,58,255,0.15),transparent_40%)]" style={{ transform: `translate(calc(var(--mouse-x,0) * 10px), calc(var(--mouse-y,0) * 10px))` }} />
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-black opacity-40 animate-[moveGradient_12s_linear_infinite]" />
      {/* subtle pattern overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-8" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="rgba(0,0,0,0.06)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
      <style>{`
        @keyframes moveGradient {
          0% { transform: translateX(-10%); }
          50% { transform: translateX(10%); }
          100% { transform: translateX(-10%); }
        }
      `}</style>
    </div>
  )
}

export default LiveBackground
