import React from 'react';
import {
  Users, Stethoscope, Building2, Calendar,
  FileText, FlaskConical, Pill, Receipt,
  Bed, UserPlus, BarChart3, ShieldCheck, CheckCircle2, Clock
} from 'lucide-react';
import { ModulePlaceholderPage } from '../ModulePlaceholderPage';

// 1. Patients Page
export const PatientsPage = () => (
  <ModulePlaceholderPage
    title="Patient Management"
    subtitle="Register, update, and search hospital outpatients and inpatients."
    icon={Users}
    entityName="Patient"
    metrics={[
      { label: 'Total Registered', value: '1,420', icon: Users, color: '#0284c7', bgColor: '#e0f2fe' },
      { label: 'New This Week', value: '84', icon: CheckCircle2, color: '#10b981', bgColor: '#d1fae5' },
      { label: 'Active Treatments', value: '142', icon: Clock, color: '#f59e0b', bgColor: '#fef3c7' },
    ]}
    columns={[
      { key: 'patientId', label: 'Patient ID', width: '130px' },
      { key: 'name', label: 'Full Name', render: (r) => <strong>{r.name}</strong> },
      { key: 'gender', label: 'Gender', width: '90px' },
      { key: 'age', label: 'Age', width: '80px' },
      { key: 'phone', label: 'Phone Number' },
      { key: 'bloodGroup', label: 'Blood Group', width: '110px', render: (r) => <span className="badge badge-primary">{r.bloodGroup}</span> },
      { key: 'registeredDate', label: 'Registered' },
    ]}
    sampleData={[
      { id: '1', patientId: 'PAT-2026-0001', name: 'James Wilson', gender: 'Male', age: 45, phone: '+1 555-0192', bloodGroup: 'O+', registeredDate: '2026-09-10' },
      { id: '2', patientId: 'PAT-2026-0002', name: 'Sophia Martinez', gender: 'Female', age: 32, phone: '+1 555-0144', bloodGroup: 'A+', registeredDate: '2026-09-11' },
      { id: '3', patientId: 'PAT-2026-0003', name: 'Liam Chen', gender: 'Male', age: 28, phone: '+1 555-0178', bloodGroup: 'B-', registeredDate: '2026-09-12' },
    ]}
    formFields={[
      { name: 'firstName', label: 'First Name', required: true },
      { name: 'lastName', label: 'Last Name', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }], required: true },
      { name: 'bloodGroup', label: 'Blood Group', type: 'select', options: [{ value: 'A+', label: 'A+' }, { value: 'B+', label: 'B+' }, { value: 'O+', label: 'O+' }, { value: 'AB+', label: 'AB+' }] },
      { name: 'phone', label: 'Contact Phone', required: true },
      { name: 'email', label: 'Email Address' },
    ]}
  />
);

// 2. Doctors Page
export const DoctorsPage = () => (
  <ModulePlaceholderPage
    title="Doctor Directory & Schedules"
    subtitle="Consultant profiles, clinical specialties, and weekly consultation rosters."
    icon={Stethoscope}
    entityName="Doctor"
    metrics={[
      { label: 'Active Specialists', value: '42', icon: Stethoscope, color: '#0284c7', bgColor: '#e0f2fe' },
      { label: 'On Duty Today', value: '28', icon: CheckCircle2, color: '#10b981', bgColor: '#d1fae5' },
      { label: 'On Leave', value: '4', icon: Clock, color: '#ef4444', bgColor: '#fee2e2' },
    ]}
    columns={[
      { key: 'docId', label: 'Doctor ID', width: '120px' },
      { key: 'name', label: 'Doctor Name', render: (r) => <strong>{r.name}</strong> },
      { key: 'specialty', label: 'Specialization' },
      { key: 'department', label: 'Department' },
      { key: 'fee', label: 'Consultation Fee' },
      { key: 'status', label: 'Status', render: (r) => <span className="badge badge-success">{r.status}</span> },
    ]}
    sampleData={[
      { id: '1', docId: 'DOC-101', name: 'Dr. Gregory House', specialty: 'Diagnostic Medicine', department: 'Internal Medicine', fee: '$120.00', status: 'Available' },
      { id: '2', docId: 'DOC-102', name: 'Dr. Meredith Grey', specialty: 'General Surgery', department: 'General Surgery', fee: '$100.00', status: 'Available' },
      { id: '3', docId: 'DOC-103', name: 'Dr. Derek Shepherd', specialty: 'Neurosurgery', department: 'Neurology', fee: '$150.00', status: 'In Surgery' },
    ]}
    formFields={[
      { name: 'name', label: 'Full Name (Dr.)', required: true },
      { name: 'specialty', label: 'Medical Specialty', required: true },
      { name: 'consultationFee', label: 'Consultation Fee ($)', type: 'number', required: true },
    ]}
  />
);

