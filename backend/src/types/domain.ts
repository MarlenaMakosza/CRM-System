// ============================================================================
// ENCJE DOMENOWE - odzwierciedlają schemat bazy danych
// ============================================================================

/**
 * Adres - tabela `adres`
 * Zamiast null używamy pustego stringa ""
 */
export type Address = {
  id: number;
  ulica: string;
  numer_budynku: string;
  numer_lokalu: string;
  kod_pocztowy: string;
  miejscowosc: string;
  wojewodztwo: string;
};

/**
 * Klient - tabela `klient`
 * Zamiast null używamy pustego stringa ""
 */
export type ClientBase = {
  id: number;
  nip: string;
  nazwa_firmy: string;
  imie: string;
  nazwisko: string;
  stanowisko: string;
  email: string;
  telefon: string;
  adres_id: number;
  status_klienta_id: number;
  created_at: Date;
};

/**
 * Klient z pełnym adresem (z JOIN)
 */
export type Client = Omit<ClientBase, "adres_id" | "status_klienta_id"> & {
  adres: Address;
  status_kod: string; // z tabeli status_klienta
};
