/**
 * Hospital Management System Constants
 */

export const APP_NAME = 'CarePulse Hospital Management System';
export const APP_VERSION = '1.0.0';

export const USER_ROLES = {
  ADMINISTRATOR: 'Administrator',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  RECEPTIONIST: 'Receptionist',
  LAB_STAFF: 'Laboratory Staff',
  PHARMACIST: 'Pharmacist',
  ACCOUNTANT: 'Accountant',
};

export const API_ENDPOINTS = {
  HEALTH: '/health',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
};
