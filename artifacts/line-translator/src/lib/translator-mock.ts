export type ReplyTone =
  | 'Casuale'
  | 'Educato'
  | 'Molto educato'
  | 'Affettuoso'
  | 'Professionale';

export type AnalysisResult = {
  source: string;
  translation: string;
  meaning: string;
  subtext: string;
  suggestedReply: string;
  replyTranslation: string;
  replyExplanation: string;
};

export const DEFAULT_SOURCE = '今日はちょっと厳しいかな';
const POSTPONE_MESSAGE = 'また今度ね';
const POSITIVE_MESSAGE = '今日は楽しかった！また一緒に行こうね😊';

export const tones: ReplyTone[] = [
  'Casuale',
  'Educato',
  'Molto educato',
  'Affettuoso',
  'Professionale',
];

type Reply = Pick<
  AnalysisResult,
  'suggestedReply' | 'replyTranslation' | 'replyExplanation'
>;

const softRefusalReplies: Record<ReplyTone, Reply> = {
  Casuale: {
    suggestedReply: 'そっか、わかった！無理しないでね😊',
    replyTranslation: 'Capito, va bene! Non sforzarti troppo 😊',
    replyExplanation:
      'Una risposta spontanea e premurosa: accetta il possibile rifiuto, toglie pressione e invita l’altra persona a non sforzarsi.',
  },
  Educato: {
    suggestedReply: 'そうですか、わかりました。どうぞ無理なさらないでください。',
    replyTranslation: 'Capisco, ho capito. Per favore, non si sforzi troppo.',
    replyExplanation:
      'Un modo gentile e misurato per dire che hai capito, mostrando attenzione senza chiedere spiegazioni.',
  },
  'Molto educato': {
    suggestedReply: '承知しました。どうぞご無理なさらないでください。また機会がありましたら、よろしくお願いします。',
    replyTranslation:
      'Capisco. Non si sforzi troppo. Se ci sarà un’altra occasione, sarò felice di risentirla.',
    replyExplanation:
      'Una formulazione molto rispettosa: riconosce la difficoltà, non mette pressione e lascia aperta una futura occasione.',
  },
  Affettuoso: {
    suggestedReply: 'そっか、わかったよ。無理しないでね。また会えるの楽しみにしてる😊',
    replyTranslation:
      'Capito. Non sforzarti troppo. Non vedo l’ora di rivederti 😊',
    replyExplanation:
      'Una risposta calorosa che rassicura l’altra persona e fa capire che ti farà piacere rivederla.',
  },
  Professionale: {
    suggestedReply: '承知いたしました。またご都合のよい際にお知らせいただけますと幸いです。',
    replyTranslation:
      'Capisco. Le sarei grato/a se mi facesse sapere quando le sarà comodo.',
    replyExplanation:
      'Una risposta professionale e non pressante, adatta per confermare di aver compreso senza chiudere il rapporto.',
  },
};

const postponeReplies: Record<ReplyTone, Reply> = {
  Casuale: {
    suggestedReply: 'うん、また今度行こう😊',
    replyTranslation: 'Sì, andiamo un’altra volta 😊',
    replyExplanation:
      'Una risposta informale che accetta il rinvio con naturalezza e propone di fare l’attività un’altra volta.',
  },
  Educato: {
    suggestedReply: 'はい、また都合のいい時に行きましょう。',
    replyTranslation: 'Sì, andiamo un’altra volta quando ci sarà comodo.',
    replyExplanation:
      'Una risposta gentile che accetta di rimandare e lascia all’altra persona libertà di scegliere un momento adatto.',
  },
  'Molto educato': {
    suggestedReply: 'はい、また機会がございましたら、ぜひご一緒できればと思います。',
    replyTranslation:
      'Sì, se ci sarà un’altra occasione, mi farebbe piacere andarci insieme.',
    replyExplanation:
      'Un modo molto rispettoso per accettare il rinvio e mostrare interesse per una futura occasione insieme.',
  },
  Affettuoso: {
    suggestedReply: 'うん、また一緒に行こうね！楽しみにしてる😊',
    replyTranslation:
      'Sì, andiamo di nuovo insieme! Non vedo l’ora 😊',
    replyExplanation:
      'Una risposta affettuosa: accetta il “un’altra volta” e comunica entusiasmo per rivedersi.',
  },
  Professionale: {
    suggestedReply: '承知いたしました。またご都合のよい際にお声がけいただけますと幸いです。',
    replyTranslation:
      'Capisco. Le sarei grato/a se mi invitasse a partecipare quando le sarà comodo.',
    replyExplanation:
      'Una risposta professionale che conferma il rinvio e invita l’altra persona a ricontattarti quando sarà disponibile.',
  },
};

