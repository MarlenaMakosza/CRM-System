import { Context } from "oak";
import { ErrorResponse } from "../types/index.ts";
import { InvalidInputError, ValidationError } from "./validation.ts";

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

/**
 * Błąd gdy klient nie został znaleziony w bazie
 */
export class ClientNotFoundError extends Error {
  constructor(public clientId: number) {
    super(`Client with id=${clientId} not found`);
    this.name = "ClientNotFoundError";
  }
}

/**
 * Błąd bazy danych - używany gdy PostgreSQL zwraca błąd
 */
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = "DatabaseError";
  }
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

/**
 * Główny handler błędów - mapuje błędy na odpowiednie HTTP response
 * Type-safe - używa instanceof zamiast porównywania stringów
 */
export function handleError(ctx: Context, error: unknown): void {
  // 404 - Client nie istnieje
  if (error instanceof ClientNotFoundError) {
    ctx.response.status = 404;
    ctx.response.body = {
      error: `Client with id: ${error.clientId} does not exist`,
    } satisfies ErrorResponse;
    return;
  }

  // 400 - Błąd walidacji (ValidationError z customowym statusCode)
  if (error instanceof ValidationError) {
    ctx.response.status = error.statusCode;
    ctx.response.body = {
      error: error.message,
    } satisfies ErrorResponse;
    return;
  }

  // 400 - Niepoprawny input (Invalid ID, zły format danych)
  if (error instanceof InvalidInputError) {
    ctx.response.status = 400;
    ctx.response.body = {
      error: error.message,
    } satisfies ErrorResponse;
    return;
  }

  // 500 - Błąd bazy danych
  if (error instanceof DatabaseError) {
    console.error("Database error:", error.originalError);
    ctx.response.status = 500;
    ctx.response.body = {
      error: "Database error occurred",
      details: error.message,
    } satisfies ErrorResponse;
    return;
  }

  // 500 - Nieobsłużony błąd (catch-all)
  console.error("Unhandled error:", error);
  ctx.response.status = 500;
  ctx.response.body = {
    error: "Internal server error",
  } satisfies ErrorResponse;
}
