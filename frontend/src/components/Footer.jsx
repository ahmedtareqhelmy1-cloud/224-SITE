import React from 'react'

export default function Footer(){
  return (
    <footer className="pt-5 pb-4 bg-dark text-white-50 mt-auto">
      <div className="container">
        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-4">
            <div className="fw-bold text-white h5 mb-2">224 Studios</div>
            <p className="mb-2">Designed beyond reality. Premium streetwear crafted with care.</p>
            <div className="d-flex gap-3">
              <a href="https://www.instagram.com/224_.studios?igsh=bHluNm1vdnQ5bmlv" target="_blank" rel="noreferrer" className="link-light text-decoration-none">Instagram</a>
              <a href={import.meta.env.BASE_URL + 'contact'} className="link-light text-decoration-none">Contact</a>
            </div>
          </div>
          <div className="col-6 col-lg-2">
            <div className="text-white small mb-2">Explore</div>
            <ul className="list-unstyled m-0">
              <li><a className="link-light text-decoration-none" href={import.meta.env.BASE_URL + ''}>Home</a></li>
              <li><a className="link-light text-decoration-none" href={import.meta.env.BASE_URL + 'collections'}>Collections</a></li>
              <li><a className="link-light text-decoration-none" href={import.meta.env.BASE_URL + 'lookbook'}>Lookbook</a></li>
              <li><a className="link-light text-decoration-none" href={import.meta.env.BASE_URL + 'story'}>Our Story</a></li>
            </ul>
          </div>
          <div className="col-6 col-lg-3">
            <div className="text-white small mb-2">Customer</div>
            <ul className="list-unstyled m-0">
              <li>Free shipping on orders over 2999 EGP</li>
              <li>14-day return policy</li>
              <li>Secure payment</li>
            </ul>
          </div>
          <div className="col-12 col-lg-3 text-lg-end">
            <div className="small">© 224 — Crafted in Egypt</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
