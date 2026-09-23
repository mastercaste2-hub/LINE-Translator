export type PartOfSpeech =
  | 'noun'
  | 'adverb'
  | 'i-adjective'
  | 'adjective'
  | 'verb'
  | 'expression'
  | 'particle'
  | 'auxiliary'
  | 'punctuation'
  | 'symbol'
  | 'unknown';

export type TokenType =
  | 'word'
  | 'particle'
  | 'grammar'
  | 'punctuation'
  | 'emoji'
  | 'whitespace'
  | 'unknown';

export type CharacterClass =
  | 'kanji'
  | 'hiragana'
  | 'katakana'
  | 'mixed'
  | 'latin'
  | 'number'
  | 'other';

export type ToneLabel =
  | 'casual'
  | 'polite'
  | 'soft'
  | 'hesitant'
  | 'affectionate'
  | 'direct';

export type DictionaryEntry = {
  id: string;
  surface: string;
  partOfSpeech: PartOfSpeech;
  characterClass?: CharacterClass;
  meaning: string;
  sentenceFunction: string;
  variants?: Array<{ surface: string; grammarRuleId: string }>;
};

export type EngineToken = {
  text: string;
  type: TokenType;
  partOfSpeech: PartOfSpeech;
  meaning?: string;
  sentenceFunction?: string;
  grammarRule?: string;
  dictionaryId?: string;
};

export type GrammarMatch = {
  id: string;
  label: string;
  matchedText: string;
  explanation: string;
  start: number;
  end: number;
};

export type LineExpression = {
  id: string;
  surface: string;
  literalMeaning: string;
  naturalMeaning: string;
  subtext?: string;
  tones: ToneLabel[];
};

export type LineExpressionMatch = LineExpression & {
  start: number;
  end: number;
};

export type JapaneseAnalysis = {
  source: string;
  tokens: EngineToken[];
  structure: string[];
  grammar: GrammarMatch[];
  expressions: LineExpressionMatch[];
  literalMeaning: string;
  naturalMeaning: string;
  tone: ToneLabel[];
  toneEvidence: string[];
  subtext: string;
  confidence: number;
  confidenceNote: string;
};
