import * as crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'; // 32 bytes for AES-256
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a string using AES-256-CBC.
 */
export function encrypt(text: string): string {
    if (!text) return text;
    // If it's already an encrypted string (contains :), don't double-encrypt
    if (text.includes(':') && text.split(':')[0].length === 32) return text;

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        // Store as ivHex:encryptedDataHex
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (err) {
        console.error('Encryption failed:', err);
        return text;
    }
}

/**
 * Decrypts a string using AES-256-CBC.
 */
export function decrypt(text: string): string {
    if (!text) return text;

    try {
        const textParts = text.split(':');
        if (textParts.length !== 2) return text; // If not in expected format, return plain text

        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedText = Buffer.from(textParts[1], 'hex');

        // Safety check for valid IV size
        if (iv.length !== IV_LENGTH) return text;

        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (err) {
        // If decryption fails (e.g., wrong key, corrupted data), return as is or handle gently
        // For production, returning [ENCRYPTED] or masking might be safer, but returning plain is fail-safe during migration.
        return text;
    }
}
