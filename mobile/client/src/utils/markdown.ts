export type Block = { kind: 'text' | 'heading' | 'item' | 'quote' | 'code' | 'table'; text: string; level?: number; marker?: string; language?: string; rows?: string[][] };
export function markdownBlocks(input: string): Block[] {
  const lines = input.replace(/\r\n?/g, '\n').split('\n'); const blocks: Block[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]; if (!line.trim()) continue;
    const fence = /^\s*(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      const content: string[] = []; const close = new RegExp(`^\\s*${fence[1][0]}{${fence[1].length},}\\s*$`);
      while (++i < lines.length && !close.test(lines[i])) content.push(lines[i]);
      blocks.push({ kind: 'code', text: content.join('\n'), language: fence[2].trim() }); continue;
    }
    if (line.includes('|') && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i + 1] ?? '')) {
      const row = (value: string) => value.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
      const rows = [row(line)]; i++;
      while (i + 1 < lines.length && lines[i + 1].includes('|') && lines[i + 1].trim()) rows.push(row(lines[++i]));
      blocks.push({ kind: 'table', text: '', rows }); continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    const item = /^\s*([-*+] |\d+[.)] )(.+)$/.exec(line);
    const quote = /^>\s?(.*)$/.exec(line);
    if (heading) blocks.push({ kind: 'heading', text: heading[2], level: heading[1].length });
    else if (item) blocks.push({ kind: 'item', text: item[2], marker: /^\d/.test(item[1]) ? item[1].trim() : '•' });
    else if (quote) blocks.push({ kind: 'quote', text: quote[1] });
    else blocks.push({ kind: 'text', text: line });
  }
  return blocks;
}
export function safeLink(value: string): string | null {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !!url.hostname && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export type Inline = { text: string; style?: 'bold' | 'italic' | 'code' | 'link'; url?: string };
export function markdownInline(text: string): Inline[] {
  const result: Inline[] = []; const pattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|\[[^\]\n]+\]\([^\s)]+\))/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index! > cursor) result.push({ text: text.slice(cursor, match.index) });
    const value = match[0];
    if (value.startsWith('[')) {
      const end = value.indexOf(']('); const url = safeLink(value.slice(end + 2, -1));
      result.push({ text: value.slice(1, end), ...(url ? { style: 'link' as const, url } : {}) });
    } else if (value.startsWith('`')) result.push({ text: value.slice(1, -1), style: 'code' });
    else if (value.startsWith('**') || value.startsWith('__')) result.push({ text: value.slice(2, -2), style: 'bold' });
    else result.push({ text: value.slice(1, -1), style: 'italic' });
    cursor = match.index! + value.length;
  }
  if (cursor < text.length) result.push({ text: text.slice(cursor) });
  return result;
}
