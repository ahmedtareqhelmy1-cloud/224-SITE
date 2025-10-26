import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ProductCard({ p }) {
  const isImage = (v) => typeof v === 'string' && (/^(https?:\/\/|\/)\s*/.test(v) || /(png|jpe?g|webp|svg)$/i.test(v));
  const arrCandidates = Array.isArray(p.images) ? p.images.filter(isImage) : [];
  const objCandidates = (p.images && typeof p.images === 'object') ? Object.values(p.images).filter(isImage) : [];
  const base = import.meta.env.BASE_URL || '/';
  const candidates = [p.thumbnail, p.image, ...arrCandidates, ...objCandidates].filter(isImage);
  const src = candidates[0] || `${base}assets/Logo.svg`;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="card border-0 shadow-sm overflow-hidden h-100"
    >
      <div className="position-relative">
        <div className="ratio ratio-1x1 bg-body-tertiary">
          <img
            src={src}
            alt={p.name || 'Product'}
            className="w-100 h-100 object-fit-cover"
            onError={(e)=>{ e.currentTarget.src = `${base}assets/Logo.svg`; }}
          />
        </div>
        {p.isSoldOut && (
          <span className="badge text-bg-dark position-absolute top-0 start-0 m-2 rounded-pill">Sold Out</span>
        )}
        {p.isOnSale && (
          <span className="badge text-bg-danger position-absolute top-0 end-0 m-2 rounded-pill">Sale</span>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h6 className="fw-bold mb-1 text-truncate" title={p.name}>{p.name}</h6>
        {p.description && <p className="text-secondary small mb-2" style={{minHeight: '2.25rem'}}>{p.description}</p>}
        <div className="mt-auto d-flex align-items-center justify-content-between">
          <div className="text-nowrap">
            {p.isOnSale ? (
              <>
                <span className="text-secondary small me-1"><del>{Number(p.price).toLocaleString()} EGP</del></span>
                <strong>{Number(p.salePrice).toLocaleString()} EGP</strong>
              </>
            ) : (
              <strong>{Number(p.price).toLocaleString()} EGP</strong>
            )}
          </div>
          <Link to={`/product/${p.id}`} className="btn btn-sm btn-dark">Details</Link>
        </div>
      </div>
    </motion.div>
  )
}
