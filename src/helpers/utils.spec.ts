import {
  hashPasswordHelper,
  comparePasswordHelper,
  formatMediaField,
  resolveUrl,
  createPackageChecksum,
  verifyPackageChecksum,
} from './utils';

describe('hashPasswordHelper', () => {
  it('should return a non-empty string', async () => {
    const hash = await hashPasswordHelper('password123');
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe('string');
  });

  it('should not return the same value as the plain password', async () => {
    const hash = await hashPasswordHelper('password123');
    expect(hash).not.toBe('password123');
  });

  it('should return a different hash on each call (bcrypt salting)', async () => {
    const hash1 = await hashPasswordHelper('password123');
    const hash2 = await hashPasswordHelper('password123');
    expect(hash1).not.toBe(hash2);
  });

  it('should produce a hash verifiable by comparePasswordHelper', async () => {
    const plain = 'mySecurePassword!';
    const hash = await hashPasswordHelper(plain);
    const isMatch = await comparePasswordHelper(plain, hash);
    expect(isMatch).toBe(true);
  });
});

describe('comparePasswordHelper', () => {
  it('should return true for a matching password', async () => {
    const hash = await hashPasswordHelper('correctPassword');
    expect(await comparePasswordHelper('correctPassword', hash)).toBe(true);
  });

  it('should return false for a wrong password', async () => {
    const hash = await hashPasswordHelper('correctPassword');
    expect(await comparePasswordHelper('wrongPassword', hash)).toBe(false);
  });

  it('should return false for an empty password', async () => {
    const hash = await hashPasswordHelper('correctPassword');
    expect(await comparePasswordHelper('', hash)).toBe(false);
  });

  it('should return false when password differs by one character', async () => {
    const hash = await hashPasswordHelper('password123');
    expect(await comparePasswordHelper('password124', hash)).toBe(false);
  });
});

describe('formatMediaField', () => {
  it('should return empty array when given empty array', () => {
    const result = formatMediaField([], (url: string) => url);
    expect(result).toEqual([]);
  });

  it('should convert each media URL using the provided builder', () => {
    const media = [{ url: 'photo.jpg' }] as any[];
    const result = formatMediaField(media, (url: string) => `https://cdn.com/${url}`);
    expect(result[0].url).toBe('https://cdn.com/photo.jpg');
  });

  it('should preserve non-url fields of each media object', () => {
    const media = [{ url: 'photo.jpg', type: 'IMAGE', id: 1 }] as any[];
    const result = formatMediaField(media, (url: string) => url);
    expect(result[0].type).toBe('IMAGE');
    expect(result[0].id).toBe(1);
  });

  it('should not mutate the original media objects', () => {
    const media = [{ url: 'photo.jpg' }] as any[];
    const original = JSON.parse(JSON.stringify(media));
    formatMediaField(media, (url: string) => `https://cdn.com/${url}`);
    expect(media).toEqual(original);
  });
});

describe('resolveUrl', () => {
  it('should build a URL from host and single path segment', () => {
    expect(String(resolveUrl('https://api.com', 'users'))).toContain('api.com');
    expect(String(resolveUrl('https://api.com', 'users'))).toContain('users');
  });

  it('should strip trailing slash from host', () => {
    const result = String(resolveUrl('https://api.com/', 'users'));
    expect(result).toContain('users');
    expect(result).not.toContain('//users');
  });

  it('should join multiple path segments correctly', () => {
    const result = String(resolveUrl('https://api.com', 'users', '123', 'orders'));
    expect(result).toContain('users');
    expect(result).toContain('123');
    expect(result).toContain('orders');
  });

  it('should handle path segments with slashes', () => {
    const result = String(resolveUrl('https://api.com', '/users/'));
    expect(result).toContain('users');
  });
});

describe('createPackageChecksum', () => {
  const secret = 'test-secret-key';
  const payload = { orderId: 1, amount: 100000 };

  it('should return a non-empty hex string', () => {
    const checksum = createPackageChecksum(payload, secret);
    expect(checksum).toBeTruthy();
    expect(/^[a-f0-9]+$/i.test(checksum)).toBe(true);
  });

  it('should return the same checksum for identical payloads (deterministic)', () => {
    const c1 = createPackageChecksum(payload, secret);
    const c2 = createPackageChecksum(payload, secret);
    expect(c1).toBe(c2);
  });

  it('should return a different checksum when payload changes', () => {
    const c1 = createPackageChecksum(payload, secret);
    const c2 = createPackageChecksum({ orderId: 2, amount: 200000 }, secret);
    expect(c1).not.toBe(c2);
  });

  it('should throw an error when no secret is provided', () => {
    expect(() => createPackageChecksum(payload, '')).toThrow();
  });
});

describe('verifyPackageChecksum', () => {
  const secret = 'test-secret-key';
  const payload = { orderId: 1, amount: 100000 };

  it('should return true for a valid checksum', () => {
    const checksum = createPackageChecksum(payload, secret);
    expect(verifyPackageChecksum(payload, checksum, secret)).toBe(true);
  });

  it('should return false when payload is tampered', () => {
    const checksum = createPackageChecksum(payload, secret);
    expect(verifyPackageChecksum({ orderId: 1, amount: 999 }, checksum, secret)).toBe(false);
  });

  it('should return false when checksum is wrong', () => {
    expect(verifyPackageChecksum(payload, 'invalid-checksum', secret)).toBe(false);
  });
});
