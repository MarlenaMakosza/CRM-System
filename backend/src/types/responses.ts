import type { ClientBase, Address } from "./domain.ts";

// ============================================================================
// RESPONSE TYPES - wyprowadzone z ClientBase
// ============================================================================

//TODO założyć, że wszystko not null i jak pusty string to user nie podał

/**
 * Klient w liście (uproszczony widok)
 */
export type ClientListResponse = Pick<
  ClientBase,
  "id" | "nip" | "nazwa_firmy" | "email" | "telefon"
> & {
  miejscowosc: string;
  kod_pocztowy: string;
  status_kod: string;
};

/**
 * Szczegóły klienta (pełny widok z adresem)
 */
export type ClientDetailResponse = Omit<
  ClientBase,
  "id" | "adres_id" | "status_klienta_id"
> & {
  status_kod: string;
  adres: Omit<Address, "id">;
};
