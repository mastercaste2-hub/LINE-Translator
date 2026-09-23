import type { DictionaryEntry } from '../types';

export const dictionaryEntries: DictionaryEntry[] = [
  { id: 'today', surface: '今日', partOfSpeech: 'noun', meaning: 'oggi', sentenceFunction: 'riferimento temporale' },
  { id: 'little', surface: 'ちょっと', partOfSpeech: 'adverb', meaning: 'un po’; per un momento', sentenceFunction: 'attenua ciò che segue' },
  { id: 'difficult', surface: '厳しい', partOfSpeech: 'i-adjective', meaning: 'difficile; severo', sentenceFunction: 'descrive una condizione' },
  { id: 'again', surface: 'また', partOfSpeech: 'adverb', meaning: 'di nuovo; un’altra volta', sentenceFunction: 'modifica l’azione o il riferimento temporale' },
  { id: 'next-time', surface: '今度', partOfSpeech: 'noun', meaning: 'la prossima volta', sentenceFunction: 'riferimento a un’occasione' },
  { id: 'fun', surface: '楽しい', partOfSpeech: 'i-adjective', meaning: 'divertente; piacevole', sentenceFunction: 'descrive un’esperienza', variants: [{ surface: '楽しかった', grammarRuleId: 'past-i-adjective' }] },
  { id: 'together', surface: '一緒', partOfSpeech: 'noun', meaning: 'insieme', sentenceFunction: 'indica partecipazione condivisa' },
  { id: 'go', surface: '行く', partOfSpeech: 'verb', meaning: 'andare', sentenceFunction: 'azione', variants: [{ surface: '行こう', grammarRuleId: 'volitional' }] },
  { id: 'thanks', surface: 'ありがとう', partOfSpeech: 'expression', meaning: 'grazie', sentenceFunction: 'esprime gratitudine' },
  { id: 'sorry', surface: 'ごめん', partOfSpeech: 'expression', meaning: 'scusa', sentenceFunction: 'scuse informali' },
  { id: 'okay', surface: '大丈夫', partOfSpeech: 'adjective', meaning: 'va bene; tutto a posto', sentenceFunction: 'valuta una condizione o rassicura' },
  { id: 'well', surface: 'そっか', partOfSpeech: 'expression', meaning: 'ah, capisco', sentenceFunction: 'segnala ricezione di un’informazione' },
  { id: 'really', surface: 'そうなんだ', partOfSpeech: 'expression', meaning: 'è così; davvero', sentenceFunction: 'reazione informale a un’informazione' },
  { id: 'understood', surface: 'わかった', partOfSpeech: 'verb', meaning: 'ho capito', sentenceFunction: 'indica comprensione', variants: [{ surface: 'わかった', grammarRuleId: 'past' }] },
  { id: 'want', surface: 'たい', partOfSpeech: 'auxiliary', meaning: 'volere fare', sentenceFunction: 'marca desiderio dopo una base verbale' },
  { id: 'go-polite', surface: '行きます', partOfSpeech: 'verb', meaning: 'andare (forma cortese)', sentenceFunction: 'azione in forma cortese', variants: [{ surface: '行きます', grammarRuleId: 'polite-masu' }] },
  { id: 'good', surface: 'いい', partOfSpeech: 'i-adjective', meaning: 'buono; va bene', sentenceFunction: 'valuta una cosa o una situazione' },
  { id: 'know', surface: '知る', partOfSpeech: 'verb', meaning: 'sapere; conoscere', sentenceFunction: 'stato di conoscenza' },
  { id: 'person', surface: '人', partOfSpeech: 'noun', meaning: 'persona', sentenceFunction: 'referente umano' },
  { id: 'friend', surface: '友達', partOfSpeech: 'noun', meaning: 'amico; amica', sentenceFunction: 'referente sociale' },
  { id: 'tomorrow', surface: '明日', partOfSpeech: 'noun', meaning: 'domani', sentenceFunction: 'riferimento temporale' },
  { id: 'yesterday', surface: '昨日', partOfSpeech: 'noun', meaning: 'ieri', sentenceFunction: 'riferimento temporale' },
  { id: 'now', surface: '今', partOfSpeech: 'noun', meaning: 'adesso', sentenceFunction: 'riferimento temporale' },
  { id: 'think', surface: '思う', partOfSpeech: 'verb', meaning: 'pensare', sentenceFunction: 'esprime un’opinione o un pensiero' },
  { id: 'do', surface: 'する', partOfSpeech: 'verb', meaning: 'fare', sentenceFunction: 'azione generica' },
  { id: 'eat', surface: '食べる', partOfSpeech: 'verb', meaning: 'mangiare', sentenceFunction: 'azione' },
  { id: 'see', surface: '見る', partOfSpeech: 'verb', meaning: 'vedere; guardare', sentenceFunction: 'azione percettiva' },
  { id: 'meet', surface: '会う', partOfSpeech: 'verb', meaning: 'incontrare', sentenceFunction: 'azione reciproca' },
];

