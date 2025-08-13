package com.selfimprovementtree.backend.repo;

import com.selfimprovementtree.backend.model.UserDataEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDataRepository extends JpaRepository<UserDataEntity, String> {
}
