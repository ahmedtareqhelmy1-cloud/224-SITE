export async function fetchProducts(){
  try{
    const { firebaseFunctions } = await import('../config/firebase');
    const res = await firebaseFunctions.getProducts();
    // firebase getProducts returns an object { products, lastVisible, hasMore }
    return res.products || [];
  }catch(e){
    console.error('fetchProducts error:', e);
    return []
  }
}
