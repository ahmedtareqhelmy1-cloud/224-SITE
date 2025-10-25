import { firebaseFunctions } from '../config/firebase';

const testProduct = {
  title: "Test T-Shirt",
  description: "A test product for checking Firebase integration",
  price: 299,
  category: "tshirts",
  stock: 10,
  sizes: { S: true, M: true, L: true },
  colors: { Black: true, White: true }
};

export const runFirebaseTests = async (onStatus) => {
  const results = {
    success: [],
    errors: []
  };

  const log = (message, isError = false) => {
    console.log(`[Test] ${message}`);
    onStatus?.(message);
    if (isError) {
      results.errors.push(message);
    } else {
      results.success.push(message);
    }
  };

  try {
    // 1. Test Products Collection Access
    log("Testing products collection access...");
    const products = await firebaseFunctions.getProducts();
    log(`✓ Successfully fetched ${products.length} products`);

    // 2. Test Single Product Creation (if admin)
    try {
      log("Testing product creation (admin only)...");
      const testFile = new File(["test"], "test.png", { type: "image/png" });
      const newProduct = await firebaseFunctions.adminCreateProduct({
        ...testProduct,
        images: [testFile]
      });
      log(`✓ Successfully created test product with ID: ${newProduct.id}`);

      // 2.1 Test Product Deletion
      if (newProduct.id) {
        await firebaseFunctions.adminDeleteProduct(newProduct.id);
        log("✓ Successfully deleted test product");
      }
    } catch (err) {
      log(`× Admin product creation failed: ${err.message}`, true);
    }

    // 3. Test Orders Collection Access
    try {
      log("Testing orders access...");
      await firebaseFunctions.getAllOrders();
      log("✓ Successfully accessed orders collection");
    } catch (err) {
      log(`× Orders access failed: ${err.message}`, true);
    }

    // 4. Test Storage Rules
    try {
      log("Testing storage rules...");
      const testFile = new File(["test"], "test.png", { type: "image/png" });
      const uploadResult = await firebaseFunctions.uploadProductImage(testFile, "test-product");
      log("✓ Successfully tested storage upload");
    } catch (err) {
      log(`× Storage upload test failed: ${err.message}`, true);
    }

    return results;

  } catch (err) {
    log(`× Test suite failed: ${err.message}`, true);
    return results;
  }
};