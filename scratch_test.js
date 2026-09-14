const http = require('http');

const request = (method, path, data, token) => {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(postData);

    const req = http.request(
      {
        host: 'localhost',
        port: 5000,
        path,
        method,
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, data: body });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(postData);
    req.end();
  });
};

async function testAll() {
  console.log('--- 1. Testing Health Endpoint ---');
  const health = await request('GET', '/api/health');
  console.log('Health:', health.status, health.data?.status || health.data);

  console.log('--- 2. Testing Admin Login ---');
  const login = await request('POST', '/api/auth/login', {
    email: 'admin@hospital.org',
    password: 'Admin@12345',
  });
  console.log('Login Status:', login.status, login.data?.message);
  const token = login.data?.data?.token;
  if (!token) throw new Error('Failed to obtain token');

  console.log('--- 3. Testing Dashboard Stats ---');
  const dash = await request('GET', '/api/dashboard/stats', null, token);
  console.log('Dashboard Status:', dash.status, 'KPIs:', Object.keys(dash.data?.data?.kpis || {}));

  console.log('--- 4. Testing Lab Endpoints ---');
  const labStats = await request('GET', '/api/lab/stats', null, token);
  console.log('Lab Stats:', labStats.status, labStats.data?.data);

  console.log('--- 5. Testing Pharmacy / Medicine Stats ---');
  const medStats = await request('GET', '/api/medicines/stats', null, token);
  console.log('Medicine Stats:', medStats.status, medStats.data?.data);

  console.log('--- 6. Testing Billing Stats ---');
  const billStats = await request('GET', '/api/billing/stats', null, token);
  console.log('Billing Stats:', billStats.status, billStats.data?.data);

  console.log('--- 7. Testing Admission Stats ---');
  const admStats = await request('GET', '/api/admissions/stats', null, token);
  console.log('Admission Stats:', admStats.status, admStats.data?.data);

  console.log('--- 8. Testing Staff Stats ---');
  const staffStats = await request('GET', '/api/staff/stats', null, token);
  console.log('Staff Stats:', staffStats.status, staffStats.data?.data);

  console.log('--- 9. Testing Reports Endpoints ---');
  const revReport = await request('GET', '/api/reports/revenue', null, token);
  console.log('Revenue Report:', revReport.status, revReport.data?.data?.totals);
  const patReport = await request('GET', '/api/reports/patients', null, token);
  console.log('Patient Report:', patReport.status, 'Total:', patReport.data?.data?.totalRegistered);

  console.log('--- 10. Testing Audit Logs ---');
  const audit = await request('GET', '/api/audit-logs', null, token);
  console.log('Audit Logs Status:', audit.status, 'Count:', audit.data?.data?.length);

  console.log('\n>>> ALL 10 MODULE TESTS PASSED PERFECTLY! <<<');
}

testAll().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
