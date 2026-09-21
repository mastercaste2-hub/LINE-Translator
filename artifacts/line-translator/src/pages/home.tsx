import { type ReactNode, useEffect, useState } from 'react';
import {
  Capacitor,
  registerPlugin,
  type PluginListenerHandle,
} from '@capacitor/core';
import {
  ArrowUpRight,
  Check,
  Clipboard,
  Languages,
  MessageCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  analyzeJapaneseMessage,
  DEFAULT_SOURCE,
  tones,
  type AnalysisResult,
  type ReplyTone,
} from '@/lib/translator-mock';

type SharedTextPayload = {
  text?: string;
};

type ShareIntentBridge = {
  addListener: (
    eventName: 'sharedText',
    listenerFunc: (payload: SharedTextPayload) => void,
  ) => Promise<PluginListenerHandle>;
  getPendingShare: () => Promise<SharedTextPayload>;
};

const ShareIntent = registerPlugin<ShareIntentBridge>('ShareIntent');

const initialResult: AnalysisResult = {
  source: DEFAULT_SOURCE,
  translation: 'Oggi è un po’ difficile, forse.',
  meaning:
    'È un rifiuto morbido. La persona probabilmente non riesce a fare qualcosa oggi, ma evita di dirlo in modo categorico.',
  subtext:
    'かな (kana) rende la frase esitante e meno definitiva. Non è necessariamente un “mai”: lascia una piccola porta aperta.',
  suggestedReply: 'そっか、わかった！無理しないでね😊',
  replyTranslation: 'Capito, va bene! Non sforzarti troppo 😊',
  replyExplanation:
    'Una risposta spontanea e premurosa: accetta il possibile rifiuto, toglie pressione e invita l’altra persona a non sforzarsi.',
};

function TonePicker({
  value,
  onChange,
}: {
  value: ReplyTone;
  onChange: (tone: ReplyTone) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" data-testid="group-reply-tones">
      {tones.map((tone) => (
        <button
          className={`line-focus line-button rounded-xl border px-3 py-2.5 text-left text-sm font-medium ${
            value === tone
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border bg-background/60 text-foreground hover:bg-muted'
          }`}
          data-testid={`button-tone-${tone.toLowerCase().replaceAll(' ', '-')}`}
          key={tone}
          onClick={() => onChange(tone)}
          type="button"
        >
          <span className="block">{tone}</span>
          {value === tone && <span className="mt-1 block text-[10px] uppercase tracking-[.14em] opacity-75">scelto</span>}
        </button>
      ))}
    </div>
  );
}

function ResultSection({
  eyebrow,
  title,
  children,
  accent = false,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <section className={`border-t pt-5 ${accent ? 'border-primary/40' : 'line-rule'}`}>
      <p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">{eyebrow}</p>
      <h3 className="mt-2 text-base font-semibold tracking-[-.01em]">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  );
}