// 3. Departments Page
export const DepartmentsPage = () => (
  <ModulePlaceholderPage
    title="Department Management"
    subtitle="Clinical and operational medical units within the hospital."
    icon={Building2}
    entityName="Department"
    metrics={[
      { label: 'Total Departments', value: '14', icon: Building2, color: '#0284c7', bgColor: '#e0f2fe' },
      { label: 'Clinical Units', value: '10', icon: Stethoscope, color: '#6366f1', bgColor: '#e0e7ff' },
      { label: 'Operational Wards', value: '8', icon: Bed, color: '#10b981', bgColor: '#d1fae5' },
    ]}
    columns={[
      { key: 'code', label: 'Code', width: '100px' },
      { key: 'name', label: 'Department Name', render: (r) => <strong>{r.name}</strong> },
      { key: 'hod', label: 'Head of Department (HOD)' },
      { key: 'staffCount', label: 'Total Staff' },
      { key: 'status', label: 'Status', render: (r) => <span className="badge badge-success">{r.status}</span> },
    ]}
    sampleData={[
      { id: '1', code: 'CARD', name: 'Cardiology', hod: 'Dr. John Watson', staffCount: '18 Staff', status: 'Active' },
      { id: '2', code: 'PEDI', name: 'Pediatrics', hod: 'Dr. Lisa Cuddy', staffCount: '24 Staff', status: 'Active' },
      { id: '3', code: 'NEUR', name: 'Neurology', hod: 'Dr. Derek Shepherd', staffCount: '14 Staff', status: 'Active' },
    ]}
    formFields={[
      { name: 'code', label: 'Department Code (e.g. CARD)', required: true },
      { name: 'name', label: 'Department Name', required: true },
      { name: 'description', label: 'Description' },
    ]}
  />
);

// 4. Appointments Page
export const AppointmentsPage = () => (
  <ModulePlaceholderPage
    title="Appointment Scheduling"
    subtitle="Patient appointment booking, calendar slots, and queue status."
    icon={Calendar}
    entityName="Appointment"
    metrics={[
      { label: 'Scheduled Today', value: '38', icon: Calendar, color: '#0284c7', bgColor: '#e0f2fe' },
      { label: 'In Consultation', value: '6', icon: Stethoscope, color: '#10b981', bgColor: '#d1fae5' },
      { label: 'Completed', value: '24', icon: CheckCircle2, color: '#6366f1', bgColor: '#e0e7ff' },
    ]}
    columns={[
      { key: 'token', label: 'Token #', width: '90px' },
      { key: 'patient', label: 'Patient Name', render: (r) => <strong>{r.patient}</strong> },
      { key: 'doctor', label: 'Assigned Doctor' },
      { key: 'slot', label: 'Time Slot' },
      { key: 'reason', label: 'Visit Reason' },
      { key: 'status', label: 'Status', render: (r) => <span className="badge badge-primary">{r.status}</span> },
    ]}
    sampleData={[
      { id: '1', token: '#01', patient: 'Hannah Abbott', doctor: 'Dr. Gregory House', slot: '09:00 AM - 09:15 AM', reason: 'Routine Health Check', status: 'Completed' },
      { id: '2', token: '#02', patient: 'Marcus Flint', doctor: 'Dr. Meredith Grey', slot: '09:15 AM - 09:30 AM', reason: 'Abdominal Pain', status: 'In-Consultation' },
      { id: '3', token: '#03', patient: 'Susan Bones', doctor: 'Dr. Gregory House', slot: '09:30 AM - 09:45 AM', reason: 'Blood Pressure Review', status: 'Scheduled' },
    ]}
    formFields={[
      { name: 'patientName', label: 'Patient Name', required: true },
      { name: 'doctor', label: 'Doctor', type: 'select', options: [{ value: '1', label: 'Dr. Gregory House' }, { value: '2', label: 'Dr. Meredith Grey' }], required: true },
      { name: 'appointmentDate', label: 'Date', type: 'date', required: true },
      { name: 'reason', label: 'Reason for Consultation' },
    ]}
  />
);

