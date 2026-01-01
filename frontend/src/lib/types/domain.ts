// ============================================================================
// ENCJE DOMENOWE - odzwierciedlają strukturę z backendu
// ============================================================================

export type StatusKlienta = "PROSPEKT" | "AKTYWNY" | "NIEAKTYWNY" | "VIP";

export type CompanyData = {
  nip: string;
  nazwa_firmy: string;
};

export type ContactData = {
  email: string;
  telefon: string;
};

export type AddressSummary = {
  kod_pocztowy: string;
  miejscowosc: string;
};

/**
 * ClientSummary - uproszczony widok klienta dla listy
 */
export type ClientSummary = {
  company_data: CompanyData;
  contact_data: ContactData;
  adres: AddressSummary;
  status_kod: StatusKlienta;
};
