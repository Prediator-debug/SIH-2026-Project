/**
 * Application Configuration & Environment Variables
 * Single source of truth for client and server runtime configurations.
 */

export const config = {
  // Backend API Base URL (Server-side: BACKEND_API_URL, Client-side: NEXT_PUBLIC_BACKEND_API_URL)
  backendApiUrl: 
    process.env.BACKEND_API_URL || 
    process.env.NEXT_PUBLIC_BACKEND_API_URL || 
    (process.env.NODE_ENV === 'production' ? 'https://sih-2026-project-bpsy.onrender.com' : 'http://127.0.0.1:8000'),

  // Gemini AI Key
  geminiApiKey: process.env.GEMINI_API_KEY || '',

  // Firebase Web Client Config
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  },

  // Environment checks
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;

export default config;
