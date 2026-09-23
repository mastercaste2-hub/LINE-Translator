import type { DictionaryEntry } from '../types';
import type { VerbClass, VerbForm, VerbMorphology } from '../types';

const godanI: Record<string, string> = {
  'う': 'い', 'く': 'き', 'ぐ': 'ぎ', 'す': 'し', 'つ': 'ち',
  'ぬ': 'に', 'ぶ': 'び', 'む': 'み', 'る': 'り',
};

const godanA: Record<string, string> = {
  'う': 'わ', 'く': 'か', 'ぐ': 'が', 'す': 'さ', 'つ': 'た',
  'ぬ': 'な', 'ぶ': 'ば', 'む': 'ま', 'る': 'ら',
};

const godanO: Record<string, string> = {
  'う': 'お', 'く': 'こ', 'ぐ': 'ご', 'す': 'そ', 'つ': 'と',
  'ぬ': 'の', 'ぶ': 'ぼ', 'む': 'も', 'る': 'ろ',
};

const ichidanHints = new Set(['える', 'ける', 'げる', 'せる', 'てる', 'ねる', 'べる', 'める', 'れる', 'いる', 'きる', 'ぎる', 'じる', 'ちる', 'にる', 'ひる', 'びる', 'みる', 'りる']);
const godanRuExceptions = new Set(['帰る', '知る', '走る', '入る', '切る', '要る', '作る', 'しゃべる', '滑る', '減る', '焦る']);

function inferVerbClass(entry: DictionaryEntry): VerbClass | undefined {
  if (entry.partOfSpeech !== 'verb') return undefined;
  if (entry.verbClass) return entry.verbClass;
  if (entry.surface === 'する' || entry.surface.endsWith('する')) return 'suru';
  if (entry.surface === '来る') return 'kuru';
  if (godanRuExceptions.has(entry.surface)) return 'godan';
  if (entry.surface.endsWith('る')) {
    const ending = entry.surface.slice(-2);
    if (ichidanHints.has(ending)) return 'ichidan';
  }
  return 'godan';
}

function suruStem(dictionary: string) {
  return dictionary.endsWith('する') ? dictionary.slice(0, -2) : '';
}

function conjugateTe(dictionary: string, verbClass: VerbClass): string {
  if (verbClass === 'suru') return suruStem(dictionary) + 'して';
  if (verbClass === 'kuru') return '来て';
  if (dictionary === 'ある') return 'あって';
  if (verbClass === 'ichidan') return dictionary.slice(0, -1) + 'て';
  if (dictionary === '行く') return '行って';

  const ending = dictionary.slice(-1);
  const stem = dictionary.slice(0, -1);
  if (ending === 'う' || ending === 'つ' || ending === 'る') return stem + 'って';
  if (ending === 'む' || ending === 'ぶ' || ending === 'ぬ') return stem + 'んで';
  if (ending === 'く') return stem + 'いて';
  if (ending === 'ぐ') return stem + 'いで';
  if (ending === 'す') return stem + 'して';
  return dictionary;
}

function conjugateTa(dictionary: string, verbClass: VerbClass): string {
  return conjugateTe(dictionary, verbClass).replace(/て$/u, 'た').replace(/で$/u, 'だ');
}

function conjugateMasu(dictionary: string, verbClass: VerbClass): string {
  if (verbClass === 'suru') return suruStem(dictionary) + 'します';
  if (verbClass === 'kuru') return '来ます';
  if (dictionary === 'ある') return 'あります';
  if (verbClass === 'ichidan') return dictionary.slice(0, -1) + 'ます';
  const ending = dictionary.slice(-1);
  return dictionary.slice(0, -1) + (godanI[ending] ?? ending) + 'ます';
}

function conjugateNai(dictionary: string, verbClass: VerbClass): string {
  if (verbClass === 'suru') return suruStem(dictionary) + 'しない';
  if (verbClass === 'kuru') return '来ない';
  if (dictionary === 'ある') return 'ない';
  if (verbClass === 'ichidan') return dictionary.slice(0, -1) + 'ない';
  const ending = dictionary.slice(-1);
  return dictionary.slice(0, -1) + (godanA[ending] ?? ending) + 'ない';
}

