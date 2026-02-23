import { processQuizQuestions } from '../utils/shuffleOptions';
import { normalizeQuizChoices } from '../utils/normalizeOptionLengths';

export type QuizQuestion = {
  id: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  prompt: string;
  choices: string[];
  answer: number;
  explain: string;
};

export type QuizTopic = {
  name: string;
  icon: string;
  description: string;
  questions: QuizQuestion[];
};

export type QuizLevel = {
  level: 'beginner' | 'intermediate' | 'expert';
  title: string;
  description: string;
  topics: QuizTopic[];
};

// ============================================
// BEGINNER LEVEL QUIZZES
// ============================================

const BEGINNER_BASIC: QuizQuestion[] = [
  {
    id: 'q-beg-basic-1',
    topic: 'Basic Cybersecurity Topics',
    difficulty: 'beginner',
    prompt: 'What is cybersecurity?',
    choices: [
      'Building firewalls only',
      'The practice of protecting systems and data from attacks',
      'Writing code',
      'Managing hardware'
    ],
    answer: 1,
    explain: 'Cybersecurity is the practice of protecting computer systems and networks from information attacks.'
  },
  {
    id: 'q-beg-basic-2',
    topic: 'Basic Cybersecurity Topics',
    difficulty: 'beginner',
    prompt: 'Which of these is NOT a type of malware?',
    choices: ['Virus', 'Firewall', 'Ransomware', 'Trojan'],
    answer: 1,
    explain: 'A firewall is a protective device, not malware. Virus, Ransomware, and Trojan are all malware types.'
  },
  {
    id: 'q-beg-basic-3',
    topic: 'Basic Cybersecurity Topics',
    difficulty: 'beginner',
    prompt: 'What is the main goal of a vulnerability?',
    choices: [
      'To improve security',
      'To be exploited by attackers',
      'To slow down systems',
      'To encrypt data'
    ],
    answer: 1,
    explain: 'A vulnerability is a weakness that can be exploited by attackers to gain unauthorized access.'
  },
  {
    id: 'q-beg-basic-4',
    topic: 'Basic Cybersecurity Topics',
    difficulty: 'beginner',
    prompt: 'What does CIA stand for in cybersecurity?',
    choices: [
      'Central Intelligence Agency',
      'Confidentiality, Integrity, Availability',
      'Cyber Information Architecture',
      'Critical Infrastructure Assessment'
    ],
    answer: 1,
    explain: 'CIA is the security trinity: Confidentiality (privacy), Integrity (accuracy), and Availability (accessibility).'
  },
  {
    id: 'q-beg-basic-5',
    topic: 'Basic Cybersecurity Topics',
    difficulty: 'beginner',
    prompt: 'Why is it important to keep software updated?',
    choices: [
      'To get new features only',
      'Patches fix security vulnerabilities',
      'To improve graphics',
      'To reduce storage'
    ],
    answer: 1,
    explain: 'Software updates often include critical security patches that fix known vulnerabilities.'
  },
];

const BEGINNER_AUTH: QuizQuestion[] = [
  {
    id: 'q-beg-auth-1',
    topic: 'Authentication & Access Control',
    difficulty: 'beginner',
    prompt: 'Which is a strong authentication control?',
    choices: ['MFA', 'Shared passwords', 'Plaintext storage', 'Security through obscurity'],
    answer: 0,
    explain: 'MFA (Multi-Factor Authentication) adds a second factor, greatly reducing account takeover risk.'
  },
  {
    id: 'q-beg-auth-2',
    topic: 'Authentication & Access Control',
    difficulty: 'beginner',
    prompt: 'What does MFA stand for?',
    choices: [
      'Multi-File Authentication',
      'Multi-Factor Authentication',
      'Memory-File Association',
      'Mobile-Free Architecture'
    ],
    answer: 1,
    explain: 'MFA requires multiple verification methods (e.g., password + phone code).'
  },
  {
    id: 'q-beg-auth-3',
    topic: 'Authentication & Access Control',
    difficulty: 'beginner',
    prompt: 'Which password is generally the strongest?',
    choices: ['P@ssw0rd', '12345678', 'MyDogIs3YearsOld!', 'qwerty'],
    answer: 2,
    explain: 'A long passphrase with mixed characters is stronger than short, common passwords.'
  },
  {
    id: 'q-beg-auth-4',
    topic: 'Authentication & Access Control',
    difficulty: 'beginner',
    prompt: 'Which is the best place to store your passwords?',
    choices: ['Browser notes', 'Sticky notes on monitor', 'Password manager', 'Plain text file on desktop'],
    answer: 2,
    explain: 'Password managers securely store and encrypt your passwords.'
  },
  {
    id: 'q-beg-auth-5',
    topic: 'Authentication & Access Control',
    difficulty: 'beginner',
    prompt: 'Why should you avoid reusing the same password everywhere?',
    choices: [
      'It is hard to type',
      'If one site is breached, all your accounts are at risk',
      'Websites forbid it',
      'It makes logging in slower'
    ],
    answer: 1,
    explain: 'Password reuse allows a single breach to compromise many of your accounts.'
  },
];

