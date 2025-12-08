// Stripe configuration
// Set to null or empty string to disable Stripe
// Replace with your actual Stripe publishable key when ready
export const STRIPE_PUBLISHABLE_KEY = null; // Set to 'pk_test_YOUR_KEY' when ready

// Enable/disable Stripe integration
export const STRIPE_ENABLED = STRIPE_PUBLISHABLE_KEY !== null && STRIPE_PUBLISHABLE_KEY !== '';

// Stripe API endpoints
// For local testing: http://localhost:3000
// For mobile testing: Use ngrok URL or your local IP (see backend/README.md)
export const STRIPE_ENDPOINTS = {
  createPaymentIntent: 'http://localhost:3000/api/create-payment-intent',
  confirmPayment: 'http://localhost:3000/api/confirm-payment',
};

// Helper function to get the base URL (useful for switching between local and production)
export const getStripeBaseUrl = () => {
  // For production, you can check environment or use a config
  // return process.env.BACKEND_URL || 'http://localhost:3000';
  return 'http://localhost:3000'; // Change this for production
};


