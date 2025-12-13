// ============================================================================
// EXPORT WSZYSTKIEGO
// ============================================================================

// Domain
export type {
  Address,
  Client,
  ClientMetadata as NewClient,
  ClientSummary,
  StatusKlienta,
} from "./domain.ts";

// Database
export type { DbClientSummaryRow as DbClientSummaryRow } from "./database.ts";

// Utils
export { isEmpty, nullToEmpty, undefinedToEmpty } from "./utils.ts";