// 5. Medical Records (EMR) Page
export const MedicalRecordsPage = () => (
  <ModulePlaceholderPage
    title="Electronic Medical Records (EMR)"
    subtitle="Patient clinical diagnoses, treatment histories, and clinical notes."
    icon={FileText}
    entityName="Medical Record"
    metrics={[
      { label: 'Consultations Logged', value: '3,812', icon: FileText, color: '#0284c7', bgColor: '#e0f2fe' },
      { label: 'Prescriptions Issued', value: '2,940', icon: Pill, color: '#10b981', bgColor: '#d1fae5' },
      { label: 'Lab Orders Linked', value: '850', icon: FlaskConical, color: '#f59e0b', bgColor: '#fef3c7' },
    ]}
    columns={[
      { key: 'recordId', label: 'Record ID', width: '130px' },
      { key: 'patient', label: 'Patient', render: (r) => <strong>{r.patient}</strong> },
      { key: 'doctor', label: 'Examining Doctor' },
      { key: 'diagnosis', label: 'Clinical Diagnosis' },
      { key: 'date', label: 'Visit Date' },
    ]}
    sampleData={[
      { id: '1', recordId: 'EMR-2026-0901', patient: 'James Wilson', doctor: 'Dr. Gregory House', diagnosis: 'Type 2 Diabetes Mellitus - Controlled', date: '2026-09-12' },
      { id: '2', recordId: 'EMR-2026-0902', patient: 'Sophia Martinez', doctor: 'Dr. Meredith Grey', diagnosis: 'Acute Bronchitis', date: '2026-09-12' },
    ]}
    formFields={[
      { name: 'patientId', label: 'Patient ID', required: true },
      { name: 'diagnosis', label: 'Primary Diagnosis', required: true },
      { name: 'notes', label: 'Clinical Examination Notes' },
    ]}
  />
);

// 6. Laboratory Page
export const LaboratoryPage = () => (
  <ModulePlaceholderPage
    title="Laboratory Management"
    subtitle="Pathology test orders, sample tracking, result entry, and reports."
    icon={FlaskConical}
    entityName="Lab Order"
    metrics={[
      { label: 'Pending Samples', value: '14', icon: FlaskConical, color: '#f59e0b', bgColor: '#fef3c7' },
      { label: 'Results Ready', value: '22', icon: CheckCircle2, color: '#10b981', bgColor: '#d1fae5' },
      { label: 'Tests in Catalog', value: '85', icon: FileText, color: '#0284c7', bgColor: '#e0f2fe' },
    ]}
    columns={[
      { key: 'orderId', label: 'Order #', width: '120px' },
      { key: 'patient', label: 'Patient Name', render: (r) => <strong>{r.patient}</strong> },
      { key: 'testName', label: 'Investigation' },
      { key: 'priority', label: 'Priority', render: (r) => <span className="badge badge-warning">{r.priority}</span> },
      { key: 'status', label: 'Status', render: (r) => <span className="badge badge-primary">{r.status}</span> },
    ]}
    sampleData={[
      { id: '1', orderId: 'LAB-881', patient: 'Arthur Pendelton', testName: 'Complete Blood Count (CBC)', priority: 'Urgent', status: 'Sample Collected' },
      { id: '2', orderId: 'LAB-882', patient: 'Clara Oswald', testName: 'Lipid Profile & Glucose', priority: 'Routine', status: 'Completed' },
    ]}
    formFields={[
      { name: 'patientId', label: 'Patient ID', required: true },
      { name: 'testCode', label: 'Investigation Test', type: 'select', options: [{ value: 'CBC', label: 'CBC - Blood Count' }, { value: 'LFT', label: 'LFT - Liver Function' }], required: true },
      { name: 'priority', label: 'Priority', type: 'select', options: [{ value: 'Routine', label: 'Routine' }, { value: 'Urgent', label: 'Urgent' }] },
    ]}
  />
);

