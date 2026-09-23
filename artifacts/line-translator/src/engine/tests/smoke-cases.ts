import { analyzeJapaneseMessage } from '../interpreter/analyze';

export type SmokeCase = {
  id: string;
  source: string;
  expectedExpressionIds: string[];
  expectedIntent?: string;
  expectedLemma?: string;
  expectedForm?: string;
  expectedKnownTexts?: string[];
};

export const smokeCases: SmokeCase[] = [
  { id: 'A-soft-refusal', source: '今日はちょっと厳しいかな', expectedExpressionIds: ['soft-refusal-today'] },
  { id: 'B-postpone', source: 'また今度ね', expectedExpressionIds: ['postpone-next-time'] },
  { id: 'C-positive-invitation', source: '今日は楽しかった！また一緒に行こうね😊', expectedExpressionIds: ['enjoyed-today', 'invite-together'] },
  { id: 'D-thanks', source: 'ありがとう', expectedExpressionIds: ['thanks'] },
  { id: 'E-acknowledgement', source: 'そっか、わかった', expectedExpressionIds: ['acknowledge', 'understood'] },
  { id: 'F-te-form-request', source: 'ちょっと待ってね', expectedExpressionIds: [], expectedIntent: 'wait-request', expectedLemma: '待つ', expectedForm: 'te' },
  { id: 'G-te-form-see', source: 'これ見てね', expectedExpressionIds: [], expectedLemma: '見る', expectedForm: 'te' },
  { id: 'H-common-daily', source: '今日は仕事が忙しい', expectedExpressionIds: [], expectedKnownTexts: ['今日', '仕事', '忙しい'] },
  { id: 'I-volitional', source: '明日友達と会おう😊', expectedExpressionIds: [], expectedLemma: '会う', expectedForm: 'volitional', expectedKnownTexts: ['明日', '友達', '会おう'] },
  { id: 'J-conversation', source: '本当にありがとう😊', expectedExpressionIds: [], expectedKnownTexts: ['本当に', 'ありがとう'] },
  { id: 'K-question', source: '今どこ？', expectedExpressionIds: [], expectedKnownTexts: ['今', 'どこ'] },
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
    const tokenTexts = contentTokens.map((token) => token.text);

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
    for (const expectedText of testCase.expectedKnownTexts ?? []) {
      if (!tokenTexts.includes(expectedText)) failures.push('Expected vocabulary token was not recognized: ' + expectedText + '.');
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
