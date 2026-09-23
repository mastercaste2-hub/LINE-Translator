import { allLexicalEntries, dictionaryEntries, particleEntries } from '../dictionary/entries';
import { findVerbMorphology } from '../morphology/verbs';
import { findGrammarPatterns } from '../grammar/patterns';
import type { CharacterClass, DictionaryEntry, EngineToken, PartOfSpeech } from '../types';

const orderedEntries = [...allLexicalEntries].sort((a, b) => b.surface.length - a.surface.length);
const orderedParticles = [...particleEntries].sort((a, b) => b.surface.length - a.surface.length);
const emojiAtStart = /^(?:\p{Regional_Indicator}{2}|\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\p{Emoji_Modifier})?)*)/u;
const punctuationCharacter = /^[\p{P}\p{S}]$/u;
const kanjiCharacter = /^\p{Script=Han}$/u;
const hiraganaCharacter = /^\p{Script=Hiragana}$/u;
const katakanaCharacter = /^\p{Script=Katakana}$/u;

function entryAt(source: string, index: number, entries: DictionaryEntry[]) {
  for (const entry of entries) {
    const forms = [entry.surface, ...(entry.variants?.map((variant) => variant.surface) ?? [])]
      .sort((a, b) => b.length - a.length);
    for (const surface of forms) {
      if (!source.startsWith(surface, index)) continue;
      const variant = entry.variants?.find((item) => item.surface === surface);
      return { entry, surface, grammarRuleId: variant?.grammarRuleId };
    }
  }
  return undefined;
}

function scriptOf(character: string): 'kanji' | 'hiragana' | 'katakana' | 'other' {
  if (kanjiCharacter.test(character)) return 'kanji';
  if (hiraganaCharacter.test(character)) return 'hiragana';
  if (katakanaCharacter.test(character)) return 'katakana';
  return 'other';
}

function characterClassOf(text: string): CharacterClass {
  const classes = new Set<CharacterClass>(Array.from(text, (character): CharacterClass => {
    if (kanjiCharacter.test(character)) return 'kanji';
    if (hiraganaCharacter.test(character)) return 'hiragana';
    if (katakanaCharacter.test(character)) return 'katakana';
    if (/\p{Number}/u.test(character)) return 'number';
    if (/\p{Letter}/u.test(character)) return 'latin';
    return 'other';
  }));
  return classes.size === 1 ? [...classes][0] : 'mixed';
}

function unknownRun(source: string, index: number) {
  const first = Array.from(source.slice(index))[0];
  const script = scriptOf(first);
  let end = index + first.length;
  while (end < source.length) {
    const next = Array.from(source.slice(end))[0];
    if (!next || scriptOf(next) !== script || script === 'other') break;
    if (entryAt(source, end, orderedEntries) || entryAt(source, end, orderedParticles)) break;
    end += next.length;
  }
  return { text: source.slice(index, end), end };
}

function morphologyAt(source: string, index: number) {
  const tail = source.slice(index);
  const characters = Array.from(tail);
  const max = Math.min(characters.length, 10);
  for (let length = max; length >= 2; length -= 1) {
    const candidate = characters.slice(0, length).join('');
    const morphology = findVerbMorphology(candidate, dictionaryEntries);
    if (morphology) return morphology;
  }
  return undefined;
}

export function tokenizeJapanese(source: string): EngineToken[] {
  const tokens: EngineToken[] = [];
  const grammar = findGrammarPatterns(source);
  let index = 0;

  while (index < source.length) {
    const current = source[index];
    if (/\s/u.test(current)) {
      let end = index + 1;
      while (end < source.length && /\s/u.test(source[end])) end += 1;
      tokens.push({ text: source.slice(index, end), type: 'whitespace', partOfSpeech: 'unknown', characterClass: 'other' });
      index = end;
      continue;
    }

    const emoji = source.slice(index).match(emojiAtStart)?.[0];
    if (emoji) {
      tokens.push({ text: emoji, type: 'emoji', partOfSpeech: 'symbol', characterClass: 'other', sentenceFunction: 'segnale grafico; il significato pragmatico dipende dal contesto' });
      index += emoji.length;
      continue;
    }

    const entryMatch = entryAt(source, index, orderedEntries);
    const particleMatch = entryAt(source, index, orderedParticles);
    const match = entryMatch && (!particleMatch || entryMatch.surface.length >= particleMatch.surface.length)
      ? entryMatch
      : particleMatch;

    if (match) {
      const isParticle = match.entry.partOfSpeech === 'particle';
      const associatedGrammar = match.grammarRuleId
        ? grammar.find((item) => item.id === match.grammarRuleId && item.start < index + match.surface.length && item.end > index)
        : undefined;
      tokens.push({
        text: match.surface,
        type: isParticle ? 'particle' : match.grammarRuleId ? 'grammar' : 'word',
        partOfSpeech: match.entry.partOfSpeech,
        characterClass: characterClassOf(match.surface),
        meaning: match.entry.meaning,
        sentenceFunction: match.entry.sentenceFunction,
        grammarRule: associatedGrammar?.label ?? (match.grammarRuleId ? match.grammarRuleId : undefined),
        dictionaryId: match.entry.id,
      });
      index += match.surface.length;
      continue;
    }

    const char = Array.from(source.slice(index))[0];
    if (punctuationCharacter.test(char)) {
      tokens.push({ text: char, type: 'punctuation', partOfSpeech: 'punctuation', characterClass: 'other', sentenceFunction: 'fraseggio o punteggiatura originale' });
      index += char.length;
      continue;
    }

    const morphology = morphologyAt(source, index);
    if (morphology) {
      const entry = dictionaryEntries.find((item) => item.surface === morphology.lemma);
      tokens.push({
        text: morphology.surface,
        type: 'morphology',
        partOfSpeech: 'verb',
        characterClass: characterClassOf(morphology.surface),
        meaning: morphology.lemmaMeaning,
        sentenceFunction: entry?.sentenceFunction ?? 'azione',
        grammarRule: morphology.formLabel,
        dictionaryId: entry?.id,
        morphology,
      });
      index += morphology.surface.length;
      continue;
    }

    const run = unknownRun(source, index);
    const overlappingGrammar = grammar.find((item) => item.start < run.end && item.end > index);
    const pos: PartOfSpeech = 'unknown';
    tokens.push({
      text: run.text,
      type: 'unknown',
      partOfSpeech: pos,
      characterClass: characterClassOf(run.text),
      sentenceFunction: 'elemento conservato; non presente nei dati lessicali della V0.2',
      grammarRule: overlappingGrammar?.label,
    });
    index = run.end;
  }

  return tokens;
}
