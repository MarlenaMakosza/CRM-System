import { sql } from "db";
import {
  DbContract,
  DbContractItem,
  DbUpsertContract,
} from "../types/database.ts";
import { UpsertContractItem } from "../types/index.ts";
import { ContractNotFoundError } from "../utils/errorHandler.ts";

/**
 * Pobierz listę wszystkich umów
 * @param {number} [przedstawicielId] - opcjonalny filtr po ID przedstawiciela (dla pracowników)
 * @returns {Promise<DbContract[]>} - lista wszystkich umów
 */
export function getAllContracts(
  przedstawicielId?: number,
): Promise<DbContract[]> {
  if (przedstawicielId !== undefined) {
    // Filtruj umowy tylko dla konkretnego przedstawiciela
    return sql<DbContract[]>`
      SELECT
        u.id, u.klient_id, u.przedstawiciel_id, u.typ_id,
        u.status,
        u.data_od::TEXT AS data_od,
        COALESCE(u.data_do::TEXT, '') AS data_do,
        u.created_at::TEXT AS created_at,
        u.wartosc_umowy,
        t.nazwa AS typ_nazwa
      FROM umowa u
      JOIN typ_umowy t ON u.typ_id = t.id
      WHERE u.przedstawiciel_id = ${przedstawicielId}
      ORDER BY u.id DESC
    `;
  }

  // Bez filtra - wszystkie umowy (dla szefa)
  return sql<DbContract[]>`
    SELECT
      u.id, u.klient_id, u.przedstawiciel_id, u.typ_id,
      u.status,
      u.data_od::TEXT AS data_od,
      COALESCE(u.data_do::TEXT, '') AS data_do,
      u.created_at::TEXT AS created_at,
      u.wartosc_umowy,
      t.nazwa AS typ_nazwa
    FROM umowa u
    JOIN typ_umowy t ON u.typ_id = t.id
    ORDER BY u.id DESC
  `;
}

/**
 * Pobierz umowę po jej ID
 * @param {number} id - ID umowy
 * @returns {Promise<DbContract>} - surowe dane umowy z bazy
 * @throws Error gdy umowa nie istnieje
 */
export async function getContractById(id: number): Promise<DbContract> {
  const contracts = await sql<DbContract[]>`
    SELECT
      u.id, u.klient_id, u.przedstawiciel_id, u.typ_id,
      u.status,
      u.data_od::TEXT AS data_od,
      COALESCE(u.data_do::TEXT, '') AS data_do,
      u.created_at::TEXT AS created_at,
      u.wartosc_umowy,
      t.nazwa AS typ_nazwa
    FROM umowa u
    JOIN typ_umowy t ON u.typ_id = t.id
    WHERE u.id = ${id}
    LIMIT 1
  `;

  if (contracts.length === 0) {
    throw new ContractNotFoundError(id);
  }

  return contracts[0];
}

/**
 * Pobierz pozycje umowy dla danej umowy
 * @param {number} umowaId - ID umowy
 * @returns {Promise<DbContractItem[]>} - lista pozycji umowy
 */
export function getContractItems(
  umowaId: number,
): Promise<DbContractItem[]> {
  return sql<DbContractItem[]>`
    SELECT
      p.id, p.umowa_id, p.produkt_id,
      p.ilosc, p.jednostka, p.cena_jednostkowa, p.wartosc,
      prod.nazwa AS nazwa_produktu,
      COALESCE(prod.opis, '') AS opis_produktu
    FROM pozycja_umowy p
    JOIN produkt prod ON p.produkt_id = prod.id
    WHERE p.umowa_id = ${umowaId}
    ORDER BY p.id ASC
  `;
}

/**
 * Pobierz ID typu umowy po nazwie
 * @param {string} typNazwa - nazwa typu umowy
 * @returns {Promise<number>} - ID typu umowy
 * @throws Error gdy typ nie istnieje
 */
export async function getTypUmowyId(typNazwa: string): Promise<number> {
  const result = await sql<{ id: number }[]>`
    SELECT id FROM typ_umowy WHERE nazwa = ${typNazwa} LIMIT 1
  `;

  if (result.length === 0) {
    throw new Error(`Contract type '${typNazwa}' not found`);
  }

  return result[0].id;
}

