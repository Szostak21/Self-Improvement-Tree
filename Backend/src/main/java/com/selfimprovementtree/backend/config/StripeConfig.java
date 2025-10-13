package com.selfimprovementtree.backend.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Stripe API configuration.
 * Initializes the Stripe SDK with the secret key from application.properties.
 */
@Configuration
public class StripeConfig {

    @Value("${stripe.secret.key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
        System.out.println("✅ Stripe initialized with key: " + secretKey.substring(0, 12) + "...");
    }
}
