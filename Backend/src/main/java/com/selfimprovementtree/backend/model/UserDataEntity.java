package com.selfimprovementtree.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;

@Entity
@Table(name = "user_data")
public class UserDataEntity {
    @Id
    private String id; // userId

    @Column(columnDefinition = "TEXT")
    private String json; // raw userData JSON

    private OffsetDateTime updatedAt;

    public UserDataEntity() {}

    public UserDataEntity(String id, String json, OffsetDateTime updatedAt) {
        this.id = id;
        this.json = json;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getJson() { return json; }
    public void setJson(String json) { this.json = json; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
