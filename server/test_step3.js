// Automated integration test script for Step 3 APIs: Schemes, Applications, Complaints, Prices, Notices
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

// Main test suite for Step 3
const runTests = async () => {
  console.log('=== Starting Step 3 Integration Tests ===\n');
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
    // Authenticate Villager
    const vLogin = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'ramesh_kumar', password: 'password123' });
    const villagerToken = vLogin.data.token;

    // Authenticate Panchayat Admin
    const pLogin = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'panchayat_admin', password: 'password123' });
    const panchayatToken = pLogin.data.token;

    // --- Schemes Tests ---
    // Test 1: GET /api/schemes
    const schemesRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/schemes',
      method: 'GET'
    });
    assert(schemesRes.status === 200 && Array.isArray(schemesRes.data) && schemesRes.data.length >= 10,
      'GET /api/schemes returns seeded schemes list', `Count: ${schemesRes.data?.length}`);

    // Test 2: GET /api/schemes with search & category
    const filterSchemeRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/schemes?search=kisan&category=farmer',
      method: 'GET'
    });
    assert(filterSchemeRes.status === 200 && filterSchemeRes.data.length >= 1,
      'GET /api/schemes filters by search and category', JSON.stringify(filterSchemeRes.data));

    // Test 3: Villager forbidden from POST /api/schemes
    const villagerSchemeRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/schemes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${villagerToken}`
      }
    }, { name: 'Unauthorized Scheme', description: 'Test', category: 'farmer' });
    assert(villagerSchemeRes.status === 403, 'Villager creating scheme returns 403 Forbidden');

    // Test 4: Panchayat creates scheme
    const createSchemeRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/schemes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${panchayatToken}`
      }
    }, {
      name: 'Gram Solar Pump Subsidy Scheme',
      description: 'Subsidy of 70% on solar agricultural water pumps for small farmers.',
      category: 'farmer',
      documentsRequired: ['Aadhaar Card', 'Land Record (Khasra)'],
      minAge: 21,
      maxIncome: 300000,
      applyLink: 'https://kusum.gov.in'
    });
    assert(createSchemeRes.status === 201 && createSchemeRes.data.scheme._id,
      'Panchayat creates scheme returns 201 Created', JSON.stringify(createSchemeRes.data));
    const createdSchemeId = createSchemeRes.data.scheme._id;

    // Test 5: Panchayat updates scheme
    const updateSchemeRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/schemes/${createdSchemeId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${panchayatToken}`
      }
    }, { minAge: 20 });
    assert(updateSchemeRes.status === 200 && updateSchemeRes.data.scheme.minAge === 20,
      'Panchayat updates scheme returns 200 OK');

    // --- Applications Tests ---
    // Find Old Age Pension Scheme (minAge: 60)
    const oldAgeScheme = schemesRes.data.find(s => s.minAge === 60);

    // Test 6: Villager fails age eligibility check (minAge: 60, applying age: 28)
    const ageFailRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/applications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${villagerToken}`
      }
    }, {
      scheme: oldAgeScheme._id,
      fullName: 'Ramesh Kumar',
      age: 28,
      income: 50000,
      landAcres: 2
    });
    assert(ageFailRes.status === 400 && ageFailRes.data.message.includes('Minimum age required'),
      'Application rejects ineligible age with 400', JSON.stringify(ageFailRes.data));

    // Test 7: Villager successfully applies for eligible scheme
    const applyRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/applications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${villagerToken}`
      }
    }, {
      scheme: createdSchemeId,
      fullName: 'Ramesh Kumar',
      age: 35,
      income: 120000,
      landAcres: 3
    });
    assert(applyRes.status === 201 && applyRes.data.application.status === 'pending',
      'Villager submits valid application returns 201 Created', JSON.stringify(applyRes.data));
    const createdAppId = applyRes.data.application._id;

    // Test 8: Block duplicate application
    const dupApplyRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/applications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${villagerToken}`
      }
    }, {
      scheme: createdSchemeId,
      fullName: 'Ramesh Kumar',
      age: 35,
      income: 120000,
      landAcres: 3
    });
    assert(dupApplyRes.status === 400 && dupApplyRes.data.message.includes('already applied'),
      'Duplicate scheme application blocked with 400', JSON.stringify(dupApplyRes.data));

    // Test 9: GET /api/applications/mine
    const myAppsRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/applications/mine',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${villagerToken}` }
    });
    assert(myAppsRes.status === 200 && myAppsRes.data.some(a => a._id === createdAppId),
      'GET /api/applications/mine returns villager applications', `Count: ${myAppsRes.data?.length}`);

    // Test 10: Panchayat reviews and approves application
    const reviewAppRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/applications/${createdAppId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${panchayatToken}`
      }
    }, { status: 'approved', remark: 'Land revenue documents verified successfully.' });
    assert(reviewAppRes.status === 200 && reviewAppRes.data.application.status === 'approved',
      'Panchayat approves application returns 200 OK');

    // --- Complaints Tests ---
    // Test 11: Villager files a new complaint
    const fileComplaintRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/complaints',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${villagerToken}`
      }
    }, {
      title: 'Pothole on School Approach Road',
      category: 'road',
      description: 'A deep crater has formed after rainfall near the primary school entrance causing slips.'
    });
    assert(fileComplaintRes.status === 201 && fileComplaintRes.data.complaint.status === 'open',
      'Villager files complaint returns 201 Created', JSON.stringify(fileComplaintRes.data));
    const createdComplaintId = fileComplaintRes.data.complaint._id;

    // Test 12: Villager updates own open complaint
    const updateComplaintRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/complaints/${createdComplaintId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${villagerToken}`
      }
    }, { title: 'Deep Pothole on School Approach Road (Urgent)' });
    assert(updateComplaintRes.status === 200 && updateComplaintRes.data.complaint.title.includes('Urgent'),
      'Villager edits open complaint returns 200 OK');

    // Test 13: Panchayat responds and resolves complaint
    const respondComplaintRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/complaints/${createdComplaintId}/respond`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${panchayatToken}`
      }
    }, {
      status: 'resolved',
      panchayatReply: 'Gravel filling completed by road maintenance team.'
    });
    assert(respondComplaintRes.status === 200 && respondComplaintRes.data.complaint.status === 'resolved',
      'Panchayat responds to complaint returns 200 OK');

    // Test 14: Villager cannot edit resolved complaint
    const editResolvedRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/complaints/${createdComplaintId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${villagerToken}`
      }
    }, { title: 'Attempt to change resolved complaint' });
    assert(editResolvedRes.status === 400, 'Editing resolved complaint returns 400 Bad Request');

    // Test 15: Villager cannot delete resolved complaint
    const deleteResolvedRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/complaints/${createdComplaintId}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${villagerToken}` }
    });
    assert(deleteResolvedRes.status === 400, 'Deleting resolved complaint returns 400 Bad Request');

    // --- Prices Tests ---
    // Test 16: GET /api/prices
    const pricesRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/prices?district=Indore',
      method: 'GET'
    });
    assert(pricesRes.status === 200 && pricesRes.data.length >= 1,
      'GET /api/prices with district filter returns matching prices');

    // Test 17: Panchayat creates crop price
    const createPriceRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/prices',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${panchayatToken}`
      }
    }, {
      crop: 'Sunflower (Surajmukhi)',
      market: 'Latur APMC',
      district: 'Latur',
      price: 5400
    });
    assert(createPriceRes.status === 201 && createPriceRes.data.cropPrice._id,
      'Panchayat creates crop price returns 201 Created');
    const createdPriceId = createPriceRes.data.cropPrice._id;

    // Test 18: Panchayat updates crop price
    const updatePriceRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/prices/${createdPriceId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${panchayatToken}`
      }
    }, { price: 5550 });
    assert(updatePriceRes.status === 200 && updatePriceRes.data.cropPrice.price === 5550,
      'Panchayat updates crop price returns 200 OK');

    // Test 19: Panchayat deletes crop price
    const deletePriceRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/prices/${createdPriceId}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${panchayatToken}` }
    });
    assert(deletePriceRes.status === 200, 'Panchayat deletes crop price returns 200 OK');

    // --- Notices Tests ---
    // Test 20: GET /api/notices with type filter
    const noticesRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/notices?type=meeting',
      method: 'GET'
    });
    assert(noticesRes.status === 200 && noticesRes.data.length >= 1,
      'GET /api/notices with type filter returns matching notices');

    // Test 21: Panchayat creates notice
    const createNoticeRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/notices',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${panchayatToken}`
      }
    }, {
      title: 'Free Soil Testing Campaign at Panchayat Hall',
      body: 'Farmers can bring soil samples from their fields for free N-P-K nutrient testing.',
      type: 'camp'
    });
    assert(createNoticeRes.status === 201 && createNoticeRes.data.notice._id,
      'Panchayat creates notice returns 201 Created');
    const createdNoticeId = createNoticeRes.data.notice._id;

    // Test 22: Panchayat updates notice
    const updateNoticeRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/notices/${createdNoticeId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${panchayatToken}`
      }
    }, { title: 'Free Soil Testing Campaign (Extended Timings)' });
    assert(updateNoticeRes.status === 200 && updateNoticeRes.data.notice.title.includes('Extended'),
      'Panchayat updates notice returns 200 OK');

    // Test 23: Panchayat deletes notice
    const deleteNoticeRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/notices/${createdNoticeId}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${panchayatToken}` }
    });
    assert(deleteNoticeRes.status === 200, 'Panchayat deletes notice returns 200 OK');

    console.log(`\n=== Test Results: ${passed}/${total} Passed ===`);
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
};

runTests();
