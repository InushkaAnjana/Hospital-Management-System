const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('../config/db');
const {
  User,
  Doctor,
  Patient,
  Department,
  LabTest,
  Invoice,
  Admission,
  Staff,
  AuditLog,
} = require('../models');

const seedNewModules = async () => {
  try {
    console.log('[Seed New Modules] Connecting to DB...');
    await connectDB();

    const [patients, doctors, depts, adminUser] = await Promise.all([
      Patient.find(),
      Doctor.find(),
      Department.find(),
      User.findOne({ role: 'Administrator' }),
    ]);

    if (!patients.length || !doctors.length) {
      console.log('Ensure patients and doctors are seeded first.');
      process.exit(1);
    }

    // 1. Seed Lab Tests if none
    const labCount = await LabTest.countDocuments();
    if (labCount === 0) {
      console.log('Seeding initial Lab Tests...');
      await LabTest.create([
        {
          testCode: 'LAB-2026-0001',
          patient: patients[0]._id,
          doctor: doctors[0]._id,
          testName: 'Complete Blood Count (CBC)',
          category: 'Hematology',
          priority: 'Urgent',
          status: 'Completed',
          sampleType: 'Blood',
          cost: 45,
          completedAt: new Date(),
          technicianNotes: 'Normal leucocyte distribution. Platelets adequate.',
          results: [
            { parameter: 'Hemoglobin', value: '14.5', unit: 'g/dL', referenceRange: '13.0 - 17.0', status: 'Normal' },
            { parameter: 'WBC Count', value: '7,200', unit: '/mcL', referenceRange: '4,000 - 11,000', status: 'Normal' },
            { parameter: 'Platelets', value: '260,000', unit: '/mcL', referenceRange: '150,000 - 450,000', status: 'Normal' },
          ],
        },
        {
          testCode: 'LAB-2026-0002',
          patient: patients[1]._id,
          doctor: doctors[1]._id,
          testName: 'Lipid Profile & Serum Cholesterol',
          category: 'Biochemistry',
          priority: 'Routine',
          status: 'Sample Collected',
          sampleType: 'Blood',
          sampleCollectedAt: new Date(),
          cost: 65,
          technicianNotes: 'Fasting specimen received in good condition.',
        },
        {
          testCode: 'LAB-2026-0003',
          patient: patients[2]._id,
          doctor: doctors[0]._id,
          testName: 'Comprehensive Metabolic Panel (CMP)',
          category: 'Biochemistry',
          priority: 'Routine',
          status: 'Ordered',
          sampleType: 'Serum',
          cost: 80,
          technicianNotes: 'Patient scheduled for morning draw.',
        },
      ]);
      console.log('✓ Seeded Lab Tests');
    }

    // 2. Seed Invoices if none
    const invoiceCount = await Invoice.countDocuments();
    if (invoiceCount === 0) {
      console.log('Seeding initial Invoices...');
      await Invoice.create([
        {
          invoiceNumber: 'INV-2026-0001',
          patient: patients[0]._id,
          items: [
            { description: 'Cardiology Specialist Consultation', type: 'Consultation', quantity: 1, unitPrice: 120, total: 120 },
            { description: 'Complete Blood Count (CBC)', type: 'Laboratory', quantity: 1, unitPrice: 45, total: 45 },
          ],
          subtotal: 165,
          discount: 15,
          taxRate: 5,
          taxAmount: 7.5,
          totalAmount: 157.5,
          amountPaid: 157.5,
          balanceDue: 0,
          paymentStatus: 'Paid',
          paymentMethod: 'Credit Card',
          paymentDate: new Date(),
          notes: 'Settled at discharge counter.',
          createdBy: adminUser?._id,
        },
        {
          invoiceNumber: 'INV-2026-0002',
          patient: patients[1]._id,
          items: [
            { description: 'Inpatient General Ward Stay (2 nights)', type: 'Admission', quantity: 2, unitPrice: 150, total: 300 },
            { description: 'Amoxil 500mg (10 tabs)', type: 'Pharmacy', quantity: 10, unitPrice: 0.85, total: 8.5 },
          ],
          subtotal: 308.5,
          discount: 0,
          taxRate: 0,
          taxAmount: 0,
          totalAmount: 308.5,
          amountPaid: 150,
          balanceDue: 158.5,
          paymentStatus: 'Partially Paid',
          paymentMethod: 'Cash',
          paymentDate: new Date(),
          notes: 'Initial deposit paid.',
          createdBy: adminUser?._id,
        },
      ]);
      console.log('✓ Seeded Invoices');
    }

    // 3. Seed Admissions if none
    const admissionCount = await Admission.countDocuments();
    if (admissionCount === 0) {
      console.log('Seeding initial Inpatient Admissions...');
      await Admission.create([
        {
          admissionNumber: 'ADM-2026-0001',
          patient: patients[0]._id,
          doctor: doctors[0]._id,
          ward: 'General Ward',
          roomNumber: 'Room 102',
          bedNumber: 'B-04',
          admissionDate: new Date(Date.now() - 86400000 * 2),
          status: 'Admitted',
          admissionReason: 'Severe chest tightness and cardiac observation',
          diagnosis: 'Unstable Angina - Rule Out MI',
          dailyRate: 150,
          nurseInCharge: 'Nurse Connor',
          vitalsLog: [
            {
              recordedAt: new Date(Date.now() - 86400000),
              bloodPressure: '130/85',
              heartRate: 78,
              temperature: 98.4,
              respiratoryRate: 16,
              oxygenSaturation: 98,
              notes: 'Patient resting comfortably. Normal sinus rhythm.',
            },
          ],
        },
        {
          admissionNumber: 'ADM-2026-0002',
          patient: patients[1]._id,
          doctor: doctors[1]._id,
          ward: 'Semi-Private Ward',
          roomNumber: 'Room 205',
          bedNumber: 'B-12',
          admissionDate: new Date(Date.now() - 86400000 * 4),
          dischargeDate: new Date(Date.now() - 86400000),
          status: 'Discharged',
          admissionReason: 'Post-laparoscopic appendectomy recovery',
          diagnosis: 'Acute Appendicitis - Post-Op',
          dailyRate: 200,
          dischargeSummary: 'Wound healed nicely, no fever, afebrile, discharged with oral antibiotics.',
          dischargeCondition: 'Recovered',
        },
      ]);
      console.log('✓ Seeded Admissions');
    }

    // 4. Seed Staff members if none
    const staffCount = await Staff.countDocuments();
    if (staffCount === 0) {
      console.log('Seeding initial Hospital Staff Directory...');
      await Staff.create([
        {
          employeeCode: 'EMP-1001',
          name: 'Sarah Connor',
          email: 'nurse.sarah@hospital.org',
          phone: '+1 (555) 010-0003',
          role: 'Nurse',
          department: depts[0]?._id,
          designation: 'Head Operating Nurse',
          salary: 4800,
          shift: 'Morning',
          status: 'Active',
          attendance: [{ date: new Date(), status: 'Present', checkIn: '08:00 AM', checkOut: '04:00 PM' }],
        },
        {
          employeeCode: 'EMP-1002',
          name: 'David Banner',
          email: 'lab.tech@hospital.org',
          phone: '+1 (555) 010-0005',
          role: 'Laboratory Staff',
          department: depts[1]?._id,
          designation: 'Senior Medical Laboratory Technologist',
          salary: 5200,
          shift: 'Morning',
          status: 'Active',
          attendance: [{ date: new Date(), status: 'Present', checkIn: '08:15 AM', checkOut: '04:15 PM' }],
        },
        {
          employeeCode: 'EMP-1003',
          name: 'Walter White',
          email: 'pharma.walter@hospital.org',
          phone: '+1 (555) 010-0006',
          role: 'Pharmacist',
          department: depts[0]?._id,
          designation: 'Chief Hospital Pharmacist',
          salary: 5600,
          shift: 'Evening',
          status: 'Active',
          attendance: [{ date: new Date(), status: 'Present', checkIn: '03:45 PM', checkOut: '11:45 PM' }],
        },
        {
          employeeCode: 'EMP-1004',
          name: 'Skyler White',
          email: 'billing.skyler@hospital.org',
          phone: '+1 (555) 010-0007',
          role: 'Accountant',
          department: depts[0]?._id,
          designation: 'Senior Healthcare Billing Accountant',
          salary: 4500,
          shift: 'Morning',
          status: 'Active',
          attendance: [{ date: new Date(), status: 'Present', checkIn: '08:45 AM', checkOut: '05:00 PM' }],
        },
      ]);
      console.log('✓ Seeded Staff Directory');
    }

    // 5. Seed initial Audit Logs if none
    const auditCount = await AuditLog.countDocuments();
    if (auditCount === 0) {
      console.log('Seeding initial Audit Logs...');
      await AuditLog.create([
        {
          user: adminUser?._id,
          userName: 'Super Administrator',
          userRole: 'Administrator',
          action: 'LOGIN',
          module: 'Auth',
          description: 'Administrator logged in from hospital secure gateway',
          ipAddress: '192.168.1.100',
        },
        {
          user: adminUser?._id,
          userName: 'Super Administrator',
          userRole: 'Administrator',
          action: 'CREATE',
          module: 'Billing',
          description: 'Issued Invoice #INV-2026-0001 for Patient Eleanor Vance',
          ipAddress: '192.168.1.100',
        },
      ]);
      console.log('✓ Seeded Audit Logs');
    }

    console.log('\n[Seed New Modules] ALL MODULES SEEDED WITH REAL DATA!');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedNewModules();
