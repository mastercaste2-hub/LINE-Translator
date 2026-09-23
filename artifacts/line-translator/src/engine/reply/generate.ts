import type { JapaneseAnalysis, ReplySuggestion } from '../types';

type ReplyTone = 'Casuale' | 'Educato' | 'Molto educato' | 'Affettuoso' | 'Professionale';

const replyByIntent: Record<string, Record<ReplyTone, ReplySuggestion>> = {
  softWait: {
    Casuale: { japanese: 'うん、待ってるね😊', italian: 'Sì, ti aspetto 😊', explanation: 'Accetta la richiesta di aspettare senza aggiungere un contesto non espresso.' },
    Educato: { japanese: 'はい、待っていますね。', italian: 'Va bene, aspetterò.', explanation: 'Mantiene la richiesta e usa una forma più cortese senza cambiare il contenuto.' },
    'Molto educato': { japanese: 'はい、お待ちしております。', italian: 'Certamente, attenderò.', explanation: 'Risposta molto rispettosa; adatta a un rapporto formale.' },
    Affettuoso: { japanese: 'うん、ゆっくりで大丈夫だよ😊', italian: 'Certo, fai con calma 😊', explanation: 'Rassicura e toglie pressione, mantenendo il senso della richiesta.' },
    Professionale: { japanese: '承知しました。お待ちしております。', italian: 'Ricevuto, attenderò.', explanation: 'Conferma la richiesta con una formulazione professionale.' },
  },
  postpone: {
    Casuale: { japanese: 'うん、また今度ね😊', italian: 'Sì, un’altra volta 😊', explanation: 'Accetta il rinvio senza inventare quale attività verrà fatta.' },
    Educato: { japanese: 'はい、また今度お願いします。', italian: 'Sì, un’altra volta, volentieri.', explanation: 'Accetta il rinvio in modo gentile e prudente.' },
    'Molto educato': { japanese: 'はい、また機会がございましたら、よろしくお願いいたします。', italian: 'Sì, se ci sarà un’altra occasione, ne sarò felice.', explanation: 'Lascia aperta una futura occasione con una formulazione molto rispettosa.' },
    Affettuoso: { japanese: 'うん、また今度ね！楽しみにしてる😊', italian: 'Sì, un’altra volta! Non vedo l’ora 😊', explanation: 'Aggiunge calore senza trasformare il rinvio in una certezza romantica.' },
    Professionale: { japanese: '承知いたしました。またご都合のよい際にお声がけいただけますと幸いです。', italian: 'Capisco. Mi faccia sapere quando le sarà comodo.', explanation: 'Conferma il rinvio senza attribuire un’attività specifica.' },
  },
  invitation: {
    Casuale: { japanese: '私も楽しかった！また一緒に行こうね😊', italian: 'Mi sono divertito/a anch’io! Andiamo di nuovo insieme 😊', explanation: 'Ricambia l’entusiasmo già espresso e riprende l’invito presente nel messaggio.' },
    Educato: { japanese: '私も楽しかったです。またぜひ一緒に行きましょう。', italian: 'Mi sono divertito/a anch’io. Andiamo di nuovo insieme.', explanation: 'Ricambia il piacere e accetta l’invito con una forma più cortese.' },
    'Molto educato': { japanese: '私も楽しい時間を過ごすことができました。またぜひご一緒できれば幸いです。', italian: 'Anch’io ho passato un momento piacevole. Se possibile, sarei felice di stare di nuovo insieme.', explanation: 'Mantiene l’intenzione dell’invito in modo molto rispettoso.' },
    Affettuoso: { japanese: '私も楽しかった！また一緒に行こうね😊', italian: 'Mi sono divertito/a anch’io! Andiamo di nuovo insieme 😊', explanation: 'Ricambia il calore già presente senza introdurre una relazione romantica.' },
    Professionale: { japanese: '私も楽しい時間を過ごせました。また機会がございましたら、ぜひご一緒できれば幸いです。', italian: 'Anch’io ho trascorso un momento piacevole. Se ci sarà un’altra occasione, sarei felice di stare di nuovo insieme.', explanation: 'Mantiene il contenuto positivo con un registro professionale.' },
  },
};

export function generateSafeReply(analysis: JapaneseAnalysis, tone: ReplyTone): ReplySuggestion | null {
  if (analysis.intent === 'wait-request') return replyByIntent.softWait[tone];
  if (analysis.intent === 'postpone') return replyByIntent.postpone[tone];
  if (analysis.intent === 'invitation') return replyByIntent.invitation[tone];
  return null;
}
