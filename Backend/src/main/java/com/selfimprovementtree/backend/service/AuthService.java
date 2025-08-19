package com.selfimprovementtree.backend.service;

import com.selfimprovementtree.backend.model.AppUser;
import com.selfimprovementtree.backend.model.UserDataEntity;
import com.selfimprovementtree.backend.model.PendingRegistration;
import com.selfimprovementtree.backend.model.PendingPasswordReset;
import com.selfimprovementtree.backend.repo.AppUserRepository;
import com.selfimprovementtree.backend.repo.UserDataRepository;
import com.selfimprovementtree.backend.repo.PendingRegistrationRepository;
import com.selfimprovementtree.backend.repo.PendingPasswordResetRepository;
import com.selfimprovementtree.backend.security.JwtService;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;

@Service
public class AuthService {
    private final AppUserRepository userRepo;
    private final UserDataRepository dataRepo;
    private final JwtService jwtService;
    private final PendingRegistrationRepository pendingRepo;
    private final PendingPasswordResetRepository resetRepo;
    private final JavaMailSender mailSender;
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(AppUserRepository userRepo, UserDataRepository dataRepo, JwtService jwtService, PendingRegistrationRepository pendingRepo, PendingPasswordResetRepository resetRepo, JavaMailSender mailSender) {
        this.userRepo = userRepo;
        this.dataRepo = dataRepo;
        this.jwtService = jwtService;
        this.pendingRepo = pendingRepo;
        this.resetRepo = resetRepo;
        this.mailSender = mailSender;
    }

    public String register(String email, String username, String rawPassword) {
        userRepo.findByEmail(email).ifPresent(u -> { throw new RuntimeException("EMAIL_TAKEN"); });
        userRepo.findByUsername(username).ifPresent(u -> { throw new RuntimeException("USERNAME_TAKEN"); });
        AppUser user = new AppUser(email, username, encoder.encode(rawPassword));
        userRepo.save(user);
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("username", username);
        return jwtService.generateToken(user.getId().toString(), claims);
    }

    public String login(String usernameOrEmail, String rawPassword) {
        Optional<AppUser> userOpt = usernameOrEmail.contains("@")
                ? userRepo.findByEmail(usernameOrEmail)
                : userRepo.findByUsername(usernameOrEmail);
        if (userOpt.isEmpty()) throw new RuntimeException("INVALID_CREDENTIALS");
        AppUser user = userOpt.get();
        if (!encoder.matches(rawPassword, user.getPasswordHash())) throw new RuntimeException("INVALID_CREDENTIALS");
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("username", user.getUsername());
        return jwtService.generateToken(user.getId().toString(), claims);
    }

    public Map<String, Object> linkGuestToAccount(String usernameOrEmail, String rawPassword, String guestId) {
        Optional<AppUser> userOpt = usernameOrEmail.contains("@")
                ? userRepo.findByEmail(usernameOrEmail)
                : userRepo.findByUsername(usernameOrEmail);
        if (userOpt.isEmpty()) throw new RuntimeException("INVALID_CREDENTIALS");
        AppUser user = userOpt.get();
        if (!encoder.matches(rawPassword, user.getPasswordHash())) throw new RuntimeException("INVALID_CREDENTIALS");
        String accountId = user.getId().toString();

        Optional<UserDataEntity> guest = dataRepo.findById(guestId);
        Optional<UserDataEntity> account = dataRepo.findById(accountId);

        String jsonToKeep = null;
        // Prefer progress already linked to the account; only fall back to guest if account has none
        if (account.isPresent()) {
            jsonToKeep = account.get().getJson();
        } else if (guest.isPresent()) {
            jsonToKeep = guest.get().getJson();
        }

        if (jsonToKeep != null) {
            UserDataEntity e = account.orElseGet(UserDataEntity::new);
            e.setId(accountId);
            e.setJson(jsonToKeep);
            e.setUpdatedAt(java.time.OffsetDateTime.now());
            dataRepo.save(e);
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("username", user.getUsername());
        String token = jwtService.generateToken(accountId, claims);
        return Map.of("token", token, "accountId", accountId, "username", user.getUsername());
    }

    public void registerInit(String email, String username, String rawPassword) {
        if (email == null || email.isBlank() || username == null || username.isBlank() || rawPassword == null || rawPassword.length() < 6) {
            throw new RuntimeException("INVALID_INPUT");
        }
        userRepo.findByEmail(email).ifPresent(u -> { throw new RuntimeException("EMAIL_TAKEN"); });
        userRepo.findByUsername(username).ifPresent(u -> { throw new RuntimeException("USERNAME_TAKEN"); });
        pendingRepo.findByEmail(email).ifPresent(p -> pendingRepo.delete(p));
        pendingRepo.findByUsername(username).ifPresent(p -> pendingRepo.delete(p));
        String code = generateCode();
        String hash = encoder.encode(rawPassword);
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime exp = now.plusMinutes(15);
        PendingRegistration pr = new PendingRegistration(email, username, hash, code, now, exp);
        pendingRepo.save(pr);

        // Send email
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);
        msg.setFrom("selfimprovementtree@gmail.com");
        msg.setSubject("Self-Improvement Tree: Email verification code");
        msg.setText("Your verification code: " + code + "\n\nIt expires in 15 minutes.");
        mailSender.send(msg);
    }

