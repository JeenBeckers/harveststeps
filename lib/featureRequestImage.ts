/** Gedeelde regels voor de optionele afbeelding bij een nieuw verbetervoorstel. */

export const FEATURE_REQUEST_IMAGE_FLAG = "afbeelding-uploaden-bij-nieuw-verbetervoorstel-mswv468w";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/gif"] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

/** Waarde voor het `accept`-attribuut van de file input. */
export const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif";

export const IMAGE_TOO_LARGE_ERROR = "De afbeelding is groter dan 5 MB.";
export const IMAGE_TYPE_ERROR = "Alleen jpg, jpeg, png of gif zijn toegestaan.";

export function isAllowedImageMimeType(mimeType: string): mimeType is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

const ALLOWED_IMAGE_EXTENSIONS = /\.(jpe?g|png|gif)$/i;

/**
 * Controle in de browser vóór verzenden; de server valideert opnieuw op de bytes zelf.
 * Niet elke browser vult `type` betrouwbaar, dus de extensie telt ook mee.
 */
export function validateImageFile(file: File): string | null {
  if (file.size > MAX_IMAGE_BYTES) return IMAGE_TOO_LARGE_ERROR;
  if (!isAllowedImageMimeType(file.type) && !ALLOWED_IMAGE_EXTENSIONS.test(file.name)) return IMAGE_TYPE_ERROR;
  return null;
}

/**
 * Leidt het type af uit de eerste bytes. Het door de browser opgegeven mime type is
 * niet te vertrouwen, dus alleen dit resultaat wordt opgeslagen en teruggeserveerd.
 */
export function sniffImageMimeType(bytes: Uint8Array): AllowedImageMimeType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (bytes.length >= 6 && /^GIF8[79]a$/.test(String.fromCharCode(...bytes.subarray(0, 6)))) return "image/gif";
  return null;
}
