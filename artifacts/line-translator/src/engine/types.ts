export type PartOfSpeech =
  | 'noun'
  | 'adverb'
  | 'i-adjective'
  | 'adjective'
  | 'na-adjective'
  | 'verb'
  | 'expression'
  | 'conjunction'
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
  | 'volitional'
  | 'te-iru'
  | 'taku-nai'
  | 'masen-deshita';

export type ParticleFunction =
  | 'topic'
  | 'subject-focus'
  | 'subject'
  | 'focus'
  | 'direct-object'
  | 'destination-target'
  | 'time-target'
  | 'direction'
  | 'action-location'
  | 'means'
  | 'companion'
  | 'quotation'
  | 'addition'
  | 'possessive'
  | 'source-reason'
  | 'limit'
  | 'comparison-source'
  | 'non-exhaustive-list'
  | 'confirmation-seeking'
  | 'emphasis'
  | 'uncertainty'
  | 'question'
  | 'copula';

export type GrammaticalRole =
  | 'topic'
  | 'subject'
  | 'object'
  | 'indirect-object'
  | 'destination'
  | 'location'
  | 'companion'
  | 'possessor'
  | 'nominal-head'
  | 'predicate'
  | 'modifier'
  | 'temporal-adjunct'
  | 'question-focus'
  | 'unknown';

export type SemanticCategory = 'temporal' | 'person' | 'place' | 'activity' | 'state' | 'question' | 'other';

export type GrammarRelationKind =
  | 'topic-of'
  | 'subject-of'
  | 'object-of'
  | 'indirect-object-of'
  | 'destination-of'
  | 'location-of'
  | 'companion-of'
  | 'possesses'
  | 'modifies'
  | 'temporal-context-of'
  | 'predicate-of';

export type ParticleAnalysis = {
  tokenIndex: number;
  surface: string;
  candidateFunctions: ParticleFunction[];
  selectedFunction?: ParticleFunction;
  appliedFunctions?: ParticleFunction[];
  ambiguity: boolean;
  confidence: number;
  explanation: string;
};

export type GrammarRelation = {
  fromToken: number;
  toToken: number;
  relation: GrammarRelationKind;
  particleToken?: number;
  confidence: number;
  evidence: string;
};

export type PhraseAnalysis = {
  type: 'noun-phrase' | 'temporal-phrase' | 'predicate-phrase' | 'question-phrase';
  tokenIndexes: number[];
  role: GrammaticalRole;
  confidence: number;
};

export type SentenceStructure = {
  predicateTokenIndexes: number[];
  subject: { status: 'explicit'; tokenIndexes: number[] } | { status: 'omitted/implicit' };
  phrases: PhraseAnalysis[];
  relationships: GrammarRelation[];
};

export type DictionaryEntry = {
  id: string;
  surface: string;
  partOfSpeech: PartOfSpeech;
  characterClass?: CharacterClass;
  semanticCategory?: SemanticCategory;
  particleFunctions?: ParticleFunction[];
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
  lemma?: string;
  semanticCategory?: SemanticCategory;
  grammaticalRoles?: GrammaticalRole[];
  particleFunctions?: ParticleFunction[];
  confidence?: number;
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
  particleAnalysis: ParticleAnalysis[];
  relationships: GrammarRelation[];
  phrases: PhraseAnalysis[];
  sentenceStructure: SentenceStructure;
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
