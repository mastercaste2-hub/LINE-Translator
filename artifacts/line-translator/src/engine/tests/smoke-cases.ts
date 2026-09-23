import { analyzeJapaneseMessage } from '../interpreter/analyze';
import type { GrammaticalRole, ParticleFunction, VerbForm } from '../types';

type ExpectedRole = { surface: string; role: GrammaticalRole };
type ExpectedParticle = { surface: string; function: ParticleFunction };
type ExpectedMorphology = { lemma: string; form: VerbForm };

export type SmokeCase = {
  id: string;
  source: string;
  knownTokens: string[];
  particles?: ExpectedParticle[];
  morphology?: ExpectedMorphology[];
  roles?: ExpectedRole[];
  relation?: string;
  naturalMeaningIncludes: string;
};

export const smokeCases: SmokeCase[] = [
  {
    id: 'topic-subject-predicate',
    source: '今日は仕事が忙しい',
    knownTokens: ['今日', '仕事', '忙しい'],
    particles: [{ surface: 'は', function: 'topic' }, { surface: 'が', function: 'subject' }],
    roles: [{ surface: '今日', role: 'topic' }, { surface: '仕事', role: 'subject' }, { surface: '忙しい', role: 'predicate' }],
    relation: 'subject-of',
    naturalMeaningIncludes: 'lavoro',
  },
  {
    id: 'companion-volitional-meeting',
    source: '明日友達と会おう😊',
    knownTokens: ['明日', '友達', '会おう'],
    particles: [{ surface: 'と', function: 'companion' }],
    morphology: [{ lemma: '会う', form: 'volitional' }],
    roles: [{ surface: '友達', role: 'companion' }, { surface: '会おう', role: 'predicate' }],
    relation: 'companion-of',
    naturalMeaningIncludes: 'incontriamoci',
  },
  {
    id: 'destination-dictionary-verb',
    source: '学校に行く',
    knownTokens: ['学校', '行く'],
    particles: [{ surface: 'に', function: 'destination-target' }],
    morphology: [{ lemma: '行く', form: 'dictionary' }],
    roles: [{ surface: '学校', role: 'destination' }, { surface: '行く', role: 'predicate' }],
    relation: 'destination-of',
    naturalMeaningIncludes: 'Andare a scuola',
  },
  {
    id: 'location-progressive',
    source: '東京で働いている',
    knownTokens: ['東京', '働いている'],
    particles: [{ surface: 'で', function: 'action-location' }],
    morphology: [{ lemma: '働く', form: 'te-iru' }],
    roles: [{ surface: '東京', role: 'location' }, { surface: '働いている', role: 'predicate' }],
    relation: 'location-of',
    naturalMeaningIncludes: 'A Tokyo',
  },
  {
    id: 'possessive-noun-phrase',
    source: '私の友達',
    knownTokens: ['私', 'の', '友達'],
    particles: [{ surface: 'の', function: 'possessive' }],
    roles: [{ surface: '私', role: 'possessor' }, { surface: '友達', role: 'nominal-head' }],
    relation: 'possesses',
    naturalMeaningIncludes: 'mio amico',
  },
  {
    id: 'hedged-difficulty',
    source: '今日はちょっと厳しいかな',
    knownTokens: ['今日', 'ちょっと', '厳しい', 'かな'],
    particles: [{ surface: 'は', function: 'topic' }, { surface: 'かな', function: 'uncertainty' }],
    roles: [{ surface: '今日', role: 'topic' }, { surface: '厳しい', role: 'predicate' }],
    naturalMeaningIncludes: 'complicato',
  },
  {
    id: 'intensified-thanks',
    source: '本当にありがとう😊',
    knownTokens: ['本当に', 'ありがとう'],
    naturalMeaningIncludes: 'Grazie davvero',
  },
  {
    id: 'omitted-subject-question',
    source: '今どこ？',
    knownTokens: ['今', 'どこ'],
    roles: [{ surface: '今', role: 'temporal-adjunct' }, { surface: 'どこ', role: 'predicate' }],
    naturalMeaningIncludes: 'soggetto è omesso',
  },
  {
    id: 'temporal-together-volitional',
    source: '明日一緒に行こう',
    knownTokens: ['明日', '一緒に', '行こう'],
    morphology: [{ lemma: '行く', form: 'volitional' }],
    roles: [{ surface: '明日', role: 'temporal-adjunct' }, { surface: '行こう', role: 'predicate' }],
    relation: 'temporal-context-of',
    naturalMeaningIncludes: 'andiamo insieme',
  },
  {
    id: 'na-adjective-copula-emphasis',
    source: '大丈夫だよ',
    knownTokens: ['大丈夫', 'だ', 'よ'],
    particles: [{ surface: 'よ', function: 'emphasis' }],
    roles: [{ surface: '大丈夫', role: 'predicate' }],
    naturalMeaningIncludes: 'Va tutto bene',
  },
];

