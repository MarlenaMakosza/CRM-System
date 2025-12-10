import type { ClientBase, Address } from "./domain.ts";

// ============================================================================
// REQUEST TYPES - wyprowadzone z ClientBase
// ============================================================================

/**
 * Request do utworzenia klienta
 *
 * Wymagane: nip, nazwa_firmy, email, status_kod
 * Opcjonalne: imie, nazwisko, stanowisko, telefon (user może nie wysłać)
 */
export type CreateClientRequest =
  // Wymagane pola z ClientBase
  Pick<ClientBase, "nip" | "nazwa_firmy" | "email"> &
  // Opcjonalne pola z ClientBase (user może nie wysłać → undefined)
  Partial<Pick<ClientBase, "imie" | "nazwisko" | "stanowisko" | "telefon">> & {
    status_kod: string;
    adres: Address;
  };

/**
 * Request do aktualizacji klienta (wszystko opcjonalne)
 */
export type UpdateClientRequest = CreateClientRequest;

// ---------------------------------------------------------------------------
// HELPER - konwersja undefined → ""
// ---------------------------------------------------------------------------

/**
 * Konwertuje undefined z requestu na pusty string do bazy
 *
 * Użycie: toEmptyString(request.imie) → "" jeśli undefined
 */
export function toEmptyString(value: string | undefined): string {
  return value ?? "";
}
