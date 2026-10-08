/** A missing/expired session is expected while entering as a new guest. */
export async function restoreSession<T>(read: () => Promise<T>, guest: () => Promise<void>, isUnauthorized: (error: unknown) => boolean, expired: () => void): Promise<T> {
  try { return await read(); }
  catch (error) { if (!isUnauthorized(error)) throw error; }
  expired();
  await guest();
  return read();
}
