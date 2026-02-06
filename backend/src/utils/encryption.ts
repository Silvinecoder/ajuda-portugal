import crypto from "crypto";

const keyHex = process.env.ENCRYPTION_KEY;
if (!keyHex) throw new Error("ENCRYPTION_KEY is not set");
if (keyHex.length !== 64) throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex chars)");

export const ENCRYPTION_KEY = Buffer.from(keyHex, "hex");
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${tag}:${encrypted}`;
}

export function decrypt(encrypted?: string | null): string | null {
  if (!encrypted) return null;
  const parts = encrypted.split(":");
  if (parts.length !== 3) return null;

  const [ivHex, tagHex, encryptedText] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