// 7. Pharmacy Page
export const PharmacyPage = () => (
  <ModulePlaceholderPage
    title="Pharmacy & Drug Inventory"
    subtitle="Pharmaceutical stock tracking, prescription dispensing, and expiry monitoring."
    icon={Pill}
    entityName="Medicine"
    metrics={[
      { label: 'Medications in Stock', value: '342 Items', icon: Pill, color: '#0284c7', bgColor: '#e0f2fe' },
      { label: 'Low Stock Warnings', value: '3 Items', icon: Clock, color: '#ef4444', bgColor: '#fee2e2' },
      { label: 'Prescriptions Dispensed', value: '118 Today', icon: CheckCircle2, color: '#10b981', bgColor: '#d1fae5' },
    ]}
    columns={[
      { key: 'itemCode', label: 'Drug Code', width: '110px' },
      { key: 'name', label: 'Brand & Generic Name', render: (r) => <div><strong>{r.name}</strong><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.generic}</div></div> },
      { key: 'category', label: 'Category' },
      { key: 'stock', label: 'Current Stock' },
      { key: 'unitPrice', label: 'Unit Price' },
      { key: 'expiry', label: 'Expiry Date' },
    ]}
    sampleData={[
      { id: '1', itemCode: 'MED-001', name: 'Amoxil 500mg', generic: 'Amoxicillin', category: 'Antibiotic', stock: '450 Tabs', unitPrice: '$0.85', expiry: '2027-05-15' },
      { id: '2', itemCode: 'MED-002', name: 'Panadol 500mg', generic: 'Paracetamol', category: 'Analgesic', stock: '18 Tabs (Low)', unitPrice: '$0.25', expiry: '2026-11-20' },
    ]}
    formFields={[
      { name: 'brandName', label: 'Brand Name', required: true },
      { name: 'genericName', label: 'Generic Name', required: true },
      { name: 'category', label: 'Category', required: true },
      { name: 'stockQuantity', label: 'Quantity', type: 'number', required: true },
      { name: 'sellingPrice', label: 'Selling Price ($)', type: 'number', required: true },
      { name: 'expiryDate', label: 'Expiry Date', type: 'date', required: true },
    ]}
  />
);

// 8. Billing & Payments Page
export const BillingPage = () => (
  <ModulePlaceholderPage
    title="Billing & Invoicing"
    subtitle="Integrated patient billing for consultations, investigations, pharmacy, and bed stays."
    icon={Receipt}
    entityName="Invoice"
    metrics={[
      { label: 'Total Revenue (Month)', value: '$124,500', icon: Receipt, color: '#059669', bgColor: '#d1fae5' },
      { label: 'Invoices Generated', value: '412', icon: FileText, color: '#0284c7', bgColor: '#e0f2fe' },
      { label: 'Unpaid Dues', value: '$3,820', icon: Clock, color: '#ef4444', bgColor: '#fee2e2' },
    ]}
    columns={[
      { key: 'invoiceNumber', label: 'Invoice #', width: '130px' },
      { key: 'patient', label: 'Patient Name', render: (r) => <strong>{r.patient}</strong> },
      { key: 'total', label: 'Grand Total' },
      { key: 'paid', label: 'Amount Paid' },
      { key: 'status', label: 'Payment Status', render: (r) => <span className="badge badge-success">{r.status}</span> },
      { key: 'date', label: 'Invoice Date' },
    ]}
    sampleData={[
      { id: '1', invoiceNumber: 'INV-2026-0410', patient: 'Eleanor Vance', total: '$145.00', paid: '$145.00', status: 'Paid', date: '2026-09-13' },
      { id: '2', invoiceNumber: 'INV-2026-0411', patient: 'David Tennant', total: '$620.00', paid: '$200.00', status: 'Partially Paid', date: '2026-09-13' },
    ]}
    formFields={[
      { name: 'patientId', label: 'Patient ID', required: true },
      { name: 'consultationAmount', label: 'Consultation Fee ($)', type: 'number' },
      { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: [{ value: 'Cash', label: 'Cash' }, { value: 'Card', label: 'Credit/Debit Card' }, { value: 'Online', label: 'Online UPI' }] },
    ]}
  />
);

