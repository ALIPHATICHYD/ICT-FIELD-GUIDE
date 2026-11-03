// Every guide lives here. To add one, copy an entry, give it a new id and fill it in.
//
// Text in [[double brackets]] is a value only the NPA ICT office knows (a server name,
// an IP range, an internal app name). It shows in the app as a highlighted "confirm with
// supervisor" mark until someone replaces it with the real value.
//
// reviewedBy stays null until a supervisor has checked the guide. The app shows
// "Not yet reviewed" for those, so interns know how far to trust it.

export const CATEGORIES = [
  { id: 'printers', name: 'Printers & shared printing', icon: 'printer' },
  { id: 'software', name: 'Software installs (verified sources)', icon: 'monitor' },
  { id: 'network', name: 'Networking, Wi-Fi & IP', icon: 'wifi' },
  { id: 'email', name: 'NPA email setup', icon: 'mail' },
  { id: 'oracle', name: 'Oracle & databases', icon: 'db' },
  { id: 'apps', name: 'In-house apps & Java', icon: 'app' },
  { id: 'hardware', name: 'PCs, all-in-ones, monitors & UPS', icon: 'tower' },
  { id: 'servers', name: 'Servers & backups', icon: 'server' }
];

export const TICKET_TYPES = [
  { id: 'software', name: 'software issue' },
  { id: 'hardware', name: 'hardware issue' },
  { id: 'network', name: 'network issue' },
  { id: 'email', name: 'email issue' },
  { id: 'printer', name: 'printer issue' }
];

