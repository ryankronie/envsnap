import * as crypto from 'crypto';
import { EnvSnapshot } from './types';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export function deriveKey(passphrase: string, salt: Buffer): Buffer {
  return crypto.scryptSync(passphrase, salt, KEY_LENGTH);
}

export function encryptSnapshot(snapshot: EnvSnapshot, passphrase: string): string {
  const salt = crypto.randomBytes(16);
  const key = deriveKey(passphrase, salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const plaintext = JSON.stringify(snapshot);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  const payload = Buffer.concat([salt, iv, tag, encrypted]);
  return payload.toString('base64');
}

export function decryptSnapshot(encoded: string, passphrase: string): EnvSnapshot {
  const payload = Buffer.from(encoded, 'base64');

  const salt = payload.subarray(0, 16);
  const iv = payload.subarray(16, 16 + IV_LENGTH);
  const tag = payload.subarray(16 + IV_LENGTH, 16 + IV_LENGTH + TAG_LENGTH);
  const encrypted = payload.subarray(16 + IV_LENGTH + TAG_LENGTH);

  const key = deriveKey(passphrase, salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8')) as EnvSnapshot;
}

export function isEncryptedPayload(content: string): boolean {
  try {
    const buf = Buffer.from(content, 'base64');
    return buf.length > 48;
  } catch {
    return false;
  }
}
