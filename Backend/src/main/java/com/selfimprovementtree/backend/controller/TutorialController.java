package com.selfimprovementtree.backend.controller;

import com.selfimprovementtree.backend.model.AppUser;
import com.selfimprovementtree.backend.repo.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Tutorial Progress Controller
 * Manages tutorial completion state for each user
 */
@RestController
@RequestMapping("/api/user/tutorial-progress")
@CrossOrigin(origins = "*")
public class TutorialController {

    @Autowired
    private AppUserRepository userRepository;

    /**
     * GET /api/user/tutorial-progress
     * Returns the tutorial completion state for the authenticated user
     */
    @GetMapping
    public ResponseEntity<?> getTutorialProgress(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not authenticated"));
        }

        String username = authentication.getName();
        AppUser user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        Map<String, Boolean> progress = new HashMap<>();
        progress.put("tree", user.isTutorialTree());
        progress.put("habit", user.isTutorialHabit());
        progress.put("shop", user.isTutorialShop());

        return ResponseEntity.ok(progress);
    }

    /**
     * PATCH /api/user/tutorial-progress
     * Updates tutorial completion state for the authenticated user
     * Body: { "tree": true, "habit": true, "shop": true }
     */
    @PatchMapping
    public ResponseEntity<?> updateTutorialProgress(
            @RequestBody Map<String, Boolean> progress,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not authenticated"));
        }

        String username = authentication.getName();
        AppUser user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        // Update tutorial flags
        if (progress.containsKey("tree")) {
            user.setTutorialTree(progress.get("tree"));
        }
        if (progress.containsKey("habit")) {
            user.setTutorialHabit(progress.get("habit"));
        }
        if (progress.containsKey("shop")) {
            user.setTutorialShop(progress.get("shop"));
        }

        userRepository.save(user);

        System.out.println("✅ Tutorial progress updated for user: " + username);
        System.out.println("   Tree: " + user.isTutorialTree());
        System.out.println("   Habit: " + user.isTutorialHabit());
        System.out.println("   Shop: " + user.isTutorialShop());

        Map<String, Boolean> updatedProgress = new HashMap<>();
        updatedProgress.put("tree", user.isTutorialTree());
        updatedProgress.put("habit", user.isTutorialHabit());
        updatedProgress.put("shop", user.isTutorialShop());

        return ResponseEntity.ok(updatedProgress);
    }
}
