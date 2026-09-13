import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import {
  PatientsPage,
  DoctorsPage,
  DepartmentsPage,
  AppointmentsPage,
  MedicalRecordsPage,
  LaboratoryPage,
  PharmacyPage,
  BillingPage,
  AdmissionsPage,
  StaffPage,
  ReportsPage,
  AuditLogsPage,
} from '../pages/modules';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Main Dashboard Application Shell */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        {/* Clinical & Patient Care Modules */}
        <Route path="patients" element={<PatientsPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="medical-records" element={<MedicalRecordsPage />} />
        <Route path="admissions" element={<AdmissionsPage />} />

        {/* Diagnostics & Pharmaceutical */}
        <Route path="laboratory" element={<LaboratoryPage />} />
        <Route path="pharmacy" element={<PharmacyPage />} />

        {/* Financial & Administration */}
        <Route path="billing" element={<BillingPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
