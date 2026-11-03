// ICT tools and spares. This is a starting list: the ICT store should replace the
// quantities and locations with real ones. status: 'ok' | 'low' | 'out'.
export const TOOL_GROUPS = [
  { id: 'net', name: 'Network' },
  { id: 'hw', name: 'Hardware' },
  { id: 'sp', name: 'Spares & consumables' }
];

export const TOOLS = [
  { g: 'net', name: 'RJ45 crimping tool', use: 'Fit RJ45 plugs on Cat5e / Cat6 cable', where: '[[ICT store shelf]]', qty: null, status: 'ok', art: ' _/\\_\n|====|\n \\  /' , guide: 'crimp-rj45' },
  { g: 'net', name: 'LAN cable tester', use: 'Check all 8 wires of a network cable', where: '[[ICT store shelf]]', qty: null, status: 'ok', art: '[o o]\n|::::|\n[____]', guide: 'crimp-rj45' },
  { g: 'net', name: 'Punch-down tool', use: 'Terminate cable on patch panels and wall sockets', where: '[[ICT store shelf]]', qty: null, status: 'ok', art: '  ||\n  ||\n [__]' },
  { g: 'net', name: 'Cat6 cable box (305 m)', use: 'Make patch cables and new runs', where: '[[ICT store]]', qty: null, status: 'ok', art: '(@@@)\n(@@@)' },
  { g: 'net', name: 'Spare network switch', use: 'Swap in when an office switch dies', where: '[[server room rack]]', qty: null, status: 'ok', art: '[::::]\n[::::]' },
  { g: 'hw', name: 'Digital multimeter', use: 'Check power supplies, sockets and cables', where: '[[ICT office drawer]]', qty: null, status: 'ok', art: '.---.\n|8.8|\n\'-o-\'' },
  { g: 'hw', name: 'Anti-static wrist strap', use: 'Wear it every time you open a PC', where: '[[ICT office drawer]]', qty: null, status: 'ok', art: '  O\n /|\n  @' },
  { g: 'hw', name: 'Precision screwdriver set', use: 'Laptops, all-in-ones and printers', where: '[[ICT office drawer]]', qty: null, status: 'ok', art: '|||||\n|||||' },
  { g: 'hw', name: 'POST diagnostic card', use: 'Read error codes from a PC that won\'t start', where: '[[ICT office drawer]]', qty: null, status: 'ok', art: '[88]\n|__|' },
  { g: 'hw', name: 'Bootable USB (Windows installer)', use: 'Reinstall or repair Windows', where: '[[ICT office]]', qty: null, status: 'ok', art: ' ___\n|USB|\n|___|' },
  { g: 'hw', name: 'Compressed air / blower', use: 'Clear dust from PCs and printers', where: '[[ICT office]]', qty: null, status: 'ok', art: ' |~\n[ ]\n[_]' },
  { g: 'sp', name: 'Toner cartridges', use: 'Match the cartridge code to the printer model', where: '[[ICT store shelf]]', qty: null, status: 'ok', art: '[###]\n[###]', guide: 'paper-jam' },
  { g: 'sp', name: 'Thermal paste', use: 'Re-apply when replacing a CPU cooler', where: '[[ICT office drawer]]', qty: null, status: 'ok', art: '  _\n (_)\n |_|' },
  { g: 'sp', name: 'UPS battery 12 V 9 Ah', use: 'Common desktop UPS battery', where: '[[ICT store shelf]]', qty: null, status: 'ok', art: '[+ -]\n[___]', guide: 'ups-beeping' },
  { g: 'sp', name: 'RAM sticks (DDR4)', use: 'Upgrades and swap tests', where: '[[ICT store]]', qty: null, status: 'ok', art: '|||||\n=====', guide: 'monitor-no-display' },
  { g: 'sp', name: 'SSD 256 GB+', use: 'Biggest speed-up for old PCs', where: '[[ICT store]]', qty: null, status: 'ok', art: '[SSD]\n[___]', guide: 'pc-slow' }
];