function Home() {
  const [message, setMessage] = useState(DEFAULT_SOURCE);
  const [tone, setTone] = useState<ReplyTone>('Casuale');
  const [result, setResult] = useState<AnalysisResult | null>(initialResult);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [receivedFromShare, setReceivedFromShare] = useState(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let disposed = false;
    let listener: PluginListenerHandle | null = null;
    let lastHandledText: string | null = null;

    const analyzeSharedText = async (sharedText: string) => {
      if (disposed || !sharedText.trim() || lastHandledText === sharedText) {
        return;
      }

      lastHandledText = sharedText;
      setMessage(sharedText);
      setReceivedFromShare(true);
      setIsCopied(false);
      setIsAnalyzing(true);
      setResult(null);

      const nextResult = await analyzeJapaneseMessage(sharedText, tone);
      if (disposed) return;

      setResult(nextResult);
      setIsAnalyzing(false);
    };

    const connectShareIntent = async () => {
      listener = await ShareIntent.addListener('sharedText', (payload) => {
        if (payload.text) void analyzeSharedText(payload.text);
      });

      const pendingShare = await ShareIntent.getPendingShare();
      if (pendingShare.text) {
        await analyzeSharedText(pendingShare.text);
      }
    };

    void connectShareIntent();

    return () => {
      disposed = true;
      if (listener) void listener.remove();
    };
  }, [tone]);

  const handleAnalyze = async () => {
    if (!message.trim() || isAnalyzing) return;
    setIsCopied(false);
    setIsAnalyzing(true);
    const nextResult = await analyzeJapaneseMessage(message, tone);
    setResult(nextResult);
    setIsAnalyzing(false);
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard?.writeText(result.suggestedReply);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1800);
  };

  const handleReset = () => {
    setMessage('');
    setResult(null);
    setIsCopied(false);
    setReceivedFromShare(false);
  };

  return (
    <main className="line-shell line-noise min-h-[100dvh] overflow-hidden">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-5 pb-10 sm:px-8 lg:px-12">
        <header className="line-animate flex items-center justify-between py-6 sm:py-8" data-testid="header-app">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-secondary text-accent shadow-sm" aria-hidden="true">
              <Languages size={20} strokeWidth={1.8} />
            </div>
            <div>
               <p className="font-serif text-xl font-semibold leading-none tracking-[-.03em]">LINE Translator 🇯🇵</p>
               <p className="mt-1 text-xs text-muted-foreground">Capisci il giapponese. Rispondi nel modo giusto.</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <ShieldCheck size={15} className="text-primary" />
            <span>Il contesto prima delle parole</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground sm:hidden">
            <ShieldCheck size={16} />
          </div>
        </header>

        <div className="grid flex-1 gap-8 pb-12 pt-6 lg:grid-cols-[.8fr_1.2fr] lg:items-start lg:gap-16 lg:pt-14">
          <section className="line-animate max-w-xl" data-testid="section-introduction">
            <p className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.22em] text-primary">
              <span className="h-px w-7 bg-primary" />
              Capire prima di rispondere
            </p>
            <h1 className="max-w-lg font-serif text-[clamp(2.8rem,8vw,5.8rem)] leading-[.95] tracking-[-.055em] text-secondary">
              Le parole<br />
              <em className="font-medium text-primary">tra le righe.</em>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
              Incolla un messaggio LINE in giapponese. Ti aiutiamo a coglierne il senso, il tono e a rispondere con naturalezza.
            </p>
            <div className="mt-8 hidden items-center gap-3 lg:flex">
              <div className="flex -space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-accent font-mono text-[10px] text-secondary">日</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary font-mono text-[10px] text-primary-foreground">IT</div>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">Traduzione chiara.<br />Sfumature che restano.</p>
            </div>
          </section>

          <section className="line-animate-delay line-card rounded-[24px] border border-border/80 p-4 sm:p-6" data-testid="card-translator">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div className="flex items-center gap-2">
                <MessageCircle size={17} className="text-primary" />
                <h2 className="text-sm font-semibold">Il messaggio ricevuto</h2>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[9px] uppercase tracking-[.12em] text-muted-foreground">01 / incolla</span>
            </div>

            <div className="mt-5">
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground" htmlFor="japanese-message">Testo giapponese</label>
              <textarea
                className="line-focus min-h-[132px] w-full resize-none rounded-2xl border border-input bg-background/65 p-4 text-lg leading-8 text-secondary placeholder:text-muted-foreground/70"
                data-testid="textarea-japanese-message"
                id="japanese-message"
                onChange={(event) => {
                  setMessage(event.target.value);
                  setReceivedFromShare(false);
                }}
                placeholder="Incolla qui il messaggio LINE…"
                value={message}
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Anche una sola frase è sufficiente.</p>
                {message && (
                  <button className="line-focus text-xs font-medium text-primary underline-offset-4 hover:underline" data-testid="button-clear-message" onClick={handleReset} type="button">
                    Svuota
                  </button>
                )}
              </div>
              {receivedFromShare && (
                <p
                  className="mt-3 text-xs text-muted-foreground"
                  data-testid="status-shared-text"
                >
                  📲 Testo ricevuto da un’altra app
                </p>
              )}
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Come vuoi rispondere?</label>
                <span className="text-xs text-muted-foreground">02 / tono</span>
              </div>
              <TonePicker onChange={setTone} value={tone} />
            </div>

            <button
              className="line-focus line-button mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3.5 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
              data-testid="button-analyze-message"
              disabled={!message.trim() || isAnalyzing}
              onClick={handleAnalyze}
              type="button"
            >
              {isAnalyzing ? 'Sto leggendo tra le righe…' : 'Analizza il messaggio'}
              {isAnalyzing ? <Sparkles size={16} className="animate-pulse" /> : <ArrowUpRight size={17} />}
            </button>
          </section>
        </div>

        <section className="line-animate-delay" data-testid="section-analysis">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.2em] text-primary">
                <span className="h-px w-7 bg-primary" />
                La lettura
              </p>
              <h2 className="font-serif text-3xl tracking-[-.04em] text-secondary sm:text-4xl">Ora sai cosa intende.</h2>
            </div>
            {result && !isAnalyzing && (
              <button className="line-focus hidden items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-secondary sm:flex" data-testid="button-new-analysis" onClick={handleReset} type="button">
                <RotateCcw size={13} /> Nuovo messaggio
              </button>
            )}
          </div>

          {isAnalyzing ? (
            <div className="line-card grid gap-5 rounded-[24px] border border-border/80 p-5 sm:grid-cols-2 sm:p-7" data-testid="status-analysis-loading">
              <div className="space-y-3"><div className="line-skeleton h-3 w-24 rounded" /><div className="line-skeleton h-7 w-4/5 rounded" /><div className="line-skeleton h-4 w-full rounded" /><div className="line-skeleton h-4 w-3/4 rounded" /></div>
              <div className="space-y-3"><div className="line-skeleton h-3 w-32 rounded" /><div className="line-skeleton h-24 w-full rounded-2xl" /><div className="line-skeleton h-4 w-5/6 rounded" /></div>
            </div>
          ) : result ? (
            <div className="line-card grid overflow-hidden rounded-[24px] border border-border/80 lg:grid-cols-[.9fr_1.1fr]" data-testid="card-analysis-result">
              <div className="bg-secondary p-5 text-secondary-foreground sm:p-7">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[.18em] text-accent">Messaggio originale</p>
                  <span className="rounded-full border border-secondary-foreground/20 px-2 py-1 font-mono text-[9px] text-secondary-foreground/65">日本語</span>
                </div>
                <p className="line-japanese mt-8 text-2xl leading-relaxed sm:text-3xl" data-testid="text-source-message">{result.source}</p>
                <div className="mt-10 border-t border-secondary-foreground/15 pt-4">
                  <p className="text-xs leading-5 text-secondary-foreground/65">Tradotto con attenzione alle sfumature, non solo alle parole.</p>
                </div>
              </div>
              <div className="p-5 sm:p-7">
                 <ResultSection eyebrow="🇮🇹 Traduzione naturale" title="Traduzione" accent>
                  <p className="text-lg font-medium leading-7 text-secondary" data-testid="text-translation">{result.translation}</p>
                </ResultSection>
                 <ResultSection eyebrow="💬 Significato e sfumature" title="Significato / sfumatura">
                  <p data-testid="text-meaning">{result.meaning}</p>
                </ResultSection>
                 <ResultSection eyebrow="🎭 Tono e sottintesi" title="Tono e sottotesto">
                  <p data-testid="text-subtext">{result.subtext}</p>
                </ResultSection>
              </div>
            </div>
          ) : (
            <div className="line-card rounded-[24px] border border-dashed border-border p-8 text-center" data-testid="status-analysis-empty">
              <p className="font-serif text-xl text-secondary">Il significato apparirà qui.</p>
              <p className="mt-2 text-sm text-muted-foreground">Incolla un messaggio e scegli il tono della tua risposta.</p>
            </div>
          )}
        </section>

        {result && !isAnalyzing && (
          <section className="line-animate mt-7 grid gap-6 rounded-[24px] border border-primary/25 bg-primary/10 p-5 sm:p-7 lg:grid-cols-[1fr_.8fr] lg:items-center" data-testid="card-reply-suggestion">
            <div>
              <div className="flex items-center gap-2">
                 <Send size={17} className="text-primary" />
                 <p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary">🇯🇵 Risposta suggerita</p>
              </div>
              <h2 className="mt-3 font-serif text-2xl tracking-[-.03em] text-secondary sm:text-3xl">Una risposta che suona come te.</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Tono scelto: <span className="font-semibold text-secondary">{tone}</span></p>
            </div>
            <div>
              <div className="rounded-2xl border border-primary/20 bg-card/75 p-4">
                <p className="line-japanese text-lg leading-8 text-secondary" data-testid="text-suggested-reply">{result.suggestedReply}</p>
                 <div className="mt-4 border-t border-border/70 pt-3">
                   <p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">🇮🇹 Traduzione della risposta</p>
                   <p className="mt-1 text-sm leading-6 text-secondary" data-testid="text-reply-translation">{result.replyTranslation}</p>
                   <p className="mt-3 text-xs leading-5 text-muted-foreground" data-testid="text-reply-explanation"><span className="mb-1 block font-semibold text-secondary">💬 Perché questa risposta</span>{result.replyExplanation}</p>
                   <button className="line-focus line-button mt-4 flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:bg-secondary/90" data-testid="button-copy-reply" onClick={handleCopy} type="button">
                    {isCopied ? <Check size={14} /> : <Clipboard size={14} />}
                     {isCopied ? 'Risposta copiata' : 'Copia risposta'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <footer className="mt-auto flex flex-col gap-2 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Un piccolo aiuto per comunicare meglio.</p>
          <p className="font-mono text-[10px] uppercase tracking-[.12em]">LINE Translator · prototipo locale</p>
        </footer>
      </div>
    </main>
  );
}

export default Home;