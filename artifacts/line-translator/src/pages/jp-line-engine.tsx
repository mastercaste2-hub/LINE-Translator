import { Brain, Braces, BookOpen, MessageSquareText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const architecture = [
  { label: 'Parser', icon: Braces },
  { label: 'Dizionario', icon: BookOpen },
  { label: 'Grammatica', icon: Braces },
  { label: 'Espressioni LINE', icon: MessageSquareText },
  { label: 'Interpretazione', icon: Sparkles },
  { label: 'Tono e sottotesto', icon: MessageSquareText },
  { label: 'Generazione risposta', icon: Sparkles },
];

export default function JPLineEngine() {
  return (
    <main className="line-shell line-noise min-h-screen px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 sm:gap-8">
        <header className="line-animate space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <Brain className="size-4 text-primary" aria-hidden="true" />
            <span>Motore linguistico giapponese proprietario</span>
          </div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            🧠 JP LINE Engine
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Laboratorio interno per analizzare il giapponese in modo locale,
            strutturato e comprensibile.
          </p>
        </header>

        <Card className="line-card line-animate-delay rounded-2xl border-card-border">
          <CardContent className="space-y-4 p-5 sm:p-7">
            <label htmlFor="japanese-message" className="text-sm font-semibold">
              Messaggio giapponese
            </label>
            <Textarea
              id="japanese-message"
              placeholder="Scrivi o incolla una frase giapponese..."
              className="line-focus line-japanese min-h-36 resize-y rounded-xl bg-background/70 p-4"
            />
            <div className="flex justify-end">
              <Button type="button" className="line-button min-h-11 w-full sm:w-auto">
                Analizza
              </Button>
            </div>
          </CardContent>
        </Card>

        <section aria-labelledby="analysis-heading">
          <Card className="line-card rounded-2xl border-card-border">
            <CardContent className="space-y-3 p-5 sm:p-7">
              <p className="font-mono text-xs font-medium tracking-[0.18em] text-primary">
                ANALISI
              </p>
              <h2 id="analysis-heading" className="font-serif text-2xl font-semibold">
                Il motore linguistico verrà sviluppato qui.
              </h2>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="architecture-heading" className="space-y-4">
          <div>
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-primary">
              ARCHITETTURA
            </p>
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
