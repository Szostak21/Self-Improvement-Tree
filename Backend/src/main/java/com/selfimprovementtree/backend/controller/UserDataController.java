package com.selfimprovementtree.backend.controller;

import com.selfimprovementtree.backend.service.UserDataService;
import com.selfimprovementtree.backend.security.JwtService;
import com.selfimprovementtree.backend.repo.AppUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/userdata")
@CrossOrigin(origins = "*")
public class UserDataController {

    private final UserDataService service;
    private final JwtService jwtService;
    private final AppUserRepository userRepo;

    public UserDataController(UserDataService service, JwtService jwtService, AppUserRepository userRepo) {
        this.service = service;
        this.jwtService = jwtService;
        this.userRepo = userRepo;
    }

    @GetMapping("/{id}")
    public ResponseEntity<String> get(
            @PathVariable String id,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (isAccountId(id) && !isAuthorized(id, authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return service.get(id)
                .map(e -> ResponseEntity.ok(e.getJson()))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> put(
            @PathVariable String id,
            @RequestBody String json,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (isAccountId(id) && !isAuthorized(id, authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        service.upsert(id, json);
        return ResponseEntity.ok().build();
    }

    private boolean isAuthorized(String id, String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return false;
        String token = authHeader.substring("Bearer ".length()).trim();
        try {
            String subject = jwtService.getSubject(token);
            return id.equals(subject);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isAccountId(String id) {
        try {
            long userId = Long.parseLong(id);
            return userRepo.findById(userId).isPresent();
        } catch (NumberFormatException ex) {
            return false;
        }
    }
}