// 9. Admissions (Inpatient) Page
export const AdmissionsPage = () => (
  <ModulePlaceholderPage
    title="Inpatient & Bed Allocation (IPD)"
    subtitle="Hospital ward occupancy, inpatient admissions, bed tracking, and nurse vitals."
    icon={Bed}
    entityName="Admission"
    metrics={[
      { label: 'Total Hospital Beds', value: '80 Beds', icon: Bed, color: '#0284c7', bgColor: '#e0f2fe' },
      { label: 'Occupied Beds', value: '64 Beds (80%)', icon: Clock, color: '#ef4444', bgColor: '#fee2e2' },
      { label: 'Available Beds', value: '16 Free', icon: CheckCircle2, color: '#10b981', bgColor: '#d1fae5' },
    ]}
    columns={[
      { key: 'admId', label: 'Admission #', width: '130px' },
      { key: 'patient', label: 'Patient Name', render: (r) => <strong>{r.patient}</strong> },
      { key: 'ward', label: 'Ward / Unit' },
      { key: 'bed', label: 'Bed No.', width: '90px' },
      { key: 'admittedDate', label: 'Admission Date' },
      { key: 'status', label: 'Status', render: (r) => <span className="badge badge-primary">{r.status}</span> },
    ]}
    sampleData={[
      { id: '1', admId: 'ADM-2026-0081', patient: 'David Tennant', ward: 'General Medical - Ward B', bed: 'B-12', admittedDate: '2026-09-10', status: 'Admitted' },
      { id: '2', admId: 'ADM-2026-0082', patient: 'Rose Tyler', ward: 'Intensive Care Unit (ICU)', bed: 'ICU-04', admittedDate: '2026-09-12', status: 'Admitted' },
    ]}
    formFields={[
      { name: 'patientId', label: 'Patient ID', required: true },
      { name: 'ward', label: 'Ward Type', type: 'select', options: [{ value: 'General', label: 'General Ward' }, { value: 'ICU', label: 'Intensive Care Unit' }, { value: 'Private', label: 'Private Room' }], required: true },
      { name: 'reason', label: 'Reason for Admission', required: true },
    ]}
  />
);

// 10. Staff Management Page
export const StaffPage = () => (
  <ModulePlaceholderPage
    title="Staff & Human Resources"
    subtitle="Employee profiles, clinical assignments, attendance check-ins, and leave requests."
    icon={UserPlus}
    entityName="Staff Member"
    metrics={[
      { label: 'Total Employees', value: '164', icon: UserPlus, color: '#0284c7', bgColor: '#e0f2fe' },
      { label: 'Present Today', value: '152', icon: CheckCircle2, color: '#10b981', bgColor: '#d1fae5' },
      { label: 'On Leave', value: '12', icon: Clock, color: '#f59e0b', bgColor: '#fef3c7' },
    ]}
    columns={[
      { key: 'code', label: 'Staff Code', width: '120px' },
      { key: 'name', label: 'Employee Name', render: (r) => <strong>{r.name}</strong> },
      { key: 'role', label: 'Role / Designation' },
      { key: 'dept', label: 'Department' },
      { key: 'phone', label: 'Contact' },
      { key: 'status', label: 'Status', render: (r) => <span className="badge badge-success">{r.status}</span> },
    ]}
    sampleData={[
      { id: '1', code: 'EMP-1001', name: 'Sarah Connor', role: 'Head Nurse', dept: 'ICU', phone: '+1 555-4421', status: 'Active' },
      { id: '2', code: 'EMP-1002', name: 'John Matrix', role: 'Senior Pharmacist', dept: 'Pharmacy', phone: '+1 555-8833', status: 'Active' },
    ]}
    formFields={[
      { name: 'name', label: 'Full Name', required: true },
      { name: 'role', label: 'Role', type: 'select', options: [{ value: 'Nurse', label: 'Nurse' }, { value: 'Receptionist', label: 'Receptionist' }, { value: 'Pharmacist', label: 'Pharmacist' }, { value: 'Lab Staff', label: 'Lab Staff' }], required: true },
      { name: 'phone', label: 'Phone', required: true },
    ]}
  />
);

