import { sql } from "db";
import {
  CreateClientRequest,
  UpdateClientRequest,
} from "../requests/clientRequests.ts";

// Custom error class
export class ValidationError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "ValidationError";
  }
}

// Walidacja ID
export function validateId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid ID");
  }
}

// Sprawdź czy NIP już istnieje
async function checkNipExists(
  nip: string,
  excludeId?: number,
): Promise<boolean> {
  if (excludeId) {
    const result = await sql`
      SELECT id FROM klient WHERE nip = ${nip} AND id != ${excludeId} LIMIT 1
    `;
    return result.length > 0;
  }

  const result = await sql`
    SELECT id FROM klient WHERE nip = ${nip} LIMIT 1
  `;
  return result.length > 0;
}

// Pobierz status_id po kodzie
async function getStatusId(status_kod: string): Promise<number | null> {
  const statusRows = await sql`
    SELECT id FROM status_klienta
    WHERE kod = ${status_kod}
    LIMIT 1
  `;
  return statusRows.length > 0 ? statusRows[0].id : null;
}

// Walidacja formatów dla CreateClientRequest
function validateCreateClientRequest(data: CreateClientRequest): void {
  // Wymagane pola
  if (
    !data.nip || !data.nazwa_firmy || !data.email || !data.status_kod ||
    !data.adres
  ) {
    throw new ValidationError("Missing required fields");
  }

  // Format NIP (10 cyfr)
  if (!/^\d{10}$/.test(data.nip)) {
    throw new ValidationError("NIP must be 10 digits");
  }

  // Format email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new ValidationError("Invalid email format");
  }

  // Format kodu pocztowego (XX-XXX)
  if (!/^\d{2}-\d{3}$/.test(data.adres.kod_pocztowy)) {
    throw new ValidationError("Invalid postal code format (XX-XXX)");
  }
}

// Walidacja dla tworzenia klienta (POST)
export async function validateClientForCreation(
  data: CreateClientRequest,
): Promise<void> {
  // Walidacja formatów
  validateCreateClientRequest(data);

  // Sprawdź duplikat NIP
  if (await checkNipExists(data.nip)) {
    throw new ValidationError("Client with this NIP already exists", 409);
  }

  // Sprawdź czy status istnieje
  const statusId = await getStatusId(data.status_kod);
  if (!statusId) {
    throw new ValidationError("Unknown status_kod");
  }
}

// Walidacja dla aktualizacji klienta (PATCH)
export async function validateClientForUpdate(
  data: UpdateClientRequest,
  currentNip: string,
  clientId: number,
): Promise<void> {
  // Sprawdź czy body nie jest pusty
  if (!data || Object.keys(data).length === 0) {
    throw new ValidationError("Empty body");
  }

  // Jeśli zmienia NIP, sprawdź duplikat
  if (data.nip && data.nip !== currentNip) {
    if (await checkNipExists(data.nip, clientId)) {
      throw new ValidationError("Client with this NIP already exists", 409);
    }
  }

  // Jeśli podano status, sprawdź czy istnieje
  if (data.status_kod) {
    const statusId = await getStatusId(data.status_kod);
    if (!statusId) {
      throw new ValidationError("Unknown status_kod");
    }
  }
}