const positiveReplies: Record<ReplyTone, Reply> = {
  Casuale: {
    suggestedReply: '私も楽しかった！また一緒に行こうね😊',
    replyTranslation:
      'Mi sono divertito/a anch’io! Andiamo di nuovo insieme 😊',
    replyExplanation:
      'Una risposta naturale e amichevole: ricambia l’entusiasmo e conferma volentieri l’idea di rifare l’attività insieme.',
  },
  Educato: {
    suggestedReply: '私も楽しかったです。またぜひ一緒に行きましょう。',
    replyTranslation:
      'Mi sono divertito/a anch’io. Andiamo di nuovo insieme, volentieri.',
    replyExplanation:
      'Una risposta gentile che ricambia il piacere provato e accetta con educazione l’idea di rivedersi.',
  },
  'Molto educato': {
    suggestedReply: '私も楽しい時間を過ごすことができました。またぜひご一緒させていただければ幸いです。',
    replyTranslation:
      'Anch’io ho passato un momento piacevole. Se possibile, sarei felice di poter stare di nuovo in sua compagnia.',
    replyExplanation:
      'Una formulazione molto rispettosa per esprimere gratitudine e desiderio di condividere un’altra occasione.',
  },
  Affettuoso: {
    suggestedReply: '私も楽しかった！また一緒に行こうね😊',
    replyTranslation:
      'Mi sono divertito/a anch’io! Andiamo di nuovo insieme 😊',
    replyExplanation:
      'Una risposta calorosa e affettuosa: ricambia chiaramente la gioia e rafforza l’intenzione di passare altro tempo insieme.',
  },
  Professionale: {
    suggestedReply: '私も楽しい時間を過ごせました。また機会がございましたら、ぜひご一緒できれば幸いです。',
    replyTranslation:
      'Anch’io ho trascorso un momento piacevole. Se ci sarà un’altra occasione, sarei felice di poter stare di nuovo in sua compagnia.',
    replyExplanation:
      'Una risposta positiva ma professionale, che ringrazia per il tempo condiviso senza risultare troppo informale.',
  },
};

const genericReplies: Record<ReplyTone, Reply> = {
  Casuale: {
    suggestedReply: 'そうなんだ！教えてくれてありがとう。',
    replyTranslation: 'Ah, capisco! Grazie per avermelo detto.',
    replyExplanation:
      'Risposta mock generica e casuale: riconosce il messaggio senza fingere di conoscerne il contesto preciso.',
  },
  Educato: {
    suggestedReply: 'そうですか。教えていただき、ありがとうございます。',
    replyTranslation: 'Capisco. Grazie per avermelo comunicato.',
    replyExplanation:
      'Risposta mock generica e gentile: ringrazia l’altra persona senza attribuire un significato non verificato al messaggio.',
  },
  'Molto educato': {
    suggestedReply: 'そうなのですね。お知らせいただき、ありがとうございます。',
    replyTranslation: 'Capisco. Grazie per avermelo fatto sapere.',
    replyExplanation:
      'Risposta mock generica e molto rispettosa: conferma di aver ricevuto il messaggio mantenendo prudenza sul significato.',
  },
  Affettuoso: {
    suggestedReply: 'そうなんだね。教えてくれてありがとう😊',
    replyTranslation: 'Ah, capisco. Grazie per avermelo detto 😊',
    replyExplanation:
      'Risposta mock generica e calorosa: mostra ascolto e vicinanza senza inventare intenzioni o contesto.',
  },
  Professionale: {
    suggestedReply: '承知いたしました。ご連絡いただき、ありがとうございます。',
    replyTranslation: 'Ho preso nota. Grazie per avermi contattato/a.',
    replyExplanation:
      'Risposta mock generica e professionale: conferma la ricezione del messaggio senza interpretarlo oltre ciò che è esplicito.',
  },
};

/**
 * Local prototype adapter. Replace this function with the real analysis client
 * without changing the composer or result components.
 */
export async function analyzeJapaneseMessage(
  message: string,
  tone: ReplyTone,
): Promise<AnalysisResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 620));
  const source = message.trim() || DEFAULT_SOURCE;
  const normalizedSource = source.replace(/\s+/gu, '');

  if (normalizedSource === DEFAULT_SOURCE) {
    const reply = softRefusalReplies[tone];
    return {
      source,
      translation: 'Oggi la vedo un po’ difficile, forse.',
      meaning:
        'È un’espressione morbida e indiretta di difficoltà o di possibile rifiuto. La desinenza かな rende la frase meno definitiva e lascia una certa ambiguità.',
      subtext:
        'Il tono è esitante e non categorico. In base al contesto può voler dire “oggi preferirei di no”, ma non equivale necessariamente a un rifiuto definitivo.',
      ...reply,
    };
  }

  if (normalizedSource === POSTPONE_MESSAGE) {
    const reply = postponeReplies[tone];
    return {
      source,
      translation: 'Un’altra volta, eh. / Facciamo un’altra volta.',
      meaning:
        'Il significato di base è rimandare qualcosa a un’altra occasione. L’intenzione precisa dipende dal contesto: non è corretto considerarlo automaticamente un rifiuto.',
      subtext:
        'ね ammorbidisce la frase e la rende colloquiale. Può essere un rinvio sincero oppure un modo gentile per non decidere ora, ma il testo da solo non permette di stabilirlo.',
      ...reply,
    };
  }

  if (normalizedSource === POSITIVE_MESSAGE) {
    const reply = positiveReplies[tone];
    return {
      source,
      translation: 'Oggi mi sono divertito/a! Andiamo di nuovo insieme 😊',
      meaning:
        'È un messaggio chiaramente positivo: esprime piacere per il tempo passato insieme e un’intenzione amichevole, anche affettuosa, di rifare l’attività.',
      subtext:
        'また一緒に行こうね comunica apertura e desiderio di condividere un’altra esperienza. L’emoji rafforza il calore e l’entusiasmo del messaggio.',
      ...reply,
    };
  }

  const reply = genericReplies[tone];
  return {
    source,
    translation: '[Mock generico] Non posso determinare con certezza una traduzione naturale senza riconoscere il contesto della frase.',
    meaning:
      '[Mock generico] Il testo non corrisponde ai casi locali previsti. Il significato preciso dipende dal contesto e non va inventato.',
    subtext:
      '[Mock generico] Non ci sono abbastanza informazioni per distinguere tono, intenzione o eventuali sottintesi.',
    ...reply,
  };
}