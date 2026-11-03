// Interface text in English, Hausa, Yoruba and Igbo.
// The guides themselves are in English for now. The Hausa, Yoruba and Igbo lines
// below are first drafts and should be checked by native-speaking staff before launch.

export const LANGS = [
  { id: 'en', label: 'EN', name: 'English' },
  { id: 'ha', label: 'HA', name: 'Hausa' },
  { id: 'yo', label: 'YO', name: 'Yorùbá' },
  { id: 'ig', label: 'IG', name: 'Igbo' }
];

const STRINGS = {
  en: {
    home: 'Home', guides: 'Guides', figures: 'How it works', tools: 'Tools', toolsLong: 'Tools inventory', ticket: 'Ticket', poster: 'QR poster',
    sectionGuide: 'Field guide', sectionTicket: 'Ticket',
    tagline: 'NPA ICT Operations · interns',
    beforeLeave: 'Before you leave the ICT office',
    goingTo: "I'm going to", forA: 'for a',
    savedOffline: 'saved', notSaved: 'not saved yet',
    tripTotalSaved: (n) => `${n} guides · open with no signal`,
    tripTotalNotSaved: 'Open this app once on Wi-Fi so it can save the guides',
    stuck: 'Stuck on a ticket?',
    heroA: 'Fix it on the spot.', heroB: 'No running back to the office.',
    searchPh: "What's wrong? e.g. printer offline", tryLabel: 'Try',
    browse: 'Browse by problem', popular: 'Most used', guidesCount: (n) => `${n} guide${n === 1 ? '' : 's'}`,
    installEyebrow: 'Works with no network', installTitle: 'Install it before you leave the office.',
    installBody: 'Every guide, figure and tool list is saved on the phone, so it still opens in a basement server room.',
    installBtn: 'Install app', installIos: 'On iPhone: tap Share, then "Add to Home Screen".', installed: 'Installed on this device',
    noSignal: 'No signal? Fine.', online: 'Online', offline: 'Offline',
    savedCount: (a, b) => `${a}/${b} saved`,
    steps: 'steps', min: 'min', youNeed: "You'll need", related: 'Related', seeHow: 'See how it works',
    notReviewed: 'Not yet reviewed', reviewedBy: (n) => `Reviewed by ${n}`,
    confirm: 'confirm with supervisor',
    fixed: 'Fixed?', fixedBody: 'Copy a resolution note for your supervisor.',
    askSenior: 'Ask a senior', copyNote: 'Copy resolution note', copied: 'Copied',
    stillStuck: 'Still stuck?', results: (n) => `${n} results`, noResults: 'Nothing found. Try fewer words, or ask a senior.',
    allCats: 'All', start: 'Start over', manual: 'Manual', auto: 'Auto', bigIdea: 'The big idea:',
    dragToTurn: 'Drag to turn it around', inventoryLede: 'Know what exists and where it is before you leave the office.',
    flowTitle: 'Where the Field Guide fits in a ticket', why: 'Why this exists',
    before: 'Before', after: 'After', print: 'Print poster', back: 'Back',
    langNote: 'Guides are in English for now.'
  },
  ha: {
    home: 'Gida', guides: 'Jagorori', figures: 'Yadda yake aiki', tools: 'Kayan aiki', toolsLong: 'Jerin kayan aiki', ticket: 'Tikiti', poster: 'Fosta QR',
    sectionGuide: 'Jagorar fili', sectionTicket: 'Tikiti',
    tagline: 'NPA ICT · ɗalibai masu horo',
    beforeLeave: 'Kafin ka bar ofishin ICT',
    goingTo: 'Zan je', forA: 'don',
    savedOffline: 'an ajiye', notSaved: 'ba a ajiye ba tukuna',
    tripTotalSaved: (n) => `Jagorori ${n} · suna buɗewa ba tare da sigina ba`,
    tripTotalNotSaved: 'Buɗe manhajar sau ɗaya a Wi-Fi don ta ajiye jagororin',
    stuck: 'Ka makale a kan tikiti?',
    heroA: 'Gyara shi a wurin.', heroB: 'Ba sai ka koma ofis ba.',
    searchPh: 'Me ya lalace? misali: firinta ba ya aiki', tryLabel: 'Gwada',
    browse: 'Duba bisa matsala', popular: 'Wanda aka fi amfani da su', guidesCount: (n) => `jagorori ${n}`,
    installEyebrow: 'Yana aiki ba tare da intanet ba', installTitle: 'Saka shi kafin ka bar ofis.',
    installBody: 'Duk jagorori da hotuna ana ajiye su a wayar, don haka suna buɗewa ko a ɗakin sabar.',
    installBtn: 'Saka manhaja', installIos: 'A iPhone: taɓa Share, sannan "Add to Home Screen".', installed: 'An saka a wannan na\'ura',
    noSignal: 'Babu sigina? Babu matsala.', online: 'Akan layi', offline: 'Babu layi',
    savedCount: (a, b) => `${a}/${b} an ajiye`,
    steps: 'matakai', min: 'minti', youNeed: 'Za ka buƙaci', related: 'Masu alaƙa', seeHow: 'Duba yadda yake aiki',
    notReviewed: 'Ba a duba ba tukuna', reviewedBy: (n) => `${n} ya duba`,
    confirm: 'tabbatar da mai kulawa',
    fixed: 'An gyara?', fixedBody: 'Kwafi bayanin gyara don mai kulawa.',
    askSenior: 'Tambayi babba', copyNote: 'Kwafi bayanin gyara', copied: 'An kwafa',
    stillStuck: 'Har yanzu ka makale?', results: (n) => `sakamako ${n}`, noResults: 'Ba a samu komai ba. Gwada ƙananan kalmomi, ko tambayi babba.',
    allCats: 'Duka', start: 'Fara daga farko', manual: 'Da hannu', auto: 'Kai tsaye', bigIdea: 'Babban ra\'ayi:',
    dragToTurn: 'Ja don juya shi', inventoryLede: 'San abin da ke akwai da inda yake kafin ka fita.',
    flowTitle: 'Inda Jagorar Fili ke shiga cikin tikiti', why: 'Me yasa aka yi wannan',
    before: 'Kafin', after: 'Bayan', print: 'Buga fosta', back: 'Koma',
    langNote: 'Jagorori suna cikin Turanci a yanzu.'
  },
  yo: {
    home: 'Ilé', guides: 'Ìtọ́sọ́nà', figures: 'Bí ó ṣe ń ṣiṣẹ́', tools: 'Irinṣẹ́', toolsLong: 'Àkójọ irinṣẹ́', ticket: 'Tíkẹ́ẹ̀tì', poster: 'Pósítà QR',
    sectionGuide: 'Ìtọ́sọ́nà iṣẹ́', sectionTicket: 'Tíkẹ́ẹ̀tì',
    tagline: 'NPA ICT · àwọn akẹ́kọ̀ọ́ ìdánilẹ́kọ̀ọ́',
    beforeLeave: 'Kí o tó kúrò ní ọ́fíìsì ICT',
    goingTo: 'Mo ń lọ sí', forA: 'fún',
    savedOffline: 'ti fipamọ́', notSaved: 'kò tíì fipamọ́',
    tripTotalSaved: (n) => `ìtọ́sọ́nà ${n} · ó ń ṣí láìsí nẹ́tíwọ̀ọ̀kì`,
    tripTotalNotSaved: 'Ṣí áàpù yìí lẹ́ẹ̀kan lórí Wi-Fi kí ó lè fi àwọn ìtọ́sọ́nà pamọ́',
    stuck: 'Ṣé o há sí orí tíkẹ́ẹ̀tì kan?',
    heroA: 'Tún un ṣe níbẹ̀.', heroB: 'Kò sí pé o ń sáré padà sí ọ́fíìsì.',
    searchPh: 'Kí ló ṣẹlẹ̀? àpẹẹrẹ: printer kò ṣiṣẹ́', tryLabel: 'Gbìyànjú',
    browse: 'Wo gẹ́gẹ́ bí ìṣòro', popular: 'Èyí tí wọ́n ń lò jù', guidesCount: (n) => `ìtọ́sọ́nà ${n}`,
    installEyebrow: 'Ó ń ṣiṣẹ́ láìsí nẹ́tíwọ̀ọ̀kì', installTitle: 'Fi sórí fóònù kí o tó kúrò ní ọ́fíìsì.',
    installBody: 'Gbogbo ìtọ́sọ́nà àti àwòrán wà lórí fóònù, nítorí náà ó ń ṣí kódà nínú yàrá sáfà.',
    installBtn: 'Fi áàpù sí', installIos: 'Lórí iPhone: tẹ Share, lẹ́yìn náà "Add to Home Screen".', installed: 'Ó ti wà lórí ẹ̀rọ yìí',
    noSignal: 'Kò sí nẹ́tíwọ̀ọ̀kì? Kò burú.', online: 'Lórí ayélujára', offline: 'Kò sí lórí ayélujára',
    savedCount: (a, b) => `${a}/${b} ti fipamọ́`,
    steps: 'ìgbésẹ̀', min: 'ìṣẹ́jú', youNeed: 'Ohun tí o nílò', related: 'Tó jọmọ́', seeHow: 'Wo bí ó ṣe ń ṣiṣẹ́',
    notReviewed: 'A kò tíì ṣàyẹ̀wò rẹ̀', reviewedBy: (n) => `${n} ti ṣàyẹ̀wò`,
    confirm: 'jẹ́rìí pẹ̀lú alábòójútó',
    fixed: 'Ṣé o ti tún un ṣe?', fixedBody: 'Daakọ àkọsílẹ̀ àtúnṣe fún alábòójútó rẹ.',
    askSenior: 'Béèrè lọ́wọ́ àgbà', copyNote: 'Daakọ àkọsílẹ̀', copied: 'Ti daakọ',
    stillStuck: 'Ṣé o ṣì há?', results: (n) => `èsì ${n}`, noResults: 'Kò sí nǹkan. Lo ọ̀rọ̀ díẹ̀, tàbí béèrè lọ́wọ́ àgbà.',
    allCats: 'Gbogbo', start: 'Bẹ̀rẹ̀ lẹ́ẹ̀kan sí i', manual: 'Ọwọ́', auto: 'Aládàáṣe', bigIdea: 'Èrò pàtàkì:',
    dragToTurn: 'Fà á láti yí i padà', inventoryLede: 'Mọ ohun tó wà àti ibi tó wà kí o tó jáde.',
    flowTitle: 'Ibi tí Ìtọ́sọ́nà Iṣẹ́ ti wúlò nínú tíkẹ́ẹ̀tì', why: 'Ìdí tí a fi ṣe é',
    before: 'Ṣáájú', after: 'Lẹ́yìn', print: 'Tẹ pósítà', back: 'Padà',
    langNote: 'Àwọn ìtọ́sọ́nà wà ní Gẹ̀ẹ́sì fún báyìí.'
  },
  ig: {
    home: 'Ụlọ', guides: 'Ntụziaka', figures: 'Otú o si arụ ọrụ', tools: 'Ngwaọrụ', toolsLong: 'Ndepụta ngwaọrụ', ticket: 'Tiketi', poster: 'Akwụkwọ QR',
    sectionGuide: 'Ntụziaka ọrụ', sectionTicket: 'Tiketi',
    tagline: 'NPA ICT · ndị na-amụ ọrụ',
    beforeLeave: 'Tupu ị pụọ n\'ọfịs ICT',
    goingTo: 'Ana m aga', forA: 'maka',
    savedOffline: 'echekwara', notSaved: 'echekwabeghị',
    tripTotalSaved: (n) => `ntụziaka ${n} · na-emeghe na-enweghị netwọk`,
    tripTotalNotSaved: 'Mepee ngwa a otu ugboro na Wi-Fi ka o chekwaa ntụziaka',
    stuck: 'Ị kwụsịrị n\'otu tiketi?',
    heroA: 'Dozie ya ebe ahụ.', heroB: 'Agaghị ịgba ọsọ laghachi n\'ọfịs.',
    searchPh: 'Gịnị mebiri? dịka: printer anaghị arụ ọrụ', tryLabel: 'Nwaa',
    browse: 'Chọọ site na nsogbu', popular: 'Ndị a na-ejikarị', guidesCount: (n) => `ntụziaka ${n}`,
    installEyebrow: 'Ọ na-arụ ọrụ na-enweghị netwọk', installTitle: 'Tinye ya tupu ị pụọ n\'ọfịs.',
    installBody: 'Ntụziaka niile na foto dị na ekwentị, ya mere ọ na-emeghe ọbụna n\'ime ụlọ sava.',
    installBtn: 'Tinye ngwa', installIos: 'Na iPhone: pịa Share, wee "Add to Home Screen".', installed: 'Etinyela ya na ngwaọrụ a',
    noSignal: 'Enweghị netwọk? Ọ dị mma.', online: 'Na ịntanetị', offline: 'Enweghị ịntanetị',
    savedCount: (a, b) => `${a}/${b} echekwara`,
    steps: 'nzọụkwụ', min: 'nkeji', youNeed: 'Ihe ị chọrọ', related: 'Ndị metụtara ya', seeHow: 'Hụ otú o si arụ ọrụ',
    notReviewed: 'Enyochabeghị ya', reviewedBy: (n) => `${n} nyochara ya`,
    confirm: 'kwado ya na onye nlekọta',
    fixed: 'Edoziela ya?', fixedBody: 'Detuo ndetu ndozi maka onye nlekọta gị.',
    askSenior: 'Jụọ onye isi', copyNote: 'Detuo ndetu ndozi', copied: 'Edetuola',
    stillStuck: 'Ị ka kwụsịrị?', results: (n) => `nsonaazụ ${n}`, noResults: 'Ọ dịghị ihe achọtara. Jiri okwu ole na ole, ma ọ bụ jụọ onye isi.',
    allCats: 'Niile', start: 'Malite ọzọ', manual: 'Aka', auto: 'Akpaaka', bigIdea: 'Echiche bụ isi:',
    dragToTurn: 'Dọrọ ya ka ọ tụgharịa', inventoryLede: 'Mara ihe dị na ebe ọ dị tupu ị pụọ.',
    flowTitle: 'Ebe Ntụziaka Ọrụ dabara na tiketi', why: 'Ihe kpatara nke a',
    before: 'Tupu', after: 'Mgbe', print: 'Bipụta akwụkwọ', back: 'Laghachi',
    langNote: 'Ntụziaka dị n\'asụsụ Bekee ugbu a.'
  }
};

let current = 'en';
try { const saved = localStorage.getItem('fg-lang'); if (saved && STRINGS[saved]) current = saved; } catch (e) {}

export function getLang() { return current; }
export function setLang(id) {
  if (!STRINGS[id]) return;
  current = id;
  try { localStorage.setItem('fg-lang', id); } catch (e) {}
  document.documentElement.lang = id;
}
export function t(key, ...args) {
  const v = (STRINGS[current] && STRINGS[current][key]) ?? STRINGS.en[key];
  return typeof v === 'function' ? v(...args) : v ?? key;
}
export const _strings = STRINGS;
