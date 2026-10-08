export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export interface Document { id: string; agent_id: string; shared: boolean; filename: string; status: 'processing' | 'ready' | 'failed'; error?: string; size_bytes: number; kind: string }
export interface Source { label: string; document_id: string; filename: string; page?: number | null }
export function validateDocument(name: string, size: number) {
  if (!Number.isFinite(size) || size <= 0) throw new Error('Choose a non-empty file.');
  if (size > MAX_DOCUMENT_BYTES) throw new Error('Choose a file of 10 MB or less.');
  if (!/\.(pdf|docx|txt|md|png|jpe?g|webp)$/i.test(name)) throw new Error('Choose a PDF, DOCX, TXT, Markdown, PNG, JPEG, or WebP file.');
}
export function toggleAttachment(ids: string[], doc: Document): string[] {
  if (ids.includes(doc.id)) return ids.filter(id => id !== doc.id);
  if (doc.status !== 'ready') throw new Error('Wait until this file is ready.');
  if (ids.length >= 5) throw new Error('Attach up to five files per message.');
  return [...ids, doc.id];
}
/** A system picker can background Android without interrupting an upload. */
export class UploadTask {
  private controller = new AbortController();
  private transferring = false;
  get signal() { return this.controller.signal; }
  startUpload() { if (this.signal.aborted) return false; this.transferring = true; return true; }
  background() { if (this.transferring) this.abort(); }
  abort() { this.controller.abort(); }
}