/**
 * Sprawdź czy klient istnieje
 * @param {number} klientId - ID klienta
 * @returns {Promise<boolean>} - true jeśli klient istnieje
 */
export async function clientExists(klientId: number): Promise<boolean> {
  const result = await sql<{ id: number }[]>`
    SELECT id FROM klient WHERE id = ${klientId} LIMIT 1
  `;

  return result.length > 0;
}

/**
 * Sprawdź czy przedstawiciel istnieje
 * @param {number} przedstawicielId - ID przedstawiciela
 * @returns {Promise<boolean>} - true jeśli przedstawiciel istnieje
 */
export async function przedstawicielExists(
  przedstawicielId: number,
): Promise<boolean> {
  const result = await sql<{ id: number }[]>`
    SELECT id FROM przedstawiciel_handlowy WHERE id = ${przedstawicielId} LIMIT 1
  `;

  return result.length > 0;
}

/**
 * Sprawdź czy produkt istnieje
 * @param {number} produktId - ID produktu
 * @returns {Promise<boolean>} - true jeśli produkt istnieje
 */
export async function productExists(produktId: number): Promise<boolean> {
  const result = await sql<{ id: number }[]>`
    SELECT id FROM produkt WHERE id = ${produktId} LIMIT 1
  `;

  return result.length > 0;
}

/**
 * Dodaj nową umowę do bazy
 * @param {DbUpsertContract} contract - dane nowej umowy
 * @returns {Promise<number>} - ID utworzonej umowy
 */
export async function insertContract(
  contract: DbUpsertContract,
): Promise<number> {
  // Konwersja pustego stringa na NULL dla data_do
  const dataDo = contract.data_do || null;

  const result = await sql<{ id: number }[]>`
    INSERT INTO umowa (
      klient_id, przedstawiciel_id, typ_id,
      status, data_od, data_do, wartosc_umowy
    ) VALUES (
      ${contract.klient_id}, ${contract.przedstawiciel_id}, ${contract.typ_id},
      ${contract.status}, ${contract.data_od}, ${dataDo}, ${contract.wartosc_umowy}
    )
    RETURNING id
  `;

  return result[0].id;
}

/**
 * Dodaj pozycje umowy do bazy
 * @param {number} umowaId - ID umowy
 * @param {UpsertContractItem[]} items - dane pozycji umowy
 * @returns {Promise<void>}
 */
export async function insertContractItems(
  umowaId: number,
  items: UpsertContractItem[],
): Promise<void> {
  // Wstawiamy każdą pozycję osobno
  for (const item of items) {
    await sql`
      INSERT INTO pozycja_umowy (
        umowa_id, produkt_id, ilosc, jednostka, cena_jednostkowa
      ) VALUES (
        ${umowaId}, ${item.produkt_id}, ${item.ilosc},
        ${item.jednostka}, ${item.cena_jednostkowa}
      )
    `;
  }
}

/**
 * Aktualizuj umowę
 * @param {number} id - ID umowy
 * @param {DbUpsertContract} contract - pełne dane umowy
 * @returns {Promise<void>}
 */
export async function updateContract(
  id: number,
  contract: DbUpsertContract,
): Promise<void> {
  // Konwersja pustego stringa na NULL dla data_do
  const dataDo = contract.data_do || null;

  await sql`
    UPDATE umowa
    SET
      klient_id = ${contract.klient_id},
      przedstawiciel_id = ${contract.przedstawiciel_id},
      typ_id = ${contract.typ_id},
      status = ${contract.status},
      data_od = ${contract.data_od},
      data_do = ${dataDo},
      wartosc_umowy = ${contract.wartosc_umowy}
    WHERE id = ${id}
  `;
}

/**
 * Usuń pozycje umowy
 * @param {number} umowaId - ID umowy
 * @returns {Promise<void>}
 */
export async function deleteContractItems(umowaId: number): Promise<void> {
  await sql`DELETE FROM pozycja_umowy WHERE umowa_id = ${umowaId}`;
}