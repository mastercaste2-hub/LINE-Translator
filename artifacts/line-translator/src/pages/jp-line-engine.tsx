import { type ReactNode, useState } from 'react';
import { Brain, Braces, BookOpen, MessageSquareText, Sparkles } from 'lucide-react';
import { analyzeJapaneseMessage, generateSafeReply } from '@/engine/interpreter/analyze';
import { commonVocabularyEntries } from '@/engine/dictionary/common-vocabulary';
import type { JapaneseAnalysis } from '@/engine/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const architecture = [
  { label: 'Parser', icon: Braces },
  { label: 'Dizionario + verbi', icon: BookOpen },
  { label: 'Morfologia e coniugazioni', icon: Braces },
  { label: 'Grammatica', icon: Braces },
  { label: 'Espressioni LINE', icon: MessageSquareText },
  { label: 'Interpretazione composizionale', icon: Sparkles },
  { label: 'Tono e sottotesto', icon: MessageSquareText },
  { label: 'Risposta sicura', icon: Sparkles },
];

const replyTones = ['Casuale', 'Educato', 'Molto educato', 'Affettuoso', 'Professionale'] as const;

export default function JPLineEngine() {
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState<JapaneseAnalysis | null>(null);
  const [replyTone, setReplyTone] = useState<(typeof replyTones)[number]>('Casuale');

  const analyze = () => {
    if (!message.trim()) {
      setAnalysis(null);
      return;
    }
    setAnalysis(analyzeJapaneseMessage(message.trim()));
  };

  const reply = analysis ? generateSafeReply(analysis, replyTone) : null;

  return (
    <main className="line-shell line-noise min-h-screen px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 sm:gap-8">
        <header className="line-animate space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Brain className="size-4 text-primary" aria-hidden="true" />
            <span>Motore linguistico giapponese proprietario · V0.2</span>
          </div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            🧠 JP LINE Engine
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Parser, morfologia, grammatica e interpretazione locale. Il vocabolario include un core curato di <strong>{commonVocabularyEntries.length}</strong> voci, senza servizi esterni. Il motore non inventa
            informazioni quando la struttura non è sufficientemente riconosciuta.
          </p>
        </header>

        <Card className="line-card line-animate-delay rounded-2xl border-card-border">
          <CardContent className="space-y-4 p-5 sm:p-7">
            <label htmlFor="japanese-message" className="text-sm font-semibold">
              Messaggio giapponese
            </label>
            <Textarea
              id="japanese-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Scrivi o incolla una frase giapponese..."
              className="line-focus line-japanese min-h-36 resize-y rounded-xl bg-background/70 p-4"
            />
            <div className="flex justify-end">
              <Button type="button" onClick={analyze} disabled={!message.trim()} className="line-button min-h-11 w-full sm:w-auto">
                Analizza
              </Button>
            </div>
          </CardContent>
        </Card>

        <section aria-labelledby="analysis-heading" aria-live="polite">
          <Card className="line-card rounded-2xl border-card-border">
            <CardContent className="space-y-3 p-5 sm:p-7">
              <p className="font-mono text-xs font-medium tracking-[0.18em] text-primary">
                ANALISI
              </p>
              {!analysis ? (
                <h2 id="analysis-heading" className="font-serif text-2xl font-semibold">
                  Inserisci una frase giapponese e premi Analizza.
                </h2>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 id="analysis-heading" className="font-serif text-2xl font-semibold">Risultato locale V0.2</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Ogni risultato deriva da lessico, regole grammaticali o strutture esplicite del motore.
                    </p>
                  </div>

                  <ResultBlock title="Token e morfologia">
                    <div className="flex flex-wrap gap-2">
                      {analysis.tokens.filter((token) => token.type !== 'whitespace').map((token, index) => (
                        <span key={`${index}-${token.text}`} className={`max-w-full rounded-lg border px-3 py-2 text-sm ${token.type === 'unknown' ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-background/70'}`}>
                          <span className="line-japanese font-semibold">{token.text}</span>
                          <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                            {token.type} · {token.characterClass ?? '—'} · {token.partOfSpeech}
                          </span>
                          {token.meaning && <span className="mt-1 block text-xs text-muted-foreground">{token.meaning}</span>}
                          {token.sentenceFunction && <span className="mt-1 block text-xs text-muted-foreground">Funzione: {token.sentenceFunction}</span>}
                          {token.grammarRule && <span className="mt-1 block text-xs text-primary">Regola: {token.grammarRule}</span>}
                          {token.morphology && (
                            <span className="mt-2 block border-t border-border/70 pt-2 text-xs text-primary">
                              {token.morphology.formLabel} · lemma {token.morphology.lemma} · {token.morphology.explanation}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </ResultBlock>

                  <ResultBlock title="Struttura">
                    {analysis.structure.length
                      ? <ul className="list-inside list-disc space-y-1">{analysis.structure.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
                      : <p>Nessuna struttura specifica riconosciuta.</p>}
                  </ResultBlock>

                  <ResultBlock title="Significato letterale"><p>{analysis.literalMeaning}</p></ResultBlock>
                  <ResultBlock title="Interpretazione naturale"><p>{analysis.naturalMeaning}</p></ResultBlock>

                  <ResultBlock title="Tono">
                    <div className="flex flex-wrap gap-2">
                      {analysis.tone.length
                        ? analysis.tone.map((tone) => <span key={tone} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{tone}</span>)
                        : <span>Non determinato dalle regole disponibili.</span>}
                    </div>
                    {analysis.toneEvidence.length > 0 && (
                      <ul className="mt-2 list-inside list-disc space-y-1">{analysis.toneEvidence.map((item) => <li key={item}>{item}</li>)}</ul>
                    )}
                  </ResultBlock>

                  <ResultBlock title="Sottotesto"><p>{analysis.subtext}</p></ResultBlock>

                  <ResultBlock title="Confidence">
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(analysis.confidence * 100)}%` }} />
                      </div>
                      <strong className="font-mono text-sm">{Math.round(analysis.confidence * 100)}%</strong>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{analysis.confidenceNote}</p>
                  </ResultBlock>

                  <ResultBlock title="Risposta">
                    <div className="rounded-xl border border-border bg-background/60 p-4">
                      <div className="mb-3 flex flex-wrap gap-2">
                        {replyTones.map((tone) => (
                          <button
                            key={tone}
                            type="button"
                            onClick={() => setReplyTone(tone)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${replyTone === tone ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-muted'}`}
                          >
                            {tone}
                          </button>
                        ))}
                      </div>
                      {reply ? (
                        <>
                          <p className="line-japanese text-lg font-medium leading-8 text-secondary">{reply.japanese}</p>
                          <p className="mt-2 text-sm text-muted-foreground">🇮🇹 {reply.italian}</p>
                          <p className="mt-3 text-xs leading-5 text-muted-foreground">💬 {reply.explanation}</p>
                        </>
                      ) : (
                        <p className="text-sm leading-6 text-muted-foreground">
                          Nessuna risposta automatica: l’intenzione non è sufficientemente riconosciuta.
                          Il motore preferisce non inventare.
                        </p>
                      )}
                    </div>
                  </ResultBlock>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="architecture-heading" className="space-y-4">
          <div>
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-primary">ARCHITETTURA</p>
            <h2 id="architecture-heading" className="mt-2 font-serif text-2xl font-semibold">
              I componenti del motore
            </h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {architecture.map(({ label, icon: Icon }) => (
              <li key={label}>
                <Card className="line-card h-full rounded-xl border-card-border">
                  <CardContent className="flex items-center gap-3 p-4">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium">{label}</span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function ResultBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2 border-t border-border/70 pt-4">
      <h3 className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-primary">{title}</h3>
      <div className="text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  );
}
