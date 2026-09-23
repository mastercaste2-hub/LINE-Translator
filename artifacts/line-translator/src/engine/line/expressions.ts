import type { LineExpression, LineExpressionMatch } from '../types';

export const lineExpressions: LineExpression[] = [
  { id: 'soft-refusal-today', surface: '今日はちょっと厳しいかな', literalMeaning: 'Oggi / tema; un po’; difficile; forse.', naturalMeaning: 'Oggi è un po’ complicato, forse.', subtext: 'La frase esprime una difficoltà attenuata. Da sola non dimostra che si tratti di un rifiuto definitivo, né specifica chi sia in difficoltà.', tones: ['soft', 'hesitant', 'casual'] },
  { id: 'postpone-next-time', surface: 'また今度ね', literalMeaning: 'Un’altra volta / la prossima occasione / ricerca di accordo.', naturalMeaning: 'Un’altra volta, va bene?', subtext: 'Può rimandare un’occasione con tono amichevole; non garantisce che l’invito verrà ripreso.', tones: ['soft', 'casual'] },
  { id: 'enjoyed-today', surface: '今日は楽しかった', literalMeaning: 'Oggi / tema; divertente al passato.', naturalMeaning: 'Oggi è stato divertente.', subtext: 'Esprime una valutazione positiva dell’esperienza; la frase non identifica da sola il rapporto tra le persone né il soggetto che l’ha vissuta.', tones: ['casual'] },
  { id: 'invite-together', surface: 'また一緒に行こうね', literalMeaning: 'Andiamo di nuovo insieme, eh.', naturalMeaning: 'Dai, torniamoci insieme un’altra volta.', subtext: 'È una proposta/invito formulata in modo informale e inclusivo.', tones: ['casual', 'soft', 'affectionate'] },
  { id: 'thanks', surface: 'ありがとう', literalMeaning: 'Grazie.', naturalMeaning: 'Grazie.', tones: ['casual'] },
  { id: 'sorry', surface: 'ごめん', literalMeaning: 'Scusa.', naturalMeaning: 'Scusami.', tones: ['casual', 'soft'] },
  { id: 'reassure-okay', surface: '大丈夫', literalMeaning: 'Va bene; tutto a posto.', naturalMeaning: 'Va tutto bene / non c’è problema.', tones: ['soft'] },
  { id: 'acknowledge', surface: 'そっか', literalMeaning: 'Ah, così.', naturalMeaning: 'Ah, capisco.', tones: ['casual', 'soft'] },
  { id: 'reaction', surface: 'そうなんだ', literalMeaning: 'È così, eh.', naturalMeaning: 'Ah, davvero? / Capisco.', tones: ['casual'] },
  { id: 'understood', surface: 'わかった', literalMeaning: 'Capire al passato.', naturalMeaning: 'Capito.', tones: ['casual', 'direct'] },
  { id: 'really-thanks', surface: '本当にありがとう', literalMeaning: 'Davvero; grazie.', naturalMeaning: 'Grazie davvero.', tones: ['casual', 'soft'] },
  { id: 'okay-assertive', surface: '大丈夫だよ', literalMeaning: 'Tutto a posto / copula assertiva.', naturalMeaning: 'Va tutto bene.', tones: ['casual', 'direct'] },
  { id: 'see-you', surface: 'またね', literalMeaning: 'Di nuovo, eh.', naturalMeaning: 'A presto.', tones: ['casual', 'soft'] },
  { id: 'thank-you-polite', surface: 'ありがとうございます', literalMeaning: 'Grazie (forma cortese).', naturalMeaning: 'La ringrazio / grazie mille.', tones: ['polite'] },
  { id: 'sorry-polite', surface: 'すみません', literalMeaning: 'Mi scusi.', naturalMeaning: 'Mi scusi / grazie per il disturbo.', tones: ['polite', 'soft'] },
];

export function findLineExpressions(source: string): LineExpressionMatch[] {
  const candidates: LineExpressionMatch[] = [];
  for (const expression of lineExpressions) {
    let fromIndex = 0;
    while (fromIndex < source.length) {
      const start = source.indexOf(expression.surface, fromIndex);
      if (start < 0) break;
      candidates.push({ ...expression, start, end: start + expression.surface.length });
      fromIndex = start + expression.surface.length;
    }
  }

  const selected: LineExpressionMatch[] = [];
  for (const candidate of candidates.sort((a, b) => a.start - b.start || b.surface.length - a.surface.length)) {
    const overlaps = selected.some((item) => candidate.start < item.end && candidate.end > item.start);
    if (!overlaps) selected.push(candidate);
  }
  return selected;
}
