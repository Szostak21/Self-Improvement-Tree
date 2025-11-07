package com.selfimprovementtree.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "app_user", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_email", columnNames = "email"),
        @UniqueConstraint(name = "uk_user_username", columnNames = "username")
})
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    // Tutorial progress flags
    @Column(name = "tutorial_tree", nullable = false)
    private boolean tutorialTree = false;

    @Column(name = "tutorial_habit", nullable = false)
    private boolean tutorialHabit = false;

    @Column(name = "tutorial_shop", nullable = false)
    private boolean tutorialShop = false;

    public AppUser() {}

    public AppUser(String email, String username, String passwordHash) {
        this.email = email;
        this.username = username;
        this.passwordHash = passwordHash;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public boolean isTutorialTree() {
        return tutorialTree;
    }

    public void setTutorialTree(boolean tutorialTree) {
        this.tutorialTree = tutorialTree;
    }

    public boolean isTutorialHabit() {
        return tutorialHabit;
    }

    public void setTutorialHabit(boolean tutorialHabit) {
        this.tutorialHabit = tutorialHabit;
    }

    public boolean isTutorialShop() {
        return tutorialShop;
    }

    public void setTutorialShop(boolean tutorialShop) {
        this.tutorialShop = tutorialShop;
    }
}
