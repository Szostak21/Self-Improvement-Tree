# Stripe Payment Integration

This module provides complete Stripe payment integration for your React Native + Expo app with Spring Boot backend.

## Features

- ✅ Stripe Checkout Session creation
- ✅ **In-app payment modal** (WebView-based for seamless UX)
- ✅ Deep linking for success/cancel handling
- ✅ Environment-based configuration
- ✅ Test mode support
- ✅ Modular and reusable components
- ✅ Ready-to-use PaymentButton component
- ✅ Integrated into ShopScreen with gem purchases
- ✅ Ready-to-use PaymentButton component
- ✅ Integrated into ShopScreen with gem purchases

## Backend Setup (Spring Boot)

### 1. Dependencies

The Stripe Java SDK is already added to your `pom.xml`:

```xml
<dependency>
    <groupId>com.stripe</groupId>
    <artifactId>stripe-java</artifactId>
    <version>24.16.0</version>
</dependency>
```

### 2. Environment Variables

Update your `run-backend.sh` script with your Stripe keys:

```bash
# Stripe configuration
export STRIPE_SECRET_KEY="sk_test_YOUR_ACTUAL_SECRET_KEY"
export STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY"
```

### 3. Get Stripe Test Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or log in
3. In the left sidebar, click "Developers" → "API keys"
4. Copy your **Test** keys (they start with `sk_test_` and `pk_test_`)

### 4. API Endpoints

- `POST /api/payment/create-checkout-session` - Creates Stripe Checkout Session
- `GET /api/payment/config` - Returns publishable key

## Frontend Setup (React Native + Expo)

### 1. Dependencies

The following packages are already added to your `package.json`:

```json
"@stripe/stripe-react-native": "^0.39.0",
"expo-linking": "~7.1.2",
"expo-web-browser": "~14.1.1",
"react-native-webview": "13.8.6"
```

### 2. Install Dependencies

```bash
cd Frontend
npm install
```

### 3. Deep Linking Configuration

Your `app.json` is already configured with:
- `scheme: "myapp"` for deep linking
- This handles `myapp://success` and `myapp://cancel` URLs

### 4. Using the Payment Components

#### Basic Usage in ShopScreen.tsx:

The ShopScreen already includes working PaymentButton components for gem purchases:

```typescript
<PaymentButton
  productName="20 Gems Pack"
  priceInCents={99} // $0.99
  quantity={1}
  onSuccess={() => {
    // Add gems to user data
    setUserData((prev: any) => ({
      ...prev,
      gems: (prev.gems || 0) + 20,
    }));
    Alert.alert('Success!', 'You received 20 gems!');
  }}
  onCancel={() => {
    console.log('Payment cancelled');
  }}
  buttonText="Buy 20 Gems - $0.99"
/>
```

**New: In-App Payment Experience**
- Click payment button → Modal opens within the app
- Complete payment in the embedded WebView
- No external browser needed!
- Seamless user experience

#### Using the Hook Directly:

```typescript
import { useStripePayment } from '../hooks/useStripePayment';

export default function CustomPaymentScreen() {
  const { createPayment, isLoading } = useStripePayment();

  const handleCustomPayment = async () => {
    const result = await createPayment({
      productName: "Custom Product",
      priceInCents: 1999, // $19.99
      quantity: 2,
      successUrl: "myapp://success",
      cancelUrl: "myapp://cancel"
    });

    if (result) {
      console.log('Payment successful:', result);
    }
  };

  return (
    <TouchableOpacity onPress={handleCustomPayment} disabled={isLoading}>
      <Text>{isLoading ? 'Processing...' : 'Pay Now'}</Text>
    </TouchableOpacity>
  );
}
```

#### Using the Hook Directly:

