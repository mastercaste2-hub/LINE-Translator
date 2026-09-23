import { findGrammarPatterns } from '../grammar/patterns';
import { buildSentenceStructure } from '../grammar/relationships';
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
    .map((token) => token.meaning
      ? (token.lemma ?? token.text) + ' (' + token.meaning + ')'
      : token.text + ' (unknown: nessun significato assegnato)');
  return meanings.length ? meanings.join(' · ') : 'Nessun contenuto lessicale riconosciuto.';
}

function composeNaturalMeaning(tokens: EngineToken[], sentence: ReturnType<typeof buildSentenceStructure>) {
  const hasRole = (surface: string, role: NonNullable<EngineToken['grammaticalRoles']>[number]) =>
    tokens.find((token) => token.text === surface && token.grammaticalRoles?.includes(role));
  const temporal = tokens.find((token) => token.semanticCategory === 'temporal');
  const place = tokens.find((token) => token.semanticCategory === 'place');
  const verb = tokens.find((token) => token.morphology);
  const predicate = sentence.sentenceStructure.predicateTokenIndexes.map((index) => tokens[index]);

  if (predicate.some((token) => token.semanticCategory === 'question') && temporal) {
    return 'Dove ' + (temporal.meaning ?? temporal.text) + '? (il soggetto è omesso e non determinabile dal testo).';
  }
  if (place && verb?.morphology?.lemma === '働く' && verb.morphology.form === 'te-iru') {
    return 'A ' + place.meaning + ', si sta lavorando. (il soggetto è omesso nel testo).';
  }
  if (hasRole('私', 'possessor') && hasRole('友達', 'nominal-head')) {
    return 'Il mio amico / la mia amica. (il numero non è espresso nel testo giapponese).';
  }
  if (hasRole('仕事', 'subject') && predicate.some((token) => token.lemma === '忙しい')) {
    return 'Oggi, il lavoro è impegnativo.';
  }
  if (hasRole('学校', 'destination') && predicate.some((token) => token.lemma === '行く')) {
    return 'Andare a scuola. (il soggetto è omesso nel testo).';
  }
  if (temporal && hasRole('友達', 'companion') && verb?.morphology?.lemma === '会う' && verb.morphology.form === 'volitional') {
    return (temporal.meaning ?? temporal.text) + ', incontriamoci con un amico / un’amica.';
  }
  if (temporal && tokens.some((token) => token.text === '一緒に') && verb?.morphology?.lemma === '行く' && verb.morphology.form === 'volitional') {
    return (temporal.meaning ?? temporal.text) + ', andiamo insieme.';
  }
  return undefined;
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
  if (grammarIds.includes('kana') || grammarIds.includes('final-kanaa')) {
    tone.add('hesitant');
    tone.add('soft');
    evidence.push('La chiusura かな è implementata come indizio esitante/attenuante.');
  }
  if (grammarIds.includes('ne') || grammarIds.includes('final-yorone') || grammarIds.includes('final-dane')) {
    tone.add('soft');
    evidence.push('La particella finale ね è trattata come possibile ricerca di accordo.');
  }
  if (grammarIds.includes('polite-desu') || grammarIds.includes('polite-masu') || grammarIds.includes('polite-kudasai')) {
    tone.add('polite');
    evidence.push('È stata riconosciuta una forma cortese esplicita.');
  }
  if (grammarIds.includes('yo') || grammarIds.includes('final-yorone')) {
    tone.add('direct');
    evidence.push('La chiusura よ è trattata come indizio assertivo/informativo.');
  }
  if (grammarIds.includes('final-ka')) {
    evidence.push('か finale marca un’interrogativa; da sola non determina cortesia o tono relazionale.');
  }
  if (!tone.size && tokens.some((token) => token.type === 'particle' || token.partOfSpeech === 'verb')) {
    tone.add('casual');
    evidence.push('Lessico/particelle colloquiali riconosciuti; classificazione prudenziale.');
  }
  if (source.trim() && !evidence.length) evidence.push('Nessun indizio di tono sufficiente nelle regole V0.3.');
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
  const parsedTokens = tokenizeJapanese(source);
  const sentence = buildSentenceStructure(parsedTokens);
  const tokens = sentence.tokens;
  const grammar = findGrammarPatterns(source);
  const expressions = findLineExpressions(source);
  const particleAnalysis = sentence.particleAnalysis;
  const completeExpressionCoverage = expressions.length > 0 && unmatchedTextIsEmpty(source, expressions);
  const recognizedTokens = tokens.filter((token) => token.type !== 'unknown' && token.type !== 'whitespace');
  const unknownTokens = tokens.filter((token) => token.type === 'unknown');
  const morphology = tokens.flatMap((token) => token.morphology ? [token.morphology] : []);
  const intent = inferIntent(source, tokens);

  const structure = [
    ...particleAnalysis.map((item) => 'Particella ' + item.surface + ': funzione ' + (item.selectedFunction ?? 'ambigua/non risolta') + '; ' + item.explanation),
    ...sentence.relationships.map((item) => (tokens[item.fromToken].lemma ?? tokens[item.fromToken].text) + ' → ' + item.relation + ' → ' + (tokens[item.toToken].lemma ?? tokens[item.toToken].text)),
    ...morphology.map((item) => `${item.formLabel}: ${item.surface} ← ${item.lemma} (${item.lemmaMeaning})`),
    ...grammar.map((match) => `${match.label} (${match.matchedText}): ${match.explanation}`),
    ...expressions.map((expression) => `Espressione LINE: ${expression.surface}`),
  ];
  if (unknownTokens.length) structure.push(`${unknownTokens.length} segmento/i non riconosciuto/i conservato/i senza interpretazione.`);

  const waitAnalysis = analyzeWaitRequest(tokens);
  const composedMeaning = composeNaturalMeaning(tokens, sentence);
  const naturalMeaning = waitAnalysis?.naturalMeaning
    ?? (completeExpressionCoverage
      ? expressions.map((expression) => expression.naturalMeaning).join(' ')
      : composedMeaning
        ? composedMeaning
        : expressions.length
          ? expressions.map((expression) => expression.naturalMeaning).join(' ') + ' (lettura parziale: restano elementi fuori dalle espressioni note)'
          : 'Interpretazione naturale non disponibile: le regole locali non sono sufficienti per questa frase.');

  const { tone, evidence: toneEvidence } = inferTone(source, expressions.flatMap((item) => item.tones), grammar.map((item) => item.id), tokens);
  if (waitAnalysis) {
    tone.push('casual', 'soft');
    toneEvidence.push('Forma て di 待つ dopo ちょっと + ね: richiesta informale attenuata riconosciuta dalla grammatica locale.');
  }

  const subtext = waitAnalysis?.subtext
    ?? (expressions.map((item) => item.subtext).filter((value): value is string => Boolean(value)).join(' ')
      || 'Nessun sottotesto dedotto: non è stata riconosciuta una struttura pragmatica sufficiente.');

  let confidence = 0.15;
  if (recognizedTokens.length) confidence += Math.min(0.35, recognizedTokens.length * 0.07);
  if (morphology.length) confidence += 0.18;
  if (grammar.length) confidence += 0.1;
  if (expressions.length) confidence += completeExpressionCoverage ? 0.35 : 0.15;
  if (waitAnalysis) confidence += 0.15;
  confidence += Math.min(0.12, sentence.relationships.length * 0.025);
  confidence -= particleAnalysis.filter((item) => item.ambiguity).length * 0.04;
  if (unknownTokens.length) confidence -= Math.min(0.3, unknownTokens.length * 0.08);
  confidence = Math.max(0.05, Math.min(completeExpressionCoverage || waitAnalysis ? 0.96 : 0.82, confidence));

  const responseSafety: JapaneseAnalysis['responseSafety'] =
    intent ? 'safe' : expressions.length ? 'needs-context' : 'not-generated';

  return {
    source,
    tokens,
    structure,
    grammar,
    particleAnalysis,
    relationships: sentence.relationships,
    phrases: sentence.phrases,
    sentenceStructure: sentence.sentenceStructure,
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
