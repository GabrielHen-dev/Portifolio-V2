// Cifra AES-256-GCM para segredos em repouso (TOTP).

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { env } from '../../config/env.js';

const KEY = Buffer.from(env.ENCRYPTION_KEY, 'hex');
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export class AesEncryptor {
  encrypt(plaintext: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv('aes-256-gcm', KEY, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return [iv.toString('base64url'), tag.toString('base64url'), ciphertext.toString('base64url')].join('.');
  }

  decrypt(payload: string): string {
    const parts = payload.split('.');
    if (parts.length !== 3) throw new Error('Payload cifrado malformado.');

    const [ivB64, tagB64, dataB64] = parts as [string, string, string];
    const iv = Buffer.from(ivB64, 'base64url');
    const tag = Buffer.from(tagB64, 'base64url');

    if (iv.length !== IV_LENGTH || tag.length !== TAG_LENGTH) {
      throw new Error('Payload cifrado malformado.');
    }

    const decipher = createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64url')), decipher.final()]).toString('utf8');
  }
}
