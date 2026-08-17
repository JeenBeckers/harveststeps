/** Gedeelde regels voor de optionele afbeelding bij een nieuw verbetervoorstel. */

export const IMAGE_UPLOAD_FLAG_KEY = "afbeelding-uploaden-bij-nieuw-verbetervoorstel-mswv468w";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/gif"] as const;

/** Voor het `accept`-attribuut van de file input. */
export const IMAGE_ACCEPT = ALLOWED_IMAGE_MIME_TYPES.join(",");

export const IMAGE_TYPE_ERROR = "Alleen jpg, jpeg, png of gif zijn toegestaan.";
export const IMAGE_SIZE_ERROR = "De afbeelding mag maximaal 5 MB zijn.";

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((b, i) => bytes[i] === b);
}

/**
 * Leidt het formaat af uit de eerste bytes in plaats van uit het door de browser
 * meegestuurde content-type, zodat een verkeerd gelabeld bestand niet als afbeelding
 * wordt opgeslagen en later teruggeserveerd.
 */
export function detectImageMime(bytes: Uint8Array): (typeof ALLOWED_IMAGE_MIME_TYPES)[number] | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61])) return "image/gif";
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])) return "image/gif";
  return null;
}