// 11. Reports & Analytics Page
export const ReportsPage = () => (
  <ModulePlaceholderPage
    title="Reports & Analytics Hub"
    subtitle="Interactive healthcare KPIs, department workload trends, and financial reports."
    icon={BarChart3}
    entityName="Report Configuration"
    metrics={[
      { label: 'Monthly Inpatients', value: '248', icon: Bed, color: '#0284c7', bgColor: '#e0f2fe' },
      { label: 'Lab Utilization', value: '94%', icon: FlaskConical, color: '#10b981', bgColor: '#d1fae5' },
      { label: 'Pharmacy Sales', value: '$48,200', icon: Pill, color: '#6366f1', bgColor: '#e0e7ff' },
    ]}
    columns={[
      { key: 'reportName', label: 'Report Name', render: (r) => <strong>{r.reportName}</strong> },
      { key: 'category', label: 'Category' },
      { key: 'period', label: 'Frequency' },
      { key: 'lastRun', label: 'Last Generated' },
    ]}
    sampleData={[
      { id: '1', reportName: 'Monthly Financial & Revenue Summary', category: 'Finance', period: 'Monthly', lastRun: '2026-09-01' },
      { id: '2', reportName: 'Department Bed Occupancy Ratio', category: 'Operations', period: 'Daily', lastRun: '2026-09-13' },
      { id: '3', reportName: 'Pharmacy Expiry Risk Assessment', category: 'Inventory', period: 'Weekly', lastRun: '2026-09-10' },
    ]}
    formFields={[
      { name: 'reportName', label: 'Report Name', required: true },
      { name: 'category', label: 'Report Domain', type: 'select', options: [{ value: 'Finance', label: 'Finance' }, { value: 'Clinical', label: 'Clinical' }, { value: 'Pharmacy', label: 'Pharmacy' }] },
    ]}
  />
);

// 12. Audit Logs Page
export const AuditLogsPage = () => (
  <ModulePlaceholderPage
    title="System Audit Trail & Security Logs"
    subtitle="Tamper-evident chronological logs of clinical actions, logins, and billing modifications."
    icon={ShieldCheck}
    entityName="Audit Filter"
    metrics={[
      { label: 'Events Logged (Today)', value: '1,842', icon: ShieldCheck, color: '#0284c7', bgColor: '#e0f2fe' },
      { label: 'Security Alerts', value: '0 Warnings', icon: CheckCircle2, color: '#10b981', bgColor: '#d1fae5' },
      { label: 'Active Sessions', value: '18 Users', icon: Users, color: '#6366f1', bgColor: '#e0e7ff' },
    ]}
    columns={[
      { key: 'timestamp', label: 'Timestamp', width: '180px' },
      { key: 'user', label: 'Actor / User', render: (r) => <strong>{r.user}</strong> },
      { key: 'action', label: 'Action Performed' },
      { key: 'module', label: 'Target Module' },
      { key: 'ip', label: 'Client IP' },
      { key: 'status', label: 'Result', render: (r) => <span className="badge badge-success">{r.status}</span> },
    ]}
    sampleData={[
      { id: '1', timestamp: '2026-09-13 23:25:10', user: 'admin@hospital.org', action: 'USER_LOGIN_SUCCESS', module: 'Authentication', ip: '127.0.0.1', status: 'SUCCESS' },
      { id: '2', timestamp: '2026-09-13 23:20:45', user: 'dr.smith@hospital.org', action: 'CREATE_PRESCRIPTION', module: 'EMR / Pharmacy', ip: '192.168.1.45', status: 'SUCCESS' },
      { id: '3', timestamp: '2026-09-13 23:15:02', user: 'reception@hospital.org', action: 'BOOK_APPOINTMENT', module: 'Appointments', ip: '192.168.1.20', status: 'SUCCESS' },
    ]}
    formFields={[
      { name: 'dateRange', label: 'Log Date Filter', type: 'date' },
      { name: 'actionType', label: 'Action Event Filter' },
    ]}
  />
);
