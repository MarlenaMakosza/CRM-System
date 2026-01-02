import * as contractRepo from "../repository/contractRepository.ts";
import {
  mapUpsertContractToDbUpsertContract,
  mapDbContractToContract,
} from "../mappers/contractMapper.ts";
import {
  Contract,
  UpsertContract,
} from "../types/index.ts";
import { validateId, ValidationError } from "../utils/clientValidation.ts";
import { validateUpsertContract } from "../utils/contractValidation.ts";

/**
 * Pobierz listę wszystkich umów
 * @param {number} [przedstawicielId] - opcjonalny filtr po ID przedstawiciela (dla pracowników)
 * @returns {Promise<Contract[]>} - lista wszystkich umów
 */
export async function listContracts(
  przedstawicielId?: number,
): Promise<Contract[]> {
  const dbContracts = await contractRepo.getAllContracts(przedstawicielId);

  // Dla każdej umowy pobierz jej pozycje
  const contracts: Contract[] = [];
  for (const dbContract of dbContracts) {
    const dbItems = await contractRepo.getContractItems(dbContract.id);
    contracts.push(mapDbContractToContract(dbContract, dbItems));
  }

  return contracts;
}

/**
 * Pobierz pełne dane umowy o podanym ID (wraz z pozycjami)
 * @param {number} id - ID umowy
 * @returns {Promise<Contract>} - pełne dane umowy
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 * @throws Error gdy umowa nie istnieje
 */
export async function getContractDetails(id: number): Promise<Contract> {
  validateId(id);
  const dbContract = await contractRepo.getContractById(id);
  const dbItems = await contractRepo.getContractItems(id);
  return mapDbContractToContract(dbContract, dbItems);
}

/**
 * Tworzy nową umowę w systemie
 * @param {UpsertContract} request - dane nowej umowy
 * @returns {Promise<Contract>} - utworzona umowa
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export async function createContract(
  request: UpsertContract,
): Promise<Contract> {
  // 1. Walidacja
  validateUpsertContract(request);

  // 2. Waliduj czy klient istnieje
  const clientExists = await contractRepo.clientExists(
    request.relations.klient_id,
  );
  if (!clientExists) {
    throw new ValidationError(
      `Client with id=${request.relations.klient_id} not found`,
    );
  }

  // 3. Waliduj czy przedstawiciel istnieje
  const przedstawicielExists = await contractRepo.przedstawicielExists(
    request.relations.przedstawiciel_id,
  );
  if (!przedstawicielExists) {
    throw new ValidationError(
      `Sales representative with id=${request.relations.przedstawiciel_id} not found`,
    );
  }

  // 4. Pobierz ID typu umowy
  const typId = await contractRepo.getTypUmowyId(request.details.typ_nazwa);

  // 5. Waliduj pozycje umowy jeśli są podane
  if (request.items && request.items.length > 0) {
    for (const item of request.items) {
      const productExists = await contractRepo.productExists(item.produkt_id);
      if (!productExists) {
        throw new ValidationError(
          `Product with id=${item.produkt_id} not found`,
        );
      }
    }
  }

  // 6. Oblicz wartość umowy z pozycji (jeśli są)
  let wartoscUmowy = 0;
  if (request.items && request.items.length > 0) {
    wartoscUmowy = request.items.reduce(
      (sum, item) => sum + item.ilosc * item.cena_jednostkowa,
      0,
    );
  }

  // 7. Mapuj request → DbUpsertContract
  const newContract = mapUpsertContractToDbUpsertContract(
    request,
    typId,
    wartoscUmowy,
  );

  // 8. Zapisz umowę w bazie
  const contractId = await contractRepo.insertContract(newContract);

  // 9. Jeśli są pozycje, dodaj je
  if (request.items && request.items.length > 0) {
    await contractRepo.insertContractItems(contractId, request.items);
  }

  // 10. Pobierz utworzoną umowę i zwróć w strukturze domenowej
  const dbContract = await contractRepo.getContractById(contractId);
  const dbItems = await contractRepo.getContractItems(contractId);
  return mapDbContractToContract(dbContract, dbItems);
}

/**
 * Aktualizuje umowę (PUT - pełna zamiana)
 * @param {number} id - ID umowy
 * @param {UpsertContract} request - pełne dane umowy
 * @returns {Promise<Contract>} - zaktualizowana umowa
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export async function updateContract(
  id: number,
  request: UpsertContract,
): Promise<Contract> {
  // 1. Waliduj ID
  validateId(id);

  // 2. Sprawdź czy umowa istnieje
  await contractRepo.getContractById(id);

  // 3. Waliduj request
  validateUpsertContract(request);

  // 4. Waliduj czy klient istnieje
  const clientExists = await contractRepo.clientExists(
    request.relations.klient_id,
  );
  if (!clientExists) {
    throw new ValidationError(
      `Client with id=${request.relations.klient_id} not found`,
    );
  }

  // 5. Waliduj czy przedstawiciel istnieje
  const przedstawicielExists = await contractRepo.przedstawicielExists(
    request.relations.przedstawiciel_id,
  );
  if (!przedstawicielExists) {
    throw new ValidationError(
      `Sales representative with id=${request.relations.przedstawiciel_id} not found`,
    );
  }

  // 6. Pobierz ID typu umowy
  const typId = await contractRepo.getTypUmowyId(request.details.typ_nazwa);

  // 7. Waliduj pozycje umowy jeśli są podane
  if (request.items && request.items.length > 0) {
    for (const item of request.items) {
      const productExists = await contractRepo.productExists(item.produkt_id);
      if (!productExists) {
        throw new ValidationError(
          `Product with id=${item.produkt_id} not found`,
        );
      }
    }
  }

  // 8. Oblicz wartość umowy z pozycji (jeśli są)
  let wartoscUmowy = 0;
  if (request.items && request.items.length > 0) {
    wartoscUmowy = request.items.reduce(
      (sum, item) => sum + item.ilosc * item.cena_jednostkowa,
      0,
    );
  }

  // 9. Mapuj request → DbUpsertContract
  const updatedContract = mapUpsertContractToDbUpsertContract(
    request,
    typId,
    wartoscUmowy,
  );

  // 10. Zaktualizuj umowę
  await contractRepo.updateContract(id, updatedContract);

  // 11. Usuń stare pozycje i dodaj nowe (PUT = pełna zamiana)
  await contractRepo.deleteContractItems(id);
  if (request.items && request.items.length > 0) {
    await contractRepo.insertContractItems(id, request.items);
  }

  // 12. Pobierz zaktualizowaną umowę
  const dbContract = await contractRepo.getContractById(id);
  const dbItems = await contractRepo.getContractItems(id);
  return mapDbContractToContract(dbContract, dbItems);
}