function conjugateVolitional(dictionary: string, verbClass: VerbClass): string {
  if (verbClass === 'suru') return suruStem(dictionary) + 'しよう';
  if (verbClass === 'kuru') return '来よう';
  if (dictionary === 'ある') return 'あろう';
  if (verbClass === 'ichidan') return dictionary.slice(0, -1) + 'よう';
  const ending = dictionary.slice(-1);
  return dictionary.slice(0, -1) + (godanO[ending] ?? ending) + 'う';
}

export function conjugateVerb(dictionary: string, verbClass: VerbClass): Record<VerbForm, string> {
  const masu = conjugateMasu(dictionary, verbClass);
  const nai = conjugateNai(dictionary, verbClass);
  const forms: Record<VerbForm, string> = {
    dictionary,
    te: conjugateTe(dictionary, verbClass),
    ta: conjugateTa(dictionary, verbClass),
    masu,
    masen: dictionary === 'ある' ? 'ありません' : masu.replace(/ます$/u, 'ません'),
    mashita: dictionary === 'ある' ? 'ありました' : masu.replace(/ます$/u, 'ました'),
    nai,
    nakatta: dictionary === 'ある' ? 'なかった' : nai.replace(/ない$/u, 'なかった'),
    volitional: conjugateVolitional(dictionary, verbClass),
    'te-iru': conjugateTe(dictionary, verbClass) + 'いる',
    'taku-nai': masu.replace(/ます$/u, 'たくない'),
    'masen-deshita': dictionary === 'ある' ? 'ありませんでした' : masu.replace(/ます$/u, 'ませんでした'),
  };
  return forms;
}

const formLabels: Record<VerbForm, string> = {
  dictionary: '辞書形 · forma dizionario',
  te: 'て形 · forma て',
  ta: 'た形 · passato',
  masu: 'ます形 · forma cortese',
  masen: 'ません形 · negazione cortese',
  mashita: 'ました形 · passato cortese',
  nai: 'ない形 · negazione',
  nakatta: 'なかった形 · negazione al passato',
  volitional: '意向形 · forma volitiva',
  'te-iru': 'ている形 · progressivo/stato',
  'taku-nai': 'たくない形 · desiderativo negativo',
  'masen-deshita': 'ませんでした形 · negazione cortese al passato',
};

export function findVerbMorphology(surface: string, entries: DictionaryEntry[]): VerbMorphology | undefined {
  for (const entry of entries) {
    const verbClass = inferVerbClass(entry);
    if (!verbClass) continue;

    const forms = conjugateVerb(entry.surface, verbClass);
    const matchedForm = (Object.entries(forms) as Array<[VerbForm, string]>)
      .find(([, form]) => form === surface);
    if (!matchedForm) continue;

    const [form] = matchedForm;
    return {
      surface,
      lemma: entry.surface,
      lemmaMeaning: entry.meaning,
      verbClass,
      form,
      formLabel: formLabels[form],
      explanation: explainVerbForm(form, entry.surface, verbClass),
    };
  }
  return undefined;
}

function explainVerbForm(form: VerbForm, dictionary: string, verbClass: VerbClass): string {
  if (form === 'te') {
    if (verbClass === 'ichidan') return `Da ${dictionary}: si elimina る e si aggiunge て.`;
    if (verbClass === 'suru') return `${dictionary} → ${conjugateTe(dictionary, verbClass)}: verbo in する, forma て.`;
    if (verbClass === 'kuru') return '来る → 来て: forma irregolare.';
    if (dictionary === 'ある') return 'ある → あって: forma て irregolare del verbo di esistenza.';
    if (dictionary === '行く') return '行く → 行って: eccezione lessicale della forma て.';
    const ending = dictionary.slice(-1);
    if (ending === 'う' || ending === 'つ' || ending === 'る') return `Finale ${ending} → って.`;
    if (ending === 'む' || ending === 'ぶ' || ending === 'ぬ') return `Finale ${ending} → んで.`;
    if (ending === 'く') return 'Finale く → いて.';
    if (ending === 'ぐ') return 'Finale ぐ → いで.';
    if (ending === 'す') return 'Finale す → して.';
  }
  return `Forma riconosciuta di ${dictionary}.`;
}
