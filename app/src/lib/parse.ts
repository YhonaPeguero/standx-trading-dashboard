import type { AccountMeta, LoadProgress, Trade } from '../types';
import { reconstructAccount } from './standx';

/**
 * Client-side file parsing. Reads uploaded .txt/.json/.csv files entirely in
 * the browser (Blob.text) — nothing is ever uploaded anywhere. The StandX
 * export is two JSON files (trade fills + orders) under a `{ result: [...] }`
 * envelope; we also accept NDJSON and CSV/TSV as fallbacks.
 */

type RawRecord = Record<string, unknown>;

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB per file
const MAX_FILES = 50;
const MAX_RECORDS = 500_000;

export const ACCEPT = '.txt,.json,.csv,.tsv,text/plain,application/json,text/csv';

export interface ParseResult {
  trades: Trade[];
  meta: AccountMeta;
  filesRead: number;
  recordsFound: number;
  parsedAnyFormat: boolean;
  skipped: string[];
}

/** Pull an array of records out of whatever JSON envelope StandX returns. */
function extractRows(body: unknown): RawRecord[] {
  if (Array.isArray(body)) return body as RawRecord[];
  if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>;
    for (const key of ['result', 'data', 'trades', 'orders', 'results', 'items', 'list', 'rows', 'records', 'history']) {
      const v = o[key];
      if (Array.isArray(v)) return v as RawRecord[];
      if (v && typeof v === 'object') {
        const inner = extractRows(v);
        if (inner.length) return inner;
      }
    }
  }
  return [];
}

// ---------- CSV ----------

function detectDelimiter(headerLine: string): string {
  if (headerLine.includes('\t')) return '\t';
  if (headerLine.includes(';') && !headerLine.includes(',')) return ';';
  return ',';
}

function splitCsvLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += c;
    } else if (c === '"') {
      quoted = true;
    } else if (c === delim) {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseCsv(text: string): RawRecord[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const delim = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delim);
  if (!headers.length || headers.every((h) => /^-?\d/.test(h))) return [];
  const rows: RawRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i], delim);
    if (cells.length === 1 && cells[0] === '') continue;
    const o: RawRecord = {};
    headers.forEach((h, j) => {
      o[h] = cells[j];
    });
    rows.push(o);
  }
  return rows;
}

function parseText(text: string): { records: RawRecord[]; ok: boolean } {
  const trimmed = text.trim();
  if (!trimmed) return { records: [], ok: false };

  try {
    const rows = extractRows(JSON.parse(trimmed));
    if (rows.length) return { records: rows, ok: true };
  } catch {
    /* not a single JSON document */
  }

  const lines = trimmed.split(/\r?\n/);
  const nd: RawRecord[] = [];
  let okLines = 0;
  let total = 0;
  for (const line of lines) {
    const l = line.trim();
    if (!l) continue;
    total++;
    try {
      const o = JSON.parse(l);
      okLines++;
      if (Array.isArray(o)) nd.push(...(o as RawRecord[]));
      else if (o && typeof o === 'object') nd.push(o as RawRecord);
    } catch {
      /* skip line */
    }
  }
  if (okLines > 0 && okLines >= total * 0.5 && nd.length) return { records: nd, ok: true };

  const csv = parseCsv(trimmed);
  if (csv.length) return { records: csv, ok: true };

  return { records: [], ok: false };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function parseFiles(
  files: File[],
  onProgress?: (p: LoadProgress) => void,
  signal?: AbortSignal,
): Promise<ParseResult> {
  const limited = files.slice(0, MAX_FILES);
  const records: RawRecord[] = [];
  const skipped: string[] = [];
  let parsedAnyFormat = false;
  let filesRead = 0;

  for (const file of limited) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    filesRead++;
    if (file.size > MAX_FILE_BYTES) {
      skipped.push(file.name);
      onProgress?.({ files: filesRead, rows: records.length });
      continue;
    }
    let text: string;
    try {
      text = await file.text();
    } catch {
      skipped.push(file.name);
      continue;
    }
    const { records: recs, ok } = parseText(text);
    if (ok) parsedAnyFormat = true;
    else skipped.push(file.name);
    for (const r of recs) {
      if (records.length >= MAX_RECORDS) break;
      records.push(r);
    }
    onProgress?.({ files: filesRead, rows: records.length });
    await sleep(50);
  }

  const { trades, meta } = reconstructAccount(records);

  return { trades, meta, filesRead, recordsFound: records.length, parsedAnyFormat, skipped };
}
