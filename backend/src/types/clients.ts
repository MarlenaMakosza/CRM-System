import { type Address } from "./common.ts";

export type ClientListItem = {
  id: number;
  nip: string;
  nazwa_firmy: string;
  email: string;
  telefon: string | null;
  miejscowosc: string;
  kod_pocztowy: string;
  status_kod: string;
};

export type ClientDetail = {
  id: number;
  nip: string;
  nazwa_firmy: string;
  imie: string;
  nazwisko: string;
  stanowisko: string | null;
  email: string;
  telefon: string | null;
  status_kod: string;
  adres: Address;
};
