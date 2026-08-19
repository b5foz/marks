const encoder = new TextEncoder();

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export const SESSION_COOKIE = 'marks_session';

export async function createSessionToken(days = 30): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(String(expiry)));
  return `${expiry}.${toBase64Url(sig)}`;
}

export async function verifySessionToken(value: string | undefined | null): Promise<boolean> {
  if (!value) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;

  const [expiryStr, sig] = value.split('.');
  if (!expiryStr || !sig) return false;

  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  const key = await getKey(secret);
  const expectedSig = await crypto.subtle.sign('HMAC', key, encoder.encode(expiryStr));
  return toBase64Url(expectedSig) === sig;
}