export type SmokeCaseResult = {
  id: string;
  passed: boolean;
  failures: string[];
  tokenCount: number;
  unknownTokens: string[];
  roles: Array<{ surface: string; roles: GrammaticalRole[] }>;
  particleFunctions: Array<{ surface: string; selectedFunction?: ParticleFunction; confidence: number }>;
  morphology: Array<{ lemma: string; form: VerbForm }>;
  confidence: number;
};

/** Local deterministic smoke harness; call runSmokeCases() from a dev console or an existing TS runner. */
export function runSmokeCases(): SmokeCaseResult[] {
  return smokeCases.map((testCase) => {
    const analysis = analyzeJapaneseMessage(testCase.source);
    const failures: string[] = [];
    const contentTokens = analysis.tokens.filter((token) => !['whitespace', 'punctuation', 'emoji'].includes(token.type));
    for (const surface of testCase.knownTokens) {
      if (!analysis.tokens.some((token) => token.text === surface && token.type !== 'unknown')) {
        failures.push('Token not recognized: ' + surface);
      }
    }
    for (const expected of testCase.particles ?? []) {
      const actual = analysis.particleAnalysis.find((item) => item.surface === expected.surface);
      if (!actual) failures.push('Particle not analyzed: ' + expected.surface);
      else if (actual.selectedFunction !== expected.function) failures.push('Particle ' + expected.surface + ' expected function ' + expected.function + ', got ' + (actual.selectedFunction ?? 'ambiguous'));
    }
    for (const expected of testCase.morphology ?? []) {
      if (!analysis.morphology.some((item) => item.lemma === expected.lemma && item.form === expected.form)) {
        failures.push('Morphology not recognized: ' + expected.lemma + '/' + expected.form);
      }
    }
    for (const expected of testCase.roles ?? []) {
      const token = analysis.tokens.find((item) => item.text === expected.surface);
      if (!token?.grammaticalRoles?.includes(expected.role)) failures.push('Role not assigned: ' + expected.surface + '/' + expected.role);
    }
    if (testCase.relation && !analysis.relationships.some((item) => item.relation === testCase.relation)) {
      failures.push('Expected relation not produced: ' + testCase.relation);
    }
    if (!analysis.naturalMeaning.includes(testCase.naturalMeaningIncludes)) {
      failures.push('Natural interpretation does not contain expected evidence: ' + testCase.naturalMeaningIncludes);
    }
    if (analysis.confidence <= 0 || analysis.confidence > 1) failures.push('Confidence is outside the 0..1 range.');
    if (contentTokens.some((token) => token.type === 'unknown')) failures.push('Unknown token(s) remain: ' + contentTokens.filter((token) => token.type === 'unknown').map((token) => token.text).join(', '));
    return {
      id: testCase.id,
      passed: failures.length === 0,
      failures,
      tokenCount: contentTokens.length,
      unknownTokens: analysis.tokens.filter((token) => token.type === 'unknown').map((token) => token.text),
      roles: analysis.tokens.filter((token) => token.grammaticalRoles?.length).map((token) => ({ surface: token.text, roles: token.grammaticalRoles ?? [] })),
      particleFunctions: analysis.particleAnalysis.map((item) => ({ surface: item.surface, selectedFunction: item.selectedFunction, confidence: item.confidence })),
      morphology: analysis.morphology.map((item) => ({ lemma: item.lemma, form: item.form })),
      confidence: analysis.confidence,
    };
  });
}
