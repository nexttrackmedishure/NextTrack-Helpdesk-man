// API Configuration
// Switch between mock and real API services

import { apiService as mockApiService } from "./apiService";
import { realApiService } from "./realApiService";

// Configuration - Use import.meta.env for Vite instead of process.env
const USE_REAL_API = (import.meta as any).env?.VITE_USE_REAL_API === "true" || true; // Force real API for message persistence

// Export the appropriate service
export const apiService = USE_REAL_API ? realApiService : mockApiService;

// Helper function to check which service is being used
export const getApiServiceInfo = () => {
  return {
    type: USE_REAL_API ? "Real API" : "Mock API",
    description: USE_REAL_API
      ? "Connected to MongoDB via backend API"
      : "Using in-memory mock data",
    endpoint: USE_REAL_API
      ? "http://localhost:5000/api"
      : "Mock service (no HTTP calls)",
  };
};

// Log current configuration
console.log("🔧 API Service Configuration:", getApiServiceInfo());
