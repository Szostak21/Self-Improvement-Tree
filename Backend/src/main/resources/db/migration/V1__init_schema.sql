CREATE TABLE app_user (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL,
    username        VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    tutorial_tree   BOOLEAN NOT NULL DEFAULT FALSE,
    tutorial_habit  BOOLEAN NOT NULL DEFAULT FALSE,
    tutorial_shop   BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uk_user_email UNIQUE (email),
    CONSTRAINT uk_user_username UNIQUE (username)
);

CREATE TABLE user_data (
    id          VARCHAR(255) PRIMARY KEY,
    json        TEXT,
    updated_at  TIMESTAMP WITH TIME ZONE
);

CREATE TABLE pending_registration (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL,
    username        VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    code            VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_pending_email UNIQUE (email),
    CONSTRAINT uk_pending_username UNIQUE (username)
);

CREATE TABLE pending_password_reset (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,
    user_id     BIGINT NOT NULL,
    code        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_reset_email UNIQUE (email),
    CONSTRAINT uk_reset_user UNIQUE (user_id)
);
