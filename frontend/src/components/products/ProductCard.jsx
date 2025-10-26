import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const initialKey = Array.isArray(product.images) ? '0' : 'front';
  const [currentImage, setCurrentImage] = useState(initialKey);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || (product.colorOptions?.[0] || '#000'));

  const { id, name, price, images, discount, stock, image, imageUrl, thumbnail } = product;
  
  // Helper to check if a value is a valid image URL or path
  const isImage = (v) => {
    if (!v) return false;
    const str = String(v).trim();
    
    // Check for common image extensions regardless of path format
    const hasImageExtension = /\.(png|jpe?g|webp|svg|gif|bmp|avif)$/i.test(str);
    
    // Check for data URLs, absolute URLs, or relative paths
    const isValidPath = 
      str.startsWith('http') || 
      str.startsWith('https') || 
      str.startsWith('data:image') ||
      str.startsWith('/') ||
      str.startsWith('./') ||
      str.startsWith('../') ||
      hasImageExtension;
    
    return hasImageExtension || isValidPath;
  };

  // Helper to ensure the image URL is properly formatted
  const formatImageUrl = (url) => {
    if (!url) return null;
    
    const str = String(url).trim();
    
    // If it's already a full URL or data URL, return as is
    if (str.startsWith('http') || str.startsWith('data:image')) {
      return str;
    }
    
    // If it's a relative path starting with /, assume it's from the public folder
    if (str.startsWith('/')) {
      return str;
    }
    
    // For other relative paths, assume they're in the public/images folder
    // Remove any leading ./ or ../
    const cleanPath = str.replace(/^\.?\/+/, '');
    return `/images/${cleanPath}`;
  };

  // Get all possible image candidates from the product
  const getImageCandidates = () => {
    const candidates = [];
    
    // Add direct image properties first (highest priority)
    const potentialImages = [
      image,
      imageUrl,
      thumbnail,
      ...(Array.isArray(images) ? images : []),
      ...(images && typeof images === 'object' ? Object.values(images) : [])
    ];
    
    // Process all potential images and add valid ones
    potentialImages.forEach(img => {
      if (!img) return;
      
      // Handle both single images and arrays of images
      const processSingleImage = (imgUrl) => {
        if (!isImage(imgUrl)) return;
        const formattedUrl = formatImageUrl(imgUrl);
        if (formattedUrl && !candidates.includes(formattedUrl)) {
          candidates.push(formattedUrl);
        }
      };
      
      if (Array.isArray(img)) {
        img.forEach(processSingleImage);
      } else {
        processSingleImage(img);
      }
    });
    
    // Add a default fallback image if no valid images found
    const base = import.meta.env.BASE_URL || '/';
    return candidates.length > 0 ? candidates : [`${base}assets/Logo.svg`];
  };
  
  const [displayImage, setDisplayImage] = useState('');
  const [fallbackQueue, setFallbackQueue] = useState([]);
  
  // Update image state when product changes
  useEffect(() => {
    const candidates = getImageCandidates();
    setDisplayImage(candidates[0] || '');
    setFallbackQueue(candidates.slice(1));
  }, [product]);

  // Debug: Log image loading state
  useEffect(() => {
    if (!displayImage && fallbackQueue.length === 0) {
      console.warn('No valid images found for product:', { id, name, image, imageUrl, thumbnail, images });
    }
  }, [displayImage, fallbackQueue, id, name, image, imageUrl, thumbnail, images]);

  const imageKeys = Array.isArray(images)
    ? images.map((_, idx) => String(idx))
    : Object.keys(images || {});
  const finalPrice = discount ? price - (price * discount) / 100 : price;
  const isOutOfStock = stock === 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    const payload = { ...product, quantity: 1, selectedSize, selectedColor, thumbnail: displayImage };
    dispatch(addToCart(payload));
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 1500);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    // Go to product page to allow selecting sides/options first
    navigate(`/product/${id}`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <Link to={`/product/${id}`} className="block">
          <div className="relative overflow-hidden aspect-w-1 aspect-h-1">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={displayImage}
                alt={name}
                className="object-cover object-center w-full h-[300px] transform transition-transform duration-300 group-hover:scale-105"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onError={(e) => {
                  console.warn('Image failed to load, trying next fallback', { 
                    id, 
                    failed: displayImage, 
                    remaining: fallbackQueue.length 
                  });
                  
                  if (fallbackQueue.length > 0) {
                    const [next, ...restQ] = fallbackQueue;
                    setDisplayImage(next);
                    setFallbackQueue(restQ);
                  } else {
                    const base = import.meta.env.BASE_URL || '/';
                    setDisplayImage(`${base}assets/Logo.svg`);
                  }
                }}
              />
            </AnimatePresence>

            {/* Image Navigation */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {imageKeys.map((view) => (
                <motion.button
                  key={view}
                  whileHover={{ scale: 1.2 }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentImage === view 
                      ? 'bg-white shadow-lg' 
                      : 'bg-gray-400/50 hover:bg-gray-300'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImage(view);
                  }}
                />
              ))}
            </div>

            {/* Status Badges */}
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              {discount > 0 && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded shadow-md"
                >
                  -{discount}%
                </motion.div>
              )}
              {isOutOfStock && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-gray-900/80 text-white text-sm font-bold px-2 py-1 rounded shadow-md"
                >
                  Out of Stock
                </motion.div>
              )}
              {stock > 0 && stock <= 5 && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="bg-yellow-500 text-white text-sm font-bold px-2 py-1 rounded shadow-md"
                >
                  Low Stock
                </motion.div>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {finalPrice.toFixed(2)} EGP
                </span>
                {discount > 0 && (
                  <span className="text-sm text-gray-500 line-through">
                    {price.toFixed(2)} EGP
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Action Buttons */
        /* Name moved under the product image, at the top of the overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 backdrop-blur-sm bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col gap-3">
              <div className="text-base font-semibold text-white truncate dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-[#A78BFA] dark:via-[#7C3AED] dark:to-[#4C1D95]">
                {name}
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-200">Size</label>
                  <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="mt-1 w-full text-sm rounded-md p-2 bg-white text-black">
                    {(product.sizes || ['S','M','L','XL']).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-200">Color</label>
                  <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="mt-1 w-full text-sm rounded-md p-2 bg-white text-black">
                    {(product.colors || product.colorOptions || ['#000','#fff']).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 ${
                isOutOfStock
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100'
              } text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
            >
              Add to Cart
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`flex-1 ${
                isOutOfStock
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-900'
              } text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
            >
              Buy Now
            </motion.button>
              </div>
            </div>
        </div>
      </div>

      {/* Success animation */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"
          >
            <div className="bg-white p-4 rounded-full">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductCard;