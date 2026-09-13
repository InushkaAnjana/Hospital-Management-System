import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Health API Service
 */
export const fetchSystemHealth = async () => {
  const response = await api.get(API_ENDPOINTS.HEALTH);
  return response.data;
};
