/**
 * Simulates network delay for mocked API calls
 */
export function delay(ms: number = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
