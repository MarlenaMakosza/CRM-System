# CRM Lab6 - Project Notes

## Project Overview
System CRM dla Firmy X - hurtowa sprzedaż warzyw/owoców
- 3 przedstawicieli handlowych (PH)
- Cel: pozyskać ~200 sklepów w Poznaniu, Wrocławiu, Szczecinie

## Tech Stack
- **Backend**: Node.js + SvelteKit + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Frontend**: Svelte + TailwindCSS + DaisyUI
- **Auth**: Lucia v3
- **Dev Environment**: Docker (PostgreSQL)

## Completed Features ✅

### KROK 1: Leady Management
- ✅ CRUD operacje dla leadów
- ✅ Walidacja (telefon/email - min. 1 wymagany)
- ✅ Osoba decyzyjna (imię + nazwisko)
- ✅ Źródło leada (dropdown)
- ✅ Podział terytorialny PH (Poznań/Wrocław/Szczecin)
- ✅ Uprawnienia: PH widzi tylko swoje leady

### KROK 2: Kontakty Telefoniczne
- ✅ Formularz rejestracji kontaktu
- ✅ Wszystkie typy wyniku: NO_ANSWER, MEETING_SET, ORDER_TAKEN, INFO_SENT, OFFER_PRESENTED, POST_DELIVERY_CHECK
- ✅ Automatyczne przekierowanie do wizyty po MEETING_SET
- ✅ Historia kontaktów w widoku leada
- ✅ Notatka obowiązkowa

### KROK 3: Wizyty w Sklepie
- ✅ Planowanie wizyt (data + godzina + adres)
- ✅ Adres automatycznie z leada (można zmienić)
- ✅ Harmonogram wizyt z filtrami (status, data)
- ✅ Szybki filtr "Dzisiejsze wizyty"
- ✅ Zakończenie wizyty z notatkami
- ✅ Ceny konkurencji (pole tekstowe)
- ✅ Status: PLANNED / DONE / CANCELLED

### Dashboard PH
- ✅ Statystyki: moje leady, dzisiejsze wizyty, kontakty w tym tygodniu
- ✅ Tabela dzisiejszych wizyt
- ✅ Ostatnie 5 leadów z szybkimi akcjami
- ✅ Szybkie akcje (dodaj lead, przeglądaj, harmonogram)

### Dashboard Kierownika
- ✅ Statystyki: wszystkie leady, wszystkie wizyty, wszystkie kontakty
- ✅ Widok agregatowy danych

## Known Issues / TODO

### 🔴 HIGH PRIORITY
1. **Logout Error** - wylogowanie działa, ale pokazuje błąd JSON.parse
   - Location: `src/routes/logout/+server.ts`
   - Problem: POST endpoint zwraca redirect zamiast JSON
   - Trzeba przerobić na akcję w layout lub naprawić enhance
   - Status: Odłożone na później

### 🟡 MEDIUM PRIORITY
2. **Walidacja konfliktów czasowych wizyt** (z requirements)
   - Wymaganie: System nie pozwala zaplanować 2 wizyt na tę samą godzinę dla tego samego PH
   - Location: `src/routes/(app)/visits/new/+page.server.ts`
   - Komunikat: "Masz już zaplanowaną wizytę o tej godzinie"
   - Status: Wymaganie w docs, implementacja TODO

3. **Manager Reports** - brakuje ekranu raportów dla kierownika
   - Statystyki per PH, per okres
   - Liczba wizyt, telefonów, umów
   - Location: `/reports` (route nie istnieje)

4. **A11y warnings** - DaisyUI form labels
   - Multiple A11y warnings w formularzach
   - "A form label must be associated with a control"
   - Nie blokuje funkcjonalności, ale warto poprawić

### 🟢 LOW PRIORITY / NICE TO HAVE
5. **Activities list page** - `/activities` route nie istnieje
   - Link w menu istnieje, ale 404
   - Opcjonalnie: osobna strona z listą wszystkich kontaktów

6. **Newsletter functionality** (KROK 7)
   - Z requirements: opcjonalnie
   - Przycisk "Wyślij newsletter" → lista emaili ACTIVE klientów

7. **Contracts module** (KROK 5)
   - Opcjonalna tabela umów
   - Zmiana statusu leada na ACTIVE po podpisaniu

## Database Schema

### Tables
- `users` - PH + Manager z territories
- `leads` - firmy/prospects
- `activities` - kontakty telefoniczne
- `visits` - wizyty w sklepach
- `contracts` - umowy (opcjonalne)
- `sessions` - Lucia auth

### Test Users (seed)
- `ph.poznan` / `password` (PH - Poznań)
- `ph.wroclaw` / `password` (PH - Wrocław)
- `ph.szczecin` / `password` (PH - Szczecin)
- `manager` / `password` (Kierownik)

## Project Structure
```
src/
├── lib/
│   ├── server/
│   │   ├── auth.ts (Lucia config)
│   │   ├── db/ (Drizzle setup + schema)
│   │   └── validators.ts
│   └── components/ (StatusBadge, etc)
├── routes/
│   ├── login/ (auth)
│   ├── logout/ (auth endpoint - has issue)
│   └── (app)/ (protected routes)
│       ├── +layout.svelte (navbar)
│       ├── +page.svelte (dashboard)
│       ├── leads/ (CRUD)
│       ├── activities/ (only /new exists)
│       └── visits/ (list + new + complete)
```

## Development Commands
```bash
# Start dev server
npm run dev

# Database
docker-compose up -d          # Start PostgreSQL
npm run db:push              # Push schema
npm run seed                 # Seed test data
npm run db:studio            # Drizzle Studio

# Git
git status
git add .
git commit -m "message"
git push
```

## Next Steps (Prioritized)

1. **Fix logout bug** (high priority)
2. **Implement visit time conflict validation** (medium, required by docs)
3. **Create Manager Reports page** (medium, MVP requirement)
4. **Add /activities list page** (low, UI completeness)
5. **Create user instruction manual** (required for final report - punkt 6 PDF)
   - Screenshots of phone contact registration form
   - Step-by-step guide for PH

## Notes
- Instructions per punkt 6 PDF: tylko ekran rejestracji kontaktu telefonicznego
- Kierownik nie ma wykształcenia informatycznego → prosty interfejs!
- Stack: Node.js selected over Deno (switch happened early)
- Database: PostgreSQL w Docker (port 5432)

---
**Last Updated**: 2025-10-12
**Project Status**: MVP Core Features Complete, Polish & Reports TODO
