import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { removeFromCart, updateQuantity, clearCart } from '../features/cart/cartSlice'

export default function Cart() {
  const { items } = useSelector(state => state.cart)
  const dispatch = useDispatch()

  const subtotal = items.reduce((total, item) => 
    total + (item.salePrice || item.price) * item.quantity, 0)

  const shipping = items.length > 0 ? 50 : 0
  const total = subtotal + shipping

  const handleRemove = (id) => {
    dispatch(removeFromCart(id))
  }

  const handleUpdateQuantity = (id, quantity) => {
    if (quantity >= 1) {
      dispatch(updateQuantity({ id, quantity }))
    }
  }

  const handleClearCart = () => {
    dispatch(clearCart())
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-lg text-gray-700 mb-4">Your cart is empty.</p>
            <Link to="/shop" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md">Shop now</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-white shadow rounded-lg p-4 flex items-center gap-4 hover:translate-y-[-4px] transform transition-transform duration-300">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md" />
                  <div className="flex-1">
                    <Link to={`/product/${item.id}`} className="text-lg font-medium text-gray-900 dark:text-white hover:underline">{item.name}</Link>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{item.category || ''}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-md border bg-gray-50"
                      >-</button>
                      <div className="px-3">{item.quantity}</div>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md border bg-gray-50"
                      >+</button>
                      <button onClick={() => handleRemove(item.id)} className="ml-4 text-sm text-red-600">Remove</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-700 dark:text-white font-medium">{((item.salePrice || item.price) * item.quantity).toLocaleString()} EGP</div>
                    {item.salePrice && <div className="text-sm text-gray-400 dark:text-gray-300 line-through">{(item.price).toLocaleString()} EGP</div>}
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center">
                <button onClick={handleClearCart} className="text-sm text-red-600">Clear Cart</button>
                <Link to="/shop" className="text-sm text-blue-600">Continue shopping</Link>
              </div>
            </div>

            {/* Summary */}
            <aside className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Order summary</h2>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-300"> <span>Subtotal</span> <span>{subtotal.toLocaleString()} EGP</span> </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300"> <span>Shipping</span> <span>{shipping.toLocaleString()} EGP</span> </div>
                <div className="flex justify-between font-semibold text-gray-900 dark:text-white"> <span>Total</span> <span>{total.toLocaleString()} EGP</span> </div>
              </div>
              <div className="mt-6">
                <Link to="/checkout" className="block w-full text-center bg-green-600 text-white py-3 rounded-md font-medium">Proceed to Checkout</Link>
              </div>
              <p className="mt-4 text-sm text-gray-500">Secure checkout. We accept major credit cards and local payment methods.</p>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
