package com.selfimprovementtree.backend.repo;

import com.selfimprovementtree.backend.model.PendingPasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PendingPasswordResetRepository extends JpaRepository<PendingPasswordReset, Long> {
    Optional<PendingPasswordReset> findByEmail(String email);
    Optional<PendingPasswordReset> findByUserId(Long userId);
}
