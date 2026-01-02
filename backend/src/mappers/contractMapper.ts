import {
  Contract,
  ContractDetails,
  ContractItem,
  ContractMetadata,
  ContractRelations,
  DbContract,
  DbContractItem,
  DbUpsertContract,
  StatusUmowy,
  TypUmowy,
  UpsertContract,
} from "../types/index.ts";

/**
 * Konwertuje surowy rekord pozycji umowy z bazy (DbContractItem) na strukturę ContractItem
 * @param dbItem - surowe dane pozycji z bazy
 * @returns ContractItem - zagnieżdżona struktura domenowa
 */
export function mapDbContractItemToContractItem(
  dbItem: DbContractItem,
): ContractItem {
  return {
    item_metadata: {
      id: dbItem.id,
    },
    product_info: {
      produkt_id: dbItem.produkt_id,
      nazwa: dbItem.nazwa_produktu,
      opis: dbItem.opis_produktu,
    },
    item_details: {
      ilosc: dbItem.ilosc,
      jednostka: dbItem.jednostka,
      cena_jednostkowa: dbItem.cena_jednostkowa,
      wartosc: dbItem.wartosc,
    },
  };
}

/**
 * Konwertuje surowy rekord z bazy (DbContract) oraz pozycje (DbContractItem[]) na strukturę Contract
 * @param dbContract - surowe dane umowy z bazy
 * @param dbItems - surowe dane pozycji umowy z bazy
 * @returns Contract - zagnieżdżona struktura domenowa
 */
export function mapDbContractToContract(
  dbContract: DbContract,
  dbItems: DbContractItem[] = [],
): Contract {
  const contractMetadata: ContractMetadata = {
    id: dbContract.id,
    created_at: dbContract.created_at,
  };

  const relations: ContractRelations = {
    klient_id: dbContract.klient_id,
    przedstawiciel_id: dbContract.przedstawiciel_id,
  };

  const details: ContractDetails = {
    typ_umowy: dbContract.typ_nazwa as TypUmowy,
    status: dbContract.status as StatusUmowy,
    data_od: dbContract.data_od,
    data_do: dbContract.data_do,
    wartosc_umowy: dbContract.wartosc_umowy,
  };

  const items: ContractItem[] = dbItems.map(mapDbContractItemToContractItem);

  return {
    contract_metadata: contractMetadata,
    relations: relations,
    details: details,
    items: items,
  };
}

/**
 * Mapuje UpsertContract na DbUpsertContract dla repository
 * @param request - request z zagnieżdżoną strukturą
 * @param typId - ID typu umowy z bazy (FK)
 * @param wartoscUmowy - obliczona wartość umowy z pozycji
 * @returns DbUpsertContract - płaska struktura dla INSERT i UPDATE do bazy
 */
export function mapUpsertContractToDbUpsertContract(
  request: UpsertContract,
  typId: number,
  wartoscUmowy: number,
): DbUpsertContract {
  return {
    klient_id: request.relations.klient_id,
    przedstawiciel_id: request.relations.przedstawiciel_id,
    typ_id: typId,
    status: request.details.status,
    data_od: request.details.data_od,
    data_do: request.details.data_do ?? "", // Opcjonalne - pusty string jeśli NULL
    wartosc_umowy: wartoscUmowy,
  };
}
