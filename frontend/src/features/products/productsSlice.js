import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { productService } from '../../services/productService';

// Async thunk for fetching featured products
export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async () => {
    return await productService.getFeaturedProducts();
  }
);

// Async thunk for fetching hot selling products
export const fetchHotSellingProducts = createAsyncThunk(
  'products/fetchHotSellingProducts',
  async () => {
    return await productService.getHotSellingProducts();
  }
);

export const uploadImage = createAsyncThunk(
  'products/uploadImage',
  async (file) => {
    try {
      // Create a reference to the file in Firebase Storage
      const fileRef = ref(storage, `product-images/${Date.now()}-${file.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(fileRef, file);
      
      // Get the download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ category = null, filters = {}, pageSize = 12 } = {}) => {
    try {
      const productsRef = collection(db, 'products');
      const constraints = [];

      if (category) {
        constraints.push(where('category', '==', category));
      }

      if (filters.minPrice) {
        constraints.push(where('price', '>=', Number(filters.minPrice)));
      }

      if (filters.maxPrice) {
        constraints.push(where('maxPrice', '<=', Number(filters.maxPrice)));
      }

      // Always add sorting by creation date and limit
      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(pageSize));

      const q = query(productsRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      }));

      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  filters: {
    category: null,
    minPrice: null,
    maxPrice: null,
    sortBy: 'newest'
  },
  pagination: {
    currentPage: 1,
    pageSize: 12,
    hasMore: true,
    lastDoc: null
  },
  featured: [],
  hotSelling: [],
  uploadStatus: {
    loading: false,
    error: null,
    url: null
  }
};

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset pagination when filters change
      state.pagination = { ...initialState.pagination };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setLastDoc: (state, action) => {
      state.pagination.lastDoc = action.payload;
    },
    clearUploadStatus: (state) => {
      state.uploadStatus = initialState.uploadStatus;
    }
  },
  extraReducers: (builder) => {
    builder
      // Upload Image
      .addCase(uploadImage.pending, (state) => {
        state.uploadStatus.loading = true;
        state.uploadStatus.error = null;
        state.uploadStatus.url = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.uploadStatus.loading = false;
        state.uploadStatus.error = null;
        state.uploadStatus.url = action.payload;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.uploadStatus.loading = false;
        state.uploadStatus.error = action.error.message;
        state.uploadStatus.url = null;
      })
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        // Append items for pagination, replace for fresh fetch
        state.items = state.pagination.currentPage === 1 
          ? action.payload
          : [...state.items, ...action.payload];
        // Update pagination
        state.pagination.hasMore = action.payload.length === state.pagination.pageSize;
        if (action.payload.length > 0) {
          state.pagination.lastDoc = action.payload[action.payload.length - 1];
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Featured Products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featured = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Hot Selling Products
      .addCase(fetchHotSellingProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotSellingProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.hotSelling = action.payload;
      })
      .addCase(fetchHotSellingProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
  }
});

export const { setFilters, clearFilters, setPage, setLastDoc, clearUploadStatus } = productsSlice.actions;
export default productsSlice.reducer;