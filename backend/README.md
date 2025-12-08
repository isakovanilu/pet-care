# Pet Care Backend Server

Simple Express.js server for handling Stripe payment processing.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

Copy the example env file:
```bash
cp .env.example .env
```

Edit `.env` and add your Stripe secret key:
```
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
```

**Get your Stripe secret key:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Secret key** (starts with `sk_test_`)

### 3. Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Create Payment Intent
```
POST /api/create-payment-intent
Body: {
  "amount": 50.00,
  "bookingId": "booking123",
  "currency": "usd" (optional)
}
```

Returns:
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### Confirm Payment (Optional)
```
POST /api/confirm-payment
Body: {
  "paymentIntentId": "pi_xxx"
}
```

## Testing with Mobile Device

If testing on a physical device, you need to expose your local server:

### Option 1: Use ngrok (Recommended)

1. Install ngrok: https://ngrok.com/download
2. Start your backend server: `npm start`
3. In another terminal:
   ```bash
   ngrok http 3000
   ```
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Update `config/stripe.config.js` in the main app:
   ```javascript
   export const STRIPE_ENDPOINTS = {
     createPaymentIntent: 'https://abc123.ngrok.io/api/create-payment-intent',
   };
   ```

### Option 2: Use Your Local IP

1. Find your local IP:
   - Mac/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`
2. Update `config/stripe.config.js`:
   ```javascript
   export const STRIPE_ENDPOINTS = {
     createPaymentIntent: 'http://YOUR_LOCAL_IP:3000/api/create-payment-intent',
   };
   ```
3. Make sure your phone and computer are on the same WiFi network

## Testing

### Test the Server

```bash
# Health check
curl http://localhost:3000/health

# Create payment intent
curl -X POST http://localhost:3000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 50, "bookingId": "test123"}'
```

### Test Cards (Stripe Test Mode)

Use these cards in the app:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Any future expiry date (e.g., 12/25) and any CVC (e.g., 123)

## Troubleshooting

### "Invalid API Key" Error
- Make sure you're using a **test** key (starts with `sk_test_`)
- Check that the key is correctly set in `.env` file
- Restart the server after changing `.env`

### CORS Errors
- The server includes CORS middleware
- If issues persist, check that the endpoint URL in the app matches the server URL

### Connection Refused
- Make sure the server is running: `npm start`
- Check the port (default: 3000)
- Verify firewall settings

## Production Deployment

For production:
1. Use production Stripe keys (`sk_live_...`)
2. Set up proper webhook endpoints
3. Use HTTPS
4. Add authentication/authorization
5. Deploy to services like:
   - Heroku
   - Railway
   - Render
   - AWS
   - Google Cloud

## Security Notes

⚠️ **Never commit your `.env` file to version control!**

The `.env` file is already in `.gitignore`.

For production:
- Use environment variables on your hosting platform
- Enable webhook signature verification
- Add rate limiting
- Add authentication for endpoints


