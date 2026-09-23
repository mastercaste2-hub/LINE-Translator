import type {
  EngineToken,
  GrammarRelation,
  GrammarRelationKind,
  GrammaticalRole,
  ParticleAnalysis,
  ParticleFunction,
  PhraseAnalysis,
  SentenceStructure,
} from '../types';

const ignoredNeighborTypes = new Set(['whitespace', 'punctuation', 'emoji']);
const movementLemmas = new Set(['行く', '来る', '帰る']);

function nearestContent(tokens: EngineToken[], from: number, step: -1 | 1) {
  for (let index = from + step; index >= 0 && index < tokens.length; index += step) {
    if (ignoredNeighborTypes.has(tokens[index].type) || tokens[index].type === 'particle') continue;
    return index;
  }
  return undefined;
}

function isPredicate(token: EngineToken | undefined) {
  return Boolean(token && (
    token.morphology ||
    token.partOfSpeech === 'verb' ||
    token.partOfSpeech === 'i-adjective' ||
    token.partOfSpeech === 'na-adjective' ||
    token.partOfSpeech === 'adjective' ||
    token.semanticCategory === 'question'
  ));
}

function hasRole(token: EngineToken, role: GrammaticalRole) {
  return token.grammaticalRoles?.includes(role) ?? false;
}

function addRole(token: EngineToken, role: GrammaticalRole) {
  if (!token.grammaticalRoles) token.grammaticalRoles = [];
  if (!token.grammaticalRoles.includes(role)) token.grammaticalRoles.push(role);
}

function relation(
  fromToken: number,
  toToken: number,
  relationKind: GrammarRelationKind,
  particleToken: number | undefined,
  evidence: string,
  confidence = 0.82,
): GrammarRelation {
  return { fromToken, toToken, relation: relationKind, particleToken, confidence, evidence };
}

function resolveParticle(tokens: EngineToken[], index: number, predicateIndex?: number) {
  const token = tokens[index];
  const functions = token.particleFunctions ?? [];
  const previousIndex = nearestContent(tokens, index, -1);
  const nextIndex = nearestContent(tokens, index, 1);
  const previous = previousIndex === undefined ? undefined : tokens[previousIndex];
  const predicate = predicateIndex === undefined ? undefined : tokens[predicateIndex];
  let selectedFunction: ParticleFunction | undefined;
  let appliedFunctions: ParticleFunction[] | undefined;
  let explanation = token.sentenceFunction ?? 'funzione della particella conservata senza disambiguazione';
  let confidence = functions.length > 1 ? 0.48 : 0.8;

  switch (token.text) {
    case 'は':
      selectedFunction = 'topic';
      confidence = 0.88;
      break;
    case 'が':
      selectedFunction = 'subject';
      confidence = 0.75;
      explanation += ' Può inoltre mettere a fuoco il soggetto; la lettura focus resta possibile.';
      break;
    case 'を':
      selectedFunction = 'direct-object';
      confidence = 0.9;
      break;
    case 'に':
      if (previous?.semanticCategory === 'temporal') {
        selectedFunction = 'time-target';
        confidence = 0.86;
      } else if (predicate?.lemma && movementLemmas.has(predicate.lemma)) {
        selectedFunction = 'destination-target';
        confidence = 0.86;
      } else {
        explanation += ' La funzione resta ambigua tra meta, destinatario e riferimento temporale.';
      }
      break;
    case 'へ':
      selectedFunction = 'direction';
      confidence = 0.88;
      break;
    case 'で':
      if (previous?.semanticCategory === 'place') {
        selectedFunction = 'action-location';
        confidence = 0.85;
      } else {
        explanation += ' La funzione resta ambigua tra luogo dell’azione e mezzo.';
      }
      break;
    case 'と':
      if (predicate?.lemma && (predicate.partOfSpeech === 'verb') &&
          ['会う', '行く', '来る'].includes(predicate.lemma)) {
        selectedFunction = 'companion';
        confidence = 0.82;
      } else {
        explanation += ' La funzione resta ambigua tra compagnia e citazione.';
      }
      break;
    case 'も':
      selectedFunction = 'addition';
      confidence = 0.82;
      break;
    case 'の':
      selectedFunction = nextIndex !== undefined ? 'possessive' : undefined;
      confidence = selectedFunction ? 0.84 : 0.42;
      break;
    case 'から':
      explanation += ' Origine e causa non sono disambiguate in questa frase.';
      break;
    case 'まで':
      selectedFunction = 'limit';
      confidence = 0.85;
      break;
    case 'より':
      explanation += ' Confronto e provenienza restano possibili senza una regola locale più specifica.';
      break;
    case 'や':
      selectedFunction = 'non-exhaustive-list';
      confidence = 0.86;
      break;
    case 'かな':
    case 'かなあ':
      selectedFunction = 'uncertainty';
      confidence = 0.9;
      break;
    case 'ね':
      selectedFunction = 'confirmation-seeking';
      confidence = 0.84;
      break;
    case 'よ':
      selectedFunction = 'emphasis';
      confidence = 0.82;
      break;
    case 'よね':
      explanation = 'Combina enfasi e ricerca di accordo.';
      selectedFunction = 'confirmation-seeking';
      appliedFunctions = ['emphasis', 'confirmation-seeking'];
      confidence = 0.82;
      break;
    case 'だね':
      explanation = 'Copula informale con possibile ricerca di accordo.';
      selectedFunction = 'confirmation-seeking';
      appliedFunctions = ['copula', 'confirmation-seeking'];
      confidence = 0.78;
      break;
    case 'か':
      selectedFunction = nextIndex === undefined ? 'question' : undefined;
      confidence = selectedFunction ? 0.86 : 0.55;
      break;
  }

  return {
    analysis: {
      tokenIndex: index,
      surface: token.text,
      candidateFunctions: functions,
      selectedFunction,
      appliedFunctions,
      ambiguity: (!selectedFunction && functions.length > 0) || (functions.length > 1 && (token.text === 'が' || token.text === 'に' || token.text === 'で' || token.text === 'と' || token.text === 'から' || token.text === 'より' || token.text === 'か')),
      confidence,
      explanation,
    } satisfies ParticleAnalysis,
    previousIndex,
    nextIndex,
    selectedFunction,
  };
}

