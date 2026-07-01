import type { Lang } from './types';

export interface Strings {
  brandTag: string;
  emptyTitle: string;
  dropTitle: string;
  dropSub: string;
  dropHint: string;
  cta: string;
  tryDemo: string;
  fileWord: string;
  filesWord: string;
  removeFile: string;
  clearAll: string;
  privacy: string;
  guideToggle: string;
  footerDisclaimerPre: string;
  footerDisclaimerMid: string;
  footerMadeBy: string;
  loadingTitle: string;
  loadingSub: string;
  readingWord: string;
  rowsWord: string;
  startOver: string;
  overview: string;
  tryAgain: string;
  netPnl: string;
  afterFees: string;
  cumPnl: string;
  winRate: string;
  winLossDist: string;
  wins: string;
  losses: string;
  monthlyPnl: string;
  gain: string;
  loss: string;
  bestTrade: string;
  worstTrade: string;
  streak: string;
  winStreak: string;
  lossStreak: string;
  markets: string;
  profitFactor: string;
  profitFactorSub: string;
  volume: string;
  volumeSub: string;
  avgLeverage: string;
  taker: string;
  avgWin: string;
  avgLoss: string;
  recentTrades: string;
  colMarket: string;
  colSide: string;
  colSize: string;
  colPnl: string;
  colDate: string;
  downloadJson: string;
  copySummary: string;
  summaryCopied: string;
  jsonDownloaded: string;
  footerSecurity: string;
  shareCard: string;
  shareHeadline: string;
  shareHeadlineAccent: string;
  shareSub: string;
  handlePlaceholder: string;
  handleHint: string;
  downloadPng: string;
  downloadPngSub: string;
  copyImage: string;
  copyImageSub: string;
  imageCopied: string;
  copyImageUnsupported: string;
  shareX: string;
  shareXSub: string;
  cardClose: string;
  pngDownloaded: string;
  pngError: string;
  shareTextPnl: string;
  cardShowLabel: string;
  cardChartLabel: string;
  bgSectionLabel: string;
  bgUploadLabel: string;
  bgInvalidFile: string;
  bgTooLarge: string;
  metricFees: string;
  feesSub: string;
  metricTrades: string;
  tradesSub: string;
  metricRange: string;
  errEmptyTitle: string;
  errEmptyBody: string;
  errFormatTitle: string;
  errFormatBody: string;
  ranges: { all: string; d30: string; d90: string; ytd: string };
  months: string[];
  tradesWord: string;
  features: string[];
  guide: string[];
  guideToolTitle: string;
  guideToolBody: string;
  guideToolLink: string;
  guideJwtWarning: string;
}

