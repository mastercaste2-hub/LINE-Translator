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
  | 'morphology'
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

export type VerbClass = 'godan' | 'ichidan' | 'suru' | 'kuru';

export type VerbForm =
  | 'dictionary'
  | 'te'
  | 'ta'
  | 'masu'
  | 'masen'
  | 'mashita'
  | 'nai'
  | 'nakatta'
  | 'volitional';

export type DictionaryEntry = {
  id: string;
  surface: string;
  partOfSpeech: PartOfSpeech;
  characterClass?: CharacterClass;
  meaning: string;
  sentenceFunction: string;
  verbClass?: VerbClass;
  variants?: Array<{ surface: string; grammarRuleId: string }>;
};

export type EngineToken = {
  text: string;
  type: TokenType;
  partOfSpeech: PartOfSpeech;
  characterClass?: CharacterClass;
  meaning?: string;
  sentenceFunction?: string;
  grammarRule?: string;
  dictionaryId?: string;
  morphology?: VerbMorphology;
};

export type GrammarMatch = {
  id: string;
  label: string;
  matchedText: string;
  explanation: string;
  start: number;
  end: number;
};

export type VerbMorphology = {
  surface: string;
  lemma: string;
  lemmaMeaning: string;
  verbClass: VerbClass;
  form: VerbForm;
  formLabel: string;
  explanation: string;
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

export type ReplySuggestion = {
  japanese: string;
  italian: string;
  explanation: string;
};

export type JapaneseAnalysis = {
  source: string;
  tokens: EngineToken[];
  structure: string[];
  grammar: GrammarMatch[];
  morphology: VerbMorphology[];
  expressions: LineExpressionMatch[];
  literalMeaning: string;
  naturalMeaning: string;
  tone: ToneLabel[];
  toneEvidence: string[];
  subtext: string;
  intent?: 'wait-request' | 'postpone' | 'invitation';
  confidence: number;
  confidenceNote: string;
  responseSafety: 'safe' | 'needs-context' | 'not-generated';
};
