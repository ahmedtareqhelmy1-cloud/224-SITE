import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit, startAfter, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Pages
export const createPage = async ({ title, slug, content, published = true }) => {
  try{
    if(!slug) throw new Error('Slug is required');
    const pagesRef = collection(db, 'pages');
    const pageRef = doc(pagesRef, slug);
    await setDoc(pageRef, {
      title: title || slug,
      slug,
      content: content || '',
      published: !!published,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }, { merge: true });
    return { slug, title, content, published };
  }catch(err){
    console.error('createPage failed:', err);
    throw err;
  }
}

export const getPageBySlug = async (slug) => {
  try{
    const pageRef = doc(db, 'pages', slug);
    const snap = await getDoc(pageRef);
    if(!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  }catch(err){ throw err }
}

export const getPages = async () => {
  try{
    const pagesRef = collection(db, 'pages');
    const q = query(pagesRef, orderBy('updatedAt','desc'));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(d=> list.push({ id:d.id, ...d.data() }));
    return list;
  }catch(err){ throw err }
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Products
export const getProducts = async ({ category = null, filters = {}, lastDoc = null, pageSize = 12 } = {}) => {
  try {
    const productsRef = collection(db, 'products');
    let constraints = [];

    if (category) {
      constraints.push(where('category', '==', category));
    }

    if (filters.minPrice) {
      constraints.push(where('price', '>=', Number(filters.minPrice)));
    }

    if (filters.maxPrice) {
      constraints.push(where('price', '<=', Number(filters.maxPrice)));
    }

    if (filters.inStock !== undefined) {
      constraints.push(where('inStock', '==', filters.inStock));
    }

    // Add orderBy after all where clauses
    constraints.push(orderBy('createdAt', 'desc'));

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    constraints.push(limit(pageSize));

    const q = query(productsRef, ...constraints);
    const snapshot = await getDocs(q);

    const products = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });

    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return {
      products,
      lastVisible,
      hasMore: snapshot.docs.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    // If Firestore requires a composite index, the error message contains a URL the developer
    // can open to create the index. Surface a clearer message with instructions and the URL.
    const msg = error?.message || '';
    if (msg.includes('requires an index') || msg.includes('requires a composite index')) {
      // Try to extract the console URL from the message
      const urlMatch = msg.match(/https:\/\/console\.firebase\.google\.com\/[^)\s]+/);
      const consoleUrl = urlMatch ? urlMatch[0] : null;
      const help = `Firestore requires a composite index for this query. Open the Firebase console URL shown in the original error to create the index.` +
        (consoleUrl ? `\nCreate index: ${consoleUrl}` : `\n(See the Firestore indexes page in your project console)`);
      const err = new Error(help);
      err.cause = error;
      throw err;
    }

    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Product not found');
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Orders
export const createOrder = async (orderData) => {
  try {
    const orderRef = collection(db, 'orders');
    const newOrderRef = doc(orderRef);
    
    await setDoc(newOrderRef, {
      ...orderData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });

    return { id: newOrderRef.id, ...orderData };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getUserOrders = async (userId) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    const orders = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    return orders;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

// Custom Designs
export const createCustomDesign = async (designData) => {
  try {
    const designRef = collection(db, 'custom-designs');
    const newDesignRef = doc(designRef);

    let imageUrl = '';
    if (designData.image) {
      const storageRef = ref(storage, `custom-designs/${newDesignRef.id}/${designData.image.name}`);
      const snapshot = await uploadBytes(storageRef, designData.image);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    await setDoc(newDesignRef, {
      ...designData,
      imageUrl,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    return { id: newDesignRef.id, ...designData, imageUrl };
  } catch (error) {
    console.error('Error creating custom design:', error);
    throw error;
  }
};

export const getUserDesigns = async (userId) => {
  try {
    const designsRef = collection(db, 'custom-designs');
    const q = query(
      designsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    const designs = [];
    snapshot.forEach((doc) => {
      designs.push({ id: doc.id, ...doc.data() });
    });

    return designs;
  } catch (error) {
    console.error('Error fetching user designs:', error);
    throw error;
  }
};

// Admin Functions
const DEFAULT_UPLOAD_TIMEOUT_MS = Number(import.meta.env.VITE_UPLOAD_TIMEOUT_MS ?? 300000); // 5 minutes default; set 0 to disable
export const adminCreateProduct = async (productData, opts = {}) => {
  try {
    const productsRef = collection(db, 'products');
    const newProductRef = doc(productsRef);

    const imagesArray = Array.isArray(productData.images) ? productData.images : (productData.images ? Array.from(productData.images) : []);
    const imageUrls = [];

    // Helper: resumable upload with retry + timeout (better for large images / slow networks)
    const uploadWithRetry = async (file, path, { retries = 2, timeoutMs = DEFAULT_UPLOAD_TIMEOUT_MS, onProgress } = {}) => {
      let attempt = 0;
      let lastErr;
      while (attempt <= retries) {
        try {
          const storageRef = ref(storage, path);
          const task = uploadBytesResumable(storageRef, file);

          const makeUploadPromise = new Promise((resolve, reject) => {
              task.on('state_changed', (snapshot) => {
                try {
                  if (onProgress && snapshot?.bytesTransferred && snapshot?.totalBytes) {
                    const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    onProgress(pct);
                  }
                } catch {}
              }, reject, async () => {
                try {
                  const downloadUrl = await getDownloadURL(task.snapshot.ref);
                  resolve(downloadUrl);
                } catch (e) { reject(e); }
              });
            });

          let url;
          if (timeoutMs && timeoutMs > 0) {
            url = await Promise.race([
              makeUploadPromise,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timed out')), timeoutMs))
            ]);
          } else {
            // No timeout (allow huge files); rely on resumable upload + retry
            url = await makeUploadPromise;
          }

          return url;
        } catch (e) {
          lastErr = e;
          // small backoff
          await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
          attempt += 1;
        }
      }
      throw lastErr || new Error('Upload failed');
    };

    // Accept already-hosted URLs OR File objects. If strings, use as-is; otherwise upload.
    if (imagesArray.length > 0) {
      const urlLike = imagesArray.filter(x => typeof x === 'string' && /^https?:\/\//i.test(x));
      imageUrls.push(...urlLike);

      const files = imagesArray.filter(x => x && typeof x !== 'string');
      if (files.length > 0) {
        const results = await Promise.allSettled(files.map(async (image, idx) => {
          const safeName = image?.name || `image_${Date.now()}_${idx}`;
          const url = await uploadWithRetry(image, `products/${newProductRef.id}/${safeName}`, {
            onProgress: opts.onProgress,
            timeoutMs: (DEFAULT_UPLOAD_TIMEOUT_MS && DEFAULT_UPLOAD_TIMEOUT_MS > 0) ? DEFAULT_UPLOAD_TIMEOUT_MS : 180000
          });
          return url;
        }));
        results.forEach(r => { if (r.status === 'fulfilled' && r.value) imageUrls.push(r.value); });
      }

      if (imageUrls.length === 0) {
        console.warn('No image URLs resolved for product');
      }
    }

    await setDoc(newProductRef, {
      ...productData,
      images: imageUrls,
      createdAt: new Date().toISOString()
    });

    return { id: newProductRef.id, ...productData, images: imageUrls };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const adminUpdateProduct = async (productId, updates) => {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      throw new Error('Product not found');
    }

    const currentData = productSnap.data();
    let newImageUrls = [...(currentData.images || [])];

    // Handle image updates if any
    if (updates.newImages?.length) {
      const newUrls = await Promise.all(
        Array.from(updates.newImages).map(async (image) => {
          const storageRef = ref(storage, `products/${productId}/${image.name}`);
          const snapshot = await uploadBytes(storageRef, image);
          return getDownloadURL(snapshot.ref);
        })
      );
      newImageUrls = [...newImageUrls, ...newUrls];
    }

    // Handle image deletions if any
    if (updates.deleteImages?.length) {
      await Promise.all(
        updates.deleteImages.map(async (url) => {
          const imageRef = ref(storage, url);
          return deleteObject(imageRef);
        })
      );
      newImageUrls = newImageUrls.filter(url => !updates.deleteImages.includes(url));
    }

    const updatedData = {
      ...currentData,
      ...updates,
      images: newImageUrls,
      updatedAt: new Date().toISOString()
    };

    await setDoc(productRef, updatedData, { merge: true });
    return { id: productId, ...updatedData };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// (exports moved to bottom to include admin helpers)

// Admin: fetch all orders
export const getAllOrders = async () => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const orders = [];
    snapshot.forEach((doc) => orders.push({ id: doc.id, ...doc.data() }));
    return orders;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

// Admin: fetch all custom designs
export const getAllCustomDesigns = async () => {
  try {
    const designsRef = collection(db, 'custom-designs');
    const q = query(designsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const designs = [];
    snapshot.forEach((doc) => designs.push({ id: doc.id, ...doc.data() }));
    return designs;
  } catch (error) {
    console.error('Error fetching all custom designs:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await setDoc(orderRef, { status, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Update custom design status
export const updateCustomDesignStatus = async (designId, status) => {
  try {
    const designRef = doc(db, 'custom-designs', designId);
    await setDoc(designRef, { status, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating custom design status:', error);
    throw error;
  }
};

// (firebaseFunctions exported at bottom after helper definitions)

// Admin: delete a product and its images from storage
export const adminDeleteProduct = async (productId) => {
  try {
    const productRef = doc(db, 'products', productId);
    const prodSnap = await getDoc(productRef);
    if (!prodSnap.exists()) throw new Error('Product not found');

    const data = prodSnap.data();
    const imageUrls = data.images || [];

    // Try to delete each image from storage (convert download URL to path)
    await Promise.all(imageUrls.map(async (url) => {
      try {
        // download URLs look like: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encodedPath>?...
        const parts = url.split('/o/');
        if (parts.length > 1) {
          const encoded = parts[1].split('?')[0];
          const decodedPath = decodeURIComponent(encoded);
          const imageRef = ref(storage, decodedPath);
          await deleteObject(imageRef);
        }
      } catch (e) {
        // Continue even if a single image deletion fails
        console.warn('Failed to delete image from storage:', e.message || e);
      }
    }));

    // Delete the product document
    await deleteDoc(productRef);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Upsert user profile
export const saveUserProfile = async (user) => {
  try {
    if (!user || !user.id) throw new Error('User id is required');
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      displayName: user.displayName || '',
      bio: user.bio || '',
      email: user.email || '' ,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Export all Firebase functions (after all helpers are defined)
export const firebaseFunctions = {
  getProducts,
  getProductById,
  createOrder,
  getUserOrders,
  getAllOrders,
  createCustomDesign,
  getUserDesigns,
  getAllCustomDesigns,
  adminCreateProduct,
  adminUpdateProduct,
  updateOrderStatus,
  updateCustomDesignStatus,
  adminDeleteProduct,
  saveUserProfile,
  createPage,
  getPageBySlug,
  getPages
};