const es: Strings = {
  brandTag: 'Panel de trading',
  emptyTitle: 'Sube tus datos de StandX',
  dropTitle: 'Arrastra tus archivos .txt aquí',
  dropSub: 'o haz clic para buscarlos',
  dropHint: 'Normalmente son 2: trades y órdenes (.txt / .json)',
  cta: 'Generar dashboard',
  tryDemo: 'Probar con datos de ejemplo',
  fileWord: 'archivo',
  filesWord: 'archivos',
  removeFile: 'Quitar archivo',
  clearAll: 'Quitar todo',
  privacy:
    'Tus archivos nunca salen de tu dispositivo. Se procesan por completo en tu navegador, sin servidores.',
  guideToggle: '¿Cómo exporto mis datos de StandX?',
  footerDisclaimerPre: 'Proyecto de la comunidad de',
  footerDisclaimerMid: '— no es un sitio web oficial.',
  footerMadeBy: 'Hecho por',
  loadingTitle: 'Analizando tus datos…',
  loadingSub: 'Reconstruyendo tus trades a partir de las ejecuciones. Es instantáneo y 100% local.',
  readingWord: 'Archivo',
  rowsWord: 'registros',
  startOver: 'Nueva carga',
  overview: 'Resumen',
  tryAgain: 'Volver a intentar',
  netPnl: 'PnL realizado',
  afterFees: 'después de fees',
  cumPnl: 'PnL acumulado',
  winRate: 'Win rate',
  winLossDist: 'Wins / losses',
  wins: 'Ganadores',
  losses: 'Perdedores',
  monthlyPnl: 'PnL por mes',
  gain: 'Ganancia',
  loss: 'Pérdida',
  bestTrade: 'Mejor trade',
  worstTrade: 'Peor trade',
  streak: 'Racha actual',
  winStreak: 'wins seguidos',
  lossStreak: 'losses seguidos',
  markets: 'Por mercado',
  profitFactor: 'Profit factor',
  profitFactorSub: 'ganancia ÷ pérdida bruta',
  volume: 'Volumen',
  volumeSub: 'negociado',
  avgLeverage: 'leverage prom.',
  taker: 'taker',
  avgWin: 'Ganancia media',
  avgLoss: 'Pérdida media',
  recentTrades: 'Trades recientes',
  colMarket: 'Mercado',
  colSide: 'Lado',
  colSize: 'Tamaño',
  colPnl: 'PnL',
  colDate: 'Fecha',
  downloadJson: 'Descargar JSON',
  copySummary: 'Copiar resumen',
  summaryCopied: 'Resumen copiado al portapapeles',
  jsonDownloaded: 'JSON descargado',
  footerSecurity: 'Tus datos se analizaron localmente y nunca se subieron a ningún lado.',
  shareCard: 'Compartir card',
  shareHeadline: 'Comparte tu',
  shareHeadlineAccent: 'resultado',
  shareSub: 'Una tarjeta lista para X, con tus números reales.',
  handlePlaceholder: '@tu_usuario',
  handleHint: 'Escribe aquí',
  downloadPng: 'Descargar PNG',
  downloadPngSub: 'Guardar en tu dispositivo',
  copyImage: 'Copiar imagen',
  copyImageSub: 'Al portapapeles',
  imageCopied: 'Imagen copiada',
  copyImageUnsupported: 'Tu navegador no soporta copiar imágenes',
  shareX: 'Compartir en X',
  shareXSub: 'Publícalo en tu perfil',
  cardClose: 'Cerrar',
  pngDownloaded: 'Imagen descargada',
  pngError: 'No se pudo generar la imagen',
  shareTextPnl: 'Mi PnL realizado en StandX:',
  cardShowLabel: 'Estadísticas',
  cardChartLabel: 'Gráfico',
  bgSectionLabel: 'Fondo',
  bgUploadLabel: 'Subir',
  bgInvalidFile: 'Ese archivo no es una imagen',
  bgTooLarge: 'Máximo 10MB',
  metricFees: 'Fees totales',
  feesSub: 'pagados en DUSD',
  metricTrades: 'Trades',
  tradesSub: 'round-trips cerrados',
  metricRange: 'Periodo',
  errEmptyTitle: 'No encontramos trades en tus archivos',
  errEmptyBody:
    'Leímos los archivos pero no había ejecuciones para reconstruir trades. Asegúrate de exportar la respuesta de query_trades (y query_orders) desde StandX.',
  errFormatTitle: 'No pudimos leer esos archivos',
  errFormatBody:
    'El formato no es uno que reconozcamos. Sube el .txt/.json crudo que exportaste de StandX.',
  ranges: { all: 'Todo', d30: '30D', d90: '90D', ytd: 'YTD' },
  months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  tradesWord: 'trades',
  features: ['PnL realizado', 'Win rate', 'Card compartible'],
  guide: [
    'En StandX, abre las herramientas de desarrollador con F12 (o clic derecho → Inspeccionar).',
    'Ve a la pestaña "Network" y recarga tu página de historial de trades.',
    'Busca cualquier request autenticado (por ejemplo, query_trades) y copia el valor de su header "Authorization" — ese es tu JWT_TOKEN.',
    'Con ese token, consulta la API de StandX (query_trades y query_orders) recorriendo todas las páginas de resultados, con la herramienta que prefieras.',
    'Guarda el resultado completo como .txt o .json y súbelo aquí.',
  ],
  guideToolTitle: '¿Prefieres no hacerlo a mano?',
  guideToolBody:
    'Este script de ejemplo consulta la API por ti. Puedes revisar el código antes de usarlo, descargarlo y correrlo en tu máquina, o ejecutarlo en la nube — si usas la nube, elimina tu JWT_TOKEN del notebook cuando termines.',
  guideToolLink: 'Ver script en Google Colab',
  guideJwtWarning: 'Tu JWT_TOKEN es como tu contraseña: nunca lo compartas con nadie. Quien lo tenga puede entrar a tu cuenta de StandX.',
};

