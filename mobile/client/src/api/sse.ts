export interface StreamEvent { event: string; data: Record<string, unknown> }
// Incremental framing: network chunks can split JSON, UTF-8, or CRLF boundaries.
export class SSEParser {
  private buffer = '';
  push(chunk: string): StreamEvent[] {
    this.buffer += chunk;
    if (this.buffer.length > 2_000_000) throw new Error('The reply exceeded the supported size.');
    const output: StreamEvent[] = [];
    let match: RegExpExecArray | null;
    while ((match = /\r?\n\r?\n/.exec(this.buffer))) {
      const frame = this.buffer.slice(0, match.index);
      this.buffer = this.buffer.slice(match.index + match[0].length);
      const lines = frame.split(/\r?\n/);
      const event = lines.find(line => line.startsWith('event:'))?.slice(6).trim() ?? 'message';
      const data = lines.filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
      if (data) {
        const payload = JSON.parse(data);
        output.push({ event: typeof payload.type === 'string' ? payload.type : event, data: payload });
      }
    }
    return output;
  }
}
