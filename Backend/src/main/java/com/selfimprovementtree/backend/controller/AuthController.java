package com.selfimprovementtree.backend.controller;

import com.selfimprovementtree.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        String username = body.getOrDefault("username", "");
        String password = body.getOrDefault("password", "");
        if (email.isBlank() || username.isBlank() || password.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_INPUT"));
        }
        try {
            String token = authService.register(email, username, password);
            return ResponseEntity.ok(Map.of("token", token));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String usernameOrEmail = body.getOrDefault("usernameOrEmail", "");
        String password = body.getOrDefault("password", "");
        try {
            String token = authService.login(usernameOrEmail, password);
            return ResponseEntity.ok(Map.of("token", token));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(401).body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/link-guest")
    public ResponseEntity<?> linkGuest(@RequestBody Map<String, String> body) {
        String usernameOrEmail = body.getOrDefault("usernameOrEmail", "");
        String password = body.getOrDefault("password", "");
        String guestId = body.getOrDefault("guestId", "");
        if (usernameOrEmail.isBlank() || password.isBlank() || guestId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_INPUT"));
        }
        try {
            var result = authService.linkGuestToAccount(usernameOrEmail, password, guestId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(401).body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/register-init")
    public ResponseEntity<?> registerInit(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        String username = body.getOrDefault("username", "");
        String password = body.getOrDefault("password", "");
        try {
            authService.registerInit(email, username, password);
            return ResponseEntity.ok(Map.of("status", "CODE_SENT"));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/register-verify")
    public ResponseEntity<?> registerVerify(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        String code = body.getOrDefault("code", "");
        try {
            authService.verifyRegistration(email, code);
            return ResponseEntity.ok(Map.of("status", "VERIFIED"));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/reset-init")
    public ResponseEntity<?> resetInit(@RequestBody Map<String, String> body) {
        String usernameOrEmail = body.getOrDefault("usernameOrEmail", "");
        if (usernameOrEmail.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_INPUT"));
        }
        try {
            String email = authService.resetInit(usernameOrEmail);
            return ResponseEntity.ok(Map.of("status", "CODE_SENT", "email", email));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/reset-confirm")
    public ResponseEntity<?> resetConfirm(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        String code = body.getOrDefault("code", "");
        String newPassword = body.get("newPassword");
        String newUsername = body.get("newUsername");
        try {
            var result = authService.resetConfirm(email, code, newPassword, newUsername);
            return ResponseEntity.ok(result);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