const en: Strings = {
  brandTag: 'Trading panel',
  emptyTitle: 'Upload your StandX data',
  dropTitle: 'Drag & drop your .txt files',
  dropSub: 'or click to browse',
  dropHint: 'Usually 2 files: trades and orders (.txt / .json)',
  cta: 'Generate dashboard',
  tryDemo: 'Try with sample data',
  fileWord: 'file',
  filesWord: 'files',
  removeFile: 'Remove file',
  clearAll: 'Clear all',
  privacy:
    'Your files never leave your device. They are parsed entirely in your browser, with no servers.',
  guideToggle: 'How do I export my StandX data?',
  footerDisclaimerPre: 'A',
  footerDisclaimerMid: 'community project — not an official website.',
  footerMadeBy: 'Made by',
  loadingTitle: 'Analyzing your data…',
  loadingSub: 'Reconstructing your trades from the raw fills. This is instant and fully local.',
  readingWord: 'File',
  rowsWord: 'records',
  startOver: 'New upload',
  overview: 'Overview',
  tryAgain: 'Try again',
  netPnl: 'Realized PnL',
  afterFees: 'after fees',
  cumPnl: 'Cumulative PnL',
  winRate: 'Win rate',
  winLossDist: 'Wins / losses',
  wins: 'Winners',
  losses: 'Losers',
  monthlyPnl: 'PnL by month',
  gain: 'Gain',
  loss: 'Loss',
  bestTrade: 'Best trade',
  worstTrade: 'Worst trade',
  streak: 'Current streak',
  winStreak: 'wins in a row',
  lossStreak: 'losses in a row',
  markets: 'By market',
  profitFactor: 'Profit factor',
  profitFactorSub: 'gross profit ÷ loss',
  volume: 'Volume',
  volumeSub: 'traded',
  avgLeverage: 'avg leverage',
  taker: 'taker',
  avgWin: 'Avg win',
  avgLoss: 'Avg loss',
  recentTrades: 'Recent trades',
  colMarket: 'Market',
  colSide: 'Side',
  colSize: 'Size',
  colPnl: 'PnL',
  colDate: 'Date',
  downloadJson: 'Download JSON',
  copySummary: 'Copy summary',
  summaryCopied: 'Summary copied to clipboard',
  jsonDownloaded: 'JSON downloaded',
  footerSecurity: 'Your data was analyzed locally and never uploaded anywhere.',
  shareCard: 'Share card',
  shareHeadline: 'Share your',
  shareHeadlineAccent: 'result',
  shareSub: 'A clean card for X, built from your real numbers.',
  handlePlaceholder: '@your_handle',
  handleHint: 'Type here',
  downloadPng: 'Download PNG',
  downloadPngSub: 'Save to device',
  copyImage: 'Copy image',
  copyImageSub: 'To clipboard',
  imageCopied: 'Image copied',
  copyImageUnsupported: "Your browser can't copy images",
  shareX: 'Share on X',
  shareXSub: 'Post it to your profile',
  cardClose: 'Close',
  pngDownloaded: 'Image downloaded',
  pngError: 'Could not generate image',
  shareTextPnl: 'My realized StandX PnL:',
  cardShowLabel: 'Stats',
  cardChartLabel: 'Chart',
  bgSectionLabel: 'Background',
  bgUploadLabel: 'Upload',
  bgInvalidFile: "That file isn't an image",
  bgTooLarge: 'Max 10MB',
  metricFees: 'Total fees',
  feesSub: 'paid in DUSD',
  metricTrades: 'Trades',
  tradesSub: 'closed round-trips',
  metricRange: 'Period',
  errEmptyTitle: 'No trades found in your files',
  errEmptyBody:
    'We read your files but found no fills to reconstruct trades from. Make sure you exported the query_trades (and query_orders) response from StandX.',
  errFormatTitle: 'We couldn’t read those files',
  errFormatBody:
    'The format isn’t one we recognize. Upload the raw .txt/.json you exported from StandX.',
  ranges: { all: 'All', d30: '30D', d90: '90D', ytd: 'YTD' },
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  tradesWord: 'trades',
  features: ['Realized PnL', 'Win rate', 'Shareable card'],
  guide: [
    'On StandX, open developer tools with F12 (or right-click → Inspect).',
    'Go to the "Network" tab and reload your trade-history page.',
    'Find any authenticated request (e.g. query_trades) and copy its "Authorization" header value — that’s your JWT_TOKEN.',
    'Use that token to query the StandX API (query_trades and query_orders), paging through every result, with whichever tool you prefer.',
    'Save the complete result as .txt or .json and upload it here.',
  ],
  guideToolTitle: 'Prefer not to do it by hand?',
  guideToolBody:
    'This example script queries the API for you. Review the code before running it, download it and run it on your machine, or run it in the cloud — if you use the cloud, remove your JWT_TOKEN from the notebook when you’re done.',
  guideToolLink: 'View script on Google Colab',
  guideJwtWarning: 'Your JWT_TOKEN is like your password: never share it with anyone. Whoever has it can get into your StandX account.',
};

export function strings(lang: Lang): Strings {
  return lang === 'en' ? en : es;
}
