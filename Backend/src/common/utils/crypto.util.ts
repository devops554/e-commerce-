import * as crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const ivLength = 16;

function getKey(): Buffer {
    const keyStr = process.env.ENCRYPTION_KEY;
    if (!keyStr) {
        throw new Error('ENCRYPTION_KEY is not defined in environment variables');
    }
    const key = Buffer.from(keyStr, 'hex');
    if (key.length !== 32) {
        throw new Error(`Invalid ENCRYPTION_KEY length: expected 32 bytes, got ${key.length} bytes`);
    }
    return key;
}

export function encrypt(text: string): string {
    if (!text) return text;
    const key = getKey();
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
    if (!text || !text.includes(':')) return text;
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = getKey();
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
