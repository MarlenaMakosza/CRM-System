// ============================================================================
// ERROR RESPONSE TYPES
// ============================================================================

/**
 * Standardowy format odpowiedzi błędu API
 * Używany we wszystkich endpointach przy zwracaniu błędów
 */
export type ErrorResponse = {
  error: string;
  details?: string;
};