const BEGINNER_ENCRYPT: QuizQuestion[] = [
  {
    id: 'q-beg-encrypt-1',
    topic: 'Encryption & Data Protection',
    difficulty: 'beginner',
    prompt: 'What does HTTPS add on top of HTTP?',
    choices: ['More ads', 'Encryption and integrity', 'Faster loading', 'Offline support'],
    answer: 1,
    explain: 'HTTPS encrypts traffic and helps ensure it is not modified in transit.'
  },
  {
    id: 'q-beg-encrypt-2',
    topic: 'Encryption & Data Protection',
    difficulty: 'beginner',
    prompt: 'What is encryption?',
    choices: [
      'Storing data on servers',
      'Converting data into a coded format that only authorized parties can decode',
      'Deleting files',
      'Backing up data'
    ],
    answer: 1,
    explain: 'Encryption transforms readable data into ciphertext that requires a key to decrypt.'
  },
  {
    id: 'q-beg-encrypt-3',
    topic: 'Encryption & Data Protection',
    difficulty: 'beginner',
    prompt: 'What is a secure padlock icon on a website?',
    choices: [
      'A decoration',
      'Indicates an HTTPS connection and encrypted data transmission',
      'Shows the site is owned by Google',
      'Means your password is saved'
    ],
    answer: 1,
    explain: 'The padlock icon indicates a valid SSL/TLS certificate and secure HTTPS connection.'
  },
  {
    id: 'q-beg-encrypt-4',
    topic: 'Encryption & Data Protection',
    difficulty: 'beginner',
    prompt: 'Which type of encryption is used for wireless networks like Wi-Fi?',
    choices: ['WEP', 'WPA2/WPA3', 'HTTP', 'FTP'],
    answer: 1,
    explain: 'WPA2/WPA3 are modern encryption standards for Wi-Fi security.'
  },
  {
    id: 'q-beg-encrypt-5',
    topic: 'Encryption & Data Protection',
    difficulty: 'beginner',
    prompt: 'What is a data breach?',
    choices: [
      'A scheduled maintenance',
      'Unauthorized access or exposure of sensitive data',
      'A software update',
      'A backup process'
    ],
    answer: 1,
    explain: 'A data breach is when sensitive information is accessed or stolen by unauthorized parties.'
  },
];

const BEGINNER_NETWORK: QuizQuestion[] = [
  {
    id: 'q-beg-net-1',
    topic: 'Network Security',
    difficulty: 'beginner',
    prompt: 'What is the main purpose of a firewall?',
    choices: ['To design websites', 'To block or allow network traffic', 'To store passwords', 'To speed up the CPU'],
    answer: 1,
    explain: 'Firewalls filter network traffic based on security rules.'
  },
  {
    id: 'q-beg-net-2',
    topic: 'Network Security',
    difficulty: 'beginner',
    prompt: 'Which of these Wi-Fi networks is generally safest to use?',
    choices: ['Open public Wi-Fi', 'WPA2/WPA3 password-protected', 'Unknown hidden network', 'Ad-hoc peer-to-peer network'],
    answer: 1,
    explain: 'WPA2/WPA3-protected networks encrypt wireless traffic with a shared key.'
  },
  {
    id: 'q-beg-net-3',
    topic: 'Network Security',
    difficulty: 'beginner',
    prompt: 'What is a VPN?',
    choices: [
      'A very private network',
      'A Virtual Private Network that encrypts your internet connection',
      'A virus protection network',
      'A visible public network'
    ],
    answer: 1,
    explain: 'A VPN encrypts your connection and masks your IP address for privacy.'
  },
  {
    id: 'q-beg-net-4',
    topic: 'Network Security',
    difficulty: 'beginner',
    prompt: 'Should you use public Wi-Fi without a VPN?',
    choices: ['Always safe', 'Fine for all data', 'Not recommended without a VPN', 'VPNs are useless'],
    answer: 2,
    explain: 'Public Wi-Fi is unencrypted; a VPN protects your data from being intercepted.'
  },
  {
    id: 'q-beg-net-5',
    topic: 'Network Security',
    difficulty: 'beginner',
    prompt: 'What is phishing?',
    choices: [
      'Scanning ports on a server',
      'Sending fake messages to trick users',
      'Encrypting files for backup',
      'Resetting a password'
    ],
    answer: 1,
    explain: 'Phishing uses deceptive messages to trick users into revealing sensitive information.'
  },
];

const BEGINNER_APP: QuizQuestion[] = [
  {
    id: 'q-beg-app-1',
    topic: 'Application Security',
    difficulty: 'beginner',
    prompt: 'What helps prevent SQL injection?',
    choices: ['Parameterized queries', 'String concatenation', 'Dynamic SQL with user input', 'Disabling errors'],
    answer: 0,
    explain: 'Parameterized queries prevent untrusted input from changing query structure.'
  },
  {
    id: 'q-beg-app-2',
    topic: 'Application Security',
    difficulty: 'beginner',
    prompt: 'Which is a good sign that a website might be fake or malicious?',
    choices: ['Typos and strange URLs', 'Valid certificate', 'Secure padlock icon', 'Professional design'],
    answer: 0,
    explain: 'Typos and odd domain names can be red flags for fake or phishing sites.'
  },
  {
    id: 'q-beg-app-3',
    topic: 'Application Security',
    difficulty: 'beginner',
    prompt: 'What is a Cross-Site Scripting (XSS) attack?',
    choices: [
      'A type of browser',
      'Injecting malicious scripts into web pages',
      'A programming language',
      'A file format'
    ],
    answer: 1,
    explain: 'XSS attacks inject malicious scripts that execute in a user\'s browser.'
  },
  {
    id: 'q-beg-app-4',
    topic: 'Application Security',
    difficulty: 'beginner',
    prompt: 'What should you do if a website asks for sensitive information through email?',
    choices: [
      'Reply with your information',
      'Ignore them',
      'Verify through official channels first',
      'Click all links to confirm'
    ],
    answer: 2,
    explain: 'Never send sensitive data via email; always verify through official channels.'
  },
  {
    id: 'q-beg-app-5',
    topic: 'Application Security',
    difficulty: 'beginner',
    prompt: 'What is input validation?',
    choices: [
      'Checking email templates',
      'Verifying user input meets expected format',
      'Validating software licenses',
      'Testing network connections'
    ],
    answer: 1,
    explain: 'Input validation ensures user input is safe and matches expected formats.'
  },
];

