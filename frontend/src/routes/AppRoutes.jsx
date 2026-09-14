import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Interactive core pages
import { PatientsPage } from '../pages/patients/PatientsPage';
import { DoctorsPage } from '../pages/doctors/DoctorsPage';
import { DepartmentsPage } from '../pages/departments/DepartmentsPage';
import { AppointmentsPage } from '../pages/appointments/AppointmentsPage';
import { MedicalRecordsPage } from '../pages/records/MedicalRecordsPage';
import { PrescriptionsPage } from '../pages/prescriptions/PrescriptionsPage';

// Fully implemented HMS module pages
import { LaboratoryPage } from '../pages/laboratory/LaboratoryPage';
import { PharmacyPage } from '../pages/pharmacy/PharmacyPage';
import { BillingPage } from '../pages/billing/BillingPage';
import { AdmissionsPage } from '../pages/admissions/AdmissionsPage';
import { StaffPage } from '../pages/staff/StaffPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { AuditLogsPage } from '../pages/audit/AuditLogsPage';
import { UsersPage } from '../pages/admin/UsersPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Main Protected Application Shell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Clinical & Patient Care Modules */}
        <Route
          path="patients"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Laboratory Staff', 'Pharmacist', 'Accountant']}>
              <PatientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="doctors"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Doctor', 'Receptionist', 'Nurse']}>
              <DoctorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="departments"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Doctor', 'Receptionist']}>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="appointments"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Doctor', 'Nurse', 'Receptionist']}>
              <AppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="medical-records"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Doctor', 'Nurse', 'Laboratory Staff']}>
              <MedicalRecordsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="prescriptions"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Doctor', 'Nurse', 'Pharmacist']}>
              <PrescriptionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admissions"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Doctor', 'Nurse']}>
              <AdmissionsPage />
            </ProtectedRoute>
          }
        />

        {/* Diagnostics & Pharmaceutical */}
        <Route
          path="laboratory"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Laboratory Staff', 'Doctor', 'Nurse']}>
              <LaboratoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="pharmacy"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Pharmacist', 'Doctor']}>
              <PharmacyPage />
            </ProtectedRoute>
          }
        />

        {/* Financial & Administration */}
        <Route
          path="billing"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Accountant', 'Receptionist']}>
              <BillingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff"
          element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <StaffPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['Administrator', 'Accountant', 'Doctor', 'Pharmacist', 'Laboratory Staff', 'Receptionist']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit-logs"
          element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['Administrator']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
