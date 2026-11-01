// Automated integration test script for Step 4 APIs: Market, Cart, Orders
const http = require('http');

// Helper function to send HTTP requests to local server
const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

// Main test suite for Step 4
const runTests = async () => {
  console.log('=== Starting Step 4 Integration Tests ===\n');
  let passed = 0;
  let total = 0;

  const assert = (condition, testName, details = '') => {
    total++;
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName} - Details: ${details}`);
    }
  };

  try {
    // Authenticate Sita Devi (Seller)
    const sitaLogin = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'sita_devi', password: 'password123' });
    const sitaToken = sitaLogin.data.token;

    // Authenticate Ramesh Kumar (Buyer)
    const rameshLogin = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'ramesh_kumar', password: 'password123' });
    const rameshToken = rameshLogin.data.token;

    // --- Product Market Tests ---
    // Test 1: GET /api/products
    const productsRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/products',
      method: 'GET'
    });
    assert(productsRes.status === 200 && Array.isArray(productsRes.data) && productsRes.data.length >= 8,
      'GET /api/products returns seeded market products', `Count: ${productsRes.data?.length}`);

    // Test 2: GET /api/products?category=vegetables
    const vegRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/products?category=vegetables',
      method: 'GET'
    });
    assert(vegRes.status === 200 && vegRes.data.every(p => p.category === 'vegetables'),
      'GET /api/products filters by category vegetables');

    // Test 3: Seller (Sita) creates a new product
    const createProdRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sitaToken}`
      }
    }, {
      name: 'Fresh Cow Ghee (Bilona)',
      category: 'dairy',
      price: 900,
      quantity: 10,
      unit: 'kg',
      description: 'Pure Vedic bilona method A2 cow ghee prepared at home.',
      isAvailable: true
    });
    assert(createProdRes.status === 201 && createProdRes.data.product._id,
      'Seller creates product returns 201 Created');
    const createdProductId = createProdRes.data.product._id;

    // Test 4: Unauthorized user (Ramesh) attempts to edit Sita's product (403)
    const unauthorizedEditRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/products/${createdProductId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rameshToken}`
      }
    }, { price: 500 });
    assert(unauthorizedEditRes.status === 403, 'Non-seller cannot edit product returns 403 Forbidden');

    // Test 5: Seller (Sita) successfully updates product
    const updateProdRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/products/${createdProductId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sitaToken}`
      }
    }, { price: 950 });
    assert(updateProdRes.status === 200 && updateProdRes.data.product.price === 950,
      'Seller updates product price returns 200 OK');

    // Test 6: GET /api/products/mine returns seller products
    const myProdRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/products/mine',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${sitaToken}` }
    });
    assert(myProdRes.status === 200 && myProdRes.data.some(p => p._id === createdProductId),
      'GET /api/products/mine returns seller products');

    // --- Cart Tests ---
    // Clear cart first to have a clean slate
    await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/cart',
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${rameshToken}` }
    });

    // Test 7: GET /api/cart for empty cart
    const emptyCartRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/cart',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${rameshToken}` }
    });
    assert(emptyCartRes.status === 200 && emptyCartRes.data.items.length === 0 && emptyCartRes.data.total === 0,
      'GET /api/cart on empty cart returns total 0');

    // Test 8: Buyer (Ramesh) adds Sita's product to cart (quantity 2, price 950 -> total 1900)
    const addToCartRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/cart',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rameshToken}`
      }
    }, { productId: createdProductId, quantity: 2 });
    assert(addToCartRes.status === 200 && addToCartRes.data.total === 1900,
      'Add item to cart returns updated cart and total 1900', `Total: ${addToCartRes.data.total}`);

    // Test 9: Update cart item quantity (change to 3 -> total 2850)
    const updateCartRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/cart/${createdProductId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rameshToken}`
      }
    }, { quantity: 3 });
    assert(updateCartRes.status === 200 && updateCartRes.data.total === 2850,
      'Update cart quantity recalculates total to 2850', `Total: ${updateCartRes.data.total}`);

    // --- Order Tests ---
    // Test 10: Checkout validation - missing address (400)
    const noAddrOrderRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rameshToken}`
      }
    }, { address: '' });
    assert(noAddrOrderRes.status === 400, 'Order without address returns 400 Bad Request');

    // Test 11: Buyer places order successfully
    const placeOrderRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rameshToken}`
      }
    }, { address: 'House No. 14, Ward 3, Near Shiv Temple' });
    assert(placeOrderRes.status === 201 && placeOrderRes.data.order.total === 2850 && placeOrderRes.data.order.status === 'placed',
      'Buyer places order returns 201 Created and total 2850');
    const createdOrderId = placeOrderRes.data.order._id;

    // Test 12: Cart is automatically cleared after order placement
    const cartAfterOrderRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/cart',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${rameshToken}` }
    });
    assert(cartAfterOrderRes.status === 200 && cartAfterOrderRes.data.items.length === 0,
      'Cart is automatically cleared after order placement');

    // Test 13: Buyer views placed orders in GET /api/orders/mine
    const myOrdersRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/orders/mine',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${rameshToken}` }
    });
    assert(myOrdersRes.status === 200 && myOrdersRes.data.some(o => o._id === createdOrderId),
      'GET /api/orders/mine lists placed order');

    // Test 14: Seller (Sita) views received orders in GET /api/orders/received
    const receivedOrdersRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/orders/received',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${sitaToken}` }
    });
    assert(receivedOrdersRes.status === 200 && receivedOrdersRes.data.some(o => o._id === createdOrderId),
      'GET /api/orders/received lists incoming order for seller');

    // Test 15: Buyer cannot deliver order (403)
    const buyerDeliveredRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/orders/${createdOrderId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rameshToken}`
      }
    }, { status: 'delivered' });
    assert(buyerDeliveredRes.status === 403, 'Buyer cannot set order to delivered returns 403 Forbidden');

    // Test 16: Seller (Sita) accepts order
    const sellerAcceptRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/orders/${createdOrderId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sitaToken}`
      }
    }, { status: 'accepted' });
    assert(sellerAcceptRes.status === 200 && sellerAcceptRes.data.order.status === 'accepted',
      'Seller accepts order returns 200 OK');

    // Test 17: Buyer cannot cancel order once accepted by seller (400)
    const buyerCancelAfterAcceptRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/orders/${createdOrderId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rameshToken}`
      }
    }, { status: 'cancelled' });
    assert(buyerCancelAfterAcceptRes.status === 400, 'Buyer cannot cancel accepted order returns 400 Bad Request');

    // Test 18: Seller delivers order
    const sellerDeliverRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/orders/${createdOrderId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sitaToken}`
      }
    }, { status: 'delivered' });
    assert(sellerDeliverRes.status === 200 && sellerDeliverRes.data.order.status === 'delivered',
      'Seller delivers order returns 200 OK');

    // Test 19: Order with empty cart fails
    const emptyOrderRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rameshToken}`
      }
    }, { address: 'House 14' });
    assert(emptyOrderRes.status === 400 && emptyOrderRes.data.message.includes('cart is empty'),
      'Placing order with empty cart returns 400 Bad Request');

    // Test 20: Non-seller cannot delete product (403)
    const nonSellerDeleteRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/products/${createdProductId}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${rameshToken}` }
    });
    assert(nonSellerDeleteRes.status === 403, 'Non-seller cannot delete product returns 403');

    // Test 21: Seller deletes product
    const sellerDeleteRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/products/${createdProductId}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${sitaToken}` }
    });
    assert(sellerDeleteRes.status === 200, 'Seller deletes product returns 200 OK');

    console.log(`\n=== Test Results: ${passed}/${total} Passed ===`);
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
};

runTests();