const BEGINNER_INCIDENT: QuizQuestion[] = [
  {
    id: 'q-beg-inc-1',
    topic: 'Incident Response',
    difficulty: 'beginner',
    prompt: 'What is the safest way to handle suspicious email attachments?',
    choices: ['Open them to see what they are', 'Forward them to friends', 'Delete or report them', 'Reply asking if it is safe'],
    answer: 2,
    explain: 'Deleting or reporting suspicious attachments prevents malware from executing.'
  },
  {
    id: 'q-beg-inc-2',
    topic: 'Incident Response',
    difficulty: 'beginner',
    prompt: 'If you suspect you have been hacked, what should you do FIRST?',
    choices: [
      'Ignore it',
      'Change your password immediately',
      'Tell all your friends',
      'Wait and see what happens'
    ],
    answer: 1,
    explain: 'Changing your password immediately limits damage from compromised accounts.'
  },
  {
    id: 'q-beg-inc-3',
    topic: 'Incident Response',
    difficulty: 'beginner',
    prompt: 'Which of the following is an example of malware?',
    choices: ['Firewall', 'Antivirus', 'Ransomware', 'Password manager'],
    answer: 2,
    explain: 'Ransomware is malicious software that encrypts data and demands payment.'
  },
  {
    id: 'q-beg-inc-4',
    topic: 'Incident Response',
    difficulty: 'beginner',
    prompt: 'Why should you lock your screen when leaving your desk?',
    choices: ['To save battery', 'To prevent shoulder surfing', 'To prevent unauthorized access', 'To improve Wi-Fi'],
    answer: 2,
    explain: 'Locking your screen stops others from using your account while you are away.'
  },
  {
    id: 'q-beg-inc-5',
    topic: 'Incident Response',
    difficulty: 'beginner',
    prompt: 'You receive an email asking for your login details urgently. What should you do?',
    choices: ['Reply with your credentials', 'Ignore all emails', 'Verify via official channel first', 'Click all links to see what happens'],
    answer: 2,
    explain: 'Always verify using known, trusted channels instead of responding to unsolicited requests.'
  },
];

// ============================================
// INTERMEDIATE LEVEL QUIZZES
// ============================================

const INTERMEDIATE_BASIC: QuizQuestion[] = [
  {
    id: 'q-int-basic-1',
    topic: 'Basic Cybersecurity Topics',
    difficulty: 'intermediate',
    prompt: 'What is the principle of least privilege?',
    choices: [
      'Give all users admin access',
      'Grant users only the permissions they need for their job',
      'Never grant access',
      'All users should have the same permissions'
    ],
    answer: 1,
    explain: 'Least privilege minimizes risk by limiting user permissions to what is necessary.'
  },
  {
    id: 'q-int-basic-2',
    topic: 'Basic Cybersecurity Topics',
    difficulty: 'intermediate',
    prompt: 'What is defense in depth?',
    choices: [
      'Using only one security tool',
      'Implementing multiple layers of security controls',
      'Hiding security measures',
      'Only protecting the perimeter'
    ],
    answer: 1,
    explain: 'Defense in depth uses multiple security layers so if one fails, others provide protection.'
  },
  {
    id: 'q-int-basic-3',
    topic: 'Basic Cybersecurity Topics',
    difficulty: 'intermediate',
    prompt: 'Which is NOT a primary security goal in the CIA triad?',
    choices: ['Confidentiality', 'Integrity', 'Complexity', 'Availability'],
    answer: 2,
    explain: 'The CIA triad consists of Confidentiality, Integrity, and Availability.'
  },
  {
    id: 'q-int-basic-4',
    topic: 'Basic Cybersecurity Topics',
    difficulty: 'intermediate',
    prompt: 'What is a security audit?',
    choices: [
      'Checking financial accounts',
      'Systematic review of security controls and policies',
      'Selling security products',
      'Teaching security'
    ],
    answer: 1,
    explain: 'A security audit reviews controls, policies, and infrastructure to identify gaps.'
  },
  {
    id: 'q-int-basic-5',
    topic: 'Basic Cybersecurity Topics',
    difficulty: 'intermediate',
    prompt: 'What is zero trust security?',
    choices: [
      'No security measures',
      'Trust everyone on the network',
      'Never trust anything; verify everything',
      'Only protect perimeters'
    ],
    answer: 2,
    explain: 'Zero trust assumes no implicit trust and requires continuous verification.'
  },
];

