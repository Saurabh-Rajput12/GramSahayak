// Automated integration test script for Auth and User Management APIs
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

// Main test suite execution
const runTests = async () => {
  console.log('=== Starting Step 2 Integration Tests ===\n');
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
    const randomSuffix = Date.now().toString().slice(-4);
    const testUsername = `testuser_${randomSuffix}`;

    // Test 1: Register a new villager
    const regRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Test Villager',
      username: testUsername,
      password: 'password123'
    });
    assert(regRes.status === 201 && regRes.data.token && regRes.data.user.role === 'villager',
      'Register new villager returns 201 and token', JSON.stringify(regRes.data));

    const villagerToken = regRes.data.token;
    const testUserId = regRes.data.user._id;

    // Test 2: Register validation - missing fields (400)
    const emptyRegRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Only Name' });
    assert(emptyRegRes.status === 400, 'Register with missing fields returns 400', JSON.stringify(emptyRegRes.data));

    // Test 3: Register validation - password under 6 chars (400)
    const shortPassRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Short Pass', username: `short_${randomSuffix}`, password: '123' });
    assert(shortPassRes.status === 400, 'Register with password < 6 chars returns 400', JSON.stringify(shortPassRes.data));

    // Test 4: Register validation - duplicate username (409)
    const dupRegRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Duplicate User', username: testUsername, password: 'password123' });
    assert(dupRegRes.status === 409, 'Register with duplicate username returns 409', JSON.stringify(dupRegRes.data));

    // Test 5: Login villager
    const loginRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: testUsername, password: 'password123' });
    assert(loginRes.status === 200 && loginRes.data.token, 'Login villager returns 200 and token', JSON.stringify(loginRes.data));

    // Test 6: Login wrong password (401)
    const wrongPassRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: testUsername, password: 'wrongpassword' });
    assert(wrongPassRes.status === 401, 'Login with wrong password returns 401', JSON.stringify(wrongPassRes.data));

    // Test 7: GET /api/auth/me (Protected)
    const meRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${villagerToken}`
      }
    });
    assert(meRes.status === 200 && meRes.data.username === testUsername, 'GET /api/auth/me returns current user', JSON.stringify(meRes.data));

    // Test 8: GET /api/auth/me without token (401)
    const noTokenRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/me',
      method: 'GET'
    });
    assert(noTokenRes.status === 401, 'GET /api/auth/me without token returns 401', JSON.stringify(noTokenRes.data));

    // Test 9: PUT /api/auth/profile
    const updateProfileRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/profile',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${villagerToken}`
      }
    }, { name: 'Updated Villager Name' });
    assert(updateProfileRes.status === 200 && updateProfileRes.data.user.name === 'Updated Villager Name',
      'PUT /api/auth/profile updates user name', JSON.stringify(updateProfileRes.data));

    // Test 10: Login as Panchayat Admin (seeded user)
    const adminLoginRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'panchayat_admin', password: 'password123' });
    assert(adminLoginRes.status === 200 && adminLoginRes.data.user.role === 'panchayat',
      'Login as panchayat_admin returns 200 and panchayat role', JSON.stringify(adminLoginRes.data));

    const adminToken = adminLoginRes.data.token;
    const adminId = adminLoginRes.data.user._id;

    // Test 11: Villager tries to access Panchayat-only endpoint (403)
    const forbiddenRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/users',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${villagerToken}`
      }
    });
    assert(forbiddenRes.status === 403, 'Villager accessing /api/users returns 403 Forbidden', JSON.stringify(forbiddenRes.data));

    // Test 12: Panchayat accesses /api/users (200)
    const usersRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/users',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(usersRes.status === 200 && Array.isArray(usersRes.data) && usersRes.data.length >= 4,
      'Panchayat accessing /api/users returns array of users', `Total users: ${usersRes.data.length}`);

    // Test 13: Search users by query
    const searchRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/users?search=ramesh',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(searchRes.status === 200 && searchRes.data.some(u => u.username === 'ramesh_kumar'),
      'Search users by query returns matching user', JSON.stringify(searchRes.data));

    // Test 14: Panchayat attempts to self-block (400)
    const selfBlockRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/users/${adminId}/block`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(selfBlockRes.status === 400, 'Panchayat self-block returns 400', JSON.stringify(selfBlockRes.data));

    // Test 15: Panchayat blocks test villager
    const blockRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/users/${testUserId}/block`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(blockRes.status === 200 && blockRes.data.user.isBlocked === true,
      'Panchayat blocks villager successfully', JSON.stringify(blockRes.data));

    // Test 16: Blocked user attempts to login (403)
    const blockedLoginRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: testUsername, password: 'password123' });
    assert(blockedLoginRes.status === 403, 'Blocked user login returns 403 Forbidden', JSON.stringify(blockedLoginRes.data));

    // Test 17: Panchayat unblocks test villager
    const unblockRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/users/${testUserId}/block`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(unblockRes.status === 200 && unblockRes.data.user.isBlocked === false,
      'Panchayat unblocks villager successfully', JSON.stringify(unblockRes.data));

    // Test 18: Panchayat resets test villager password
    const resetRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/users/${testUserId}/reset-password`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { newPassword: 'newSecretPassword123' });
    assert(resetRes.status === 200, 'Panchayat resets user password returns 200', JSON.stringify(resetRes.data));

    // Test 19: Villager logs in with new password
    const newPassLoginRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: testUsername, password: 'newSecretPassword123' });
    assert(newPassLoginRes.status === 200 && newPassLoginRes.data.token,
      'Villager logs in successfully with reset password', JSON.stringify(newPassLoginRes.data));

    // Test 20: Panchayat attempts to self-delete (400)
    const selfDeleteRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/users/${adminId}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(selfDeleteRes.status === 400, 'Panchayat self-delete returns 400', JSON.stringify(selfDeleteRes.data));

    // Test 21: Panchayat deletes test villager
    const deleteRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/users/${testUserId}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(deleteRes.status === 200, 'Panchayat deletes user returns 200', JSON.stringify(deleteRes.data));

    console.log(`\n=== Test Results: ${passed}/${total} Passed ===`);
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
};

runTests();
