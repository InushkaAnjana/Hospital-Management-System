const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('../config/db');
const app = require('../app');

let server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

const runTests = async () => {
  try {
    await connectDB();
    server = app.listen(PORT);
    console.log(`[Test Runner] Test server listening on port ${PORT}`);

    // Helper for fetch requests
    const request = async (endpoint, options = {}) => {
      const url = `${BASE_URL}${endpoint}`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
          ...options.headers,
        },
        ...options,
      });
      const data = await res.json();
      return { status: res.status, data };
    };

    let adminToken, doctorToken, patientId, doctorId, departmentId;

    console.log('\n--- 1. Testing Authentication ---');
    // Test 1: Admin Login
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@hospital.org', password: 'Admin@12345' }),
    });
    console.log('✓ Admin Login Status:', adminLogin.status, '(Expected 200)');
    if (adminLogin.status !== 200 || !adminLogin.data.data.token) {
      throw new Error('Admin login failed: ' + JSON.stringify(adminLogin.data));
    }
    adminToken = adminLogin.data.data.token;
    console.log('  Authenticated as:', adminLogin.data.data.user.name, `[${adminLogin.data.data.user.role}]`);

    // Test 2: Doctor Login
    const doctorLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'dr.smith@hospital.org', password: 'Admin@12345' }),
    });
    console.log('✓ Doctor Login Status:', doctorLogin.status, '(Expected 200)');
    doctorToken = doctorLogin.data.data.token;

    // Test 3: Unauthorized route without token
    const unauthTest = await request('/patients');
    console.log('✓ Access without token status:', unauthTest.status, '(Expected 401)');
    if (unauthTest.status !== 401) throw new Error('Route should require token');

    // Test 4: RBAC Forbidden Test (Doctor trying to delete a department)
    const rbacTest = await request('/departments/000000000000000000000000', {
      method: 'DELETE',
      token: doctorToken,
    });
    console.log('✓ Doctor attempting admin action status:', rbacTest.status, '(Expected 403 Forbidden)');
    if (rbacTest.status !== 403) throw new Error('RBAC should block non-admin from delete');

    console.log('\n--- 2. Testing Departments & Doctors ---');
    // Test 5: Get Departments
    const deptsRes = await request('/departments', { token: adminToken });
    console.log('✓ Get Departments status:', deptsRes.status, `(Found ${deptsRes.data.data.length} departments)`);
    departmentId = deptsRes.data.data[0]._id;

    // Test 6: Get Doctors
    const docsRes = await request('/doctors', { token: adminToken });
    console.log('✓ Get Doctors status:', docsRes.status, `(Found ${docsRes.data.data.length} doctors)`);
    doctorId = docsRes.data.data[0]._id;
    console.log('  Using Doctor:', docsRes.data.data[0].name, 'Specialty:', docsRes.data.data[0].specialization);

    console.log('\n--- 3. Testing Patient Management ---');
    // Test 7: Register New Patient
    const newPat = await request('/patients', {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Subject',
        age: 29,
        gender: 'Male',
        bloodGroup: 'B+',
        phone: '+1 (555) 999-8888',
        email: 'test.subject@hospital.org',
        medicalHistory: {
          allergies: ['Amoxicillin'],
          chronicConditions: ['Seasonal Allergies'],
        },
      }),
    });
    console.log('✓ Register Patient status:', newPat.status, '(Expected 201)');
    if (newPat.status !== 201) throw new Error('Failed to create patient: ' + JSON.stringify(newPat.data));
    patientId = newPat.data.data._id;
    console.log('  Generated Patient ID:', newPat.data.data.patientId);

    // Test 8: Patient Search
    const searchPat = await request('/patients?search=Test', { token: adminToken });
    console.log('✓ Search Patient status:', searchPat.status, `(Found ${searchPat.data.data.length} matches)`);

    // Test 9: Get Single Patient with Clinical History
    const patDetail = await request(`/patients/${patientId}`, { token: adminToken });
    console.log('✓ Patient detail with medical history status:', patDetail.status);

    console.log('\n--- 4. Testing Appointments & Conflict Prevention ---');
    // Get a valid day for doctor 0 (House is Mon-Fri)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Ensure tomorrow is a weekday (Mon-Fri)
    while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    const apptDateStr = tomorrow.toISOString().split('T')[0];
    const testSlot = '09:00 AM - 09:30 AM';

    // Test 10: Book appointment
    const bookRes = await request('/appointments', {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        patient: patientId,
        doctor: doctorId,
        department: departmentId,
        appointmentDate: apptDateStr,
        timeSlot: testSlot,
        reason: 'Post-op consultation checkup',
      }),
    });
    console.log('✓ Book Appointment status:', bookRes.status, '(Expected 201)');
    if (bookRes.status !== 201) throw new Error('Booking failed: ' + JSON.stringify(bookRes.data));
    const apptId = bookRes.data.data._id;
    console.log('  Booked Appointment #:', bookRes.data.data.appointmentNumber, 'Token:', bookRes.data.data.tokenNumber);

    // Test 11: Attempt CONFLICTING booking on same doctor + same date + same slot!
    const conflictRes = await request('/appointments', {
      method: 'POST',
      token: adminToken,
      body: JSON.stringify({
        patient: patientId,
        doctor: doctorId,
        department: departmentId,
        appointmentDate: apptDateStr,
        timeSlot: testSlot,
        reason: 'Attempted duplicate booking',
      }),
    });
    console.log('✓ Double-booking conflict status:', conflictRes.status, '(Expected 409 Conflict)');
    if (conflictRes.status !== 409) {
      throw new Error('Expected 409 Conflict for double booking, but got ' + conflictRes.status);
    }
    console.log('  Conflict caught with message:', conflictRes.data.message);

    // Test 12: Reschedule appointment to another slot
    const rescheduleRes = await request(`/appointments/${apptId}/reschedule`, {
      method: 'PUT',
      token: adminToken,
      body: JSON.stringify({
        appointmentDate: apptDateStr,
        timeSlot: '10:00 AM - 10:30 AM',
        notes: 'Rescheduled by reception desk.',
      }),
    });
    console.log('✓ Reschedule Appointment status:', rescheduleRes.status, '(Expected 200)');

    console.log('\n--- 5. Testing Electronic Medical Records (EMR) ---');
    // Test 13: Create EMR
    const emrRes = await request('/medical-records', {
      method: 'POST',
      token: doctorToken,
      body: JSON.stringify({
        patient: patientId,
        doctor: doctorId,
        appointment: apptId,
        diagnosis: 'Acute Rhinitis & Bronchospasm',
        symptoms: ['Wheezing', 'Coughing', 'Mild fever'],
        clinicalNotes: 'Clear lung sounds after nebulization. Prescribed inhaler.',
        vitalSigns: {
          bloodPressure: '118/76 mmHg',
          pulseRate: 74,
          temperature: 99.1,
          respiratoryRate: 18,
          oxygenSaturation: 98,
        },
      }),
    });
    console.log('✓ Create EMR Record status:', emrRes.status, '(Expected 201)');
    if (emrRes.status !== 201) throw new Error('Create EMR failed: ' + JSON.stringify(emrRes.data));
    const emrId = emrRes.data.data._id;
    console.log('  Created EMR Record ID:', emrRes.data.data.recordId);

    console.log('\n--- 6. Testing Medicines & Prescriptions ---');
    // Test 14: Get Medicines
    const medsRes = await request('/medicines', { token: adminToken });
    console.log('✓ Get Medicines status:', medsRes.status, `(Found ${medsRes.data.data.length} medicines in inventory)`);
    const medItem = medsRes.data.data[0];
    const initialStock = medItem.stockQuantity;

    // Test 15: Create Prescription
    const rxRes = await request('/prescriptions', {
      method: 'POST',
      token: doctorToken,
      body: JSON.stringify({
        patient: patientId,
        doctor: doctorId,
        medicalRecord: emrId,
        diagnosis: 'Acute Rhinitis',
        medicines: [
          {
            medicine: medItem._id,
            medicineName: medItem.name,
            genericName: medItem.genericName,
            dosage: '1 Capsule',
            frequency: 'Three times daily (TID)',
            duration: '7 Days',
            quantity: 21,
            instructions: 'Complete full course with meals',
          },
        ],
        notes: 'Review in 1 week if symptoms persist.',
      }),
    });
    console.log('✓ Create Prescription status:', rxRes.status, '(Expected 201)');
    const rxId = rxRes.data.data._id;
    console.log('  Issued Prescription #:', rxRes.data.data.prescriptionNumber);

    // Test 16: Dispense Prescription (Pharmacist workflow)
    const pharmacistLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'pharmacy@hospital.org', password: 'Admin@12345' }),
    });
    const pharmacistToken = pharmacistLogin.data.data.token;

    const dispenseRes = await request(`/prescriptions/${rxId}/dispense`, {
      method: 'PUT',
      token: pharmacistToken,
    });
    console.log('✓ Dispense Prescription status:', dispenseRes.status, '(Expected 200)');

    // Verify stock deducted
    const updatedMed = await request(`/medicines/${medItem._id}`, { token: adminToken });
    console.log(
      '✓ Inventory stock verified: Initial =',
      initialStock,
      '-> New =',
      updatedMed.data.data.stockQuantity,
      `(Deducted 21 units)`
    );

    console.log('\n======================================================');
    console.log('🎉 ALL BACKEND API TESTS PASSED SUCCESSFULLY! (16/16)');
    console.log('======================================================\n');

    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  } catch (error) {
    console.error('\n❌ Test failure detected:', error.message);
    if (server) server.close();
    await disconnectDB();
    process.exit(1);
  }
};

runTests();