const INTERMEDIATE_AUTH: QuizQuestion[] = [
  {
    id: 'q-int-auth-1',
    topic: 'Authentication & Access Control',
    difficulty: 'intermediate',
    prompt: 'What is the difference between authentication and authorization?',
    choices: [
      'They are the same thing',
      'Authentication verifies who you are; authorization determines what you can do',
      'Authorization is always first',
      'Neither is important'
    ],
    answer: 1,
    explain: 'Authentication identifies users (who are you); authorization grants permissions (what can you do).'
  },
  {
    id: 'q-int-auth-2',
    topic: 'Authentication & Access Control',
    difficulty: 'intermediate',
    prompt: 'What is OAuth 2.0?',
    choices: [
      'A password manager',
      'A protocol for delegated authorization without sharing passwords',
      'An encryption algorithm',
      'A type of malware'
    ],
    answer: 1,
    explain: 'OAuth 2.0 allows users to authorize third-party apps without sharing passwords.'
  },
  {
    id: 'q-int-auth-3',
    topic: 'Authentication & Access Control',
    difficulty: 'intermediate',
    prompt: 'What is Single Sign-On (SSO)?',
    choices: [
      'A type of password',
      'One authentication for multiple applications',
      'Logging in multiple times',
      'A firewall feature'
    ],
    answer: 1,
    explain: 'SSO allows users to authenticate once and access multiple applications without re-entering credentials.'
  },
  {
    id: 'q-int-auth-4',
    topic: 'Authentication & Access Control',
    difficulty: 'intermediate',
    prompt: 'What does RBAC stand for?',
    choices: [
      'Role-Based Access Control',
      'Real-time Buffer Authentication Code',
      'Remote Business Account Control',
      'Rapid Binary Authorization Core'
    ],
    answer: 0,
    explain: 'RBAC is a method of restricting access based on user roles within an organization.'
  },
  {
    id: 'q-int-auth-5',
    topic: 'Authentication & Access Control',
    difficulty: 'intermediate',
    prompt: 'What is the principle of separation of duties?',
    choices: [
      'All users should have the same permissions',
      'Different users should handle different parts of critical processes',
      'No one should have permissions',
      'Give admin access to everyone'
    ],
    answer: 1,
    explain: 'Separation of duties prevents fraud by dividing responsibilities among different people.'
  },
];

const INTERMEDIATE_ENCRYPT: QuizQuestion[] = [
  {
    id: 'q-int-encrypt-1',
    topic: 'Encryption & Data Protection',
    difficulty: 'intermediate',
    prompt: 'What is the difference between symmetric and asymmetric encryption?',
    choices: [
      'They are the same',
      'Symmetric uses one key; asymmetric uses a public and private key pair',
      'Asymmetric is faster',
      'Symmetric is always weaker'
    ],
    answer: 1,
    explain: 'Symmetric encryption uses one shared key; asymmetric uses a public key (anyone) and private key (owner).'
  },
  {
    id: 'q-int-encrypt-2',
    topic: 'Encryption & Data Protection',
    difficulty: 'intermediate',
    prompt: 'What is a hash function?',
    choices: [
      'A type of encryption that can be decrypted',
      'A one-way function that produces a fixed-size output',
      'A method for hiding passwords',
      'A backup technique'
    ],
    answer: 1,
    explain: 'Hash functions produce a unique, irreversible digest; they are used for integrity and password storage.'
  },
  {
    id: 'q-int-encrypt-3',
    topic: 'Encryption & Data Protection',
    difficulty: 'intermediate',
    prompt: 'What is an SSL/TLS certificate?',
    choices: [
      'A password',
      'A digital credential verifying ownership and enabling HTTPS',
      'A malware protection',
      'A type of firewall'
    ],
    answer: 1,
    explain: 'An SSL/TLS certificate proves the server\'s identity and enables secure encrypted connections.'
  },
  {
    id: 'q-int-encrypt-4',
    topic: 'Encryption & Data Protection',
    difficulty: 'intermediate',
    prompt: 'What is public key infrastructure (PKI)?',
    choices: [
      'A way to store passwords',
      'A system for creating, distributing, and validating digital certificates',
      'A type of malware',
      'A network topology'
    ],
    answer: 1,
    explain: 'PKI manages digital certificates and public-private key pairs for secure communications.'
  },
  {
    id: 'q-int-encrypt-5',
    topic: 'Encryption & Data Protection',
    difficulty: 'intermediate',
    prompt: 'What is the purpose of salting a password hash?',
    choices: [
      'To make passwords taste better',
      'To add a random value making rainbow table attacks harder',
      'To encrypt the password',
      'To store it in the database'
    ],
    answer: 1,
    explain: 'A salt is random data added before hashing to prevent precomputed hash attacks.'
  },
];

const INTERMEDIATE_NETWORK: QuizQuestion[] = [
  {
    id: 'q-int-net-1',
    topic: 'Network Security',
    difficulty: 'intermediate',
    prompt: 'What is a DDoS attack?',
    choices: [
      'A password attack',
      'Flooding a target with traffic to make it unavailable',
      'A type of encryption',
      'A backup system'
    ],
    answer: 1,
    explain: 'DDoS (Distributed Denial of Service) overwhelms a target with traffic from multiple sources.'
  },
  {
    id: 'q-int-net-2',
    topic: 'Network Security',
    difficulty: 'intermediate',
    prompt: 'What is an intrusion detection system (IDS)?',
    choices: [
      'A type of lock',
      'Software that monitors network traffic for suspicious activity',
      'A password manager',
      'A backup tool'
    ],
    answer: 1,
    explain: 'An IDS detects and alerts on suspicious network activity and potential attacks.'
  },
  {
    id: 'q-int-net-3',
    topic: 'Network Security',
    difficulty: 'intermediate',
    prompt: 'What is network segmentation?',
    choices: [
      'Deleting network cables',
      'Dividing a network into separate subnets for security',
      'Slowing down network speed',
      'Using only Wi-Fi'
    ],
    answer: 1,
    explain: 'Network segmentation isolates systems to contain breaches and limit lateral movement.'
  },
  {
    id: 'q-int-net-4',
    topic: 'Network Security',
    difficulty: 'intermediate',
    prompt: 'What is a DMZ (demilitarized zone)?',
    choices: [
      'A desert region',
      'A network buffer between internal and external networks',
      'A type of malware',
      'A password reset'
    ],
    answer: 1,
    explain: 'A DMZ isolates public-facing services from internal networks for added protection.'
  },
  {
    id: 'q-int-net-5',
    topic: 'Network Security',
    difficulty: 'intermediate',
    prompt: 'What is port scanning?',
    choices: [
      'Examining network ports for open services',
      'A type of malware',
      'Deleting network ports',
      'A backup technique'
    ],
    answer: 0,
    explain: 'Port scanning identifies open ports and services running on a target system.'
  },
];