```typescript
import { useStripePayment } from '../hooks/useStripePayment';

export default function CustomPaymentScreen() {
  const { createPayment, isLoading } = useStripePayment();

  const handleCustomPayment = async () => {
    const result = await createPayment({
      productName: "Custom Product",
      priceInCents: 1999, // $19.99
      quantity: 2,
      successUrl: "myapp://success",
      cancelUrl: "myapp://cancel"
    });

    if (result) {
      console.log('Payment successful:', result);
    }
  };

  return (
    <TouchableOpacity onPress={handleCustomPayment} disabled={isLoading}>
      <Text>{isLoading ? 'Processing...' : 'Pay Now'}</Text>
    </TouchableOpacity>
  );
}
```

## Testing

### 1. Update Environment Variables

Edit `run-backend.sh` and replace the placeholder values with your actual Stripe test keys:

```bash
# Stripe configuration
export STRIPE_SECRET_KEY="sk_test_..."
export STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 2. Start Backend

```bash
./run-backend.sh
```

### 3. Start Frontend

```bash
cd Frontend
npm start
```

### 4. Test Payments

1. Open your app and go to the Shop screen
2. Look for the "20 Gems" and "100 Gems" items in the Gems section
3. Click "Buy" on either item
4. **Payment modal opens within the app** (no external browser!)
5. Use these test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - Any future expiry date and any CVC

6. After payment, the modal closes and you'll see a success message
7. If successful, you'll receive the gems instantly!

## Production Deployment

### 1. Switch to Live Keys

Replace test keys with live keys in `run-backend.sh`:

```bash
export STRIPE_SECRET_KEY="sk_live_YOUR_LIVE_SECRET_KEY"
export STRIPE_PUBLISHABLE_KEY="pk_live_YOUR_LIVE_PUBLISHABLE_KEY"
```

### 2. Update Success/Cancel URLs

For production, update the success and cancel URLs to your actual domain:

```typescript
const result = await createPayment({
  productName: "Product Name",
  priceInCents: 999,
  quantity: 1,
  successUrl: "https://yourdomain.com/success",
  cancelUrl: "https://yourdomain.com/cancel"
});
```

### 3. Webhook Setup (Optional)

For production, set up Stripe webhooks to handle payment confirmations server-side.

## Implementation Status

✅ **Backend (Spring Boot)**
- PaymentController with `/api/payment/create-checkout-session` endpoint
- PaymentService with Stripe Checkout Session creation
- Environment variable configuration for Stripe keys
- Proper error handling and logging

✅ **Frontend (React Native + Expo)**
- StripeService for API communication
- useStripePayment hook for payment logic
- PaymentButton reusable component
- Web-based checkout flow using expo-web-browser
- Deep linking support for success/cancel handling
- Integrated into ShopScreen for gem purchases

✅ **Configuration**
- Updated pom.xml with Stripe Java SDK
- Updated package.json with Stripe React Native packages
- Updated app.json with deep linking scheme
- Updated run-backend.sh with Stripe environment variables

✅ **Ready to Use**
- Two working payment buttons in ShopScreen (20 Gems $0.99, 100 Gems $1.99)
- Automatic gem crediting on successful payment
- Test-ready with Stripe test keys
- Easy switch to production with live keys

## Troubleshooting

### Common Issues:

1. **"Cannot find module 'expo-web-browser'"**
   - Run `npm install` in the Frontend directory

2. **"Invalid API Key" error**
   - Check that your Stripe keys are correctly set in `run-backend.sh`
   - Ensure you're using test keys for testing

3. **Deep linking not working**
   - Make sure your app.json has `"scheme": "myapp"`
   - Test with `myapp://success` URLs

4. **Payment not processing**
   - Check backend logs for Stripe API errors
   - Verify your Stripe account is in test mode
   - Use test card numbers for testing

### Debug Mode:

Add console logs to see what's happening:

```typescript
const result = await createPayment({
  productName: "Test Product",
  priceInCents: 100,
  quantity: 1
});

console.log('Payment result:', result);
```

## Security Notes

- Never commit real Stripe keys to version control
- Use environment variables for all sensitive data
- Validate payment amounts server-side before creating sessions
- Implement proper webhook verification for production