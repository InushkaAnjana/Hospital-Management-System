const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB } = require('../config/db');
const {
  User,
  Department,
  Doctor,
  Patient,
  Appointment,
  MedicalRecord,
  Medicine,
  Prescription,
} = require('../models');

const seedData = async () => {
  try {
    console.log('[Seeder] Connecting to MongoDB Atlas...');
    await connectDB();

    console.log('[Seeder] Clearing previous collections...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Appointment.deleteMany({}),
      MedicalRecord.deleteMany({}),
      Medicine.deleteMany({}),
      Prescription.deleteMany({}),
    ]);

    console.log('[Seeder] 1. Seeding Hospital Departments...');
    const departments = await Department.create([
      {
        name: 'Cardiology',
        code: 'CARD',
        description: 'Comprehensive adult cardiovascular evaluation, ECG, and intervention.',
        headOfDepartment: 'Dr. Gregory House',
        status: 'Active',
      },
      {
        name: 'General Surgery',
        code: 'SURG',
        description: 'Operative care, trauma, and elective surgical procedures.',
        headOfDepartment: 'Dr. Meredith Grey',
        status: 'Active',
      },
      {
        name: 'Neurology',
        code: 'NEUR',
        description: 'Disorders of the brain, spinal cord, and peripheral nervous system.',
        headOfDepartment: 'Dr. Derek Shepherd',
        status: 'Active',
      },
      {
        name: 'Pediatrics',
        code: 'PEDI',
        description: 'Infant, child, and adolescent specialized clinical care.',
        headOfDepartment: 'Dr. Lisa Cuddy',
        status: 'Active',
      },
      {
        name: 'Orthopedics',
        code: 'ORTH',
        description: 'Musculoskeletal injuries, joints, and spine treatment.',
        headOfDepartment: 'Dr. Callie Torres',
        status: 'Active',
      },
    ]);

    const deptMap = {};
    departments.forEach((d) => (deptMap[d.code] = d._id));

    console.log('[Seeder] 2. Seeding Users for all 7 Hospital Roles (Password: Admin@12345)...');
    const defaultPassword = 'Admin@12345';

    const users = await User.create([
      {
        name: 'Super Administrator',
        email: 'admin@hospital.org',
        password: defaultPassword,
        role: 'Administrator',
        phone: '+1 (555) 010-0001',
      },
      {
        name: 'Dr. Gregory House',
        email: 'dr.smith@hospital.org',
        password: defaultPassword,
        role: 'Doctor',
        department: deptMap['CARD'],
        phone: '+1 (555) 010-0002',
      },
      {
        name: 'Nurse Sarah Connor',
        email: 'nurse.sarah@hospital.org',
        password: defaultPassword,
        role: 'Nurse',
        phone: '+1 (555) 010-0003',
      },
      {
        name: 'Emily Watson (Reception)',
        email: 'reception@hospital.org',
        password: defaultPassword,
        role: 'Receptionist',
        phone: '+1 (555) 010-0004',
      },
      {
        name: 'Dr. Alex Vance (Lab)',
        email: 'lab.tech@hospital.org',
        password: defaultPassword,
        role: 'Laboratory Staff',
        phone: '+1 (555) 010-0005',
      },
      {
        name: 'Marcus Brody (Pharmacy)',
        email: 'pharmacy@hospital.org',
        password: defaultPassword,
        role: 'Pharmacist',
        phone: '+1 (555) 010-0006',
      },
      {
        name: 'Arthur Pendelton (Billing)',
        email: 'billing@hospital.org',
        password: defaultPassword,
        role: 'Accountant',
        phone: '+1 (555) 010-0007',
      },
    ]);

    console.log('[Seeder] 3. Seeding Doctors with weekly rosters...');
    const doctors = await Doctor.create([
      {
        doctorCode: 'DOC-101',
        name: 'Dr. Gregory House',
        user: users[1]._id,
        specialization: 'Cardiology & Diagnostic Medicine',
        department: deptMap['CARD'],
        qualifications: 'MD, FACC, Board Certified',
        experienceYears: 18,
        consultationFee: 120,
        phone: '+1 (555) 010-0002',
        email: 'dr.smith@hospital.org',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: [
          { startTime: '09:00 AM - 09:30 AM', endTime: '09:30 AM', maxPatients: 1 },
          { startTime: '09:30 AM - 10:00 AM', endTime: '10:00 AM', maxPatients: 1 },
          { startTime: '10:00 AM - 10:30 AM', endTime: '10:30 AM', maxPatients: 1 },
          { startTime: '10:30 AM - 11:00 AM', endTime: '11:00 AM', maxPatients: 1 },
          { startTime: '02:00 PM - 02:30 PM', endTime: '02:30 PM', maxPatients: 1 },
          { startTime: '02:30 PM - 03:00 PM', endTime: '03:00 PM', maxPatients: 1 },
        ],
        status: 'Available',
      },
      {
        doctorCode: 'DOC-102',
        name: 'Dr. Meredith Grey',
        specialization: 'General & Trauma Surgery',
        department: deptMap['SURG'],
        qualifications: 'MD, FACS',
        experienceYears: 12,
        consultationFee: 100,
        phone: '+1 (555) 010-0012',
        email: 'dr.grey@hospital.org',
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        timeSlots: [
          { startTime: '09:00 AM - 09:30 AM', endTime: '09:30 AM', maxPatients: 1 },
          { startTime: '09:30 AM - 10:00 AM', endTime: '10:00 AM', maxPatients: 1 },
          { startTime: '10:00 AM - 10:30 AM', endTime: '10:30 AM', maxPatients: 1 },
        ],
        status: 'Available',
      },
      {
        doctorCode: 'DOC-103',
        name: 'Dr. Derek Shepherd',
        specialization: 'Neurosurgery & Spine',
        department: deptMap['NEUR'],
        qualifications: 'MD, PhD, FAANS',
        experienceYears: 16,
        consultationFee: 150,
        phone: '+1 (555) 010-0013',
        email: 'dr.shepherd@hospital.org',
        availableDays: ['Tuesday', 'Thursday', 'Saturday'],
        timeSlots: [
          { startTime: '10:00 AM - 10:30 AM', endTime: '10:30 AM', maxPatients: 1 },
          { startTime: '10:30 AM - 11:00 AM', endTime: '11:00 AM', maxPatients: 1 },
          { startTime: '02:00 PM - 02:30 PM', endTime: '02:30 PM', maxPatients: 1 },
        ],
        status: 'Available',
      },
      {
        doctorCode: 'DOC-104',
        name: 'Dr. Lisa Cuddy',
        specialization: 'Pediatric Medicine',
        department: deptMap['PEDI'],
        qualifications: 'MD, FAAP',
        experienceYears: 15,
        consultationFee: 90,
        phone: '+1 (555) 010-0014',
        email: 'dr.cuddy@hospital.org',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        timeSlots: [
          { startTime: '09:00 AM - 09:30 AM', endTime: '09:30 AM', maxPatients: 1 },
          { startTime: '09:30 AM - 10:00 AM', endTime: '10:00 AM', maxPatients: 1 },
        ],
        status: 'Available',
      },
    ]);

    console.log('[Seeder] 4. Seeding Registered Patients...');
    const patients = await Patient.create([
      {
        patientId: 'PAT-2026-0001',
        firstName: 'James',
        lastName: 'Wilson',
        age: 45,
        gender: 'Male',
        bloodGroup: 'O+',
        phone: '+1 (555) 234-5678',
        email: 'james.wilson@email.com',
        address: {
          street: '742 Evergreen Terrace',
          city: 'Metropolis',
          state: 'NY',
          postalCode: '10001',
        },
        emergencyContact: {
          name: 'Sarah Wilson',
          relationship: 'Spouse',
          phone: '+1 (555) 234-5679',
        },
        medicalHistory: {
          chronicConditions: ['Type 2 Diabetes', 'Mild Hypertension'],
          allergies: ['Penicillin', 'Sulfa Drugs'],
          pastSurgeries: ['Appendectomy (2018)'],
          notes: 'Patient maintains healthy diet and logs blood glucose daily.',
        },
        status: 'Active',
      },
      {
        patientId: 'PAT-2026-0002',
        firstName: 'Sophia',
        lastName: 'Martinez',
        age: 32,
        gender: 'Female',
        bloodGroup: 'A+',
        phone: '+1 (555) 345-6789',
        email: 'sophia.m@email.com',
        address: {
          street: '124 Conch Street',
          city: 'Brooklyn',
          state: 'NY',
          postalCode: '11201',
        },
        emergencyContact: {
          name: 'Carlos Martinez',
          relationship: 'Brother',
          phone: '+1 (555) 345-6780',
        },
        medicalHistory: {
          chronicConditions: ['Asthma'],
          allergies: ['Aspirin', 'Dust Mites'],
          pastSurgeries: [],
          notes: 'Uses rescue inhaler as needed.',
        },
        status: 'Active',
      },
      {
        patientId: 'PAT-2026-0003',
        firstName: 'Liam',
        lastName: 'Chen',
        age: 28,
        gender: 'Male',
        bloodGroup: 'B-',
        phone: '+1 (555) 456-7890',
        email: 'liam.chen@email.com',
        address: {
          street: '456 Elm Street',
          city: 'Queens',
          state: 'NY',
          postalCode: '11355',
        },
        emergencyContact: {
          name: 'Mei Chen',
          relationship: 'Mother',
          phone: '+1 (555) 456-7891',
        },
        medicalHistory: {
          chronicConditions: [],
          allergies: [],
          pastSurgeries: ['Wisdom tooth extraction (2022)'],
          notes: 'No significant past illness.',
        },
        status: 'Active',
      },
      {
        patientId: 'PAT-2026-0004',
        firstName: 'Eleanor',
        lastName: 'Vance',
        age: 62,
        gender: 'Female',
        bloodGroup: 'AB+',
        phone: '+1 (555) 567-8901',
        email: 'eleanor.v@email.com',
        address: {
          street: '88 Riverview Rd',
          city: 'Albany',
          state: 'NY',
          postalCode: '12203',
        },
        emergencyContact: {
          name: 'Robert Vance',
          relationship: 'Husband',
          phone: '+1 (555) 567-8902',
        },
        medicalHistory: {
          chronicConditions: ['Osteoarthritis', 'Hyperlipidemia'],
          allergies: ['Codeine'],
          pastSurgeries: ['Right Knee Arthroscopy (2020)'],
          notes: 'Under routine statin management.',
        },
        status: 'Active',
      },
    ]);

    console.log('[Seeder] 5. Seeding Pharmacy Inventory / Medicines...');
    const medicines = await Medicine.create([
      {
        itemCode: 'MED-001',
        name: 'Amoxil 500mg',
        genericName: 'Amoxicillin Trihydrate',
        category: 'Antibiotic',
        form: 'Capsule',
        strength: '500mg',
        unitPrice: 0.85,
        stockQuantity: 450,
        reorderLevel: 50,
        expiryDate: new Date('2028-05-15'),
        manufacturer: 'GSK Pharmaceuticals',
      },
      {
        itemCode: 'MED-002',
        name: 'Panadol Extra',
        genericName: 'Paracetamol + Caffeine',
        category: 'Analgesic',
        form: 'Tablet',
        strength: '500mg/65mg',
        unitPrice: 0.25,
        stockQuantity: 18, // Low stock on purpose
        reorderLevel: 30,
        expiryDate: new Date('2027-11-20'),
        manufacturer: 'Haleon Healthcare',
      },
      {
        itemCode: 'MED-003',
        name: 'Lipitor 20mg',
        genericName: 'Atorvastatin Calcium',
        category: 'Cardiovascular',
        form: 'Tablet',
        strength: '20mg',
        unitPrice: 1.2,
        stockQuantity: 280,
        reorderLevel: 40,
        expiryDate: new Date('2028-02-10'),
        manufacturer: 'Pfizer Inc.',
      },
      {
        itemCode: 'MED-004',
        name: 'Glucophage 850mg',
        genericName: 'Metformin Hydrochloride',
        category: 'Antidiabetic',
        form: 'Tablet',
        strength: '850mg',
        unitPrice: 0.45,
        stockQuantity: 320,
        reorderLevel: 45,
        expiryDate: new Date('2027-09-30'),
        manufacturer: 'Merck Healthcare',
      },
      {
        itemCode: 'MED-005',
        name: 'Ventolin Inhaler',
        genericName: 'Albuterol Sulfate',
        category: 'Respiratory',
        form: 'Inhaler',
        strength: '100mcg/actuation',
        unitPrice: 14.5,
        stockQuantity: 75,
        reorderLevel: 15,
        expiryDate: new Date('2027-12-31'),
        manufacturer: 'GSK Respiratory',
      },
    ]);

    console.log('[Seeder] 6. Seeding Clinical Appointments...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Appointment.create([
      {
        appointmentNumber: 'APT-2026-0001',
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        department: deptMap['CARD'],
        appointmentDate: today,
        timeSlot: '09:00 AM - 09:30 AM',
        tokenNumber: 1,
        reason: 'Quarterly Cardiovascular Follow-up',
        status: 'Completed',
        notes: 'Blood pressure within normal target.',
      },
      {
        appointmentNumber: 'APT-2026-0002',
        patient: patients[1]._id,
        doctor: doctors[0]._id,
        department: deptMap['CARD'],
        appointmentDate: today,
        timeSlot: '09:30 AM - 10:00 AM',
        tokenNumber: 2,
        reason: 'Palpitations & Shortness of Breath',
        status: 'In-Consultation',
        notes: 'Performing ECG review.',
      },
      {
        appointmentNumber: 'APT-2026-0003',
        patient: patients[2]._id,
        doctor: doctors[1]._id,
        department: deptMap['SURG'],
        appointmentDate: today,
        timeSlot: '10:00 AM - 10:30 AM',
        tokenNumber: 1,
        reason: 'Abdominal Wall Evaluation',
        status: 'Scheduled',
        notes: 'Pre-op assessment.',
      },
    ]);

    console.log('[Seeder] 7. Seeding Electronic Medical Records (EMR)...');
    await MedicalRecord.create([
      {
        recordId: 'EMR-2026-0001',
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        appointment: appointments[0]._id,
        diagnosis: 'Type 2 Diabetes Mellitus - Well Controlled',
        symptoms: ['Mild fatigue after meals', 'Occasional dry mouth'],
        clinicalNotes:
          'Patient adhering to Metformin regimen. HbA1c is 6.4%. Cardiac auscultation normal with regular rhythm. No peripheral edema noted.',
        vitalSigns: {
          bloodPressure: '122/78 mmHg',
          pulseRate: 72,
          temperature: 98.4,
          respiratoryRate: 16,
          weight: 78.5,
          height: 178,
          oxygenSaturation: 99,
        },
        treatmentHistory: [
          {
            date: new Date('2026-06-10'),
            treatment: 'Routine lipid panel and fasting glucose screening',
            doctorNotes: 'Target LDL reached.',
          },
          {
            date: today,
            treatment: 'Continue Metformin 850mg twice daily with meals',
            doctorNotes: 'Re-evaluate in 3 months.',
          },
        ],
        reports: [
          {
            title: '12-Lead Electrocardiogram (ECG)',
            reportType: 'ECG / Echo',
            fileUrl: 'https://carepulse.hospital.org/reports/ecg_pat001.pdf',
            summary: 'Normal sinus rhythm, normal axis, no ischemic ST changes.',
            date: today,
          },
        ],
      },
    ]);

    console.log('[Seeder] 8. Seeding Prescriptions...');
    await Prescription.create([
      {
        prescriptionNumber: 'RX-2026-0001',
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        appointment: appointments[0]._id,
        diagnosis: 'Type 2 Diabetes Mellitus & Lipid Management',
        medicines: [
          {
            medicine: medicines[3]._id,
            medicineName: 'Glucophage 850mg',
            genericName: 'Metformin Hydrochloride',
            dosage: '1 Tablet',
            frequency: 'Twice daily with meals (BID)',
            duration: '90 Days',
            quantity: 180,
            instructions: 'Take immediately after breakfast and dinner',
          },
          {
            medicine: medicines[2]._id,
            medicineName: 'Lipitor 20mg',
            genericName: 'Atorvastatin Calcium',
            dosage: '1 Tablet',
            frequency: 'Once daily at bedtime (QHS)',
            duration: '90 Days',
            quantity: 90,
            instructions: 'Take at night before sleep',
          },
        ],
        notes: 'Refill approved for 3 months. Next clinical visit in December.',
        status: 'Active',
      },
    ]);

    console.log('======================================================');
    console.log('✅ CarePulse HMS Database Seeding Completed Successfully!');
    console.log('======================================================');
    console.log('Test Accounts Provisioned:');
    users.forEach((u) => {
      console.log(`- ${u.role.padEnd(18)} : ${u.email} (Password: ${defaultPassword})`);
    });
    console.log('======================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error] Failed to seed database:', error);
    await disconnectDB();
    process.exit(1);
  }
};

seedData();