const INTERMEDIATE_APP: QuizQuestion[] = [
  {
    id: 'q-int-app-1',
    topic: 'Application Security',
    difficulty: 'intermediate',
    prompt: 'What is a Cross-Site Request Forgery (CSRF)?',
    choices: [
      'A type of encryption',
      'Tricking a user into making unwanted requests on their behalf',
      'A network protocol',
      'A password manager'
    ],
    answer: 1,
    explain: 'CSRF tricks authenticated users into making unauthorized requests to another site.'
  },
  {
    id: 'q-int-app-2',
    topic: 'Application Security',
    difficulty: 'intermediate',
    prompt: 'What is SQL injection?',
    choices: [
      'A type of injection for medical purposes',
      'Inserting malicious SQL code to manipulate databases',
      'A programming language',
      'A backup method'
    ],
    answer: 1,
    explain: 'SQL injection exploits improper input handling to execute unauthorized database commands.'
  },
  {
    id: 'q-int-app-3',
    topic: 'Application Security',
    difficulty: 'intermediate',
    prompt: 'What is OWASP?',
    choices: [
      'A type of software',
      'An organization listing top web application security risks and solutions',
      'A programming language',
      'A malware protection tool'
    ],
    answer: 1,
    explain: 'OWASP is a resource identifying the top web application security risks and mitigation strategies.'
  },
  {
    id: 'q-int-app-4',
    topic: 'Application Security',
    difficulty: 'intermediate',
    prompt: 'What is secure code review?',
    choices: [
      'Reading code aesthetics',
      'Analyzing code for security vulnerabilities before deployment',
      'Checking code formatting',
      'Backing up code'
    ],
    answer: 1,
    explain: 'Secure code review examines code for vulnerabilities and compliance with security standards.'
  },
  {
    id: 'q-int-app-5',
    topic: 'Application Security',
    difficulty: 'intermediate',
    prompt: 'What is a vulnerability assessment?',
    choices: [
      'Evaluating software features',
      'Identifying and analyzing security weaknesses in systems',
      'Measuring network speed',
      'Checking backups'
    ],
    answer: 1,
    explain: 'A vulnerability assessment systematically identifies security weaknesses in systems and applications.'
  },
];

const INTERMEDIATE_INCIDENT: QuizQuestion[] = [
  {
    id: 'q-int-inc-1',
    topic: 'Incident Response',
    difficulty: 'intermediate',
    prompt: 'What are the phases of incident response?',
    choices: [
      'Only detection and response',
      'Preparation, Detection, Containment, Eradication, Recovery, Lessons Learned',
      'Just fixing things',
      'Ignoring issues'
    ],
    answer: 1,
    explain: 'The NIST incident response model includes six phases for handling security incidents.'
  },
  {
    id: 'q-int-inc-2',
    topic: 'Incident Response',
    difficulty: 'intermediate',
    prompt: 'What is a security incident?',
    choices: [
      'A software update',
      'A violation or threat to security policy or systems',
      'A network outage',
      'A scheduled maintenance'
    ],
    answer: 1,
    explain: 'A security incident is any event that violates security policy or impacts system confidentiality, integrity, or availability.'
  },
  {
    id: 'q-int-inc-3',
    topic: 'Incident Response',
    difficulty: 'intermediate',
    prompt: 'What is containment in incident response?',
    choices: [
      'Deleting all systems',
      'Limiting the scope and impact of an active incident',
      'Ignoring the incident',
      'Telling the public'
    ],
    answer: 1,
    explain: 'Containment stops the spread of an incident and prevents further damage.'
  },
  {
    id: 'q-int-inc-4',
    topic: 'Incident Response',
    difficulty: 'intermediate',
    prompt: 'What is forensic analysis?',
    choices: [
      'Analyzing criminal cases',
      'Collecting and analyzing evidence from a security incident',
      'Checking backups',
      'Updating firewalls'
    ],
    answer: 1,
    explain: 'Forensic analysis preserves and analyzes evidence from security incidents for investigation.'
  },
  {
    id: 'q-int-inc-5',
    topic: 'Incident Response',
    difficulty: 'intermediate',
    prompt: 'What is threat hunting?',
    choices: [
      'Hunting animals',
      'Proactively searching for signs of compromise or threats',
      'Waiting for alerts',
      'Ignoring threats'
    ],
    answer: 1,
    explain: 'Threat hunting actively searches for indicators of compromise and advanced threats that may evade detection.'
  },
];

// ============================================
// EXPERT LEVEL QUIZZES
// ============================================

