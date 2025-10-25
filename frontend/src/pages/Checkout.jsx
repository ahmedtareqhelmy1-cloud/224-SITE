import React, {useMemo, useState} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { clearCart as reduxClearCart } from '../features/cart/cartSlice'
import { sendOrderEmails } from '../services/email'
import { firebaseFunctions } from '../config/firebase'

// AAST discount removed from Checkout — kept only in Product view

export default function Checkout(){
  const dispatch = useDispatch()
  const items = useSelector(state => state.cart?.items || [])
  const subtotal = useMemo(()=> items.reduce((t,i)=> t + (i.salePrice || i.price) * (i.quantity||1), 0), [items])
  const shippingCost = useMemo(()=> (items.length ? (subtotal >= 3000 ? 0 : 50) : 0), [items, subtotal])
  const [msg, setMsg] = useState('')
  const [total, setTotal] = useState(subtotal + (items.length ? (subtotal >= 3000 ? 0 : 50) : 0))
  const [busy, setBusy] = useState(false)
  const [buyerEmail, setBuyerEmail] = useState('')
  const [lastOrderId, setLastOrderId] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('COD')

  const INSTAPAY_HANDLE = 'kook717@instapay'
  const INSTAPAY_LINK = (import.meta.env.VITE_INSTAPAY_LINK || 'https://ipn.eg/S/kook717/instapay/1WxX7I')

  // No discount application here

  async function placeOrder(paymentMethod='COD'){
    setBusy(true)
    const order = { items, total, payment: paymentMethod, status:'Pending', shipping: {
      fullName, phone, city, addressLine, notes
    }, shippingCost }

    try {
      const created = await firebaseFunctions.createOrder({ items, total, payment: paymentMethod, status: 'pending', buyerEmail });
      order.id = created.id;
      setLastOrderId(order.id);
      await sendOrderEmails(order, buyerEmail);
      dispatch(reduxClearCart());
      setMsg(`Order placed — confirmation sent. Order ID: ${order.id}`)
    } catch (err) {
      console.error('Order failed:', err);
      setMsg('Order failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container py-6">
      {/* Steps */}
      <div className="mb-6 flex items-center gap-3 text-sm">
        <div className="px-3 py-1 rounded-full bg-purple-600 text-white">1</div>
        <div className="text-white/90">Details</div>
        <div className="h-px flex-1 bg-white/10 mx-2" />
        <div className="px-3 py-1 rounded-full bg-purple-600 text-white">2</div>
        <div className="text-white/90">Payment</div>
        <div className="h-px flex-1 bg-white/10 mx-2" />
        <div className="px-3 py-1 rounded-full bg-white/10 text-white">3</div>
        <div className="text-white/70">Review</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Contact & Shipping</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label text-white/80">Email</label>
                <input className="form-control" type="email" placeholder="you@example.com" value={buyerEmail} onChange={e=>setBuyerEmail(e.target.value)} required />
              </div>
              <div>
                <label className="form-label text-white/80">Full name</label>
                <input className="form-control" type="text" placeholder="Your full name" value={fullName} onChange={e=>setFullName(e.target.value)} required />
              </div>
              <div>
                <label className="form-label text-white/80">Phone</label>
                <input className="form-control" type="tel" placeholder="01xxxxxxxxx" value={phone} onChange={e=>setPhone(e.target.value)} required />
              </div>
              <div>
                <label className="form-label text-white/80">City</label>
                <input className="form-control" type="text" placeholder="Alexandria" value={city} onChange={e=>setCity(e.target.value)} required />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label text-white/80">Address</label>
                <input className="form-control" type="text" placeholder="Street, building, apartment" value={addressLine} onChange={e=>setAddressLine(e.target.value)} required />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label text-white/80">Notes (optional)</label>
                <textarea className="form-control" rows={3} placeholder="Delivery notes" value={notes} onChange={e=>setNotes(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <button type="button" onClick={()=>setPaymentMethod('COD')} className={`p-4 rounded-lg border ${paymentMethod==='COD'?'border-purple-500 bg-purple-500/10':'border-white/10 bg-white/5'} text-white text-left`}>Cash on Delivery
                <div className="text-xs text-white/60">Pay cash upon delivery</div>
              </button>
              <button type="button" onClick={()=>setPaymentMethod('Instapay')} className={`p-4 rounded-lg border ${paymentMethod==='Instapay'?'border-purple-500 bg-purple-500/10':'border-white/10 bg-white/5'} text-white text-left`}>InstaPay
                <div className="text-xs text-white/60">Handle: {INSTAPAY_HANDLE}</div>
              </button>
              <button type="button" onClick={()=>setPaymentMethod('Paymob')} className={`p-4 rounded-lg border ${paymentMethod==='Paymob'?'border-purple-500 bg-purple-500/10':'border-white/10 bg-white/5'} text-white text-left`}>Paymob
                <div className="text-xs text-white/60">Coming soon</div>
              </button>
            </div>
            {paymentMethod==='Instapay' && (
              <div className="mt-3">
                <a className="btn btn-primary" href={INSTAPAY_LINK} target="_blank" rel="noreferrer">Open InstaPay Link</a>
              </div>
            )}
          </div>
        </div>

        {/* Right: sticky summary */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-white/10 bg-white/5 backdrop-blur p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-3 mb-3 max-h-56 overflow-auto pr-1">
              {items.map(i=> {
                const isImage = (v)=> typeof v === 'string' && (
                  /^(https?:\/\/|\/)/.test(v) || /\.(png|jpe?g|webp|svg)$/i.test(v)
                );
                const arrCandidates = Array.isArray(i.images) ? i.images.filter(isImage) : [];
                const objCandidates = (i.images && typeof i.images === 'object') ? Object.values(i.images).filter(isImage) : [];
                const candidates = [i.thumbnail, i.image, ...arrCandidates, ...objCandidates].filter(isImage);
                const thumb = candidates[0] || '/assets/Logo.svg';
                return (
                  <div key={i.id} className="flex items-center gap-3">
                    <img
                      src={thumb}
                      alt={i.name || 'Product'}
                      className="w-12 h-12 rounded object-cover border border-white/10"
                      onError={(e)=>{ e.currentTarget.src = '/assets/Logo.svg'; }}
                    />
                    <div className="flex-1 text-white/90">
                      <div className="text-sm">{i.name}</div>
                      <div className="text-xs text-white/60">Qty {i.quantity||1}</div>
                    </div>
                    <div className="text-white/90 text-sm">{((i.salePrice||i.price)* (i.quantity||1)).toLocaleString()} EGP</div>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-white/10 pt-3 space-y-1 text-sm text-white/80">
              <div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toLocaleString()} EGP</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shippingCost.toLocaleString()} EGP</span></div>
              <div className="flex justify-between font-semibold text-white"><span>Total</span><span>{(subtotal+shippingCost).toLocaleString()} EGP</span></div>
            </div>

            {msg && <div className={`alert ${msg.includes('Order placed')? 'alert-success':'alert-info'} mt-3`}>{msg}</div>}
            {lastOrderId && (
              <div className="mt-2 small text-white/70">Order ID: <strong>{lastOrderId}</strong></div>
            )}

            <button
              className="btn btn-success w-full mt-4"
              disabled={busy || !buyerEmail || !fullName || !phone || !city || !addressLine}
              onClick={()=>placeOrder(paymentMethod)}
            >
              {busy? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
