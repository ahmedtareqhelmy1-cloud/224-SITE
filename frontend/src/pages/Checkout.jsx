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
  const [msg, setMsg] = useState('')
  const [total, setTotal] = useState(subtotal + 50)
  const [busy, setBusy] = useState(false)
  const [buyerEmail, setBuyerEmail] = useState('')
  const [lastOrderId, setLastOrderId] = useState('')

  const INSTAPAY_HANDLE = 'kook717@instapay'
  const INSTAPAY_LINK = (import.meta.env.VITE_INSTAPAY_LINK || 'https://ipn.eg/S/kook717/instapay/1WxX7I')

  // No discount application here

  async function placeOrder(paymentMethod='COD'){
    setBusy(true)
    const order = { items, total, payment: paymentMethod, status:'Pending' }

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
    <div className="container py-5">
      <h2>Checkout</h2>
      <div className="row">
        <div className="col-md-6">
          <h4>Billing & Shipping</h4>
          <p>Autofill from profile (Clerk) will be added later.</p>
          <div className="mt-3">
            <label className="form-label">Email for confirmation</label>
            <input className="form-control" type="email" placeholder="you@example.com" value={buyerEmail} onChange={e=>setBuyerEmail(e.target.value)} />
          </div>
        </div>
        <div className="col-md-6">
          <h4>Order Summary</h4>
          <p>Subtotal: {subtotal} EGP</p>
          <p>Shipping: 50 EGP</p>
          <p><strong>Total: {total} EGP</strong></p>

          {msg && <div className={`alert ${msg.includes('Order placed')? 'alert-success':'alert-info'} mt-3`}>{msg}</div>}
          {lastOrderId && (
            <div className="mt-2 small text-muted">Save this Order ID for reference: <strong>{lastOrderId}</strong></div>
          )}

          <div className="mt-4">
            <button className="btn btn-success" disabled={busy} onClick={()=>placeOrder('COD')}>Place Order (Cash on Delivery)</button>
            <button className="btn btn-warning ms-2" disabled={busy} onClick={()=>placeOrder('Paymob')}>Pay with Paymob (stub)</button>
            <button
              className="btn btn-primary ms-2"
              disabled={busy}
              onClick={async ()=>{
                // create order marked as Instapay pending, then open payment link
                await placeOrder('Instapay')
                window.open(INSTAPAY_LINK, '_blank', 'noopener,noreferrer')
              }}
            >
              Pay via InstaPay
            </button>
            <div className="form-text mt-2">InstaPay handle: <strong>{INSTAPAY_HANDLE}</strong></div>
          </div>
        </div>
      </div>
    </div>
  )
}
