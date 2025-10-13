package com.selfimprovementtree.backend.controller;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Stripe Payment Controller
 * Handles PaymentIntent creation and webhook events.
 */
@RestController
@RequestMapping("/api/stripe")
@CrossOrigin(origins = "*") // Allow React Native dev server
public class StripeController {

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    /**
     * Create a PaymentIntent
     * POST /api/stripe/create-payment-intent
     * Body: { "amount": 1000, "currency": "usd", "metadata": {...} }
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody Map<String, Object> request) {
        try {
            // Extract parameters
            Long amount = ((Number) request.get("amount")).longValue();
            String currency = (String) request.getOrDefault("currency", "usd");
            @SuppressWarnings("unchecked")
            Map<String, String> metadata = (Map<String, String>) request.get("metadata");

            // Create PaymentIntent
            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(amount)
                    .setCurrency(currency)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    );

            if (metadata != null) {
                paramsBuilder.putAllMetadata(metadata);
            }

            PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());

            // Return client secret
            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());
            response.put("paymentIntentId", paymentIntent.getId());

            System.out.println("✅ PaymentIntent created: " + paymentIntent.getId());
            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            System.err.println("❌ Stripe error: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            System.err.println("❌ Server error: " + e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Stripe Webhook Endpoint
     * POST /api/stripe/webhook
     * CRITICAL: Raw body required for signature verification
     * This endpoint verifies webhook signatures and processes events
     */
    @PostMapping(value = "/webhook", consumes = "application/json")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;

        try {
            // Verify webhook signature to ensure request is from Stripe
            // This prevents attackers from sending fake events
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            System.err.println("⚠️ Webhook signature verification failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }

        // Handle the event
        String eventType = event.getType();
        System.out.println("📥 Webhook received: " + eventType);

        switch (eventType) {
            case "payment_intent.succeeded":
                PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                if (paymentIntent != null) {
                    handlePaymentSuccess(paymentIntent);
                }
                break;

            case "payment_intent.payment_failed":
                PaymentIntent failedIntent = (PaymentIntent) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                if (failedIntent != null) {
                    handlePaymentFailure(failedIntent);
                }
                break;

            case "payment_intent.created":
                System.out.println("✅ PaymentIntent created via webhook");
                break;

            default:
                System.out.println("⚪ Unhandled event type: " + eventType);
        }

        // CRITICAL: Respond quickly with 200 to acknowledge receipt
        // Stripe will retry if we don't respond within ~30 seconds
        return ResponseEntity.ok("Success");
    }

    /**
     * Handle successful payment
     * Here you would:
     * - Update user's account (grant premium features, add coins, etc.)
     * - Send confirmation email
     * - Log transaction
     */
    private void handlePaymentSuccess(PaymentIntent paymentIntent) {
        String paymentIntentId = paymentIntent.getId();
        Long amount = paymentIntent.getAmount();
        String currency = paymentIntent.getCurrency();
        Map<String, String> metadata = paymentIntent.getMetadata();

        System.out.println("✅ Payment succeeded!");
        System.out.println("   ID: " + paymentIntentId);
        System.out.println("   Amount: " + amount + " " + currency);
        System.out.println("   Metadata: " + metadata);

        // TODO: Implement your business logic here
        // Example: If metadata contains userId, update user's premium status
        if (metadata != null && metadata.containsKey("userId")) {
            String userId = metadata.get("userId");
            // grantPremiumToUser(userId);
            System.out.println("   TODO: Grant features to user: " + userId);
        }
    }

    /**
     * Handle failed payment
     */
    private void handlePaymentFailure(PaymentIntent paymentIntent) {
        String paymentIntentId = paymentIntent.getId();
        String failureMessage = paymentIntent.getLastPaymentError() != null
                ? paymentIntent.getLastPaymentError().getMessage()
                : "Unknown error";

        System.err.println("❌ Payment failed!");
        System.err.println("   ID: " + paymentIntentId);
        System.err.println("   Reason: " + failureMessage);

        // TODO: Notify user, log failure, etc.
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("service", "stripe-payments");
        return ResponseEntity.ok(response);
    }
}