    public void verifyRegistration(String email, String code) {
        PendingRegistration pr = pendingRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("NOT_FOUND"));
        if (OffsetDateTime.now().isAfter(pr.getExpiresAt())) {
            pendingRepo.delete(pr);
            throw new RuntimeException("CODE_EXPIRED");
        }
        if (!pr.getCode().equals(code)) {
            throw new RuntimeException("INVALID_CODE");
        }
        userRepo.findByEmail(email).ifPresent(u -> { throw new RuntimeException("EMAIL_TAKEN"); });
        userRepo.findByUsername(pr.getUsername()).ifPresent(u -> { throw new RuntimeException("USERNAME_TAKEN"); });
        AppUser user = new AppUser(email, pr.getUsername(), pr.getPasswordHash());
        userRepo.save(user);
        pendingRepo.delete(pr);
    }

    public String resetInit(String usernameOrEmail) {
        Optional<AppUser> userOpt = usernameOrEmail.contains("@")
                ? userRepo.findByEmail(usernameOrEmail)
                : userRepo.findByUsername(usernameOrEmail);
        AppUser user = userOpt.orElseThrow(() -> new RuntimeException("NOT_FOUND"));
        String email = user.getEmail();
        resetRepo.findByEmail(email).ifPresent(r -> resetRepo.delete(r));
        resetRepo.findByUserId(user.getId()).ifPresent(r -> resetRepo.delete(r));
        String code = generateCode();
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime exp = now.plusMinutes(15);
        PendingPasswordReset pr = new PendingPasswordReset(email, user.getId(), code, now, exp);
        resetRepo.save(pr);
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);
        msg.setFrom("selfimprovementtree@gmail.com");
        msg.setSubject("Self-Improvement Tree: Password reset code");
        msg.setText("Your reset code: " + code + "\n\nIt expires in 15 minutes.");
        mailSender.send(msg);
        return email;
    }

    public Map<String, Object> resetConfirm(String email, String code, String newPassword, String newUsername) {
        PendingPasswordReset pr = resetRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("NOT_FOUND"));
        if (OffsetDateTime.now().isAfter(pr.getExpiresAt())) {
            resetRepo.delete(pr);
            throw new RuntimeException("CODE_EXPIRED");
        }
        if (!pr.getCode().equals(code)) {
            throw new RuntimeException("INVALID_CODE");
        }
        AppUser user = userRepo.findById(pr.getUserId()).orElseThrow(() -> new RuntimeException("NOT_FOUND"));

        String np = newPassword != null ? newPassword.trim() : null;
        String nu = newUsername != null ? newUsername.trim() : null;

        if (np != null && !np.isBlank() && np.length() < 6) {
            throw new RuntimeException("PASSWORD_TOO_SHORT");
        }
        if (np != null && !np.isBlank()) {
            user.setPasswordHash(encoder.encode(np));
        }
        if (nu != null && !nu.isBlank() && !nu.equals(user.getUsername())) {
            userRepo.findByUsername(nu).ifPresent(u -> { throw new RuntimeException("USERNAME_TAKEN"); });
            user.setUsername(nu);
        }
        userRepo.save(user);
        resetRepo.delete(pr);
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("username", user.getUsername());
        String token = jwtService.generateToken(user.getId().toString(), claims);
        return Map.of("token", token, "accountId", user.getId().toString(), "username", user.getUsername());
    }

    private String generateCode() {
        int n = new Random().nextInt(900000) + 100000; // 6-digit
        return Integer.toString(n);
    }
}
