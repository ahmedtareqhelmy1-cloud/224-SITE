import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

const PRODUCTS_COLLECTION = 'products';

export const productService = {
  // Create a new product
  async createProduct(productData, images) {
    try {
      // Upload images first
      const imageUrls = await Promise.all(
        Object.entries(images).map(async ([key, file]) => {
          if (!file) return null;
          const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          return { [key]: url };
        })
      );

      // Combine all image URLs
      const combinedImageUrls = Object.assign({}, ...imageUrls.filter(Boolean));

      // Create product document
      const productRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...productData,
        images: combinedImageUrls,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        id: productRef.id,
        ...productData,
        images: combinedImageUrls
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Get a single product by ID
  async getProduct(id) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Product not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Update a product
  async updateProduct(id, updates, newImages) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Product not found');
      }

      const currentData = docSnap.data();
      let updatedImageUrls = { ...currentData.images };

      // Handle new images
      if (newImages) {
        await Promise.all(
          Object.entries(newImages).map(async ([key, file]) => {
            if (!file) return;
            
            // Delete old image if it exists
            if (updatedImageUrls[key]) {
              try {
                const oldImageRef = ref(storage, updatedImageUrls[key]);
                await deleteObject(oldImageRef);
              } catch (error) {
                console.warn('Error deleting old image:', error);
              }
            }

            // Upload new image
            const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            updatedImageUrls[key] = url;
          })
        );
      }

      // Update document
      const updateData = {
        ...updates,
        images: updatedImageUrls,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);

      return {
        id,
        ...updates,
        images: updatedImageUrls
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete a product
  async deleteProduct(id) {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Product not found');
      }

      // Delete associated images
      const imageUrls = docSnap.data().images;
      await Promise.all(
        Object.values(imageUrls).map(async (url) => {
          try {
            const imageRef = ref(storage, url);
            await deleteObject(imageRef);
          } catch (error) {
            console.warn('Error deleting image:', error);
          }
        })
      );

      // Delete document
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Get featured products
  async getFeaturedProducts(limit = 8) {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Get hot selling products
  async getHotSellingProducts(limit = 8) {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        orderBy('soldCount', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }));
    } catch (error) {
      console.error('Error fetching hot selling products:', error);
      throw error;
    }
  }
};