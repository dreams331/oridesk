/**
 * Masks a customer name for agent view
 * e.g. "John Doe" → "John D."
 */
export function maskName(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0) + "***";
  return parts[0] + " " + parts[parts.length - 1].charAt(0) + ".";
}

/**
 * Masks a customer email for agent view
 * e.g. "john.doe@gmail.com" → "j***@gmail.com"
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***.***";
  return local.charAt(0) + "***@" + domain;
}

/**
 * Masks a phone number for agent view
 * e.g. "+447911123456" → "+44****3456"
 */
export function maskPhone(phone: string): string {
  if (phone.length < 6) return "****";
  return phone.slice(0, 3) + "****" + phone.slice(-4);
}

/**
 * Generates a ticket reference number
 */
export function generateTicketRef(): string {
  const prefix = "OD";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
