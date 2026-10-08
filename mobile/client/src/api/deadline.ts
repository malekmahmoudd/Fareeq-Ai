export class ConnectionTimeout extends Error {
  constructor() {
    super('The backend is taking too long to respond. Try connecting again in a moment.');
    this.name = 'ConnectionTimeout';
  }
}

// Bound the full operation, including response-body reads. Never replay a mutation.
export async function withDeadline<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  milliseconds: number,
  parent?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let rejectCancellation: (reason: Error) => void = () => {};
  const cancellation = new Promise<never>((_, reject) => { rejectCancellation = reject; });
  function cancel(reason: Error) { controller.abort(); rejectCancellation(reason); }
  function abort() { cancel(new Error('The request was cancelled.')); }
  parent?.addEventListener('abort', abort, { once: true });
  try {
    if (parent?.aborted) abort();
    else timer = setTimeout(() => cancel(new ConnectionTimeout()), milliseconds);
    return await Promise.race([
      cancellation,
      controller.signal.aborted ? cancellation : operation(controller.signal),
    ]);
  } finally {
    clearTimeout(timer);
    parent?.removeEventListener('abort', abort);
  }
}
