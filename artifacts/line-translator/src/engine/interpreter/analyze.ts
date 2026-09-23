import { findGrammarPatterns } from '../grammar/patterns';
import { findLineExpressions } from '../line/expressions';
import { tokenizeJapanese } from '../parser/tokenize';
import type { EngineToken, JapaneseAnalysis, ToneLabel } from '../types';

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
  if (source.trim() && !evidence.length) evidence.push('Nessun indizio di tono sufficiente nelle regole V0.1.');
  return { tone: [...tone], evidence };
}

export function analyzeJapaneseMessage(source: string): JapaneseAnalysis {
  const tokens = tokenizeJapanese(source);
  const grammar = findGrammarPatterns(source);
  const expressions = findLineExpressions(source);
  const completeExpressionCoverage = expressions.length > 0 && unmatchedTextIsEmpty(source, expressions);
  const recognizedTokens = tokens.filter((token) => token.type !== 'unknown' && token.type !== 'whitespace');
  const unknownTokens = tokens.filter((token) => token.type === 'unknown');
  const structure = [
    ...tokens.filter((token) => token.type === 'particle').map((token) => `Particella ${token.text}: ${token.sentenceFunction}`),
    ...grammar.map((match) => `${match.label} (${match.matchedText}): ${match.explanation}`),
    ...expressions.map((expression) => `Espressione LINE: ${expression.surface}`),
  ];
  if (unknownTokens.length) structure.push(`${unknownTokens.length} segmento/i non riconosciuto/i conservato/i senza interpretazione.`);

  const literalMeaning = knownLiteral(tokens);
  const naturalMeaning = completeExpressionCoverage
    ? expressions.map((expression) => expression.naturalMeaning).join(' ')
    : expressions.length
      ? `${expressions.map((expression) => expression.naturalMeaning).join(' ')} (lettura parziale: restano elementi fuori dalle espressioni note)`
      : 'Interpretazione naturale non disponibile: la V0.1 non ha una regola sufficiente per questa frase.';

  const { tone, evidence: toneEvidence } = inferTone(source, expressions.flatMap((item) => item.tones), grammar.map((item) => item.id), tokens);
  const subtext = expressions.map((item) => item.subtext).filter((value): value is string => Boolean(value)).join(' ')
    || 'Nessun sottotesto dedotto: non è stata riconosciuta un’espressione con una nota pragmatica implementata.';

  let confidence = 0.15;
  if (recognizedTokens.length) confidence += Math.min(0.35, recognizedTokens.length * 0.07);
  if (grammar.length) confidence += 0.1;
  if (expressions.length) confidence += completeExpressionCoverage ? 0.35 : 0.15;
  if (unknownTokens.length) confidence -= Math.min(0.3, unknownTokens.length * 0.08);
  confidence = Math.max(0.05, Math.min(completeExpressionCoverage ? 0.95 : 0.7, confidence));

  return {
    source,
    tokens,
    structure,
    grammar,
    expressions,
    literalMeaning,
    naturalMeaning,
    tone,
    toneEvidence,
    subtext,
    confidence,
    confidenceNote: completeExpressionCoverage
      ? 'Confidenza riferita alla corrispondenza con espressioni locali note; non misura una comprensione generale della lingua.'
      : unknownTokens.length
        ? 'Confidenza ridotta da segmenti non riconosciuti; le regole disponibili forniscono solo una lettura parziale.'
        : 'Stima prudenziale basata sul numero di token e regole riconosciuti; non è una probabilità statistica.',
  };
}
