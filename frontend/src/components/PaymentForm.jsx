import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createOrder } from '../features/orders/ordersSlice';
import { clearCart } from '../features/cart/cartSlice';
import { useUser } from '@clerk/clerk-react';

const PAYMOB_API_KEY = import.meta.env.VITE_PAYMOB_API_KEY;

export default function PaymentForm({ formData, total }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useUser();
  const cartItems = useSelector((state) => state.cart.items);

  const handleCashOnDelivery = async () => {
    setLoading(true);
    try {
      await dispatch(createOrder({
        orderData: {
          ...formData,
          items: cartItems,
          total,
          paymentMethod: 'cod',
          status: 'pending'
        },
        userId: user.id
      })).unwrap();

      dispatch(clearCart());
      navigate('/profile', { state: { orderSuccess: true } });
    } catch (error) {
      setError('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    setLoading(true);
    try {
      // First, create order in our system
      const order = await dispatch(createOrder({
        orderData: {
          ...formData,
          items: cartItems,
          total,
          paymentMethod: 'online',
          status: 'pending'
        },
        userId: user.id
      })).unwrap();

      // Then, initialize Paymob payment
      const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: PAYMOB_API_KEY
        })
      });

      const { token } = await authResponse.json();

      // Create order on Paymob
      const orderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          auth_token: token,
          delivery_needed: true,
          amount_cents: Math.round(total * 100),
          currency: 'EGP',
          items: cartItems.map(item => ({
            name: item.name,
            amount_cents: Math.round(item.price * 100),
            description: item.description,
            quantity: item.quantity
          }))
        })
      });

      const { id: orderId } = await orderResponse.json();

      // Get payment key
      const paymentKeyResponse = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          auth_token: token,
          amount_cents: Math.round(total * 100),
          expiration: 3600,
          order_id: orderId,
          billing_data: {
            apartment: 'NA',
            email: user.primaryEmailAddress.emailAddress,
            floor: 'NA',
            first_name: formData.firstName,
            street: formData.address,
            building: 'NA',
            phone_number: formData.phone,
            shipping_method: 'PKG',
            postal_code: 'NA',
            city: formData.city,
            country: 'EG',
            last_name: formData.lastName,
            state: 'NA'
          },
          currency: 'EGP',
          integration_id: import.meta.env.VITE_PAYMOB_INTEGRATION_ID
        })
      });

      const { token: paymentToken } = await paymentKeyResponse.json();

      // Redirect to Paymob payment page
      const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${import.meta.env.VITE_PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;
      window.location.href = iframeUrl;

    } catch (error) {
      console.error('Payment error:', error);
      setError('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-lg font-medium text-gray-900">Payment Method</h2>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mt-6 space-y-4">
        <button
          onClick={handleOnlinePayment}
          disabled={loading}
          className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {loading ? 'Processing...' : 'Pay Online'}
        </button>

        <button
          onClick={handleCashOnDelivery}
          disabled={loading}
          className="w-full bg-gray-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-gray-500 disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Cash on Delivery'}
        </button>
      </div>

      <div className="mt-6">
        <div className="rounded-md bg-gray-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-gray-700">
                Your payment information is securely processed by Paymob. We never store your card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}