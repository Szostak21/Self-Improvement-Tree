# Local Setup Guide

This project has two parts: a Spring Boot backend and a React Native (Expo) frontend.

## Prerequisites
- Node.js LTS (npm or yarn)
- Java 17+
- Git
- Database: PostgreSQL (recommended) or H2 for dev
- Email: SMTP account (Gmail with App Password works)

---

## 1) Backend

You can run the backend in two ways: Quick (env vars) or Config file.

### Option A — Quick run (recommended for demos)

Use environment variables for Gmail credentials and start the server in one line:

```bash
# Linux/macOS
GMAIL_USER="<your_gmail>@gmail.com" \
GMAIL_APP_PASSWORD="<your_gmail_app_password>" \
./mvnw spring-boot:run
```

The app reads these to populate Spring Mail properties via placeholders (see Option B below).

Alternatively, you can export them once in your shell:

```bash
export GMAIL_USER="<your_gmail>@gmail.com"
export GMAIL_APP_PASSWORD="<your_gmail_app_password>"
./mvnw spring-boot:run
```

Advanced: Spring also supports direct overrides via `SPRING_MAIL_USERNAME` and `SPRING_MAIL_PASSWORD` env vars.

```bash
SPRING_MAIL_USERNAME="<your_gmail>@gmail.com" \
SPRING_MAIL_PASSWORD="<your_gmail_app_password>" \
./mvnw spring-boot:run
```

### Option B — Config file (persistent)

Create `Backend/src/main/resources/application.properties` with DB + SMTP. You can reference env vars to avoid committing secrets:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/sit
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update

# Email (use Gmail App Password)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${GMAIL_USER}
spring.mail.password=${GMAIL_APP_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

Run the backend:

```bash
./mvnw spring-boot:run
# or
./gradlew bootRun
```

> If you don’t want to send real emails in dev, you can stub email sending or use a test SMTP provider (e.g., Mailtrap).

---

## 2) Frontend (Expo)

1) Set API base URL in `Frontend/config.ts`:

```ts
// Frontend/config.ts
export const API_BASE = 'http://<your-LAN-ip>:8080'; // e.g., http://192.168.1.23:8080
```

- Use your machine’s LAN IP so a real device can reach the backend.
- Keep phone and PC on the same Wi‑Fi network.

2) Install and start Expo:

```bash
cd Frontend
npm install
npx expo start
```

Open on a device with Expo Go (Android/iOS) or in an emulator.

---

## 3) Demo Tips
- Forgot-password and registration flows send email codes; ensure SMTP works or stub sending in dev.
- Developer options (Settings screen) help test day rollover and local data clearing.

---

## Troubleshooting
- Device can’t reach backend: use LAN IP (not localhost), open port 8080 in firewall.
- 401 Unauthorized: check Authorization headers and server time; confirm `API_BASE` is correct.
- Data not persisting: verify backend DB config and that the app writes to the right `id`.
