import { sql } from "db";

// Pobierz status_id po kodzie
export async function getStatusId(status_kod: string): Promise<number | null> {
  const statusRows = await sql`
    SELECT id FROM status_klienta
    WHERE kod = ${status_kod}
    LIMIT 1
  `;
  return statusRows.length > 0 ? statusRows[0].id : null;
}