export const particleEntries: DictionaryEntry[] = [
  { id: 'particle-wa', surface: 'は', partOfSpeech: 'particle', meaning: 'tema della frase', sentenceFunction: 'introduce il tema' },
  { id: 'particle-ga', surface: 'が', partOfSpeech: 'particle', meaning: 'soggetto o focus', sentenceFunction: 'marca soggetto o informazione focalizzata' },
  { id: 'particle-o', surface: 'を', partOfSpeech: 'particle', meaning: 'oggetto diretto', sentenceFunction: 'marca l’oggetto dell’azione' },
  { id: 'particle-ni', surface: 'に', partOfSpeech: 'particle', meaning: 'destinazione, tempo o bersaglio', sentenceFunction: 'marca una relazione richiesta dal contesto' },
  { id: 'particle-e', surface: 'へ', partOfSpeech: 'particle', meaning: 'verso', sentenceFunction: 'marca una direzione' },
  { id: 'particle-de', surface: 'で', partOfSpeech: 'particle', meaning: 'luogo o mezzo', sentenceFunction: 'marca luogo dell’azione o mezzo' },
  { id: 'particle-to', surface: 'と', partOfSpeech: 'particle', meaning: 'con; citazione', sentenceFunction: 'marca compagnia o contenuto citato' },
  { id: 'particle-mo', surface: 'も', partOfSpeech: 'particle', meaning: 'anche', sentenceFunction: 'aggiunge un elemento' },
  { id: 'particle-no', surface: 'の', partOfSpeech: 'particle', meaning: 'relazione o possesso', sentenceFunction: 'collega nomi o nominalizza' },
  { id: 'particle-kara', surface: 'から', partOfSpeech: 'particle', meaning: 'da; perché', sentenceFunction: 'marca origine o motivo' },
  { id: 'particle-made', surface: 'まで', partOfSpeech: 'particle', meaning: 'fino a', sentenceFunction: 'marca un limite' },
  { id: 'particle-kana', surface: 'かな', partOfSpeech: 'particle', meaning: 'chissà; forse', sentenceFunction: 'chiusura riflessiva o esitante' },
  { id: 'particle-ne', surface: 'ね', partOfSpeech: 'particle', meaning: 'vero?; eh', sentenceFunction: 'cerca o condivide un accordo' },
  { id: 'particle-yo', surface: 'よ', partOfSpeech: 'particle', meaning: 'enfasi informativa', sentenceFunction: 'presenta l’informazione come nuova o assertiva' },
];

export const grammarSuffixEntries: DictionaryEntry[] = [
  { id: 'suffix-nakatta', surface: 'なかった', partOfSpeech: 'auxiliary', meaning: 'non è successo (passato)', sentenceFunction: 'nega al passato', variants: [{ surface: 'なかった', grammarRuleId: 'negative-past' }] },
  { id: 'suffix-teiru', surface: 'ている', partOfSpeech: 'auxiliary', meaning: 'stare facendo; essere in uno stato', sentenceFunction: 'aspetto progressivo o risultativo', variants: [{ surface: 'ている', grammarRuleId: 'te-iru' }] },
  { id: 'suffix-tai', surface: 'たい', partOfSpeech: 'auxiliary', meaning: 'volere fare', sentenceFunction: 'marca desiderio', variants: [{ surface: 'たい', grammarRuleId: 'desiderative' }] },
  { id: 'suffix-nai', surface: 'ない', partOfSpeech: 'auxiliary', meaning: 'non', sentenceFunction: 'nega un predicato', variants: [{ surface: 'ない', grammarRuleId: 'negative' }] },
  { id: 'suffix-sou', surface: 'そう', partOfSpeech: 'auxiliary', meaning: 'sembra; si dice che', sentenceFunction: 'marca apparenza o informazione riportata', variants: [{ surface: 'そう', grammarRuleId: 'sou' }] },
  { id: 'suffix-tara', surface: 'た', partOfSpeech: 'auxiliary', meaning: 'passato', sentenceFunction: 'marca una forma passata', variants: [{ surface: 'た', grammarRuleId: 'past' }] },
];

export const allLexicalEntries = [...dictionaryEntries, ...particleEntries, ...grammarSuffixEntries];
