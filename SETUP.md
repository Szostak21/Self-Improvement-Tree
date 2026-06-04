# Self-Improvement Tree - Setup Guide 🚀

Quick guide to get the app running from scratch.

---

## Prerequisites

- **Node.js** (LTS version)
- **Java 17+** (JDK)
- **Git**
- **Gmail account** (for email verification features)
- **Stripe account** (for payment features - optional for testing)

---

## Quick Start (3 steps)

### Option A: Automated Setup (Recommended)

```bash
git clone https://github.com/Szostak21/Self-Improvement-Tree.git
cd Self-Improvement-Tree
./setup.sh
```

The script will check prerequisites, create `.env`, and install dependencies.

### Option B: Manual Setup

### 1. Clone & Install

```bash
git clone https://github.com/Szostak21/Self-Improvement-Tree.git
cd Self-Improvement-Tree
```

### 2. Configure Environment

Create the environment file from the template:

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

**Required Credentials (single root `.env`):**
- Gmail app password
- Stripe secret key, publishable key (`EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`), webhook secret

**Note:** For Gmail App Password, enable 2FA on your Google account, then generate an app password at: https://myaccount.google.com/apppasswords

**Security Note:** Environment files are gitignored to prevent accidental commits of sensitive data.

### 3. Start the App

**Terminal 1 - Backend:**
```bash
./run-backend.sh
```

**Terminal 2 - Frontend:**
```bash
./run-frontend.sh
```

The backend will start on `http://localhost:8080` and the frontend will open in Expo.

---

## Testing on Mobile Device

1. Make sure your phone and computer are on the same Wi-Fi network
2. The `run-backend.sh` script automatically detects your local IP and updates the frontend config
3. Open Expo Go app on your phone and scan the QR code

---

## Testing Payments (Optional)

To test Stripe payments with webhook support:

**Terminal 3 - Stripe Webhooks:**
```bash
cd Backend
stripe listen --forward-to http://localhost:8080/api/stripe/webhook
```

Use test card: **4242 4242 4242 4242** (any future date, any CVC)

More test cards: https://stripe.com/docs/testing

---

## Features You Can Test

- ✅ **Guest Mode**: Use the app without registration
- ✅ **Account Creation**: Register with email verification
- ✅ **Habit Tracking**: Add habits and check them off daily
- ✅ **Tree Growth**: Watch your tree grow as you build habits
- ✅ **Shop System**: Claim daily rewards (coins/gems)
- ✅ **Real Payments**: Buy gems with Stripe (test mode)
- ✅ **Progress Sync**: Login to sync data across devices

---

## Troubleshooting

**Backend won't start?**
- Check Java version: `java -version` (needs 17+)
- Verify `.env` file exists with your credentials

**Frontend can't connect?**
- Check `Frontend/config.ts` - API_BASE should match your local IP
- Ensure backend is running on port 8080

**Payments not working?**
- Make sure Stripe keys are in `.env` file
- Start the stripe webhook listener (see above)
- Use test card: 4242 4242 4242 4242

---

## File Structure

```
Self-Improvement-Tree/
├── Backend/              # Spring Boot API
│   └── src/main/java/    # Java source code
├── Frontend/             # React Native (Expo) app
│   ├── app.config.js     # Loads root .env for Expo
│   ├── screens/          # App screens
│   └── config.ts         # API configuration
├── .env.example          # Environment template (copy to .env)
├── .env                  # All secrets (backend + frontend; create this)
├── run-backend.sh        # Start backend script
└── run-frontend.sh       # Start frontend script
```

---

## Next Steps

- Customize the tree graphics in `Frontend/assets/tree/`
- Add more shop items in `ShopScreen.tsx`
- Deploy to production (update Stripe keys to live mode)
- Customize email templates in backend

---

Need help? Check the [main README](README.md) for architecture overview.