export const GUIDES = [
  // ───────────────────────── PRINTERS ─────────────────────────
  {
    id: 'share-printer-ip',
    cat: 'printers',
    title: 'Share one printer with the whole office over IP',
    summary: 'Give a network printer a fixed address and add it on every PC in the office.',
    minutes: 8, level: 'basic', platform: 'Windows 10 / 11',
    tickets: ['printer', 'network'],
    tags: ['tcp/ip', 'static ip', 'shared printer', 'add printer', 'network printer'],
    need: ['Laptop', 'Cat6 patch cable', 'Department IP sheet'],
    steps: [
      { t: 'Give the printer a fixed IP', b: 'On the printer panel open Settings → Network → TCP/IP (or IPv4) → Manual. Use a free address from the department IP sheet so it never changes.', cmd: 'IP  [[10.x.x.x]]   Mask 255.255.255.0   Gateway [[10.x.x.1]]', shell: 'info' },
      { t: 'Check every PC can reach it', b: 'Run this on one PC in the office. Four replies means the network path is fine.', cmd: 'ping [[printer IP]]', shell: 'cmd' },
      { t: 'Add the printer by IP on each PC', b: 'Settings → Bluetooth & devices → Printers & scanners → Add device → "Add manually" → "Add a printer using an IP address or hostname". Or run this in PowerShell as administrator:', cmd: 'Add-PrinterPort -Name "IP_[[printer IP]]" -PrinterHostAddress "[[printer IP]]"', shell: 'ps' },
      { t: 'Install the driver from the maker\'s site only', b: 'Use the official HP, Canon, Kyocera or Epson support page for the exact model. Never use a driver from a random download site.' },
      { t: 'Print a test page from two PCs', b: 'Printer properties → Print Test Page. If one PC fails, the problem is that PC. If all fail, go back to step 1.' },
      { t: 'Label the printer', b: 'Stick the IP address on the front of the printer. It saves the next intern this whole guide.' }
    ],
    warn: 'Still stuck after step 2? The printer may be on another VLAN. Do not change switch settings yourself: ask a senior and keep the ticket open.',
    related: ['printer-offline', 'wifi-printer', 'paper-jam'],
    figure: 'printer',
    reviewedBy: null
  },
  {
    id: 'printer-offline',
    cat: 'printers',
    title: 'Printer shows "offline" or jobs are stuck in the queue',
    summary: 'Clear the stuck queue, restart the print spooler and check the port.',
    minutes: 6, level: 'basic', platform: 'Windows 10 / 11',
    tickets: ['printer'],
    tags: ['offline', 'spooler', 'queue', 'stuck', 'not printing'],
    need: ['Admin rights on the PC'],
    steps: [
      { t: 'Check the obvious first', b: 'Is the printer on, with no error light, paper loaded and the network or USB cable seated? Does its own panel show an IP address?' },
      { t: 'Turn off "Use printer offline"', b: 'Open the print queue (double-click the printer in Printers & scanners). Under the Printer menu, untick "Use Printer Offline" and "Pause Printing".' },
      { t: 'Restart the print spooler and clear stuck jobs', b: 'Open Command Prompt as administrator and run these three lines one by one:', cmd: 'net stop spooler\ndel /Q /F %systemroot%\\System32\\spool\\PRINTERS\\*\nnet start spooler', shell: 'cmd' },
      { t: 'Check the printer port matches its IP', b: 'Printer properties → Ports. The ticked port must match the IP the printer shows on its panel. If the printer\'s IP changed, add a new port with the right IP (see the guide on sharing a printer over IP).' },
      { t: 'Print a test page', b: 'If it prints, write the fix in your resolution note. If not, turn the printer off for 30 seconds and try once more before escalating.' }
    ],
    related: ['share-printer-ip', 'paper-jam'],
    figure: 'printer',
    reviewedBy: null
  },
  {
    id: 'paper-jam',
    cat: 'printers',
    title: 'Clear a paper jam on a laser printer',
    summary: 'Find the sheet without tearing it and without touching the hot fuser.',
    minutes: 5, level: 'basic', platform: 'Most HP / Canon / Kyocera laser printers',
    tickets: ['printer', 'hardware'],
    tags: ['jam', 'paper', 'fuser', 'roller', 'laserjet'],
    need: ['Torch (phone light is fine)'],
    steps: [
      { t: 'Read the panel message', b: 'Most printers say where the jam is: tray, toner area or rear door. Start there.' },
      { t: 'Turn the printer off and wait', b: 'The fuser runs at about 200 °C. Give it 10 minutes before you reach near the back or the toner area.' },
      { t: 'Pull the sheet in the direction the paper travels', b: 'Hold it with both hands and pull slowly and evenly. Pulling backwards or fast tears it and leaves pieces behind.' },
      { t: 'Check for torn pieces', b: 'Shine a light into the path. A tiny piece left behind causes the next jam.' },
      { t: 'Fan the paper and reload', b: 'Damp or curled paper jams. Fan the stack, square it, and do not fill above the tray\'s max line.' }
    ],
    warn: 'Never use a metal tool inside the printer, and never touch the drum (the green or blue roller): fingerprints show up on every page.',
    related: ['printer-offline'],
    figure: 'printer',
    reviewedBy: null
  },
  {
    id: 'wifi-printer',
    cat: 'printers',
    title: 'Connect a PC to a printer wirelessly',
    summary: 'Put the printer on the office Wi-Fi, then add it like any network printer.',
    minutes: 10, level: 'basic', platform: 'Windows 10 / 11',
    tickets: ['printer', 'network'],
    tags: ['wireless', 'wifi', 'wi-fi direct', 'wps'],
    need: ['Office Wi-Fi name and password from the supervisor'],
    steps: [
      { t: 'Join the printer to the office Wi-Fi', b: 'On the printer panel: Wireless → Wireless Setup Wizard. Pick the office network and type the password. Avoid WPS push-button unless the supervisor allows it.' },
      { t: 'Print the network configuration page', b: 'Most printers can print a "Network Summary" or "Configuration Page". It shows the IP address the printer got.' },
      { t: 'Ask for a reserved address', b: 'Wi-Fi printers get a new IP after a power cut unless the address is reserved on the router or DHCP server. Ask a senior to reserve it.' },
      { t: 'Add it on the PC', b: 'Same as a wired printer: Add device → add using IP address. Then print a test page.' }
    ],
    warn: 'Wi-Fi Direct (the printer\'s own hotspot) works for one person but disconnects the PC from the office network. Do not use it for shared printers.',
    related: ['share-printer-ip', 'no-internet'],
    reviewedBy: null
  },

  // ───────────────────────── SOFTWARE ─────────────────────────
  {
    id: 'free-software-winget',
    cat: 'software',
    title: 'Install common free software from verified sources',
    summary: 'Use winget, Windows\' built-in installer, so every download comes from the official publisher.',
    minutes: 5, level: 'basic', platform: 'Windows 10 (1809+) / 11',
    tickets: ['software'],
    tags: ['winget', 'install', 'chrome', 'pdf reader', '7-zip', 'vlc', 'free software'],
    need: ['Admin rights', 'Internet'],
    steps: [
      { t: 'Check winget is there', b: 'Open PowerShell. If this prints a version number, you are ready. If not, update "App Installer" from the Microsoft Store.', cmd: 'winget --version', shell: 'ps' },
      { t: 'Search before you install', b: 'This shows the exact package ID and who publishes it.', cmd: 'winget search "acrobat reader"', shell: 'ps' },
      { t: 'Install the usual office tools', b: 'One line each. -e means "exact ID", so you never get a look-alike.', cmd: 'winget install -e --id Adobe.Acrobat.Reader.64-bit\nwinget install -e --id Google.Chrome\nwinget install -e --id 7zip.7zip\nwinget install -e --id VideoLAN.VLC', shell: 'ps' },
      { t: 'Update everything in one go', b: 'Good to run on any PC you visit.', cmd: 'winget upgrade --all', shell: 'ps' }
    ],
    warn: 'Never install cracked software or "activators" on an NPA machine. They are the most common way malware gets in.',
    related: ['office-install', 'pc-slow'],
    reviewedBy: null
  },
  {
    id: 'office-install',
    cat: 'software',
    title: 'Install Microsoft Office the official way',
    summary: 'Install Office with the user\'s licensed work account, or with the approved installer from the ICT office.',
    minutes: 15, level: 'basic', platform: 'Windows 10 / 11',
    tickets: ['software'],
    tags: ['office', 'word', 'excel', 'microsoft 365', 'licence', 'activation'],
    need: ['The user\'s work account details, or the approved installer from [[ICT share or USB]]'],
    steps: [
      { t: 'Find out which licence NPA uses on this PC', b: 'Ask the supervisor: is it Microsoft 365 (sign in with a work account) or a volume licence installed from an approved installer at [[ICT share or USB]]?' },
      { t: 'Microsoft 365: install from the portal', b: 'Have the user sign in at office.com with their work account, then Install apps → Microsoft 365 apps. Do not type the user\'s password for them.' },
      { t: 'Volume licence: use the approved installer', b: 'Run the installer the ICT office provides. Do not download Office from any other site.' },
      { t: 'Check it is activated', b: 'Open Word → File → Account. It should say "Product Activated" or show the user\'s licence.' }
    ],
    warn: 'If Office says "unlicensed product", don\'t look for a key online. Log it in your note and ask the supervisor.',
    related: ['free-software-winget', 'outlook-setup'],
    reviewedBy: null
  },
  {
    id: 'pc-slow',
    cat: 'software',
    title: 'PC is very slow or keeps freezing',
    summary: 'Find what is eating the PC, then repair Windows system files.',
    minutes: 20, level: 'medium', platform: 'Windows 10 / 11',
    tickets: ['software', 'hardware'],
    tags: ['slow', 'freeze', 'hang', 'sfc', 'dism', 'disk', 'startup'],
    need: ['Admin rights'],
    steps: [
      { t: 'Look at Task Manager', b: 'Ctrl + Shift + Esc. Sort by CPU, Memory and Disk. A disk stuck at 100% on an old hard drive is the usual cause.' },
      { t: 'Turn off startup apps the user doesn\'t need', b: 'Task Manager → Startup apps. Disable updaters and chat apps. Never disable antivirus.' },
      { t: 'Free up space', b: 'Windows needs at least 10 to 15% of the C: drive free. Run Disk Cleanup and tick "Clean up system files".', cmd: 'cleanmgr /d C:', shell: 'cmd' },
      { t: 'Repair Windows files', b: 'Command Prompt as administrator. DISM first, then SFC. Each can take 10 to 20 minutes.', cmd: 'DISM /Online /Cleanup-Image /RestoreHealth\nsfc /scannow', shell: 'cmd' },
      { t: 'Check the drive', b: 'This schedules a check at the next restart. Tell the user first.', cmd: 'chkdsk C: /f', shell: 'cmd' }
    ],
    warn: 'If the PC still has a spinning hard drive and is very slow, recommend an SSD upgrade in your note. That is the biggest single speed fix.',
    related: ['free-software-winget', 'monitor-no-display'],
    reviewedBy: null
  },

  // ───────────────────────── NETWORK ─────────────────────────
  {
    id: 'no-internet',
    cat: 'network',
    title: 'PC has no network or no internet',
    summary: 'Work outward from the PC: cable, IP address, gateway, DNS.',
    minutes: 10, level: 'basic', platform: 'Windows 10 / 11',
    tickets: ['network'],
    tags: ['no internet', 'ipconfig', 'dns', 'gateway', 'limited', 'apipa', '169.254'],
    need: ['Cable tester (if wired)'],
    steps: [
      { t: 'Check the link light', b: 'Wired: the port light on the PC and on the wall socket or switch should be on. No light means cable, port or switch: test with a known-good cable.' },
      { t: 'Look at the IP address', b: 'An address starting 169.254 means the PC never got one from the server (DHCP).', cmd: 'ipconfig /all', shell: 'cmd' },
      { t: 'Ping outward, step by step', b: 'Gateway first, then the outside world, then a name. Where it stops is where the fault is.', cmd: 'ping [[gateway IP]]\nping 8.8.8.8\nping google.com', shell: 'cmd' },
      { t: 'Renew the address and clear DNS', b: 'Command Prompt as administrator:', cmd: 'ipconfig /release\nipconfig /renew\nipconfig /flushdns', shell: 'cmd' },
      { t: 'Reset the network stack', b: 'Last resort before escalating. Needs a restart.', cmd: 'netsh winsock reset\nnetsh int ip reset', shell: 'cmd' }
    ],
    warn: 'If several PCs in the same office lose network at once, it is not the PCs. Check the switch or tell a senior right away.',
    related: ['crimp-rj45', 'wifi-printer'],
    reviewedBy: null
  },
  {
    id: 'crimp-rj45',
    cat: 'network',
    title: 'Crimp and test an RJ45 network cable',
    summary: 'Make a straight-through T568B cable and prove it with a tester.',
    minutes: 10, level: 'basic', platform: 'Cat5e / Cat6 cable',
    tickets: ['network', 'hardware'],
    tags: ['rj45', 'crimp', 't568b', 'cable', 'patch cable', 'tester'],
    need: ['RJ45 crimping tool', 'RJ45 connectors', 'Cable tester', 'Cat6 cable'],
    steps: [
      { t: 'Strip about 3 cm of the outer jacket', b: 'Don\'t nick the inner wires. Untwist the pairs and straighten them.' },
      { t: 'Line up the wires in T568B order', b: 'Clip facing away from you, pins up, left to right:', cmd: '1 white-orange   2 orange\n3 white-green    4 blue\n5 white-blue     6 green\n7 white-brown    8 brown', shell: 'info' },
      { t: 'Trim and push in', b: 'Cut straight to about 1.3 cm. Push until every wire touches the end of the connector and the jacket is inside the plug.' },
      { t: 'Crimp firmly', b: 'Squeeze the tool all the way. Do both ends in the same order for a normal patch cable.' },
      { t: 'Test', b: 'Plug both ends into the tester. Lights 1 to 8 must step in the same order on both sides. Any missing or out-of-order light: cut it off and redo that end.' }
    ],
    related: ['no-internet'],
    reviewedBy: null
  },

  // ───────────────────────── EMAIL ─────────────────────────
  {
    id: 'outlook-setup',
    cat: 'email',
    title: 'Set up NPA work email in Outlook and on a phone',
    summary: 'Add the user\'s work mailbox to Outlook on Windows and to the Outlook app on their phone.',
    minutes: 8, level: 'basic', platform: 'Outlook for Windows, Outlook for Android / iOS',
    tickets: ['email'],
    tags: ['outlook', 'email', 'mailbox', 'profile', 'phone', 'mobile', 'nigerianports.gov.ng'],
    need: ['The user present to type their own password'],
    steps: [
      { t: 'Confirm the mail system', b: 'Ask the supervisor which system NPA mail runs on: [[Microsoft 365 / Exchange / other]] and the server name if Outlook asks: [[mail server]].' },
      { t: 'Add the account in Outlook', b: 'Open Outlook → File → Add Account. Type the user\'s full address (name@nigerianports.gov.ng) and let Outlook find the settings automatically. The user types their own password.' },
      { t: 'If Outlook can\'t find the settings', b: 'Choose "Advanced options" → "Let me set up my account manually" and use the settings from step 1. Write down what worked for the next person.' },
      { t: 'Set it up on the phone', b: 'Install Microsoft Outlook from the Play Store or App Store, Add account → work address → sign in. Check the user\'s phone screen lock is on.' },
      { t: 'Send a test email', b: 'Send from the PC to the phone and back. Check the time stamp is correct on both.' }
    ],
    warn: 'Never write down or keep a user\'s password. If they forgot it, the password reset goes through the supervisor.',
    related: ['outlook-sync'],
    reviewedBy: null
  },
  {
    id: 'outlook-sync',
    cat: 'email',
    title: 'Outlook won\'t send, receive or sync',
    summary: 'Check offline mode, safe mode, then repair or rebuild the profile.',
    minutes: 15, level: 'medium', platform: 'Outlook for Windows',
    tickets: ['email', 'software'],
    tags: ['outlook', 'sync', 'outbox', 'not receiving', 'ost', 'profile', 'safe mode'],
    need: [],
    steps: [
      { t: 'Check "Work Offline"', b: 'Send / Receive tab → Work Offline must not be highlighted. Check the status bar at the bottom says "Connected".' },
      { t: 'Check the internet and webmail', b: 'Can the user open webmail at [[webmail address]]? If webmail also fails, the problem is the account or network, not Outlook.' },
      { t: 'Start Outlook in safe mode', b: 'Close Outlook, press Win + R and run this. If it works in safe mode, an add-in is the problem: File → Options → Add-ins → disable them one by one.', cmd: 'outlook.exe /safe', shell: 'cmd' },
      { t: 'Repair the account', b: 'File → Account Settings → Account Settings → select the account → Repair.' },
      { t: 'Make a fresh profile', b: 'Control Panel → Mail → Show Profiles → Add. Set up the account in the new profile, choose "Always use this profile", and test. Keep the old profile until the user confirms nothing is missing.' }
    ],
    warn: 'Do not delete a .pst file: it can hold years of the user\'s mail that exists nowhere else.',
    related: ['outlook-setup'],
    reviewedBy: null
  },

  // ───────────────────────── ORACLE ─────────────────────────
  {
    id: 'oracle-tns',
    cat: 'oracle',
    title: 'Oracle errors ORA-12154, ORA-12541, ORA-12170',
    summary: 'The client can\'t find or reach the database. Check tnsnames.ora, then the listener.',
    minutes: 15, level: 'medium', platform: 'Oracle Client / Instant Client on Windows',
    tickets: ['software'],
    tags: ['oracle', 'tns', 'ora-12154', 'ora-12541', 'ora-12170', 'listener', 'tnsnames', 'tnsping'],
    need: ['The service name from the supervisor: [[service name]]'],
    steps: [
      { t: 'Read the exact error number', b: 'ORA-12154: the client can\'t find the name in tnsnames.ora. ORA-12541: it found the server but no listener answered. ORA-12170: timed out (network or firewall).' },
      { t: 'Find which tnsnames.ora is being used', b: 'If TNS_ADMIN is set, that folder wins. If not, it is ORACLE_HOME\\network\\admin.', cmd: 'echo %TNS_ADMIN%\necho %ORACLE_HOME%', shell: 'cmd' },
      { t: 'Check the entry', b: 'Open tnsnames.ora in Notepad. The alias the app uses must exist, with the right host, port and service name. A missing bracket breaks every entry below it.', cmd: '[[ALIAS]] =\n  (DESCRIPTION =\n    (ADDRESS = (PROTOCOL = TCP)(HOST = [[db host]])(PORT = 1521))\n    (CONNECT_DATA = (SERVICE_NAME = [[service name]]))\n  )', shell: 'info' },
      { t: 'Test the name and the port', b: 'tnsping comes with the full client. With Instant Client, test the port instead.', cmd: 'tnsping [[ALIAS]]\npowershell Test-NetConnection [[db host]] -Port 1521', shell: 'cmd' },
      { t: 'Listener down? Escalate', b: 'If the port test fails for every PC, the listener or server is down. That is a DBA task: tell the supervisor, don\'t restart anything on the server yourself.' }
    ],
    related: ['oracle-instant-client', 'inhouse-app-wont-open'],
    reviewedBy: null
  },
  {
    id: 'oracle-instant-client',
    cat: 'oracle',
    title: 'Install Oracle Instant Client on a PC',
    summary: 'Set up the lightweight Oracle client that in-house apps use to reach the database.',
    minutes: 15, level: 'medium', platform: 'Windows 64-bit',
    tickets: ['software'],
    tags: ['oracle', 'instant client', 'install', 'path', 'tns_admin', 'odbc'],
    need: ['Instant Client zip from oracle.com or [[ICT share]]', 'Admin rights'],
    steps: [
      { t: 'Match the version and bitness', b: 'Ask which Instant Client version the app needs: [[version]]. A 32-bit app needs the 32-bit client even on 64-bit Windows.' },
      { t: 'Unzip to a short path', b: 'For example C:\\oracle\\instantclient. Avoid spaces in the path.' },
      { t: 'Add it to PATH and set TNS_ADMIN', b: 'PowerShell as administrator, then sign out and back in.', cmd: '[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\\oracle\\instantclient", "Machine")\n[Environment]::SetEnvironmentVariable("TNS_ADMIN", "C:\\oracle\\instantclient\\network\\admin", "Machine")', shell: 'ps' },
      { t: 'Copy in tnsnames.ora', b: 'Create the network\\admin folder and copy the approved tnsnames.ora from [[ICT share]].' },
      { t: 'Install the Visual C++ runtime if asked', b: 'Instant Client needs the Microsoft Visual C++ Redistributable. Install it from Microsoft\'s site or with winget.', cmd: 'winget install -e --id Microsoft.VCRedist.2015+.x64', shell: 'ps' }
    ],
    related: ['oracle-tns'],
    reviewedBy: null
  },

  // ───────────────────────── IN-HOUSE APPS ─────────────────────────
  {
    id: 'java-runtime',
    cat: 'apps',
    title: 'Install the right Java for an in-house app',
    summary: 'Check which Java the app needs, install it from a trusted source and point the app at it.',
    minutes: 10, level: 'basic', platform: 'Windows 10 / 11',
    tickets: ['software'],
    tags: ['java', 'jre', 'jdk', 'temurin', 'java_home', 'version'],
    need: ['Name of the app and the Java version it needs: [[app name / version]]'],
    steps: [
      { t: 'See what\'s installed', b: 'An error here means no Java is on the PATH.', cmd: 'java -version\nwhere java', shell: 'cmd' },
      { t: 'Install the version the app needs', b: 'Many older in-house apps need Java 8. Eclipse Temurin is a free, trusted build. Use the Oracle JRE only if the ICT office has a licence for it.', cmd: 'winget install -e --id EclipseAdoptium.Temurin.8.JRE', shell: 'ps' },
      { t: 'Set JAVA_HOME if the app asks for it', b: 'Use the folder you just installed into.', cmd: 'setx /M JAVA_HOME "C:\\Program Files\\Eclipse Adoptium\\[[jre folder]]"', shell: 'cmd' },
      { t: 'Open the app again', b: 'Sign out and back in first so the new settings load.' }
    ],
    related: ['inhouse-app-wont-open'],
    reviewedBy: null
  },
  {
    id: 'inhouse-app-wont-open',
    cat: 'apps',
    title: 'An in-house app won\'t open or shows an error',
    summary: 'Work out whether it is the PC, the user\'s account, or the app\'s server.',
    minutes: 10, level: 'basic', platform: 'Any',
    tickets: ['software'],
    tags: ['in-house', 'app', 'error', 'login', 'browser', 'cache', 'shortcut'],
    need: ['A screenshot or photo of the exact error'],
    steps: [
      { t: 'Photograph the exact error', b: 'The exact words and code save time for whoever handles it next.' },
      { t: 'Try a second PC or user', b: 'Same error on another PC means the app or its server. Works elsewhere means this PC or this account.' },
      { t: 'Web app: clear the cache or try another browser', b: 'Ctrl + Shift + Delete → clear cached files. Check the shortcut points to the right address: [[app address]].' },
      { t: 'Desktop app: check Java and Oracle', b: 'Many in-house desktop apps need a specific Java and the Oracle client. See the related guides.' },
      { t: 'Escalate with what you found', b: 'If the app is down for everyone, tell the supervisor right away. Include the error, time, and which PCs you tried.' }
    ],
    related: ['java-runtime', 'oracle-tns'],
    reviewedBy: null
  },

  // ───────────────────────── HARDWARE ─────────────────────────
  {
    id: 'monitor-no-display',
    cat: 'hardware',
    title: 'Monitor shows nothing / "No signal"',
    summary: 'Cable, input source, then the PC itself.',
    minutes: 8, level: 'basic', platform: 'Desktop PCs',
    tickets: ['hardware'],
    tags: ['monitor', 'no signal', 'blank screen', 'hdmi', 'vga', 'displayport', 'ram', 'beep'],
    need: ['Spare video cable', 'Spare monitor if possible'],
    steps: [
      { t: 'Check power and input', b: 'Is the monitor\'s power light on? Use its menu button to pick the right input (HDMI, DisplayPort, VGA).' },
      { t: 'Reseat or swap the cable', b: 'Check the cable is in the graphics card port if the PC has one, not the motherboard port.' },
      { t: 'Swap the monitor', b: 'Try a known-good monitor. If that works, the monitor is faulty. Log the asset tag.' },
      { t: 'Listen to the PC', b: 'Beeps when it starts point to RAM or graphics. Power off, unplug, hold the power button for 10 seconds, then reseat the RAM sticks. Wear the anti-static strap.' }
    ],
    related: ['aio-setup', 'pc-slow'],
    reviewedBy: null
  },
  {
    id: 'ups-beeping',
    cat: 'hardware',
    title: 'UPS is beeping or won\'t hold power',
    summary: 'Read what the beeps mean, check the load and the battery.',
    minutes: 8, level: 'basic', platform: 'Line-interactive desktop UPS (APC, Mercury and similar)',
    tickets: ['hardware'],
    tags: ['ups', 'beeping', 'battery', 'overload', 'power', 'inverter'],
    need: [],
    steps: [
      { t: 'Find out why it is beeping', b: 'On most desktop UPSs: a few beeps every 30 seconds = running on battery. Fast beeping = battery almost empty. Constant tone = overload or fault. Check the model\'s manual or label to be sure.' },
      { t: 'Check the wall power', b: 'Is the wall socket live? Plug in a phone charger to test. The UPS beeps on battery when the mains is out.' },
      { t: 'Check what is plugged in', b: 'Unplug anything that shouldn\'t be there: laser printers, kettles, heaters. They overload the UPS.' },
      { t: 'Run a self-test', b: 'Most UPSs self-test by holding the power button for a few seconds. A "replace battery" light means the battery is worn out. Sealed lead-acid batteries usually last 3 to 5 years.' }
    ],
    warn: 'Never plug a laser printer into the UPS battery outlets. It pulls far more power than the UPS can supply when the fuser heats up.',
    related: ['server-room-checks'],
    figure: 'ups',
    reviewedBy: null
  },
  {
    id: 'aio-setup',
    cat: 'hardware',
    title: 'Set up a new all-in-one PC for a user',
    summary: 'Unbox, connect, name the PC and hand it over properly.',
    minutes: 30, level: 'medium', platform: 'Windows 10 / 11 all-in-one',
    tickets: ['hardware', 'software'],
    tags: ['all-in-one', 'aio', 'new pc', 'setup', 'domain', 'rename'],
    need: ['Asset tag', 'Naming rule from the supervisor: [[PC naming rule]]'],
    steps: [
      { t: 'Unbox and place it', b: 'Fit the stand, plug into the UPS battery outlet (not a printer outlet), connect network and the keyboard and mouse receiver.' },
      { t: 'Record the asset details', b: 'Write down the serial number, asset tag, user and office before you hand it over.' },
      { t: 'Name the PC', b: 'PowerShell as administrator. Use the NPA naming rule, then restart.', cmd: 'Rename-Computer -NewName "[[PC name]]" -Restart', shell: 'ps' },
      { t: 'Join the domain (senior task)', b: 'Joining the NPA domain needs admin credentials. A senior does this step: [[domain name]].' },
      { t: 'Install the user\'s software', b: 'Office, PDF reader, browser, plus the in-house apps the department uses. See the related guides.' },
      { t: 'Hand over', b: 'Have the user sign in, open their email and print a test page before you leave.' }
    ],
    related: ['free-software-winget', 'office-install', 'outlook-setup', 'share-printer-ip'],
    reviewedBy: null
  },

  // ───────────────────────── SERVERS ─────────────────────────
  {
    id: 'server-room-checks',
    cat: 'servers',
    title: 'Daily server room checks',
    summary: 'A five-minute walk-through that catches problems before users notice.',
    minutes: 5, level: 'basic', platform: 'Server room',
    tickets: ['hardware', 'network'],
    tags: ['server room', 'temperature', 'backup', 'ups', 'rack', 'daily check'],
    need: ['Server room checklist sheet'],
    steps: [
      { t: 'Temperature', b: 'The recommended range for server rooms is 18 to 27 °C. If it is warmer, check the air conditioning and tell the supervisor.' },
      { t: 'Lights and alarms', b: 'Look for amber or red lights on servers, switches and storage. Photograph any you find.' },
      { t: 'UPS and power', b: 'The rack UPS should be on mains, not on battery, with no alarms.' },
      { t: 'Backups', b: 'Check last night\'s backup finished in [[backup software / log location]]. A failed backup is reported the same day.' },
      { t: 'Write it in the log', b: 'Date, time, temperature and anything unusual, even if all is fine.' }
    ],
    warn: 'Interns never restart, shut down or unplug a server. Report it, and a senior decides.',
    related: ['ups-beeping'],
    reviewedBy: null
  }
];

export const byId = Object.fromEntries(GUIDES.map((g) => [g.id, g]));
