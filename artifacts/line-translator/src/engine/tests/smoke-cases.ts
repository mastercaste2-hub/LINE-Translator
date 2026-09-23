import { analyzeJapaneseMessage } from '../interpreter/analyze';

export type SmokeCase = {
  id: string;
  source: string;
  expectedExpressionIds: string[];
  expectedIntent?: string;
  expectedLemma?: string;
  expectedForm?: string;
};

export const smokeCases: SmokeCase[] = [
  { id: 'A-soft-refusal', source: '今日はちょっと厳しいかな', expectedExpressionIds: ['soft-refusal-today'] },
  { id: 'B-postpone', source: 'また今度ね', expectedExpressionIds: ['postpone-next-time'] },
  { id: 'C-positive-invitation', source: '今日は楽しかった！また一緒に行こうね😊', expectedExpressionIds: ['enjoyed-today', 'invite-together'] },
  { id: 'D-thanks', source: 'ありがとう', expectedExpressionIds: ['thanks'] },
  { id: 'E-acknowledgement', source: 'そっか、わかった', expectedExpressionIds: ['acknowledge', 'understood'] },
  { id: 'F-te-form-request', source: 'ちょっと待ってね', expectedExpressionIds: [], expectedIntent: 'wait-request', expectedLemma: '待つ', expectedForm: 'te' },
  { id: 'G-te-form-see', source: 'これ見てね', expectedExpressionIds: [], expectedLemma: '見る', expectedForm: 'te' },
];

export type SmokeCaseResult = {
  id: string;
  passed: boolean;
  failures: string[];
  tokenCount: number;
  unknownTokens: string[];
  expressionIds: string[];
  intent?: string;
  morphology?: Array<{ lemma: string; form: string }>;
};

export function runSmokeCases(): SmokeCaseResult[] {
  return smokeCases.map((testCase) => {
    const analysis = analyzeJapaneseMessage(testCase.source);
    const failures: string[] = [];
    const contentTokens = analysis.tokens.filter((token) => token.type !== 'whitespace' && token.type !== 'punctuation');
    const expressionIds = analysis.expressions.map((expression) => expression.id);
    if (contentTokens.length === 0) failures.push('Parser produced no content tokens.');
    if (testCase.expectedExpressionIds.some((id) => !expressionIds.includes(id))) {
      failures.push('Expected local expression(s) were not matched: ' + testCase.expectedExpressionIds.join(', ') + '.');
    }
    if (testCase.expectedIntent && analysis.intent !== testCase.expectedIntent) {
      failures.push('Expected intent ' + testCase.expectedIntent + ', got ' + (analysis.intent ?? 'none') + '.');
    }
    if (testCase.expectedLemma && !analysis.morphology.some((item) => item.lemma === testCase.expectedLemma && item.form === testCase.expectedForm)) {
      failures.push('Expected morphology ' + testCase.expectedLemma + '/' + testCase.expectedForm + ' was not recognized.');
    }
    if (contentTokens.every((token) => token.type === 'unknown')) failures.push('Parser returned only generic unknown text.');
    if (analysis.confidence <= 0 || analysis.confidence > 1) failures.push('Confidence is outside the 0..1 range.');
    return {
      id: testCase.id,
      passed: failures.length === 0,
      failures,
      tokenCount: contentTokens.length,
      unknownTokens: analysis.tokens.filter((token) => token.type === 'unknown').map((token) => token.text),
      expressionIds,
      intent: analysis.intent,
      morphology: analysis.morphology.map((item) => ({ lemma: item.lemma, form: item.form })),
    };
  });
}
