import { sql } from "./db.ts";

async function seed() {
  console.log("➡️ Adding seed data...");

  // status klienta
  const insertedStatus = await sql`
    INSERT INTO status_klienta (kod, nazwa)
    VALUES ('AKTYWNY', 'Aktywny klient')
    RETURNING id
  `;
  const statusId = insertedStatus[0].id;

  // adres
  const insertedAddress = await sql`
    INSERT INTO adres (
      ulica, numer_budynku, numer_lokalu, kod_pocztowy, miejscowosc, wojewodztwo
    )
    VALUES (
      'Nowa', '12A', NULL, '65-100', 'Zielona Góra', 'Lubuskie'
    )
    RETURNING id
  `;
  const adresId = insertedAddress[0].id;

  // klient powiązany z wyżej
  await sql`
    INSERT INTO klient (
      nip, nazwa_firmy, imie, nazwisko, stanowisko,
      email, telefon, adres_id, status_klienta_id
    )
    VALUES (
      '1234567890',
      'Warzywniak Marlenki',
      'Marek',
      'Kowalski',
      'Właściciel',
      'kontakt@warzywniak.pl',
      '123456789',
      ${adresId},
      ${statusId}
    )
  `;

  console.log("✔️ Seed inserted successfully.");
  await sql.end();
}

await seed();