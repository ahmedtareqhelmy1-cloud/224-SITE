import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { firebaseFunctions } from '../config/firebase';

export default function CustomDesign() {
  const [formData, setFormData] = useState({
    productType: '',
    designIdea: '',
    size: '',
    color: '',
    additionalNotes: ''
  });
  const [clerkUserState, setClerkUserState] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Nested loader that uses Clerk's hook only when Clerk is available
  function ClerkUserLoader() {
    try {
      // dynamic require so this only runs when Clerk is installed/configured
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { useUser } = require('@clerk/clerk-react');
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { isSignedIn, user: clerkUser } = useUser();
      useEffect(() => {
        if (isSignedIn) setClerkUserState(clerkUser || null);
      }, [isSignedIn, clerkUser]);
    } catch (err) {
      // Clerk not present or hook cannot be used here; ignore
    }
    return null;
  }

  useEffect(() => {
    // Do nothing special here; ClerkUserLoader will set user if available
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use Firebase to store the custom design and upload image if provided
      const payload = {
        productType: formData.productType,
        designIdea: formData.designIdea,
        size: formData.size,
        color: formData.color,
        additionalNotes: formData.additionalNotes,
        userId: clerkUserState?.id || null,
        userEmail: clerkUserState?.primaryEmailAddress?.emailAddress || null,
        image: image || null
      };

      const created = await firebaseFunctions.createCustomDesign(payload);
      if (!created) throw new Error('Firebase save failed');
      // Notify admin by email (best-effort)
      try {
        const { sendDesignEmail } = await import('../services/email');
        await sendDesignEmail({ id: created.id, ...payload, imageUrl: created.imageUrl });
      } catch (e) {
        console.warn('Failed to send design email notification:', e.message);
      }

      setSuccess(true);
      setFormData({ productType: '', designIdea: '', size: '', color: '', additionalNotes: '' });
      setImage(null);
    } catch (error) {
      console.error('Error submitting custom design:', error);
      // user-facing message
      alert('Error submitting your design request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <ClerkUserLoader />
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Custom Design Request</h2>
          <p className="mt-4 text-lg text-gray-500">Have a unique design in mind? Fill out this form and we'll bring your vision to life.</p>
        </div>

        {success ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 bg-green-50 p-4 rounded-md">
            <div className="text-center">
              <h3 className="text-lg font-medium text-green-800">Design Request Submitted!</h3>
              <p className="mt-2 text-sm text-green-600">We'll review your request and get back to you soon.</p>
              <button onClick={() => setSuccess(false)} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">Submit Another Request</button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-12 space-y-8">
            <div>
              <label htmlFor="productType" className="block text-sm font-medium text-gray-700">Product Type</label>
              <select id="productType" name="productType" required value={formData.productType} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="">Select a product type</option>
                <option value="t-shirt">T-Shirt</option>
                <option value="hoodie">Hoodie</option>
                <option value="shoes">Shoes</option>
                <option value="accessories">Accessories</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="designIdea" className="block text-sm font-medium text-gray-700">Design Idea</label>
              <textarea id="designIdea" name="designIdea" required rows={4} value={formData.designIdea} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Describe your design idea in detail..." />
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700">Size</label>
                <select id="size" name="size" required value={formData.size} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                  <option value="">Select size</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color</label>
                <input type="text" name="color" id="color" value={formData.color} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Preferred color" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Design Reference</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {image ? (
                    <div>
                      <p className="text-sm text-gray-600">{image.name}</p>
                      <button type="button" onClick={() => setImage(null)} className="mt-2 text-sm text-red-600 hover:text-red-500">Remove</button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">Additional Notes</label>
              <textarea id="additionalNotes" name="additionalNotes" rows={3} value={formData.additionalNotes} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Any additional details or requirements..." />
            </div>

            <div>
              <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed">{loading ? 'Submitting...' : 'Submit Design Request'}</button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}