const EXPERT_BASIC: QuizQuestion[] = [
  {
    id: 'q-exp-basic-1',
    topic: 'Basic Cybersecurity Topics',
    difficulty: 'expert',
    prompt: 'What is the NIST Cybersecurity Framework?',
    choices: [
      'A password manager',
      'A set of standards and practices for managing cybersecurity risk',
      'A type of malware',
      'A backup system'
    ],
    answer: 1,
    explain: 'The NIST CSF provides guidelines for organizations to manage cybersecurity risk.'
  },
  {
    id: 'q-exp-basic-2',
    topic: 'Basic Cybersecurity Topics',
    difficulty: 'expert',
    prompt: 'What is threat modeling?',
    choices: [
      'Fashion design for security',
      'Identifying potential threats and designing mitigations',
      'Building computer models',
      'Physical infrastructure planning'
    ],
    answer: 1,
    explain: 'Threat modeling systematically identifies potential attacks and develops countermeasures.'
  },
  {
    id: 'q-exp-basic-3',
    topic: 'Basic Cybersecurity Topics',
    difficulty: 'expert',
    prompt: 'What is the CVSS score?',
    choices: [
      'A password scoring system',
      'A numerical metric rating vulnerability severity from 0-10',
      'A network speed measurement',
      'A backup metric'
    ],
    answer: 1,
    explain: 'The Common Vulnerability Scoring System (CVSS) rates vulnerability severity.'
  },
  {
    id: 'q-exp-basic-4',
    topic: 'Basic Cybersecurity Topics',
    difficulty: 'expert',
    prompt: 'What is the principle of security by design?',
    choices: [
      'Making systems look secure',
      'Building security throughout the entire development lifecycle',
      'Adding security later',
      'Ignoring security initially'
    ],
    answer: 1,
    explain: 'Security by design integrates security requirements from the beginning of development.'
  },
  {
    id: 'q-exp-basic-5',
    topic: 'Basic Cybersecurity Topics',
    difficulty: 'expert',
    prompt: 'What is an APT (Advanced Persistent Threat)?',
    choices: [
      'A type of password',
      'A sophisticated, long-term targeted attack by skilled attackers',
      'A backup system',
      'An automatic patch tool'
    ],
    answer: 1,
    explain: 'An APT is a sophisticated attack campaign by advanced adversaries targeting specific organizations.'
  },
];

const EXPERT_AUTH: QuizQuestion[] = [
  {
    id: 'q-exp-auth-1',
    topic: 'Authentication & Access Control',
    difficulty: 'expert',
    prompt: 'What is the principle of privilege escalation?',
    choices: [
      'Giving everyone admin access',
      'Exploiting vulnerabilities to gain higher privileges',
      'Promoting employees',
      'Increasing network speed'
    ],
    answer: 1,
    explain: 'Privilege escalation is an attack exploiting vulnerabilities to gain higher-level permissions.'
  },
  {
    id: 'q-exp-auth-2',
    topic: 'Authentication & Access Control',
    difficulty: 'expert',
    prompt: 'What is JWT (JSON Web Token)?',
    choices: [
      'A type of password',
      'A token-based authentication mechanism',
      'A backup protocol',
      'A network topology'
    ],
    answer: 1,
    explain: 'JWT is a stateless token containing encoded claims, used for authentication and information exchange.'
  },
  {
    id: 'q-exp-auth-3',
    topic: 'Authentication & Access Control',
    difficulty: 'expert',
    prompt: 'What is SAML?',
    choices: [
      'A type of malware',
      'An XML-based standard for authentication and authorization exchange',
      'A password manager',
      'A backup system'
    ],
    answer: 1,
    explain: 'SAML is an open standard for exchanging authentication information between service providers.'
  },
  {
    id: 'q-exp-auth-4',
    topic: 'Authentication & Access Control',
    difficulty: 'expert',
    prompt: 'What is the purpose of validating JWT "aud" and "iss" claims?',
    choices: [
      'To compress the token',
      'To ensure the token was issued for your application by a trusted authority',
      'To speed up decoding',
      'To enable CORS'
    ],
    answer: 1,
    explain: 'Validating issuer and audience prevents token reuse across unintended services.'
  },
  {
    id: 'q-exp-auth-5',
    topic: 'Authentication & Access Control',
    difficulty: 'expert',
    prompt: 'What is attribute-based access control (ABAC)?',
    choices: [
      'Role-based access only',
      'Access decisions based on attributes (user, resource, environment, action)',
      'A type of password',
      'Simple permission lists'
    ],
    answer: 1,
    explain: 'ABAC makes fine-grained access decisions based on multiple attributes and policies.'
  },
];

const EXPERT_ENCRYPT: QuizQuestion[] = [
  {
    id: 'q-exp-encrypt-1',
    topic: 'Encryption & Data Protection',
    difficulty: 'expert',
    prompt: 'What is the difference between encryption and obfuscation?',
    choices: [
      'They are the same',
      'Encryption uses keys; obfuscation makes code hard to understand but is not cryptographically secure',
      'Obfuscation is more secure',
      'Neither provides security'
    ],
    answer: 1,
    explain: 'Encryption is cryptographically secure; obfuscation only hides information temporarily.'
  },
  {
    id: 'q-exp-encrypt-2',
    topic: 'Encryption & Data Protection',
    difficulty: 'expert',
    prompt: 'What is a collision in cryptography?',
    choices: [
      'Two cars hitting each other',
      'Two different inputs producing the same hash output',
      'A network error',
      'A firewall blocking'
    ],
    answer: 1,
    explain: 'A hash collision occurs when two different inputs produce the same output; modern algorithms resist this.'
  },
  {
    id: 'q-exp-encrypt-3',
    topic: 'Encryption & Data Protection',
    difficulty: 'expert',
    prompt: 'What is perfect forward secrecy (PFS)?',
    choices: [
      'Using forever the same encryption key',
      'Session keys are independent; compromising long-term keys does not compromise past sessions',
      'No encryption at all',
      'Using one password forever'
    ],
    answer: 1,
    explain: 'PFS ensures past encrypted sessions remain secure even if long-term keys are compromised.'
  },
  {
    id: 'q-exp-encrypt-4',
    topic: 'Encryption & Data Protection',
    difficulty: 'expert',
    prompt: 'What is a key derivation function (KDF)?',
    choices: [
      'A type of password',
      'A function deriving cryptographic keys from passwords or other input',
      'A backup system',
      'A network protocol'
    ],
    answer: 1,
    explain: 'KDFs strengthen passwords by deriving strong keys through computationally expensive functions.'
  },
  {
    id: 'q-exp-encrypt-5',
    topic: 'Encryption & Data Protection',
    difficulty: 'expert',
    prompt: 'What is homomorphic encryption?',
    choices: [
      'A type of password',
      'Encryption allowing computations on encrypted data without decryption',
      'A backup method',
      'A network protocol'
    ],
    answer: 1,
    explain: 'Homomorphic encryption allows operations on encrypted data, useful for preserving privacy in cloud computing.'
  },
];

