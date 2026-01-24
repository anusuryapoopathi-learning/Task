/**
 * Extract username from email address
 * Example: "user@example.com" -> "user"
 */
export function getUsernameFromEmail(email: string): string {
  if (!email) return '';
  const parts = email.split('@');
  return parts[0] || '';
}

/**
 * Capitalize first letter of username
 * Example: "user" -> "User"
 */
export function capitalizeUsername(username: string): string {
  if (!username) return '';
  return username.charAt(0).toUpperCase() + username.slice(1);
}
