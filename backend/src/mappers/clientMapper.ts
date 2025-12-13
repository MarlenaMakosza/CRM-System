// Mapper do konwersji między typami bazy danych a typami domenowymi

import {
  AddressSummary,
  ClientSummary,
  CompanyData,
  ContactData,
  StatusKlienta,
} from "../types/domain.ts";
import { DbClientSummaryRow } from "../types/database.ts";

/**
 * Konwertuje surowy rekord z bazy (DbClientListItem) na domenowy ClientSummary
 */
export function dbClientListItemToDomain(
  dbClient: DbClientSummaryRow,
): ClientSummary {
  const companyData: CompanyData = {
    nip: dbClient.nip,
    nazwa_firmy: dbClient.nazwa_firmy,
  };

  const contactData: ContactData = {
    email: dbClient.email,
    telefon: dbClient.telefon,
  };

  const adres: AddressSummary = {
    kod_pocztowy: dbClient.kod_pocztowy,
    miejscowosc: dbClient.miejscowosc,
  };

  return {
    company_data: companyData,
    contact_data: contactData,
    adres: adres,
    status_kod: dbClient.status_kod as StatusKlienta,
  };
}
