// Shared only by administrative endpoints; never imported by the public viewer.
export async function authorized(request, secret) {
  if (!secret || secret.length < 32) return false;
  const candidate = request.headers.get('authorization') || '';
  if (!candidate.startsWith('Bearer ') || candidate.length > 256) return false;
  const enc = new TextEncoder();
  const [actual, expected] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(candidate.slice(7))),
    crypto.subtle.digest('SHA-256', enc.encode(secret))
  ]);
  return crypto.subtle.timingSafeEqual(actual, expected);
}
