import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AccountMeta, ErrorType, Lang, LoadProgress, Range, Trade, View } from './types';
import { strings } from './i18n';
import { computeStats, cumulativeSeries, filterByRange } from './lib/stats';
import { parseFiles } from './lib/parse';
import { generateDemo } from './lib/standx';
import { buildExport, buildSummary, triggerDownload } from './lib/export';
import TopBar from './components/TopBar';
import EmptyState from './components/EmptyState';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import Dashboard from './components/Dashboard';
import ShareCard from './components/ShareCard';
import Toast from './components/Toast';

interface Props {
  defaultLang?: Lang;
}

export default function App({ defaultLang = 'es' }: Props) {
  const [lang, setLang] = useState<Lang>(defaultLang);
  const [view, setView] = useState<View>('empty');
  const [files, setFiles] = useState<File[]>([]);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [meta, setMeta] = useState<AccountMeta | null>(null);
  const [range, setRange] = useState<Range>('all');
  const [errorType, setErrorType] = useState<ErrorType>('empty');
  const [progress, setProgress] = useState<LoadProgress>({ files: 0, rows: 0 });
  const [shareOpen, setShareOpen] = useState(false);
  const [notice, setNotice] = useState<{ text: string; visible: boolean }>({ text: '', visible: false });

  const abortRef = useRef<AbortController | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);

  const t = strings(lang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      window.clearTimeout(noticeTimer.current);
    };
  }, []);

  const showNotice = useCallback((text: string) => {
    window.clearTimeout(noticeTimer.current);
    setNotice({ text, visible: true });
    noticeTimer.current = window.setTimeout(() => setNotice((n) => ({ ...n, visible: false })), 2200);
  }, []);

  const onAddFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}|${f.size}|${f.lastModified}`));
      const merged = [...prev];
      for (const f of incoming) {
        const key = `${f.name}|${f.size}|${f.lastModified}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(f);
        }
      }
      return merged;
    });
  }, []);

  const onRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const onClear = useCallback(() => setFiles([]), []);

  const onAnalyze = useCallback(async () => {
    if (!files.length) return;
    setProgress({ files: 0, rows: 0 });
    setView('loading');

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const result = await parseFiles(files, (p) => setProgress(p), ac.signal);
      if (ac.signal.aborted) return;
      if (result.trades.length) {
        setAllTrades(result.trades);
        setMeta(result.meta);
        setRange('all');
        setView('dashboard');
      } else {
        setErrorType(result.parsedAnyFormat ? 'empty' : 'format');
        setView('error');
      }
    } catch (err) {
      if (ac.signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) return;
      setErrorType('format');
      setView('error');
    }
  }, [files]);

  const onTryDemo = useCallback(() => {
    abortRef.current?.abort();
    const demo = generateDemo('winning');
    setAllTrades(demo.trades);
    setMeta(demo.meta);
    setRange('all');
    setView('dashboard');
  }, []);

  const onReset = useCallback(() => {
    abortRef.current?.abort();
    setView('empty');
    setFiles([]);
    setAllTrades([]);
    setMeta(null);
    setErrorType('empty');
    setRange('all');
    setShareOpen(false);
  }, []);

  const filtered = useMemo(() => filterByRange(allTrades, range), [allTrades, range]);
  const stats = useMemo(() => computeStats(filtered), [filtered]);

  const downloadJson = useCallback(() => {
    try {
      const blob = new Blob([JSON.stringify(buildExport(filtered, stats, range), null, 2)], {
        type: 'application/json',
      });
      triggerDownload(blob, 'standx_stats.json');
      showNotice(t.jsonDownloaded);
    } catch {
      /* ignore */
    }
  }, [filtered, stats, range, t.jsonDownloaded, showNotice]);

  const copySummary = useCallback(() => {
    const text = buildSummary(stats, lang);
    navigator.clipboard?.writeText(text).catch(() => {});
    showNotice(t.summaryCopied);
  }, [stats, lang, t.summaryCopied, showNotice]);

  return (
    <div className="app">
      <div className="shell">
        <TopBar lang={lang} onSetLang={setLang} showDisconnect={view === 'dashboard'} onReset={onReset} t={t} />

        <main>
          {view === 'empty' && (
            <EmptyState
              t={t}
              files={files}
              onAddFiles={onAddFiles}
              onRemoveFile={onRemoveFile}
              onClear={onClear}
              onAnalyze={onAnalyze}
              onTryDemo={onTryDemo}
            />
          )}

          {view === 'loading' && <LoadingState t={t} progress={progress} />}

          {view === 'error' && <ErrorState t={t} errorType={errorType} onReset={onReset} />}

          {view === 'dashboard' && (
            <Dashboard
              t={t}
              lang={lang}
              trades={filtered}
              stats={stats}
              meta={meta}
              range={range}
              setRange={setRange}
              onOpenShare={() => setShareOpen(true)}
              onDownloadJson={downloadJson}
              onCopySummary={copySummary}
            />
          )}
        </main>

        <footer className="app-footer">
          <span>
            {t.footerDisclaimerPre}{' '}
            <a href="https://x.com/StandX_Official" target="_blank" rel="noopener noreferrer">
              StandX
            </a>{' '}
            {t.footerDisclaimerMid} {t.footerMadeBy}{' '}
            <a href="https://x.com/RyuuDefi" target="_blank" rel="noopener noreferrer">
              Thisnotmeme
            </a>
            .
          </span>
        </footer>

        {shareOpen && view === 'dashboard' && (
          <ShareCard
            t={t}
            lang={lang}
            stats={stats}
            series={cumulativeSeries(filtered)}
            onClose={() => setShareOpen(false)}
            onNotice={showNotice}
          />
        )}

        {notice.visible && <Toast text={notice.text} />}
      </div>
    </div>
  );
}
