# System Rezerwacji Sal i Sprzętu

Backendowe REST API do zarządzania rezerwacjami sal i sprzętu (np. na uczelni).

## Opis

Aplikacja pozwala zalogowanym użytkownikom rezerwować dostępne zasoby (sale, sprzęt) na wybrany przedział czasowy. System automatycznie waliduje kolizje czasowe - nie da się zarezerwować tego samego zasobu na nakładające się terminy. Zarządzanie katalogiem zasobów (dodawanie/edycja/usuwanie) jest zarezerwowane dla administratorów, natomiast rezerwowanie jest dostępne dla każdego zalogowanego użytkownika.

## Funkcjonalności

- Rejestracja i logowanie użytkowników (JWT, hasła hashowane przez bcrypt)
- Role użytkowników: 'USER' i 'ADMIN', weryfikowane guardem na podstawie roli z tokenu
- CRUD dla zasobów (sal/sprzętu) - zarządzanie tylko dla adminów, przeglądanie publiczne
- CRUD dla rezerwacji - tworzenie i anulowanie dla zalogowanych użytkowników
- Automatyczna walidacja kolizji czasowych przy tworzeniu rezerwacji
- Ochrona przed anulowaniem cudzej rezerwacji
- Walidacja danych wejściowych przez class-validator i globalny ValidationPipe

## Stack technologiczny

- **NestJS** - framework backendowy
- **Prisma ORM** - dostęp do bazy danych i migracje
- **PostgreSQL** - baza danych (docker)
- **Passport + JWT** - autoryzacja
- **bcrypt** - hashowanie haseł
- **class-validator / class-transformer** - walidacja DTO

## Model danych

**User** - 'id', 'email' (unikalny), 'password' (hash), 'role' ('USER' | 'ADMIN'), 'createdAt'

**Resource** — 'id', 'name', 'type` ('ROOM' | 'EQUIPMENT'), 'location?', 'capacity?'

**Booking** — 'id', 'resourceId' -> Resource, 'userId' -> User, 'startTime', 'endTime', 'status' ('CONFIRMED' | 'CANCELLED'), 'purpose?', 'createdAt'

Relacje: jeden 'Resource' ma wiele 'Booking'; jeden 'User' ma wiele 'Booking'.

## Uruchomienie lokalnie

1. Zainstaluj zależności:
   ```bash
   npm install
   ```
2. Uruchom bazę PostgreSQL, np. w Dockerze:
   ```bash
   docker run --name rezerwacje-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=rezerwacje -p 5432:5432 -d postgres
   ```
3. Uzupełnij plik '.env':
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rezerwacje?schema=public"
   JWT_SECRET="twoj-sekret"
   EXPIRY_TIME_MS=3600000
   ```
4. Wykonaj migrację bazy danych:
   ```bash
   npx prisma migrate dev
   ```
5. Uruchom aplikację:
   ```bash
   npm run start:dev
   ```

Serwer wystartuje pod 'http://localhost:3000'.

## Endpointy API

### Autoryzacja

(POST) '/auth/register' - Rejestracja nowego użytkownika (dostęp Publiczny)
(POST) '/auth/login' - Logowanie, zwraca token JWT (dostęp Publiczny)

### Zasoby ('/resources')

(GET) '/resources' - Lista wszystkich zasobów (Publiczny)
(GET) '/resources/:id' - Szczegóły zasobu (Publiczny)
(POST) '/resources' - Dodanie zasobu (Tylko ADMIN)
(PATCH) '/resources/:id' - Edycja zasobu (Tylko ADMIN)
(DELETE) '/resources/:id' - Usunięcie zasobu (Tylko ADMIN)

### Rezerwacje ('/bookings')

(GET) '/bookings' - Lista wszystkich rezerwacji (Publiczny)
(GET) '/bookings/:id' - Szczegóły rezerwacji (Publiczny)
(POST) '/bookings' - Utworzenie rezerwacji (Zalogowany)
(PATCH) '/bookings/:id' - Edycja rezerwacji (Zalogowany)
(DELETE) '/bookings/:id' - Anulowanie własnej rezerwacji (Zalogowany (właściciel))

## Przykładowe zapytania

**Rejestracja:**
```json
POST /auth/register
{
  "email": "jan@przyklad.pl",
  "password": "haslo123"
}
```

**Logowanie:**
```json
POST /auth/login
{
  "email": "jan@przyklad.pl",
  "password": "haslo123"
}
```
Zwraca `{ "access_token": "..." }`. Token dołącza się jako nagłówek `Authorization: Bearer <token>` do zapytań wymagających autoryzacji.

**Utworzenie rezerwacji:**
```json
POST /bookings
{
  "resourceId": 1,
  "startTime": "2026-10-01T10:00:00.000Z",
  "endTime": "2026-10-01T12:00:00.000Z",
  "purpose": "Zajęcia z algorytmów"
}
```

## Logika walidacji kolizji

Przy tworzeniu rezerwacji backend sprawdza, czy dla danego zasobu istnieje już inna, potwierdzona (`CONFIRMED`) rezerwacja, której przedział czasowy nachodzi się na nowo tworzony (`istniejący.start < nowy.end` oraz `istniejący.end > nowy.start`). Jeśli tak, zwracany jest błąd `409 Conflict`.


## Zrzuty ekranu z testów

### Autoryzacja
Rejestracja:
![Rejestracja](images/register.png)
Logowanie:
![Logowanie](images/login.png)

### Zasoby

Próba dodania zasobu bez zalogowania - 401

![Próba dodania zasobu bez zalogowania - 401](images/resources_without_auth.png)

Dodanie zasobu po zalogowaniu - 201

![Dodanie zasobu po zalogowaniu - 201](images/resources_with_auth.png)

### Rezerwacje
Próba utworzenia rezerwacji bez zalogowania - 401

![Próba utworzenia rezerwacji bez zalogowania - 401](images/bookings_without_auth.png)

Utworzenie rezerwacji po zalogowaniu - 201

![Utworzenie rezerwacji po zalogowaniu - 201](images/bookings_with_auth.png)

Próba rezerwacji nakładającego się terminu - 409 Conflict

![Próba rezerwacji nakładającego się terminu - 409 Conflict](images/bookings_conflict.png)

Anulowanie własnej rezerwacji - 200

![Anulowanie własnej rezerwacji - 200](images/bookings_delete.png)

Próba anulowania cudzej rezerwacji - 403 Forbidden

![Próba anulowania cudzej rezerwacji - 403 Forbidden](images/bookings_delete_forbidden.png)


## Autor

Maciej Pieczykolan - projekt końcowy Wakacyjnego Wyzwania Solvro 2026.
