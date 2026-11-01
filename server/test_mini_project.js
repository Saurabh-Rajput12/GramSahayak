// Comprehensive Integration Test Suite for Gram Sahayak Mini Project
// Tests all 5 Core Modules: Auth, Schemes, Complaints, Krishi Market, and Notices
const http = require('http');

const PORT = 5001;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json'
    };
    if (body) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          let parsedData = null;
          try {
            parsedData = JSON.parse(rawData);
          } catch (e) {
            parsedData = rawData;
          }
          resolve({ status: res.statusCode, data: parsedData });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (body) req.write(postData);
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n=== Testing Gram Sahayak Mini Project (5 Core Modules) ===\n');

  try {
    // ---------------------------------------------------------
    // MODULE 1: AUTHENTICATION
    // ---------------------------------------------------------
    console.log('[Module 1: Authentication & User Roles]');

    // Login as Admin
    const adminLogin = await request('POST', '/api/auth/login', {
      username: 'panchayat_admin',
      password: 'password123'
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'Panchayat Admin login returns JWT token');
    const adminToken = adminLogin.data.token;

    // Login as Villager
    const villagerLogin = await request('POST', '/api/auth/login', {
      username: 'ramesh_kumar',
      password: 'password123'
    });
    assert(villagerLogin.status === 200 && villagerLogin.data.token, 'Villager login returns JWT token');
    const villagerToken = villagerLogin.data.token;

    // Verify /api/auth/me
    const meRes = await request('GET', '/api/auth/me', null, villagerToken);
    assert(meRes.status === 200 && meRes.data.role === 'villager', 'Protected /me returns villager profile');

    // ---------------------------------------------------------
    // MODULE 2: SARKARI YOJANAS (SCHEMES & APPLICATIONS)
    // ---------------------------------------------------------
    console.log('\n[Module 2: Government Schemes & Citizen Applications]');

    // Get all schemes
    const schemesRes = await request('GET', '/api/schemes');
    assert(schemesRes.status === 200 && Array.isArray(schemesRes.data) && schemesRes.data.length >= 5, 'Public route returns list of welfare schemes');
    const targetScheme = schemesRes.data.find(s => s.name.includes('Ayushman Bharat')) || schemesRes.data[2];

    // Filter scheme by category
    const catSchemeRes = await request('GET', '/api/schemes?category=farmer');
    assert(catSchemeRes.status === 200 && catSchemeRes.data.every(s => s.category === 'farmer'), 'Category filter returns only farmer schemes');

    // Villager submits application for a scheme
    const applyRes = await request('POST', '/api/applications', {
      scheme: targetScheme._id,
      fullName: 'Ramesh Kumar',
      age: 42,
      income: 95000,
      landAcres: 2
    }, villagerToken);
    assert(applyRes.status === 201 && applyRes.data.application, 'Villager can submit new scheme application');
    const newAppId = applyRes.data.application._id;

    // Duplicate check
    const duplicateApply = await request('POST', '/api/applications', {
      scheme: targetScheme._id,
      fullName: 'Ramesh Kumar',
      age: 42,
      income: 95000
    }, villagerToken);
    assert(duplicateApply.status === 400, 'Duplicate scheme application is blocked with 400 Bad Request');

    // Panchayat reviews and approves application
    const reviewAppRes = await request('PUT', `/api/applications/${newAppId}`, {
      status: 'approved',
      remark: 'All verification documents approved by Panchayat.'
    }, adminToken);
    assert(reviewAppRes.status === 200 && reviewAppRes.data.application && reviewAppRes.data.application.status === 'approved', 'Panchayat can approve application with remarks');

    // Villager views their applications
    const myAppsRes = await request('GET', '/api/applications/mine', null, villagerToken);
    assert(myAppsRes.status === 200 && myAppsRes.data.length >= 2, 'Villager can view all their submitted applications');

    // ---------------------------------------------------------
    // MODULE 3: SHIKAYAT NIVARAN (COMPLAINTS & GRIEVANCE REDRESSAL)
    // ---------------------------------------------------------
    console.log('\n[Module 3: Citizen Grievances & Resolution]');

    // Villager submits complaint
    const newComplaintRes = await request('POST', '/api/complaints', {
      title: 'Water logging near bus stop',
      category: 'water',
      description: 'Stagnant rainwater has created mosquito breeding near main village bus stop.'
    }, villagerToken);
    assert(newComplaintRes.status === 201 && newComplaintRes.data.complaint, 'Villager can lodge village complaint');
    const complaintId = newComplaintRes.data.complaint._id;

    // Panchayat updates complaint status and replies
    const replyComplaintRes = await request('PUT', `/api/complaints/${complaintId}/respond`, {
      status: 'in_progress',
      panchayatReply: 'Drain cleaning team dispatched to clear blockages.'
    }, adminToken);
    assert(replyComplaintRes.status === 200 && replyComplaintRes.data.complaint && replyComplaintRes.data.complaint.status === 'in_progress', 'Panchayat can update complaint status and add official reply');

    // Villager views their complaints
    const myComplaintsRes = await request('GET', '/api/complaints/mine', null, villagerToken);
    assert(myComplaintsRes.status === 200 && myComplaintsRes.data.some(c => c._id === complaintId), 'Villager can track their filed grievances');

    // ---------------------------------------------------------
    // MODULE 4: KRISHI BAZAAR (FARMER MARKETPLACE)
    // ---------------------------------------------------------
    console.log('\n[Module 4: Krishi Market (Farmer Produce)]');

    // Get all marketplace products
    const productsRes = await request('GET', '/api/products');
    assert(productsRes.status === 200 && Array.isArray(productsRes.data) && productsRes.data.length >= 5, 'Public can browse all market produce');

    // Filter products by category
    const vegRes = await request('GET', '/api/products?category=vegetables');
    assert(vegRes.status === 200 && vegRes.data.every(p => p.category === 'vegetables'), 'Filter returns only vegetable produce');

    // Farmer lists new produce item
    const newProductRes = await request('POST', '/api/products', {
      name: 'Organic Cauliflower (फूलगोभी)',
      category: 'vegetables',
      price: 30,
      quantity: 50,
      unit: 'kg',
      location: 'Ward 3, Rampur Farm',
      contactPhone: '9876543210',
      description: 'Fresh farm cauliflower harvested daily.'
    }, villagerToken);
    assert(newProductRes.status === 201 && newProductRes.data.price === 30, 'Farmer can list new farm produce with contact info');
    const newProdId = newProductRes.data._id;

    // Farmer toggles availability
    const toggleRes = await request('PUT', `/api/products/${newProdId}/toggle-stock`, null, villagerToken);
    assert(toggleRes.status === 200 && toggleRes.data.isAvailable === false, 'Farmer can toggle produce availability (In Stock / Sold Out)');

    // Farmer deletes test produce
    const deleteProdRes = await request('DELETE', `/api/products/${newProdId}`, null, villagerToken);
    assert(deleteProdRes.status === 200, 'Farmer can delete their produce listing');

    // ---------------------------------------------------------
    // MODULE 5: GRAM SUCHNA PATRA (NOTICES & CIRCULARS)
    // ---------------------------------------------------------
    console.log('\n[Module 5: Official Notices & Circulars]');

    // Get all notices
    const noticesRes = await request('GET', '/api/notices');
    assert(noticesRes.status === 200 && Array.isArray(noticesRes.data) && noticesRes.data.length >= 3, 'Public can view official village notices');

    // Panchayat posts a new notice
    const newNoticeRes = await request('POST', '/api/notices', {
      title: 'Solar Streetlight Installation Survey',
      body: 'Survey team will visit wards 1 to 5 to mark points for new solar streetlights.',
      type: 'general'
    }, adminToken);
    assert(newNoticeRes.status === 201 && newNoticeRes.data.notice.title.includes('Solar'), 'Panchayat can publish official village notice');

    // ---------------------------------------------------------
    // REPORTS SUMMARY (FOR PANCHAYAT DASHBOARD)
    // ---------------------------------------------------------
    console.log('\n[Summary & Analytics for Panchayat]');

    const summaryRes = await request('GET', '/api/reports/summary', null, adminToken);
    assert(summaryRes.status === 200 && summaryRes.data.totalVillagers >= 2, 'Panchayat summary returns aggregate counts for all 5 modules');

    console.log(`\n========================================`);
    console.log(`All Mini Project Tests Completed:`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`========================================\n`);

    if (failed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
