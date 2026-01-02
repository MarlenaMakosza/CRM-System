import { UpsertContract } from "../types/index.ts";
import { ValidationError } from "./clientValidation.ts";

/**
 * Walidacja dla tworzenia i aktualizacji umowy
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export function validateUpsertContract(data: UpsertContract): void {
  // Walidacja relations
  if (!data.relations) {
    throw new ValidationError("Missing required field: relations");
  }

  if (!data.relations.klient_id || data.relations.klient_id <= 0) {
    throw new ValidationError("Invalid or missing field: relations.klient_id");
  }

  if (
    !data.relations.przedstawiciel_id ||
    data.relations.przedstawiciel_id <= 0
  ) {
    throw new ValidationError(
      "Invalid or missing field: relations.przedstawiciel_id",
    );
  }

  // Walidacja details
  if (!data.details) {
    throw new ValidationError("Missing required field: details");
  }

  if (!data.details.typ_nazwa || data.details.typ_nazwa.trim() === "") {
    throw new ValidationError("Missing or empty field: details.typ_nazwa");
  }

  if (!data.details.status || data.details.status.trim() === "") {
    throw new ValidationError("Missing or empty field: details.status");
  }

  if (!data.details.data_od || data.details.data_od.trim() === "") {
    throw new ValidationError("Missing or empty field: details.data_od");
  }

  // Walidacja pozycji umowy (jeśli są)
  if (data.items && data.items.length > 0) {
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];

      if (!item.produkt_id || item.produkt_id <= 0) {
        throw new ValidationError(
          `Invalid or missing field: items[${i}].produkt_id`,
        );
      }

      if (!item.ilosc || item.ilosc <= 0) {
        throw new ValidationError(
          `Invalid or missing field: items[${i}].ilosc (must be > 0)`,
        );
      }

      if (!item.jednostka || item.jednostka.trim() === "") {
        throw new ValidationError(
          `Missing or empty field: items[${i}].jednostka`,
        );
      }

      if (!item.cena_jednostkowa || item.cena_jednostkowa <= 0) {
        throw new ValidationError(
          `Invalid or missing field: items[${i}].cena_jednostkowa (must be > 0)`,
        );
      }
    }
  }
}
