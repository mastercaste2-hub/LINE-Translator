import { findGrammarPatterns } from '../grammar/patterns';
import { findLineExpressions } from '../line/expressions';
import { tokenizeJapanese } from '../parser/tokenize';
import { generateSafeReply } from '../reply/generate';
import type { EngineToken, JapaneseAnalysis, ToneLabel, VerbMorphology } from '../types';

const punctuationOnly = /^[\s\p{P}\p{S}\p{Extended_Pictographic}]+$/u;

function unmatchedTextIsEmpty(source: string, matches: Array<{ start: number; end: number }>) {
  let cursor = 0;
  let remainder = '';
  for (const match of matches) {
    remainder += source.slice(cursor, match.start);
    cursor = match.end;
  }
  remainder += source.slice(cursor);
  return remainder.length === 0 || punctuationOnly.test(remainder);
}

function knownLiteral(tokens: EngineToken[]) {
  const meanings = tokens
    .filter((token) => token.type !== 'whitespace' && token.type !== 'punctuation' && token.type !== 'emoji')
    .map((token) => token.meaning ? `${token.text} (${token.meaning})` : `${token.text} (significato non disponibile)`);
  return meanings.length ? meanings.join(' · ') : 'Nessun contenuto lessicale riconosciuto.';
}

function hasToken(tokens: EngineToken[], text: string) {
  return tokens.some((token) => token.text === text);
}

function hasMorphology(tokens: EngineToken[], form: VerbMorphology['form']) {
  return tokens.find((token) => token.morphology?.form === form)?.morphology;
}

function inferIntent(source: string, tokens: EngineToken[]): JapaneseAnalysis['intent'] {
  const normalized = source.replace(/\s+/gu, '');
  const isWaitRequest =
    hasToken(tokens, 'ちょっと') &&
    Boolean(hasMorphology(tokens, 'te')?.lemma === '待つ') &&
    hasToken(tokens, 'ね');

  if (isWaitRequest) return 'wait-request';
  if (normalized.includes('また今度ね')) return 'postpone';
  if (normalized.includes('また一緒に行こうね')) return 'invitation';
  return undefined;
}

function inferTone(
  source: string,
  expressionTones: ToneLabel[],
  grammarIds: string[],
  tokens: EngineToken[],
) {
  const tone = new Set<ToneLabel>(expressionTones);
  const evidence: string[] = [];
  if (expressionTones.length) evidence.push('Espressione LINE riconosciuta nel modulo locale.');
  if (grammarIds.includes('kana')) {
    tone.add('hesitant');
    tone.add('soft');
    evidence.push('La chiusura かな è implementata come indizio esitante/attenuante.');
  }
  if (grammarIds.includes('ne')) {
    tone.add('soft');
    evidence.push('La particella finale ね è trattata come possibile ricerca di accordo.');
  }
  if (grammarIds.includes('polite-desu') || grammarIds.includes('polite-masu') || grammarIds.includes('polite-kudasai')) {
    tone.add('polite');
    evidence.push('È stata riconosciuta una forma cortese esplicita.');
  }
  if (grammarIds.includes('yo')) {
    tone.add('direct');
    evidence.push('La chiusura よ è trattata come indizio assertivo/informativo.');
  }
  if (!tone.size && tokens.some((token) => token.type === 'particle' || token.partOfSpeech === 'verb')) {
    tone.add('casual');
    evidence.push('Lessico/particelle colloquiali riconosciuti; classificazione prudenziale.');
  }
  if (source.trim() && !evidence.length) evidence.push('Nessun indizio di tono sufficiente nelle regole V0.2.');
  return { tone: [...tone], evidence };
}

function analyzeWaitRequest(tokens: EngineToken[]) {
  const waitVerb = tokens.find((token) => token.morphology?.lemma === '待つ' && token.morphology.form === 'te');
  if (!waitVerb) return undefined;
  return {
    naturalMeaning: 'Aspetta un attimo, ok?',
    subtext: 'ちょっと attenua la richiesta e ね la rende colloquiale e morbida. La frase chiede di aspettare, ma non specifica per quanto tempo.',
    structure: [
      'ちょっと: avverbio/attenuatore; può indicare “un attimo” e rendere meno brusca la richiesta.',
      `待って: ${waitVerb.morphology?.formLabel}; forma て di 待つ (aspettare), usata qui in una richiesta informale.`,
      'ね: particella finale; cerca o condivide un accordo e attenua la richiesta.',
    ],
    intent: 'wait-request' as const,
  };
}

