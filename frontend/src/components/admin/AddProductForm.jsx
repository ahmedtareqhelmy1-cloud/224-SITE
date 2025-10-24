import React from 'react';
import { motion } from 'framer-motion';
import { MotionButton } from '../animations/MotionComponents';

export const AddProductForm = ({ newProd, setNewProd, handleSubmit, adding, addMessage }) => {
  const inputClasses = `w-full bg-gray-900 text-white border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-pink-500`;
  const labelClasses = `block text-sm font-medium text-gray-300 mb-1`;
  const checkboxContainerClasses = `flex flex-wrap gap-4 mt-2`;
  const checkboxLabelClasses = `flex items-center space-x-2 text-gray-300`;

  return (
    <motion.form 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      onSubmit={handleSubmit}
      className="space-y-6 bg-gray-800 p-8 rounded-xl shadow-xl"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Add New Product</h2>

      <div>
        <label htmlFor="title" className={labelClasses}>Title</label>
        <input
          type="text"
          id="title"
          value={newProd.title}
          onChange={(e) => setNewProd({ ...newProd, title: e.target.value })}
          className={inputClasses}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="price" className={labelClasses}>Price (EGP)</label>
          <input
            type="number"
            id="price"
            value={newProd.price}
            onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label htmlFor="stock" className={labelClasses}>Stock</label>
          <input
            type="number"
            id="stock"
            value={newProd.stock}
            onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
            className={inputClasses}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className={labelClasses}>Category</label>
        <select
          id="category"
          value={newProd.category}
          onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
          className={inputClasses}
          required
        >
          <option value="tshirts">T-Shirts</option>
          <option value="pants">Pants</option>
          <option value="accessories">Accessories</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className={labelClasses}>Description</label>
        <textarea
          id="description"
          value={newProd.description}
          onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
          className={`${inputClasses} min-h-[100px]`}
          required
        />
      </div>

      <div>
        <label className={labelClasses}>Sizes</label>
        <div className={checkboxContainerClasses}>
          {Object.keys(newProd.sizes).map((size) => (
            <label key={size} className={checkboxLabelClasses}>
              <input
                type="checkbox"
                checked={newProd.sizes[size]}
                onChange={(e) => setNewProd({
                  ...newProd,
                  sizes: { ...newProd.sizes, [size]: e.target.checked }
                })}
                className="form-checkbox h-4 w-4 text-pink-500 rounded border-gray-700 bg-gray-900"
              />
              <span>{size}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClasses}>Colors</label>
        <div className={checkboxContainerClasses}>
          {Object.keys(newProd.colors).map((color) => (
            <label key={color} className={checkboxLabelClasses}>
              <input
                type="checkbox"
                checked={newProd.colors[color]}
                onChange={(e) => setNewProd({
                  ...newProd,
                  colors: { ...newProd.colors, [color]: e.target.checked }
                })}
                className="form-checkbox h-4 w-4 text-pink-500 rounded border-gray-700 bg-gray-900"
              />
              <span>{color}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClasses}>Product Image</label>
        <input
          type="file"
          onChange={(e) => setNewProd({ ...newProd, image: e.target.files[0] })}
          accept="image/*"
          className={`${inputClasses} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-pink-600 file:text-white hover:file:bg-pink-700`}
          required
        />
      </div>

      {addMessage && (
        <div className={`text-sm ${addMessage.includes('error') ? 'text-red-400' : 'text-green-400'}`}>
          {addMessage}
        </div>
      )}

      <MotionButton
        type="submit"
        disabled={adding}
        className={`w-full bg-gradient-to-r from-pink-500 via-pink-600 to-pink-700 text-white py-3 rounded-lg font-medium shadow-lg 
          hover:shadow-pink-500/25 dark:hover:shadow-pink-700/25 transition-all duration-300 
          ${adding ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        <span className="flex items-center justify-center gap-2">
          {adding ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Adding Product...
            </>
          ) : 'Add Product'}
        </span>
      </MotionButton>
    </motion.form>
  );
};