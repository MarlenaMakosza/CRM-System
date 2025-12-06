import postgres from "npm:postgres";

const DB_HOST = Deno.env.get("DB_HOST") ?? "localhost";
const DB_PORT = Number(Deno.env.get("DB_PORT") ?? "5432");
const DB_USER = Deno.env.get("POSTGRES_USER") ?? "root";
const DB_PASSWORD = Deno.env.get("POSTGRES_PASSWORD") ?? "mysecretpassword";
const DB_NAME = Deno.env.get("POSTGRES_DB") ?? "crm";

export const sql = postgres({
  hostname: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});