export function analyzeJapaneseMessage(source: string): JapaneseAnalysis {
  const tokens = tokenizeJapanese(source);
  const grammar = findGrammarPatterns(source);
  const expressions = findLineExpressions(source);
  const completeExpressionCoverage = expressions.length > 0 && unmatchedTextIsEmpty(source, expressions);
  const recognizedTokens = tokens.filter((token) => token.type !== 'unknown' && token.type !== 'whitespace');
  const unknownTokens = tokens.filter((token) => token.type === 'unknown');
  const morphology = tokens.flatMap((token) => token.morphology ? [token.morphology] : []);
  const intent = inferIntent(source, tokens);
  const structure = [
    ...tokens.filter((token) => token.type === 'particle').map((token) => `Particella ${token.text}: ${token.sentenceFunction}`),
    ...morphology.map((item) => `${item.formLabel}: ${item.surface} ← ${item.lemma} (${item.lemmaMeaning})`),
    ...grammar.map((match) => `${match.label} (${match.matchedText}): ${match.explanation}`),
    ...expressions.map((expression) => `Espressione LINE: ${expression.surface}`),
  ];
  if (unknownTokens.length) structure.push(`${unknownTokens.length} segmento/i non riconosciuto/i conservato/i senza interpretazione.`);

  const waitAnalysis = analyzeWaitRequest(tokens);
  const naturalMeaning = waitAnalysis?.naturalMeaning
    ?? (completeExpressionCoverage
      ? expressions.map((expression) => expression.naturalMeaning).join(' ')
      : expressions.length
        ? `${expressions.map((expression) => expression.naturalMeaning).join(' ')} (lettura parziale: restano elementi fuori dalle espressioni note)`
        : 'Interpretazione naturale non disponibile: le regole locali non sono sufficienti per questa frase.');

  const { tone, evidence: toneEvidence } = inferTone(source, expressions.flatMap((item) => item.tones), grammar.map((item) => item.id), tokens);
  if (waitAnalysis) {
    tone.push('casual', 'soft');
    toneEvidence.push('Forma て di 待つ dopo ちょっと + ね: richiesta informale attenuata riconosciuta dalla grammatica locale.');
  }

  const subtext = waitAnalysis?.subtext
    ?? expressions.map((item) => item.subtext).filter((value): value is string => Boolean(value)).join(' ')
    || 'Nessun sottotesto dedotto: non è stata riconosciuta una struttura pragmatica sufficiente.';

  let confidence = 0.15;
  if (recognizedTokens.length) confidence += Math.min(0.35, recognizedTokens.length * 0.07);
  if (morphology.length) confidence += 0.18;
  if (grammar.length) confidence += 0.1;
  if (expressions.length) confidence += completeExpressionCoverage ? 0.35 : 0.15;
  if (waitAnalysis) confidence += 0.15;
  if (unknownTokens.length) confidence -= Math.min(0.3, unknownTokens.length * 0.08);
  confidence = Math.max(0.05, Math.min(completeExpressionCoverage || waitAnalysis ? 0.96 : 0.82, confidence));

  const responseSafety: JapaneseAnalysis['responseSafety'] =
    intent ? 'safe' : expressions.length ? 'needs-context' : 'not-generated';

  return {
    source,
    tokens,
    structure,
    grammar,
    morphology,
    expressions,
    literalMeaning: knownLiteral(tokens),
    naturalMeaning,
    tone: [...new Set(tone)],
    toneEvidence,
    subtext,
    intent,
    confidence,
    confidenceNote: waitAnalysis
      ? 'Confidenza basata su lessico riconosciuto, forma て del verbo 待つ e particella finale ね; non rappresenta una probabilità statistica.'
      : completeExpressionCoverage
        ? 'Confidenza riferita alla corrispondenza con espressioni locali note; non misura una comprensione generale della lingua.'
        : unknownTokens.length
          ? 'Confidenza ridotta da segmenti non riconosciuti; le regole disponibili forniscono solo una lettura parziale.'
          : 'Stima prudenziale basata sul numero di token e regole riconosciuti; non è una probabilità statistica.',
    responseSafety,
  };
}

export { generateSafeReply };