const EXPERT_NETWORK: QuizQuestion[] = [
  {
    id: 'q-exp-net-1',
    topic: 'Network Security',
    difficulty: 'expert',
    prompt: 'What is a man-in-the-middle (MITM) attack?',
    choices: [
      'A physical attack',
      'Intercepting and modifying communications between two parties',
      'A typing error',
      'A network upgrade'
    ],
    answer: 1,
    explain: 'MITM attacks intercept and potentially alter traffic between two communicating parties.'
  },
  {
    id: 'q-exp-net-2',
    topic: 'Network Security',
    difficulty: 'expert',
    prompt: 'What is BGP hijacking?',
    choices: [
      'Stealing routers',
      'Maliciously announcing false IP routes to redirect traffic',
      'A network upgrade',
      'Firewall configuration'
    ],
    answer: 1,
    explain: 'BGP hijacking exploits the Border Gateway Protocol to redirect internet traffic maliciously.'
  },
  {
    id: 'q-exp-net-3',
    topic: 'Network Security',
    difficulty: 'expert',
    prompt: 'What is DNS spoofing?',
    choices: [
      'Changing DNS settings',
      'Forging DNS responses to redirect users to malicious sites',
      'Updating DNS records normally',
      'A network backup'
    ],
    answer: 1,
    explain: 'DNS spoofing poisons DNS caches to redirect users to attackers\' controlled servers.'
  },
  {
    id: 'q-exp-net-4',
    topic: 'Network Security',
    difficulty: 'expert',
    prompt: 'What is a zero-day vulnerability?',
    choices: [
      'A bug discovered today',
      'An unknown vulnerability before vendors and attackers discover it',
      'A vulnerability with zero severity',
      'A patched vulnerability'
    ],
    answer: 1,
    explain: 'A zero-day is an unknown vulnerability exploitable before a patch is available.'
  },
  {
    id: 'q-exp-net-5',
    topic: 'Network Security',
    difficulty: 'expert',
    prompt: 'What is lateral movement?',
    choices: [
      'Moving offices',
      'Expanding access from one compromised system to others within a network',
      'Moving servers',
      'Network upgrades'
    ],
    answer: 1,
    explain: 'Lateral movement is expansion of access from one compromised system to others.'
  },
];

const EXPERT_APP: QuizQuestion[] = [
  {
    id: 'q-exp-app-1',
    topic: 'Application Security',
    difficulty: 'expert',
    prompt: 'What is race condition in concurrency?',
    choices: [
      'A physical race',
      'Multiple threads accessing shared resources in an uncontrolled manner',
      'Network speed',
      'A backup process'
    ],
    answer: 1,
    explain: 'Race conditions occur when multiple threads access shared data concurrently without synchronization.'
  },
  {
    id: 'q-exp-app-2',
    topic: 'Application Security',
    difficulty: 'expert',
    prompt: 'What is a prototype pollution vulnerability?',
    choices: [
      'Polluting prototypes with data',
      'Modifying object prototypes to affect all objects in memory',
      'A backup technique',
      'A network protocol'
    ],
    answer: 1,
    explain: 'Prototype pollution allows attackers to modify object prototypes, affecting application behavior.'
  },
  {
    id: 'q-exp-app-3',
    topic: 'Application Security',
    difficulty: 'expert',
    prompt: 'What is deserialization vulnerability?',
    choices: [
      'Deleting serialized data',
      'Unsafe deserialization allowing arbitrary code execution',
      'A backup method',
      'A network upgrade'
    ],
    answer: 1,
    explain: 'Unsafe deserialization can lead to arbitrary code execution if untrusted data is processed.'
  },
  {
    id: 'q-exp-app-4',
    topic: 'Application Security',
    difficulty: 'expert',
    prompt: 'What is a timing attack?',
    choices: [
      'An attack on time servers',
      'Exploiting timing differences to extract information (e.g., passwords)',
      'A backup strategy',
      'A network protocol'
    ],
    answer: 1,
    explain: 'Timing attacks measure response times to infer information about secret data.'
  },
  {
    id: 'q-exp-app-5',
    topic: 'Application Security',
    difficulty: 'expert',
    prompt: 'What is supply chain attack?',
    choices: [
      'Attacking warehouses',
      'Compromising software or dependencies to attack downstream users',
      'A backup system',
      'A network topology'
    ],
    answer: 1,
    explain: 'Supply chain attacks compromise software or dependencies to reach downstream users and organizations.'
  },
];