export function buildSentenceStructure(sourceTokens: EngineToken[]) {
  const tokens = sourceTokens.map((token) => ({ ...token, grammaticalRoles: [...(token.grammaticalRoles ?? [])] }));
  const predicateIndexes = tokens.flatMap((token, index) => isPredicate(token) ? [index] : []);
  const mainPredicateIndex = predicateIndexes.at(-1);
  const relationships: GrammarRelation[] = [];
  const phrases: PhraseAnalysis[] = [];
  const particleAnalysis: ParticleAnalysis[] = [];

  for (const [index, token] of tokens.entries()) {
    if (token.partOfSpeech === 'na-adjective') addRole(token, 'modifier');
    if (token.semanticCategory === 'temporal') addRole(token, 'temporal-adjunct');
    if (isPredicate(token)) addRole(token, 'predicate');

    if (token.text === 'な' && token.partOfSpeech === 'auxiliary') {
      const previousIndex = nearestContent(tokens, index, -1);
      const nextIndex = nearestContent(tokens, index, 1);
      if (previousIndex !== undefined && nextIndex !== undefined && tokens[previousIndex].partOfSpeech === 'na-adjective') {
        addRole(tokens[previousIndex], 'modifier');
        relationships.push(relation(previousIndex, nextIndex, 'modifies', index, 'な collega un na-aggettivo al nome seguente.', 0.88));
        phrases.push({ type: 'noun-phrase', tokenIndexes: [previousIndex, index, nextIndex], role: 'modifier', confidence: 0.86 });
      }
    }

    if (token.type !== 'particle') continue;
    const resolved = resolveParticle(tokens, index, mainPredicateIndex);
    particleAnalysis.push(resolved.analysis);
    const leftIndex = resolved.previousIndex;
    if (leftIndex === undefined) continue;
    const left = tokens[leftIndex];
    const rightIndex = resolved.nextIndex;
    let relationKind: GrammarRelationKind | undefined;
    let role: GrammaticalRole | undefined;

    switch (resolved.selectedFunction) {
      case 'topic':
        role = 'topic';
        relationKind = mainPredicateIndex === undefined ? undefined : 'topic-of';
        if (left.semanticCategory === 'temporal' && mainPredicateIndex !== undefined) {
          relationships.push(relation(leftIndex, mainPredicateIndex, 'temporal-context-of', index, 'Il nome è marcato come temporale nel lessico locale.', 0.84));
        }
        break;
      case 'subject':
      case 'subject-focus': role = 'subject'; relationKind = mainPredicateIndex === undefined ? undefined : 'subject-of'; break;
      case 'direct-object': role = 'object'; relationKind = mainPredicateIndex === undefined ? undefined : 'object-of'; break;
      case 'destination-target': role = 'destination'; relationKind = mainPredicateIndex === undefined ? undefined : 'destination-of'; break;
      case 'time-target': role = 'temporal-adjunct'; relationKind = mainPredicateIndex === undefined ? undefined : 'temporal-context-of'; break;
      case 'direction': role = 'destination'; relationKind = mainPredicateIndex === undefined ? undefined : 'destination-of'; break;
      case 'action-location': role = 'location'; relationKind = mainPredicateIndex === undefined ? undefined : 'location-of'; break;
      case 'means': role = 'modifier'; break;
      case 'companion': role = 'companion'; relationKind = mainPredicateIndex === undefined ? undefined : 'companion-of'; break;
      case 'addition': role = left.semanticCategory === 'temporal' ? 'temporal-adjunct' : 'topic'; break;
      case 'possessive':
        role = 'possessor';
        if (rightIndex !== undefined) {
          addRole(tokens[rightIndex], 'nominal-head');
          relationships.push(relation(leftIndex, rightIndex, 'possesses', index, 'の collega il nome precedente al nome seguente.', 0.84));
          phrases.push({ type: 'noun-phrase', tokenIndexes: [leftIndex, index, rightIndex], role: 'nominal-head', confidence: 0.84 });
        }
        break;
      case 'non-exhaustive-list': role = 'modifier'; break;
      case 'confirmation-seeking':
      case 'emphasis':
      case 'uncertainty':
      case 'question':
      case 'copula':
      case 'quotation':
      case 'source-reason':
      case 'limit':
      case 'comparison-source':
      case undefined:
        break;
    }

    if (role) addRole(left, role);
    if (relationKind && mainPredicateIndex !== undefined && leftIndex !== mainPredicateIndex) {
      relationships.push(relation(leftIndex, mainPredicateIndex, relationKind, index, resolved.analysis.explanation, resolved.analysis.confidence));
    }
    if (left.partOfSpeech === 'noun' || left.semanticCategory === 'temporal' || left.semanticCategory === 'person' || left.semanticCategory === 'place') {
      phrases.push({
        type: left.semanticCategory === 'temporal' ? 'temporal-phrase' : 'noun-phrase',
        tokenIndexes: [leftIndex, index],
        role: role ?? 'unknown',
        confidence: resolved.analysis.confidence,
      });
    }
  }

  if (mainPredicateIndex !== undefined) {
    phrases.push({ type: tokens[mainPredicateIndex].semanticCategory === 'question' ? 'question-phrase' : 'predicate-phrase', tokenIndexes: [mainPredicateIndex], role: tokens[mainPredicateIndex].semanticCategory === 'question' ? 'question-focus' : 'predicate', confidence: 0.76 });
    for (const [index, token] of tokens.entries()) {
      if (token.semanticCategory !== 'temporal' || relationships.some((item) => item.fromToken === index && item.relation === 'temporal-context-of')) continue;
      relationships.push(relation(index, mainPredicateIndex, 'temporal-context-of', undefined, 'Il lemma è marcato come temporale nel dizionario locale.', 0.72));
      phrases.push({ type: 'temporal-phrase', tokenIndexes: [index], role: 'temporal-adjunct', confidence: 0.72 });
    }
  }

  const subjectTokens = tokens.flatMap((token, index) => hasRole(token, 'subject') ? [index] : []);
  const subject: SentenceStructure['subject'] = subjectTokens.length
    ? { status: 'explicit', tokenIndexes: subjectTokens }
    : { status: 'omitted/implicit' };

  return {
    tokens,
    particleAnalysis,
    relationships,
    phrases,
    sentenceStructure: {
      predicateTokenIndexes: predicateIndexes,
      subject,
      phrases,
      relationships,
    } satisfies SentenceStructure,
  };
}
