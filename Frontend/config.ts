// Centralized API base URL for backend requests.
// Ustaw EXPO_PUBLIC_API_BASE w root .env (domyślnie http://HOSTNAME:8080).
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE;

// Stripe Configuration
// Get your publishable key from https://dashboard.stripe.com/test/apikeys
export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
