import type { GrammarMatch } from '../types';

type GrammarPattern = {
  id: string;
  label: string;
  expression: RegExp;
  explanation: string;
};

const patterns: GrammarPattern[] = [
  { id: 'past-i-adjective', label: 'Aggettivo in forma passata', expression: /[一-龯々ぁ-ゖァ-ヺー]+かった/gu, explanation: 'Forma passata di un aggettivo in -い; il lemma specifico dipende dal lessico riconosciuto.' },
  { id: 'negative-past', label: 'Negazione al passato', expression: /なかった/gu, explanation: 'Forma negativa al passato.' },
  { id: 'te-iru', label: 'ている', expression: /ている/gu, explanation: 'Può indicare un’azione in corso o uno stato risultante.' },
  { id: 'opinion-to-omou', label: 'と思う', expression: /と思う/gu, explanation: 'Presenta il contenuto precedente come pensiero o opinione.' },
  { id: 'desiderative', label: '〜たい', expression: /たい(?=[ねよかな！!。？?、]|$)/gu, explanation: 'Suffisso desiderativo dopo una base verbale.' },
  { id: 'negative', label: '〜ない', expression: /ない(?=[ねよかな！!。？?、]|$)/gu, explanation: 'Forma negativa; il suo ambito dipende dal predicato precedente.' },
  { id: 'sou', label: '〜そう', expression: /そう(?=[ねよかな！!。？?、]|$)/gu, explanation: 'Può indicare apparenza o informazione riportata; qui non viene disambiguato.' },
  { id: 'past', label: 'Forma passata 〜た', expression: /た(?=[ねよかな！!。！？?]|$)/gu, explanation: 'Possibile marca del passato; interpretazione subordinata al predicato.' },
  { id: 'volitional', label: 'Forma volitiva', expression: /(?:よう|おう)(?=[ねよ！!。？?]|$)/gu, explanation: 'Forma che può esprimere intenzione o invito.' },
  { id: 'kana', label: 'Chiusura 〜かな', expression: /かな(?=[！!。？?、]|$)/gu, explanation: 'Chiusura riflessiva che può attenuare o rendere esitante l’enunciato.' },
  { id: 'ne', label: 'Particella finale 〜ね', expression: /ね(?=[！!。？?、]|$)/gu, explanation: 'Chiusura che può cercare o condividere accordo.' },
  { id: 'yo', label: 'Particella finale 〜よ', expression: /よ(?=[！!。？?、]|$)/gu, explanation: 'Chiusura assertiva o informativa.' },
  { id: 'polite-desu', label: 'Forma cortese です', expression: /です(?=[ねよ！!。？?]|$)/gu, explanation: 'Copula in forma cortese.' },
  { id: 'polite-masu', label: 'Forma cortese ます', expression: /(?:ます|ました|ません)(?=[ねよ！!。？?]|$)/gu, explanation: 'Predicato in forma cortese.' },
  { id: 'polite-kudasai', label: 'Richiesta cortese ください', expression: /ください(?=[ねよ！!。？?]|$)/gu, explanation: 'Richiesta formulata in modo cortese.' },
];

export function findGrammarPatterns(source: string): GrammarMatch[] {
  const matches: GrammarMatch[] = [];
  for (const pattern of patterns) {
    pattern.expression.lastIndex = 0;
    for (const match of source.matchAll(pattern.expression)) {
      if (match.index === undefined) continue;
      matches.push({
        id: pattern.id,
        label: pattern.label,
        matchedText: match[0],
        explanation: pattern.explanation,
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }
  return matches.sort((left, right) => left.start - right.start || left.end - right.end);
}
