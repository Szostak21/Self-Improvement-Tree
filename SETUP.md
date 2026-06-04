# Self-Improvement Tree — Setup

## Wymagania

- **Docker** i **Docker Compose**
- Konto **Gmail** (e-mail weryfikacyjny)
- Konto **Stripe** (opcjonalnie, płatności testowe)

---

## Uruchomienie

```bash
git clone https://github.com/Szostak21/Self-Improvement-Tree.git
cd Self-Improvement-Tree

cp .env.example .env
# Edytuj .env — Gmail, Stripe, HOSTNAME, hasło bazy

docker compose up --build
```

### Zmienne w `.env`

| Zmienna | Opis |
|---------|------|
| `HOSTNAME` | IP komputera w LAN (`192.168.x.x`) dla Expo Go na telefonie; `localhost` tylko do testów web w przeglądarce |
| `EXPO_PUBLIC_API_BASE` | Opcjonalnie; domyślnie `http://HOSTNAME:8080` |
| `EXPO_START_WEB` | Ustaw `1`, aby uruchomić też wersję web (`http://HOSTNAME:19006`) |

### Expo Go (telefon, ta sama sieć Wi‑Fi)

1. W logach kontenera `sit-frontend` znajdź adres `exp://…:8081`
2. W Expo Go: **Enter URL manually** → wpisz ten adres (bez QR)

### Porty

| Usługa | Port |
|--------|------|
| Backend API | 8080 |
| Expo Metro | 8081 |
| Expo Web | 19006 |
| PostgreSQL | 5432 |

---

## Stripe webhooks (opcjonalnie)

```bash
stripe listen --forward-to http://localhost:8080/api/stripe/webhook
```

Karta testowa: `4242 4242 4242 4242`

---

## Rozwiązywanie problemów

**Expo Go nie łączy się** — `HOSTNAME` w `.env` musi być IP komputera w Wi‑Fi, nie `localhost`.

**Backend nie startuje** — sprawdź `DB_*` w `.env` i logi `sit-backend`.

**Aplikacja nie widzi API** — ustaw `EXPO_PUBLIC_API_BASE=http://<HOSTNAME>:8080` w `.env` i zrestartuj: `docker compose up --build`.

---

Szczegóły architektury: [README.md](README.md)
