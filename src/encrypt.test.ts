import { encryptSnapshot, decryptSnapshot, isEncryptedPayload, deriveKey } from './encrypt';
import { EnvSnapshot } from './types';

const sample: EnvSnapshot = {
  name: 'test',
  createdAt: '2024-01-01T00:00:00.000Z',
  env: { API_KEY: 'secret123', NODE_ENV: 'production' },
};

describe('encrypt', () => {
  it('encrypts and decrypts a snapshot correctly', () => {
    const passphrase = 'my-secure-passphrase';
    const encoded = encryptSnapshot(sample, passphrase);
    const decoded = decryptSnapshot(encoded, passphrase);
    expect(decoded).toEqual(sample);
  });

  it('produces different ciphertext on each call', () => {
    const passphrase = 'same-pass';
    const a = encryptSnapshot(sample, passphrase);
    const b = encryptSnapshot(sample, passphrase);
    expect(a).not.toEqual(b);
  });

  it('throws on wrong passphrase', () => {
    const encoded = encryptSnapshot(sample, 'correct');
    expect(() => decryptSnapshot(encoded, 'wrong')).toThrow();
  });

  it('identifies encrypted payload', () => {
    const encoded = encryptSnapshot(sample, 'pass');
    expect(isEncryptedPayload(encoded)).toBe(true);
  });

  it('returns false for plain JSON string', () => {
    expect(isEncryptedPayload(JSON.stringify(sample))).toBe(false);
  });

  it('deriveKey produces consistent output for same inputs', () => {
    const salt = Buffer.alloc(16, 0);
    const k1 = deriveKey('passphrase', salt);
    const k2 = deriveKey('passphrase', salt);
    expect(k1.equals(k2)).toBe(true);
  });

  it('deriveKey produces different output for different passphrases', () => {
    const salt = Buffer.alloc(16, 1);
    const k1 = deriveKey('pass1', salt);
    const k2 = deriveKey('pass2', salt);
    expect(k1.equals(k2)).toBe(false);
  });
});
