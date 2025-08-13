package com.selfimprovementtree.backend.service;

import com.selfimprovementtree.backend.model.UserDataEntity;
import com.selfimprovementtree.backend.repo.UserDataRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service
public class UserDataService {
    private final UserDataRepository repo;

    public UserDataService(UserDataRepository repo) {
        this.repo = repo;
    }

    public Optional<UserDataEntity> get(String id) {
        return repo.findById(id);
    }

    public UserDataEntity upsert(String id, String json) {
        UserDataEntity entity = repo.findById(id).orElse(new UserDataEntity());
        entity.setId(id);
        entity.setJson(json);
        entity.setUpdatedAt(OffsetDateTime.now());
        return repo.save(entity);
    }
}
