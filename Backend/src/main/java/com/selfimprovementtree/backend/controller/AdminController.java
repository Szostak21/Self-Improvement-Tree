package com.selfimprovementtree.backend.controller;

import com.selfimprovementtree.backend.repo.AppUserRepository;
import com.selfimprovementtree.backend.repo.PendingRegistrationRepository;
import com.selfimprovementtree.backend.repo.UserDataRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AppUserRepository userRepo;
    private final UserDataRepository dataRepo;
    private final PendingRegistrationRepository pendingRepo;

    @Value("${app.admin.token:dev-reset-token}")
    private String adminToken;

    public AdminController(AppUserRepository userRepo, UserDataRepository dataRepo, PendingRegistrationRepository pendingRepo) {
        this.userRepo = userRepo;
        this.dataRepo = dataRepo;
        this.pendingRepo = pendingRepo;
    }

    @DeleteMapping("/wipe-accounts")
    public ResponseEntity<?> wipeAccounts(@RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (token == null || !token.equals(adminToken)) {
            return ResponseEntity.status(401).body("UNAUTHORIZED");
        }
        // collect all account IDs (as String) to delete corresponding user_data rows
        List<String> accountIds = userRepo.findAll().stream()
                .map(u -> String.valueOf(u.getId()))
                .toList();
        // delete user_data for those accounts
        dataRepo.deleteAllById(accountIds);
        // delete pending registrations
        pendingRepo.deleteAll();
        // delete all users
        userRepo.deleteAll();
        return ResponseEntity.ok().body("OK");
    }
}
