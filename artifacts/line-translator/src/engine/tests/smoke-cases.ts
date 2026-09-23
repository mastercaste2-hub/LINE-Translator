import { analyzeJapaneseMessage } from '../interpreter/analyze';

export type SmokeCase = {
  id: string;
  source: string;
  expectedExpressionIds: string[];
};

export const smokeCases: SmokeCase[] = [
  { id: 'A-soft-refusal', source: '今日はちょっと厳しいかな', expectedExpressionIds: ['soft-refusal-today'] },
  { id: 'B-postpone', source: 'また今度ね', expectedExpressionIds: ['postpone-next-time'] },
  { id: 'C-positive-invitation', source: '今日は楽しかった！また一緒に行こうね😊', expectedExpressionIds: ['enjoyed-today', 'invite-together'] },
  { id: 'D-thanks', source: 'ありがとう', expectedExpressionIds: ['thanks'] },
  { id: 'E-acknowledgement', source: 'そっか、わかった', expectedExpressionIds: ['acknowledge', 'understood'] },
];

export type SmokeCaseResult = {
  id: string;
  passed: boolean;
  failures: string[];
  tokenCount: number;
  unknownTokens: string[];
  expressionIds: string[];
};

/** Run from a dev console or a temporary local runner; it has no test-library dependency. */
export function runSmokeCases(): SmokeCaseResult[] {
  return smokeCases.map((testCase) => {
    const analysis = analyzeJapaneseMessage(testCase.source);
    const failures: string[] = [];
    const contentTokens = analysis.tokens.filter((token) => token.type !== 'whitespace' && token.type !== 'punctuation');
    const expressionIds = analysis.expressions.map((expression) => expression.id);
    if (contentTokens.length === 0) failures.push('Parser produced no content tokens.');
    if (contentTokens.every((token) => token.type === 'unknown')) failures.push('Parser returned only generic unknown text.');
    for (const expectedId of testCase.expectedExpressionIds) {
      if (!expressionIds.includes(expectedId)) failures.push(`Expected local expression ${expectedId} was not matched.`);
    }
    if (analysis.confidence <= 0 || analysis.confidence > 1) failures.push('Confidence is outside the 0..1 range.');
    return {
      id: testCase.id,
      passed: failures.length === 0,
      failures,
      tokenCount: contentTokens.length,
      unknownTokens: analysis.tokens.filter((token) => token.type === 'unknown').map((token) => token.text),
      expressionIds,
    };
  });
}
