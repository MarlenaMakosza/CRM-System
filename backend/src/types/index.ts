// ============================================================================
// EXPORT WSZYSTKIEGO
// ============================================================================

// Domain - Clients
export type {
  Address,
  Client,
  ClientMetadata,
  CompanyData,
  ContactData,
  ContactPerson,
  CreateClient,
  StatusKlienta,
  UpdateClient,
} from "./clients.ts";

// Auth
export type {
  AuthUser,
  CustomJwtPayload,
  LoginRequest,
  LoginResponse,
  RolaPracownika,
} from "./auth.ts";

// Database
export type {
  DbClient,
  NewAddress,
  NewClient,
  DbPrzedstawiciel,
} from "./database.ts";

// Errors
export type { ErrorResponse } from "./errors.ts";
