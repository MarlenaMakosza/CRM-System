# CRM System - Firma X

System CRM do zarządzania klientami, umowami i wydarzeniami dla przedstawicieli handlowych.

## Wymagania
- Docker i Docker Compose

## Szybki start (Docker)

1. Skopiuj plik `.env.example` na `.env`:
```shell
cp .env.example .env
```

2. Uruchom cały system:
```shell
docker compose up -d --build
```

3. Otwórz przeglądarkę:
   - **Frontend**: http://localhost
   - **Backend API**: http://localhost:8080/api

## Konta testowe

| Imię i nazwisko | Rola | Region | Email | Hasło |
|-----------------|------|--------|-------|-------|
| Jan Kowalski | Szef | Zielona Góra | jan.kowalski@firmx.pl | password123 |
| Anna Nowak | Pracownik | Szczecin | anna.nowak@firmx.pl | password123 |
| Piotr Wiśniewski | Pracownik | Wrocław | piotr.wisniewski@firmx.pl | password123 |
| Marek Zieliński | Pracownik | Poznań | marek.zielinski@firmx.pl | password123 |

## Zatrzymanie systemu

```shell
docker compose down
```

Aby usunąć również dane z bazy:
```shell
docker compose down -v
```

## Rozwój lokalny (bez Dockera)

### Backend (Deno)
```shell
# Uruchom tylko bazę danych
docker compose up db -d

# Uruchom backend w trybie dev
deno task dev
```

### Frontend (SvelteKit)
```shell
cd frontend
npm install
npm run dev
```
