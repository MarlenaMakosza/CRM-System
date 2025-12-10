// ============================================================================
// UTILITIES - pomocnicze funkcje
// ============================================================================

/**
 * Zamienia null na pusty string
 */
export function nullToEmpty(value: string | null | undefined): string {
  return value ?? "";
}

/**
 * Zamienia undefined na pusty string
 */
export function undefinedToEmpty(value: string | undefined): string {
  return value ?? "";
}

/**
 * Sprawdza czy string jest pusty
 */
export function isEmpty(value: string): boolean {
  return value.trim() === "";
}
