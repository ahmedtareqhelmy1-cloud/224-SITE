import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ProductCard({p}){
  return (
    <motion.div
      className="product-card relative group"
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
    >
      <div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition duration-500" style={{
        boxShadow: '0 0 40px rgba(123,44,255,0.12), 0 0 80px rgba(59,130,246,0.08)'
      }} />
      <div className="card-media">
        <img src={p.image} alt={p.name} />
        {p.isSoldOut && <div className="sold-out">SOLD OUT</div>}
      </div>
      <div className="card-body">
        <h5>{p.name}</h5>
        <p className="muted">{p.description}</p>
        <div className="d-flex align-items-center justify-content-between mt-3">
          <div className="price">
            {p.isOnSale ? (<><span className="badge-sale">SALE</span> <del>{p.price}</del> <strong className="ms-2">{p.salePrice} EGP</strong></>) : (<strong>{p.price} EGP</strong>)}
          </div>
          <div>
            <Link to={`/product/${p.id}`} className="btn btn-sm btn-outline-light">Details</Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