const EXPERT_INCIDENT: QuizQuestion[] = [
  {
    id: 'q-exp-inc-1',
    topic: 'Incident Response',
    difficulty: 'expert',
    prompt: 'What is the difference between indicators of compromise (IOCs) and indicators of attack (IOAs)?',
    choices: [
      'They are the same',
      'IOCs are forensic artifacts; IOAs are behavioral indicators of active attacks',
      'IOAs are older',
      'IOCs are more reliable'
    ],
    answer: 1,
    explain: 'IOCs are artifacts of past compromises; IOAs indicate active attack behaviors.'
  },
  {
    id: 'q-exp-inc-2',
    topic: 'Incident Response',
    difficulty: 'expert',
    prompt: 'What is YARA?',
    choices: [
      'A programming language',
      'A tool for pattern matching and malware identification',
      'A backup system',
      'A network protocol'
    ],
    answer: 1,
    explain: 'YARA is a tool and language for identifying and classifying malware based on patterns.'
  },
  {
    id: 'q-exp-inc-3',
    topic: 'Incident Response',
    difficulty: 'expert',
    prompt: 'What is a YARA rule?',
    choices: [
      'A firewall rule',
      'A pattern-matching rule to identify malware or suspicious files',
      'A backup rule',
      'A network topology'
    ],
    answer: 1,
    explain: 'YARA rules define patterns to identify specific malware or file characteristics.'
  },
  {
    id: 'q-exp-inc-4',
    topic: 'Incident Response',
    difficulty: 'expert',
    prompt: 'What is rootkit?',
    choices: [
      'A plant infection',
      'Malware with root/admin privileges to hide itself and control the system',
      'A backup tool',
      'A network protocol'
    ],
    answer: 1,
    explain: 'A rootkit provides attackers with privileged access while hiding its presence.'
  },
  {
    id: 'q-exp-inc-5',
    topic: 'Incident Response',
    difficulty: 'expert',
    prompt: 'What is a post-incident review?',
    choices: [
      'Publishing incident details online',
      'Analyzing an incident to improve processes and prevent recurrence',
      'Ignoring lessons learned',
      'Just moving forward'
    ],
    answer: 1,
    explain: 'Post-incident reviews (or retrospectives) analyze incidents to improve security controls and processes.'
  },
];

// ============================================
// EXPORT STRUCTURED QUIZ DATA
// ============================================

export const STRUCTURED_QUIZZES: QuizLevel[] = [
  {
    level: 'beginner',
    title: 'Beginner Level',
    description: 'Start your cybersecurity journey with fundamental concepts',
    topics: [
      { name: 'Basic Cybersecurity Topics', icon: '🛡️', description: 'Fundamentals of cybersecurity', questions: BEGINNER_BASIC },
      { name: 'Authentication & Access Control', icon: '🔐', description: 'User identity and permissions', questions: BEGINNER_AUTH },
      { name: 'Encryption & Data Protection', icon: '🔒', description: 'Protecting sensitive data', questions: BEGINNER_ENCRYPT },
      { name: 'Network Security', icon: '🌐', description: 'Securing network communications', questions: BEGINNER_NETWORK },
      { name: 'Application Security', icon: '💻', description: 'Secure coding and vulnerabilities', questions: BEGINNER_APP },
      { name: 'Incident Response', icon: '🚨', description: 'Handling security incidents', questions: BEGINNER_INCIDENT },
    ],
  },
  {
    level: 'intermediate',
    title: 'Intermediate Level',
    description: 'Deepen your understanding with advanced topics',
    topics: [
      { name: 'Basic Cybersecurity Topics', icon: '🛡️', description: 'Advanced fundamentals', questions: INTERMEDIATE_BASIC },
      { name: 'Authentication & Access Control', icon: '🔐', description: 'Advanced authentication systems', questions: INTERMEDIATE_AUTH },
      { name: 'Encryption & Data Protection', icon: '🔒', description: 'Cryptographic systems', questions: INTERMEDIATE_ENCRYPT },
      { name: 'Network Security', icon: '🌐', description: 'Advanced network protection', questions: INTERMEDIATE_NETWORK },
      { name: 'Application Security', icon: '💻', description: 'Application attack techniques', questions: INTERMEDIATE_APP },
      { name: 'Incident Response', icon: '🚨', description: 'Incident handling procedures', questions: INTERMEDIATE_INCIDENT },
    ],
  },
  {
    level: 'expert',
    title: 'Expert Level',
    description: 'Master advanced cybersecurity concepts',
    topics: [
      { name: 'Basic Cybersecurity Topics', icon: '🛡️', description: 'Strategic cybersecurity', questions: EXPERT_BASIC },
      { name: 'Authentication & Access Control', icon: '🔐', description: 'Enterprise authentication', questions: EXPERT_AUTH },
      { name: 'Encryption & Data Protection', icon: '🔒', description: 'Advanced cryptography', questions: EXPERT_ENCRYPT },
      { name: 'Network Security', icon: '🌐', description: 'Advanced network attacks', questions: EXPERT_NETWORK },
      { name: 'Application Security', icon: '💻', description: 'Advanced application attacks', questions: EXPERT_APP },
      { name: 'Incident Response', icon: '🚨', description: 'Advanced threat analysis', questions: EXPERT_INCIDENT },
    ],
  },
];

// For backward compatibility with old quiz system
const QUIZ_QUESTIONS_BASE: QuizQuestion[] = [
  ...BEGINNER_BASIC, ...BEGINNER_AUTH, ...BEGINNER_ENCRYPT, ...BEGINNER_NETWORK, ...BEGINNER_APP, ...BEGINNER_INCIDENT,
  ...INTERMEDIATE_BASIC, ...INTERMEDIATE_AUTH, ...INTERMEDIATE_ENCRYPT, ...INTERMEDIATE_NETWORK, ...INTERMEDIATE_APP, ...INTERMEDIATE_INCIDENT,
  ...EXPERT_BASIC, ...EXPERT_AUTH, ...EXPERT_ENCRYPT, ...EXPERT_NETWORK, ...EXPERT_APP, ...EXPERT_INCIDENT,
];

// Shuffle all choices to randomize answer positions
// Then normalize lengths to prevent prediction based on text size
export const QUIZ_QUESTIONS = normalizeQuizChoices(processQuizQuestions(QUIZ_QUESTIONS_BASE));
