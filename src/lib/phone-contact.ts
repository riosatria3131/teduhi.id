export function getPhoneHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `tel:${trimmed.startsWith("+") ? "+" : ""}${digits}`;
}
