import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { uploadImage } from '../../features/products/productsSlice';

const AddProduct = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: 'Men',
    stock: '',
    sizes: {
      XS: false,
      S: false,
      M: false,
      L: false,
      XL: false
    },
    colors: {
      Black: false,
      White: false,
      Navy: false,
      Gray: false
    }
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setUploading(true);
      try {
        const imageUrl = await dispatch(uploadImage(file)).unwrap();
        console.log('Image uploaded:', imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSizeChange = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [size]: !prev.sizes[size]
      }
    }));
  };

  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [color]: !prev.colors[color]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement product creation logic
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6"
      >
        <h2 className="text-3xl font-bold mb-6 text-white">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Image */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">Product Image</label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-pink-500 transition-colors">
              {selectedImage ? (
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Preview"
                  className="mx-auto max-h-48 object-contain"
                />
              ) : (
                <div className="text-gray-400">
                  <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-1">Upload a file</p>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>
          </div>

          {/* Title & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Price (EGP)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-200">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          {/* Category & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              >
                <option>Men</option>
                <option>Women</option>
                <option>Kids</option>
                <option>Accessories</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
          </div>

          {/* Available Sizes */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Available Sizes</label>
            <div className="flex gap-4">
              {Object.entries(formData.sizes).map(([size, checked]) => (
                <label key={size} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleSizeChange(size)}
                    className="form-checkbox h-4 w-4 text-pink-600 bg-gray-700 border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-200">{size}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Available Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Available Colors</label>
            <div className="flex gap-4">
              {Object.entries(formData.colors).map(([color, checked]) => (
                <label key={color} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleColorChange(color)}
                    className="form-checkbox h-4 w-4 text-pink-600 bg-gray-700 border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-200">{color}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Add Product'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddProduct;