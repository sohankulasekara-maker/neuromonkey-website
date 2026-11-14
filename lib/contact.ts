/** Contact details used across the site. One place, so they never drift apart. */
export const EMAIL = "neuromonkey.ai@gmail.com";
export const PHONE_DISPLAY = "+94 77 124 5678";
export const PHONE_TEL = "+94771245678";
export const LOCATION = "Colombo, Sri Lanka";

const WHATSAPP_NUMBER = "94771245678";

/** A WhatsApp chat link, optionally with a message already typed in. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
