# CRM System - Firma X

System CRM do zarządzania klientami, umowami i wydarzeniami dla przedstawicieli handlowych.

## Wymagania
- Docker i Docker Compose

## Szybki start (Docker)

1. Skopiować plik `.env.example` na `.env`:
```shell
cp .env.example .env
```

2. Uruchomić cały system:
```shell
docker compose up -d --build
```

2a. W przypadku problemów może być konieczne ręczne zainstalowanie zależności.
W głównym folderze projektu wykonać:

```shell
deno install
```

Następnie przejść do folderu `/frontend` i wykonać:

```shell
npm install
```

3. Otworzyć przeglądarkę:
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

Aby zatrzymać system:
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
# Uruchomić tylko bazę danych
docker compose up db -d

# Uruchomić backend w trybie dev
deno task dev
```

### Frontend (SvelteKit)
```shell
cd frontend
npm install
npm run dev
```
