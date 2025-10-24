import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';

const STORAGE_KEY = 'cavee_newsletter_dismissed_v2';

const Newsletter = ({ fixed = true }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === '1') setDismissed(true);
    } catch (e) {}
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');

    try {
      // If EmailJS is not configured, just simulate success in local dev.
      if (!import.meta.env.VITE_EMAILJS_SERVICE_ID) {
        // simulate
        await new Promise((r) => setTimeout(r, 700));
      } else {
        // Send subscription notice to admin inbox with subscriber email
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT || import.meta.env.VITE_EMAILJS_TEMPLATE_ORDER,
          {
            to_email: (import.meta.env.VITE_ADMIN_EMAIL || 'mohamedtareq543219@gmail.com'),
            from_name: 'Newsletter Subscription',
            from_email: email,
            message: `New newsletter subscriber: ${email}`
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      }

      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (dismissed) return null;

  return (
    <div className={`${fixed ? 'fixed-newsletter-wrapper' : ''} bg-gray-100 dark:bg-gray-800 ${fixed ? 'py-4' : 'py-12'}`}>
      <div className={`${fixed ? 'max-w-3xl' : 'max-w-7xl'} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-white">
              {fixed ? 'Join our newsletter for exclusive drops' : 'Subscribe to our newsletter'}
            </h2>
            {!fixed && (
              <p className="mt-2 text-sm text-gray-200">
                Get the latest updates and exclusive offers straight to your inbox.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className={`mt-2 ${fixed ? 'max-w-full' : 'max-w-xl mx-auto'} flex-1`}>
            <div className={`flex ${fixed ? 'flex-col sm:flex-row gap-3 items-center' : 'gap-4'}`}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 min-w-0 px-4 py-2 text-base rounded-lg focus:outline-none bg-gray-900/60 text-white border border-gray-700"
                required
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={status === 'loading'}
                className={`px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-pink-700 rounded-lg shadow-md ${status === 'loading' ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {status === 'loading' ? '...' : 'Subscribe'}
              </motion.button>
            </div>

            {status === 'success' && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-green-400">
                Thanks — check your inbox!
              </motion.p>
            )}

            {status === 'error' && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm text-red-400">
                Something went wrong. Try again later.
              </motion.p>
            )}
          </form>

          <div className="ml-2 self-start">
            <button
              onClick={dismiss}
              aria-label="Dismiss newsletter"
              className="text-gray-300 hover:text-white p-2 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;