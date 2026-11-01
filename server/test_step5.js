// Automated integration test script for Step 5 APIs: Events, Helplines, Feedback, Members, Reports
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

// Main test suite for Step 5
const runTests = async () => {
  console.log('=== Starting Step 5 Integration Tests ===\n');
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
    // Authenticate Villager 1 (Ramesh)
    const rameshLogin = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'ramesh_kumar', password: 'password123' });
    const rameshToken = rameshLogin.data.token;

    // Authenticate Villager 2 (Sita)
    const sitaLogin = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'sita_devi', password: 'password123' });
    const sitaToken = sitaLogin.data.token;

    // Authenticate Villager 3 (Anil)
    const anilLogin = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'anil_farmer', password: 'password123' });
    const anilToken = anilLogin.data.token;

    // Authenticate Panchayat Admin
    const pLogin = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'panchayat_admin', password: 'password123' });
    const panchayatToken = pLogin.data.token;

    // --- Events Tests ---
    // Test 1: GET /api/events
    const eventsRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/events',
      method: 'GET'
    });
    assert(eventsRes.status === 200 && Array.isArray(eventsRes.data) && eventsRes.data.length >= 4,
      'GET /api/events returns seeded events', `Count: ${eventsRes.data?.length}`);

    // Test 2: Villager forbidden from POST /api/events
    const vEventRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/events',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rameshToken}`
      }
    }, { title: 'Unauthorized Event', description: 'Test', type: 'meeting', date: new Date(), venue: 'Bhawan', seatLimit: 50 });
    assert(vEventRes.status === 403, 'Villager creating event returns 403 Forbidden');

    // Test 3: Panchayat creates an event with limited capacity (seatLimit: 2)
    const createEventRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/events',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${panchayatToken}`
      }
    }, {
      title: 'Youth Digital Skills Workshop',
      description: 'Computer literacy and online government services training.',
      type: 'training',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      venue: 'Gram Panchayat Computer Lab',
      seatLimit: 2
    });
    assert(createEventRes.status === 201 && createEventRes.data.event._id,
      'Panchayat creates event returns 201 Created');
    const createdEventId = createEventRes.data.event._id;

    // Test 4: Villager 1 (Ramesh) registers for the event (Seat 1/2)
    const regRes1 = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/events/${createdEventId}/register`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${rameshToken}` }
    });
    assert(regRes1.status === 200 && regRes1.data.event.registeredUsers.length === 1,
      'Villager 1 registers for event returns 200 OK');

    // Test 5: Villager 1 tries to register again (Duplicate registration)
    const dupRegRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/events/${createdEventId}/register`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${rameshToken}` }
    });
    assert(dupRegRes.status === 400 && dupRegRes.data.message.includes('already registered'),
      'Duplicate event registration blocked with 400 Bad Request');

    // Test 6: Villager 2 (Sita) registers for event (Seat 2/2 -> Full)
    const regRes2 = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/events/${createdEventId}/register`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${sitaToken}` }
    });
    assert(regRes2.status === 200 && regRes2.data.event.registeredUsers.length === 2,
      'Villager 2 registers for event returns 200 OK (Seats full)');

    // Test 7: Villager 3 (Anil) tries to register when event is fully booked (400)
    const fullRegRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/events/${createdEventId}/register`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${anilToken}` }
    });
    assert(fullRegRes.status === 400 && fullRegRes.data.message.includes('fully booked'),
      'Registering for fully booked event blocked with 400 Bad Request');

    // Test 8: Villager 1 cancels registration
    const cancelRegRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/events/${createdEventId}/register`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${rameshToken}` }
    });
    assert(cancelRegRes.status === 200 && cancelRegRes.data.event.registeredUsers.length === 1,
      'Villager cancels event registration returns 200 OK');

    // Test 9: GET /api/events/mine returns registered events
    const myEventsRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/events/mine',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${sitaToken}` }
    });
    assert(myEventsRes.status === 200 && myEventsRes.data.some(e => e._id === createdEventId),
      'GET /api/events/mine returns user registered events');

    // --- Helplines Tests ---
    // Test 10: GET /api/helplines
    const helplinesRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/helplines',
      method: 'GET'
    });
    assert(helplinesRes.status === 200 && helplinesRes.data.length >= 8,
      'GET /api/helplines returns seeded helplines list');

    // Test 11: Panchayat creates a helpline
    const createHelpRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/helplines',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${panchayatToken}`
      }
    }, {
      name: 'Animal Rescue & Veterinary Mobile Helpline',
      category: 'ambulance',
      phone: '1962',
      address: 'Veterinary Hospital Main Road',
      timings: '24x7'
    });
    assert(createHelpRes.status === 201 && createHelpRes.data.helpline._id,
      'Panchayat creates helpline returns 201 Created');
    const createdHelplineId = createHelpRes.data.helpline._id;

    // Test 12: Panchayat deletes helpline
    const deleteHelpRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/helplines/${createdHelplineId}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${panchayatToken}` }
    });
    assert(deleteHelpRes.status === 200, 'Panchayat deletes helpline returns 200 OK');

    // --- Feedback Tests ---
    // Test 13: Villager submits feedback
    const submitFeedbackRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/feedback',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rameshToken}`
      }
    }, {
      subject: 'Excellent timely clearance of canal drainage',
      message: 'The irrigation team cleared the silt very fast before the watering week. Great work!',
      type: 'appreciation',
      rating: 5
    });
    assert(submitFeedbackRes.status === 201 && submitFeedbackRes.data.feedback._id,
      'Villager submits feedback returns 201 Created');
    const createdFeedbackId = submitFeedbackRes.data.feedback._id;

    // Test 14: GET /api/feedback/mine
    const myFbRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/feedback/mine',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${rameshToken}` }
    });
    assert(myFbRes.status === 200 && myFbRes.data.some(f => f._id === createdFeedbackId),
      'GET /api/feedback/mine returns user feedback');

    // Test 15: Villager forbidden from GET /api/feedback
    const vFbListRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/feedback',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${rameshToken}` }
    });
    assert(vFbListRes.status === 403, 'Villager accessing all feedback returns 403 Forbidden');

    // Test 16: Panchayat marks feedback as read
    const readFbRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/feedback/${createdFeedbackId}/read`,
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${panchayatToken}` }
    });
    assert(readFbRes.status === 200 && readFbRes.data.feedback.isRead === true,
      'Panchayat marks feedback as read returns 200 OK');

    // --- Members Tests ---
    // Test 17: GET /api/members
    const membersRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/members',
      method: 'GET'
    });
    assert(membersRes.status === 200 && membersRes.data.length >= 5,
      'GET /api/members returns seeded members list');

    // Test 18: Panchayat creates member
    const createMemRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/members',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${panchayatToken}`
      }
    }, {
      name: 'Shri Vikram Solanki',
      post: 'Ward Panch',
      ward: 'Ward 2',
      contactNote: 'Primary school welfare committee representative',
      since: 2022
    });
    assert(createMemRes.status === 201 && createMemRes.data.member._id,
      'Panchayat creates member returns 201 Created');
    const createdMemberId = createMemRes.data.member._id;

    // Test 19: Panchayat deletes member
    const deleteMemRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: `/api/members/${createdMemberId}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${panchayatToken}` }
    });
    assert(deleteMemRes.status === 200, 'Panchayat deletes member returns 200 OK');

    // --- Reports Tests ---
    // Test 20: Villager forbidden from GET /api/reports/summary
    const vReportRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/reports/summary',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${rameshToken}` }
    });
    assert(vReportRes.status === 403, 'Villager accessing reports returns 403 Forbidden');

    // Test 21: Panchayat accesses GET /api/reports/summary
    const pReportRes = await makeRequest({
      hostname: '127.0.0.1',
      port: 5001,
      path: '/api/reports/summary',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${panchayatToken}` }
    });
    assert(pReportRes.status === 200 &&
      pReportRes.data.totalVillagers >= 3 &&
      pReportRes.data.complaints &&
      pReportRes.data.applications &&
      typeof pReportRes.data.totalOrders === 'number',
      'Panchayat fetches village report summary with countDocuments', JSON.stringify(pReportRes.data));

    console.log(`\n=== Test Results: ${passed}/${total} Passed ===`);
    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
};

runTests();
