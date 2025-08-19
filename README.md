# Self‑Improvement Tree 🌱

A gamified habit app that grows a beautiful tree as you build daily routines. Offline‑first mobile app (React Native + Expo) + Spring Boot backend.

---

## Demo 🎬

<p align="center">
  <img src="docs/media/registration_and_email_verification.gif" alt="Registration + Email Verification" width="640" />
</p>

---

## Gallery 📸

<p align="center">
  <img src="docs/media/habits_screen.png" alt="Habits Screen" width="280" />
  <img src="docs/media/shop_screen.png" alt="Shop" width="280" />
  <img src="docs/media/tree_screen.png" alt="Tree" width="280" />
</p>

---

## Highlights ✨

- Offline‑first: start as Guest, then log in — progress links seamlessly
- Account‑first merge: on login, server account data wins; new accounts adopt guest progress
- Secure auth: JWT, email verification, and password reset via code (optional username change)
- Play loop: track habits, grow the tree, claim daily rewards, buy upgrades (coins/gems)

---

## Tech 🛠

- Mobile: React Native (Expo), Context API, AsyncStorage
- Backend: Spring Boot, JWT, JavaMailSender, JPA (PostgreSQL/H2)

---

## Run locally ▶️

- Backend: configure DB/SMTP in `application.properties`, run Spring Boot
- Frontend: set API in `Frontend/config.ts`, then `npm install` and `npx expo start`

---

## License 📝

MIT
