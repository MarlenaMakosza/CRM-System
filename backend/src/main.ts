import { sql } from "../../db/db.ts";


export function add(a: number, b: number): number {
  return a + b;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
console.log("Add 2 + 3 =", add(2, 3));

const result = await sql`
  SELECT ID, IMIE FROM KLIENT;
`;
console.log(result);