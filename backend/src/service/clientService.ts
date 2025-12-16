import * as clientRepo from "../repository/clientRepository.ts";
import {
  createClientRequestToNewAddress as mapToNewAddress,
  createClientRequestToNewClient as mapToNewClient,
  dbClientDetailsToClient,
  dbClientToClientSummary,
} from "../mappers/clientMapper.ts";

import { Client, ClientSummary, CreateClient } from "../types/index.ts";
import { validateId } from "../utils/validation.ts";
import { validateCreateClient } from "../utils/validation.ts";

/**
 * Pobierz listę wszystkich klientów
 * @returns {Promise<ClientSummary[]>} - lista wszystkich klientów
 */
export async function listClients(): Promise<ClientSummary[]> {
  const dbClients = await clientRepo.getAllClients();
  return dbClients.map(dbClientToClientSummary);
}

/**
 * Pobierz pełne dane klienta o podanym ID
 * @param {number} id - ID klienta
 * @returns {Promise<Client>} - pełne dane klienta
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 * @throws {ClientNotFoundError} gdy klient nie istnieje
 */
export async function getClientDetails(id: number): Promise<Client> {
  validateId(id);
  const dbClient = await clientRepo.getClientById(id);
  return dbClientDetailsToClient(dbClient);
}

/**
 * Tworzy nowego klienta w systemie
 * @param {CreateClientRequest} request - dane nowego klienta (zagnieżdżona struktura)
 * @returns {Promise<Client>} - utworzony klient w pełnej strukturze domenowej
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export async function createClient(
  request: CreateClient,
): Promise<Client> {
  // 1. Walidacja
  await validateCreateClient(request);

  // 2. Pobierz status_klienta_id
  const statusId = await clientRepo.getStatusId(request.status_kod);

  // 3. Utwórz adres
  const newAddress = mapToNewAddress(request);
  const adresId = await clientRepo.createAddress(newAddress);

  // 4. Utwórz klienta
  const newClient = mapToNewClient(request, adresId, statusId);
  const clientId = await clientRepo.createClient(newClient);

  // 5. Pobierz utworzonego klienta z bazy i zmapuj na domenowy typ Client
  const dbClient = await clientRepo.getClientById(clientId);

  // 6. Użyj istniejącego mappera!
  return dbClientDetailsToClient(dbClient);
}

// export async function updateClient(
//   id: number,
//   newData: Partial<Client>,
// ): Promise<Client> {
//   const oldData = await clientRepo.getClientById(id);

//   // Merge danych przed walidacją
//   const mergedAddress: Address = {
//     id: oldData.adres.id,
//     ulica: newData.adres?.ulica ?? oldData.adres.ulica,
//     numer_budynku: newData.adres?.numer_budynku ?? oldData.adres.numer_budynku,
//     numer_lokalu: newData.adres?.numer_lokalu ?? oldData.adres.numer_lokalu,
//     kod_pocztowy: newData.adres?.kod_pocztowy ?? oldData.adres.kod_pocztowy,
//     miejscowosc: newData.adres?.miejscowosc ?? oldData.adres.miejscowosc,
//     wojewodztwo: newData.adres?.wojewodztwo ?? oldData.adres.wojewodztwo,
//   };

//   const mergedClientData: Client = {
//     id: oldData.id,
//     nip: oldData.nip,
//     nazwa_firmy: newData.nazwa_firmy ?? oldData.nazwa_firmy,
//     imie: newData.imie ?? oldData.imie,
//     nazwisko: newData.nazwisko ?? oldData.nazwisko,
//     stanowisko: newData.stanowisko ?? oldData.stanowisko,
//     email: newData.email ?? oldData.email,
//     telefon: newData.telefon ?? oldData.telefon,
//     created_at: oldData.created_at,
//     status_kod: newData.status_kod ?? oldData.status_kod,
//     adres: mergedAddress,
//   };

//   if (newData.nip && newData.nip !== oldData.nip) {
//     throw new ValidationError("NIP cannot be changed", 400);
//   }

//   // Waliduj POŁĄCZONE dane (wszystkie pola wypełnione)
//   await validateUpdateClient(mergedClientData);

//   const statusId: number = await clientRepo.getStatusId(
//     mergedClientData.status_kod,
//   );

//   const mergedClient: NewClient = {
//     nip: mergedClientData.nip,
//     nazwa_firmy: mergedClientData.nazwa_firmy,
//     imie: mergedClientData.imie,
//     nazwisko: mergedClientData.nazwisko,
//     stanowisko: mergedClientData.stanowisko,
//     email: mergedClientData.email,
//     telefon: mergedClientData.telefon,
//     adres_id: oldData.adres.id,
//     status_klienta_id: statusId,
//   };

//   await clientRepo.updateAddress(mergedAddress);
//   await clientRepo.updateClient(id, mergedClient);

//   return await clientRepo.getClientById(id);
// }

// export async function removeClient(id: number): Promise<boolean> {
//   return await clientRepo.deleteClient(id);
// }
