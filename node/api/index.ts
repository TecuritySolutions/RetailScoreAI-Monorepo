import { buildApp } from '../src/app.js';

// Build and export the app for Vercel
// Vercel will handle the serverless wrapping
export default await buildApp();
