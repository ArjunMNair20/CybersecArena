import { processChallenges } from '../utils/shuffleOptions';
import { normalizeChallengeOptions } from '../utils/normalizeOptionLengths';

export type CodeChallenge = {
  id: string;
  title: string;
  snippet: string;
  question: string;
  options: string[];
  answer: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  explanation: string;
};

const CODE_CHALLENGES_BASE: CodeChallenge[] = [
  // ==================== BEGINNER LEVEL ====================
  {
    id: 'sql-injection-1',
    title: 'SQL Injection Vulnerability',
    difficulty: 'beginner',
    snippet: `// Node.js (insecure)
app.get('/user', async (req, res) => {
  const id = req.query.id; // e.g. "1 OR 1=1"
  const rows = await db.query("SELECT * FROM users WHERE id = " + id);
  res.json(rows);
});`,
    question: 'What is the best fix for this SQL injection vulnerability?',
    options: [
      'Sanitize by removing keywords like OR, SELECT',
      'Use parameterized queries/prepared statements',
      'Escape all quotes using string replace',
      'Validate id with regex and proceed with string concat',
    ],
    answer: 1,
    explanation: 'Parameterized queries separate SQL code from data, preventing injection attacks. The database treats user input as data, not executable code.',
  },
  {
    id: 'xss-escape-1',
    title: 'XSS in React Component',
    difficulty: 'beginner',
    snippet: `// React (insecure)
function UserProfile({ user }) {
  return <div dangerouslySetInnerHTML={{ __html: user.bio }} />;
}`,
    question: 'What prevents XSS in this React component?',
    options: [
      'Use DOMPurify/sanitization before setting innerHTML',
      'Use eval() to parse the HTML',
      'Wrap in <pre> tags',
      'Set Content-Type to text/plain only',
    ],
    answer: 0,
    explanation: 'DOMPurify sanitizes HTML by removing malicious scripts while preserving safe formatting. Never use dangerouslySetInnerHTML with untrusted input.',
  },
  {
    id: 'password-hash-1',
    title: 'Password Storage',
    difficulty: 'beginner',
    snippet: `// Insecure: MD5 without salt
function hashPassword(password) {
  const hash = md5(password);
  return hash;
}`,
    question: 'What is the secure way to store passwords?',
    options: [
      'Use bcrypt/argon2 with salt and work factor',
      'Encrypt with AES and store key nearby',
      'Base64 encode and store',
      'SHA1 is sufficient today',
    ],
    answer: 0,
    explanation: 'bcrypt/argon2 are designed for password hashing with built-in salting and configurable work factors to resist brute-force attacks.',
  },
  {
    id: 'api-key-exposure',
    title: 'API Key in Frontend Code',
    difficulty: 'beginner',
    snippet: `// JavaScript (insecure)
const API_KEY = "sk_live_1234567890abcdef";
fetch('https://api.service.com/data', {
  headers: { 'Authorization': 'Bearer ' + API_KEY }
});`,
    question: 'What is the security issue here?',
    options: [
      'API keys should never be in frontend code - use backend proxy',
      'The key format is wrong',
      'Bearer token format is incorrect',
      'No issue, this is secure',
    ],
    answer: 0,
    explanation: 'Frontend code is visible to anyone. API keys in client-side code can be extracted and misused. Always use a backend proxy.',
  },
  {
    id: 'hardcoded-secrets',
    title: 'Hardcoded Database Credentials',
    difficulty: 'beginner',
    snippet: `// Python (insecure)
import mysql.connector

db = mysql.connector.connect(
  host="localhost",
  user="admin",
  password="SuperSecret123!",
  database="users"
)`,
    question: 'What is the secure approach?',
    options: [
      'Use environment variables or secret management service',
      'Encrypt the password in the code',
      'Comment out the password',
      'Use a longer password',
    ],
    answer: 0,
    explanation: 'Credentials should never be hardcoded. Use environment variables, .env files (not committed), or secret management services like AWS Secrets Manager.',
  },
  {
    id: 'cors-misconfig',
    title: 'CORS Configuration',
    difficulty: 'beginner',
    snippet: `// Express.js (insecure)
app.use(cors({
  origin: '*',
  credentials: true
}));`,
    question: 'What is the security risk?',
    options: [
      'Wildcard origin with credentials allows any site to access data',
      'CORS is not needed',
      'Credentials should be false',
      'No security issue',
    ],
    answer: 0,
    explanation: 'Using origin: "*" with credentials: true is insecure. Specify exact allowed origins instead of wildcard when credentials are enabled.',
  },
  {
    id: 'eval-danger',
    title: 'Using eval() with User Input',
    difficulty: 'beginner',
    snippet: `// JavaScript (insecure)
function calculate(expression) {
  const result = eval(expression); // user input
  return result;
}`,
    question: 'Why is this dangerous?',
    options: [
      'eval() executes arbitrary code - allows code injection',
      'eval() is too slow',
      'eval() only works in browsers',
      'No security issue',
    ],
    answer: 0,
    explanation: 'eval() executes JavaScript code, allowing attackers to run malicious code. Use a safe expression parser or validate input strictly.',
  },
  {
    id: 'session-fixation',
    title: 'Session Management',
    difficulty: 'beginner',
    snippet: `// PHP (insecure)
session_start();
if (!isset($_SESSION['user_id'])) {
  $_SESSION['user_id'] = $_GET['user_id'];
}`,
    question: 'What is the vulnerability?',
    options: [
      'Session fixation - attacker can set session ID',
      'No vulnerability',
      'Missing CSRF token',
      'Session timeout not set',
    ],
    answer: 0,
    explanation: 'Accepting user-provided session IDs allows session fixation attacks. Always generate new session IDs on login and regenerate on privilege changes.',
  },
  {
    id: 'file-upload-1',
    title: 'Unrestricted File Upload',
    difficulty: 'beginner',
    snippet: `// Node.js (insecure)
app.post('/upload', (req, res) => {
  const file = req.files.upload;
  file.mv('/uploads/' + file.name);
  res.send('Uploaded');
});`,
    question: 'What security measures are needed?',
    options: [
      'Validate file type, size, and rename files',
      'Only allow .txt files',
      'Check file extension only',
      'No validation needed',
    ],
    answer: 0,
    explanation: 'Validate file type (MIME type, not just extension), limit file size, sanitize filenames, and store outside web root if possible.',
  },
  {
    id: 'http-only-cookie',
    title: 'Cookie Security Flags',
    difficulty: 'beginner',
    snippet: `// Express.js (insecure)
res.cookie('session', token, {
  maxAge: 3600000
});`,
    question: 'What security flags should be added?',
    options: [
      'httpOnly: true, secure: true, sameSite: "strict"',
      'domain: "*"',
      'path: "/" only',
      'No flags needed',
    ],
    answer: 0,
    explanation: 'httpOnly prevents JavaScript access (XSS protection), secure ensures HTTPS-only, sameSite prevents CSRF attacks.',
  },

  // ==================== INTERMEDIATE LEVEL ====================
  {
    id: 'jwt-secret-weak',
    title: 'Weak JWT Secret',
    difficulty: 'intermediate',
    snippet: `// Node.js (insecure)
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: 123 }, 'secret123');`,
    question: 'What makes this JWT implementation insecure?',
    options: [
      'Weak secret, no expiration, and secret in code',
      'JWT format is wrong',
      'Missing algorithm specification',
      'No issues with this code',
    ],
    answer: 0,
    explanation: 'Use strong random secrets (32+ bytes), set expiration (exp), use environment variables, and specify algorithm explicitly.',
  },
  {
    id: 'race-condition',
    title: 'Race Condition in Balance Update',
    difficulty: 'intermediate',
    snippet: `// Node.js (insecure)
async function transfer(from, to, amount) {
  const fromBalance = await db.getBalance(from);
  if (fromBalance >= amount) {
    await db.updateBalance(from, fromBalance - amount);
    await db.updateBalance(to, await db.getBalance(to) + amount);
  }
}`,
    question: 'What vulnerability exists?',
    options: [
      'Race condition - balance can be negative with concurrent requests',
      'No validation',
      'Missing error handling',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Use database transactions with row-level locking or optimistic locking to prevent race conditions in concurrent operations.',
  },
  {
    id: 'path-traversal',
    title: 'Path Traversal Attack',
    difficulty: 'intermediate',
    snippet: `// Node.js (insecure)
app.get('/file', (req, res) => {
  const filename = req.query.file;
  const content = fs.readFileSync('/data/' + filename);
  res.send(content);
});`,
    question: 'How can an attacker exploit this?',
    options: [
      'Use "../../../etc/passwd" to read system files',
      'File extension is wrong',
      'Missing Content-Type header',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Validate and sanitize file paths, use path.resolve() and ensure the resolved path stays within allowed directory. Never trust user input for file paths.',
  },
  {
    id: 'csrf-token-missing',
    title: 'Missing CSRF Protection',
    difficulty: 'intermediate',
    snippet: `// Express.js (insecure)
app.post('/transfer', (req, res) => {
  const { to, amount } = req.body;
  transferMoney(req.user.id, to, amount);
  res.json({ success: true });
});`,
    question: 'What attack is this vulnerable to?',
    options: [
      'CSRF - attacker can trigger actions from other sites',
      'SQL Injection',
      'XSS',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Add CSRF tokens to forms and validate them on state-changing requests. Use SameSite cookies and verify Origin/Referer headers.',
  },
  {
    id: 'timing-attack',
    title: 'Timing Attack in Authentication',
    difficulty: 'intermediate',
    snippet: `// Python (insecure)
def verify_password(stored, provided):
    if len(stored) != len(provided):
        return False
    for i in range(len(stored)):
        if stored[i] != provided[i]:
            return False
    return True`,
    question: 'What vulnerability exists?',
    options: [
      'Timing attack - comparison leaks information via timing',
      'No salt used',
      'Wrong hash algorithm',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Use constant-time comparison functions (like secrets.compare_digest in Python) to prevent timing attacks that reveal password characters.',
  },
  {
    id: 'deserialization',
    title: 'Unsafe Deserialization',
    difficulty: 'intermediate',
    snippet: `// Python (insecure)
import pickle
data = request.get_data()
obj = pickle.loads(data)  # user-controlled`,
    question: 'What is the security risk?',
    options: [
      'Deserialization can execute arbitrary code (RCE)',
      'Memory usage too high',
      'Format not JSON',
      'No security issue',
    ],
    answer: 0,
    explanation: 'Never deserialize untrusted data. Use safe formats like JSON, or if you must use pickle, verify data integrity and use restricted unpicklers.',
  },
  {
    id: 'ssrf-attack',
    title: 'Server-Side Request Forgery',
    difficulty: 'intermediate',
    snippet: `// Node.js (insecure)
app.get('/fetch', async (req, res) => {
  const url = req.query.url;
  const response = await fetch(url);
  res.send(await response.text());
});`,
    question: 'What attack is possible?',
    options: [
      'SSRF - attacker can access internal services',
      'XSS only',
      'No vulnerability',
      'Rate limiting needed',
    ],
    answer: 0,
    explanation: 'Validate URLs, whitelist allowed domains, block private IP ranges (127.0.0.1, 10.x.x.x, 192.168.x.x), and use URL parsing libraries.',
  },
  {
    id: 'oracle-padding',
    title: 'Padding Oracle Attack',
    difficulty: 'intermediate',
    snippet: `// Node.js (insecure)
function decrypt(data) {
  try {
    return crypto.decrypt(data);
  } catch (e) {
    return { error: 'Decryption failed' };
  }
}`,
    question: 'What information leak exists?',
    options: [
      'Error messages reveal padding validity (padding oracle)',
      'No error handling',
      'Missing key',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Use authenticated encryption (AEAD) like AES-GCM, or ensure error messages are identical for all decryption failures to prevent padding oracle attacks.',
  },
  {
    id: 'insecure-random',
    title: 'Weak Random Number Generation',
    difficulty: 'intermediate',
    snippet: `// JavaScript (insecure)
function generateToken() {
  return Math.random().toString(36).substring(2);
}`,
    question: 'Why is this insecure?',
    options: [
      'Math.random() is predictable - use crypto.getRandomValues()',
      'Token too short',
      'Wrong encoding',
      'No issue',
    ],
    answer: 0,
    explanation: 'Math.random() uses a predictable PRNG. Use crypto.getRandomValues() or crypto.randomBytes() for cryptographically secure random numbers.',
  },
  {
    id: 'xml-external-entity',
    title: 'XXE Vulnerability',
    difficulty: 'intermediate',
    snippet: `// Java (insecure)
DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
DocumentBuilder builder = factory.newDocumentBuilder();
Document doc = builder.parse(new InputSource(userXml));`,
    question: 'What attack is possible?',
    options: [
      'XXE - can read local files or cause DoS',
      'XSS only',
      'No vulnerability',
      'Missing validation',
    ],
    answer: 0,
    explanation: 'Disable external entity processing: setFeature("http://apache.org/xml/features/disallow-doctype-decl", true) and setFeature("http://xml.org/sax/features/external-general-entities", false).',
  },

  // ==================== EXPERT LEVEL ====================
  {
    id: 'prototype-pollution',
    title: 'Prototype Pollution',
    difficulty: 'expert',
    snippet: `// JavaScript (insecure)
function merge(target, source) {
  for (let key in source) {
    target[key] = source[key];
  }
  return target;
}
const config = merge({}, userInput);`,
    question: 'What vulnerability exists?',
    options: [
      'Prototype pollution - can modify Object.prototype',
      'No validation',
      'Missing error handling',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Use Object.hasOwnProperty() check or Object.create(null) for target. Never merge untrusted objects directly - use libraries like lodash.merge with safe defaults.',
  },
  {
    id: 'cache-poisoning',
    title: 'HTTP Cache Poisoning',
    difficulty: 'expert',
    snippet: `// Express.js (insecure)
app.get('/api/data', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.json({ data: req.headers['x-user-id'] });
});`,
    question: 'What attack is possible?',
    options: [
      'Cache poisoning - attacker can cache malicious responses',
      'No caching needed',
      'Missing ETag',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Never cache responses based on user-controlled headers. Use Vary header properly, validate cache keys, and ensure user-specific data is not cached.',
  },
  {
    id: 'dns-rebinding',
    title: 'DNS Rebinding Attack',
    difficulty: 'expert',
    snippet: `// Node.js (insecure)
app.get('/admin', (req, res) => {
  const ip = req.ip;
  if (ip === '127.0.0.1') {
    return adminPanel();
  }
  return res.status(403).send('Forbidden');
});`,
    question: 'What vulnerability exists?',
    options: [
      'DNS rebinding - attacker can make requests appear from localhost',
      'IP check is wrong',
      'Missing authentication',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Never trust IP-based authentication. Use proper authentication tokens. If you must check IPs, validate against a whitelist and be aware of proxy headers.',
  },
  {
    id: 'hash-collision',
    title: 'Hash Collision DoS',
    difficulty: 'expert',
    snippet: `// Python (insecure)
data = {}
for item in user_input:
    data[hash(item)] = item  # Using default hash()`,
    question: 'What attack is possible?',
    options: [
      'Hash collision DoS - attacker can create many collisions',
      'No validation',
      'Hash too short',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Use cryptographically secure hashes with random seeds, or limit input size. Python\'s hash() is deterministic and vulnerable to collision attacks.',
  },
  {
    id: 'regex-dos',
    title: 'ReDoS (Regular Expression DoS)',
    difficulty: 'expert',
    snippet: `// JavaScript (insecure)
function validateEmail(email) {
  const regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}`,
    question: 'What vulnerability exists?',
    options: [
      'ReDoS - catastrophic backtracking can cause DoS',
      'Regex is too complex',
      'Missing validation',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Avoid nested quantifiers and use atomic groups or possessive quantifiers. Use well-tested libraries for email validation. Set regex timeouts.',
  },
  {
    id: 'time-of-check-time-of-use',
    title: 'TOCTOU Race Condition',
    difficulty: 'expert',
    snippet: `// Python (insecure)
if os.path.exists(filename) and os.access(filename, os.R_OK):
    with open(filename) as f:
        content = f.read()`,
    question: 'What vulnerability exists?',
    options: [
      'TOCTOU - file can change between check and use',
      'No error handling',
      'Missing file lock',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Check and use atomically. Open the file directly and handle errors, or use file locks. Never check then use - always use then handle errors.',
  },
  {
    id: 'insecure-direct-object',
    title: 'Insecure Direct Object Reference',
    difficulty: 'expert',
    snippet: `// Express.js (insecure)
app.get('/api/user/:id/files', (req, res) => {
  const files = db.getFiles(req.params.id);
  res.json(files);
});`,
    question: 'What vulnerability exists?',
    options: [
      'IDOR - user can access other users\' files by changing ID',
      'Missing authentication',
      'No validation',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Always verify the user has permission to access the resource. Check ownership: if (file.userId !== req.user.id) return 403. Use indirect references or access control lists.',
  },
  {
    id: 'command-injection-2',
    title: 'Command Injection via Template',
    difficulty: 'expert',
    snippet: `// Node.js (insecure)
const command = \`ping -c 4 \${req.query.host}\`;
exec(command, (error, stdout) => {
  res.send(stdout);
});`,
    question: 'What is the secure approach?',
    options: [
      'Validate input, use parameterized execution, or avoid exec()',
      'Escape the host parameter',
      'Use eval() instead',
      'No changes needed',
    ],
    answer: 0,
    explanation: 'Never use user input in shell commands. Use libraries that support parameterized execution, validate input against whitelist, or use safer alternatives.',
  },
  {
    id: 'jwt-alg-none',
    title: 'JWT Algorithm Confusion',
    difficulty: 'expert',
    snippet: `// Node.js (insecure)
const jwt = require('jsonwebtoken');
const decoded = jwt.verify(token, secret); // No algorithm specified`,
    question: 'What attack is possible?',
    options: [
      'Algorithm confusion - attacker can use "none" algorithm',
      'Missing expiration',
      'Secret too short',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Always explicitly specify the algorithm in jwt.verify(): jwt.verify(token, secret, { algorithms: ["HS256"] }). Never allow "none" algorithm.',
  },
  {
    id: 'graphql-introspection',
    title: 'GraphQL Information Disclosure',
    difficulty: 'expert',
    snippet: `// GraphQL (insecure)
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});
// Introspection enabled by default`,
    question: 'What information can be exposed?',
    options: [
      'Schema structure, types, and fields (information disclosure)',
      'User data only',
      'No information',
      'Only public fields',
    ],
    answer: 0,
    explanation: 'Disable introspection in production: { introspection: false }. Use query complexity limits and depth limiting to prevent DoS attacks.',
  },
  {
    id: 'ldap-injection',
    title: 'LDAP Injection Vulnerability',
    difficulty: 'intermediate',
    snippet: `// Node.js (insecure)
const filter = "(&(uid=" + username + ")(userPassword=" + password + "))";
ldap.authenticate(filter);`,
    question: 'What vulnerability exists?',
    options: [
      'LDAP injection - attacker can bypass authentication',
      'Missing SSL/TLS',
      'Weak password policy',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Use LDAP libraries with proper escaping. Never concatenate user input into LDAP filters. Use parameterized queries when available.',
  },
  {
    id: 'open-redirect',
    title: 'Open Redirect Vulnerability',
    difficulty: 'beginner',
    snippet: `// Express.js (insecure)
app.get('/redirect', (req, res) => {
  const url = req.query.url;
  res.redirect(url);
});`,
    question: 'What vulnerability exists?',
    options: [
      'Open redirect - attacker can redirect to malicious site',
      'Missing input validation',
      'No HTTPS enforcement',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Validate URLs against a whitelist of allowed domains. Use relative URLs when possible. Never redirect to user-controlled URLs without validation.',
  },
  {
    id: 'buffer-overflow',
    title: 'Buffer Overflow in C',
    difficulty: 'expert',
    snippet: `// C (insecure)
void process(char *input) {
  char buffer[8];
  strcpy(buffer, input); // No bounds checking
}`,
    question: 'What vulnerability exists?',
    options: [
      'Buffer overflow - can overwrite stack memory',
      'Missing null terminator',
      'Array too small',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Use safe functions: strncpy(), snprintf(), or bounds-checking mechanisms. Enable stack canaries, ASLR, and use AddressSanitizer for testing.',
  },
  {
    id: 'memory-leak-c',
    title: 'Memory Leak in C++',
    difficulty: 'intermediate',
    snippet: `// C++ (insecure)
void process(int count) {
  void *data = malloc(count * sizeof(int));
  if (count < 0) {
    return; // Memory not freed
  }
  free(data);
}`,
    question: 'What is the security issue?',
    options: [
      'Memory leak - allocation not freed on early return',
      'Missing validation',
      'Malloc is slow',
      'No issue',
    ],
    answer: 0,
    explanation: 'Use RAII pattern or smart pointers (unique_ptr, shared_ptr) in C++. In C, use goto cleanup pattern or structured error handling. Leaks can be exploited for DoS.',
  },
  {
    id: 'null-pointer-deref',
    title: 'Null Pointer Dereference',
    difficulty: 'intermediate',
    snippet: `// C (insecure)
int process(const char *ptr) {
  return ptr[0]; // No null check
}`,
    question: 'What vulnerability exists?',
    options: [
      'Null pointer dereference - can crash application',
      'Missing array bounds check',
      'Type mismatch',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Always check for null pointers before dereferencing. Use static analysis tools like clang-analyzer. Consider using languages with null safety.',
  },
  {
    id: 'integer-overflow',
    title: 'Integer Overflow Vulnerability',
    difficulty: 'intermediate',
    snippet: `// C (insecure)
void allocate(int size) {
  int total = size * sizeof(int); // Can overflow
  void *buf = malloc(total);
}`,
    question: 'What can happen with integer overflow?',
    options: [
      'Allocate less memory than intended, causing buffer overflow',
      'Crash with division by zero',
      'Memory leak occurs',
      'No issue',
    ],
    answer: 0,
    explanation: 'Validate input ranges before multiplication. Use safe math functions or libraries. Check for integer overflow conditions explicitly.',
  },
  {
    id: 'use-after-free',
    title: 'Use-After-Free Vulnerability',
    difficulty: 'expert',
    snippet: `// C (insecure)
void process() {
  char *ptr = malloc(10);
  free(ptr);
  printf("%s", ptr); // Use-after-free
}`,
    question: 'What vulnerability exists?',
    options: [
      'Use-after-free - accessing freed memory leads to unpredictable behavior',
      'Double free',
      'Memory leak',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Set pointers to NULL after free. Use static analysis tools or AddressSanitizer. Consider using safer languages or memory-safe libraries.',
  },
  {
    id: 'log-injection',
    title: 'Log Injection Attack',
    difficulty: 'intermediate',
    snippet: `// Java (insecure)
Logger logger = LoggerFactory.getLogger("app");
logger.info("User: " + username);`,
    question: 'What attack is possible?',
    options: [
      'Log injection - attacker can forge log entries with newlines',
      'Missing timestamps',
      'Performance issue',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Sanitize log input by removing newlines and control characters. Use structured logging (JSON). Never log untrusted data without encoding.',
  },
  {
    id: 'xxe-injection',
    title: 'XML External Entity (XXE) Attack',
    difficulty: 'intermediate',
    snippet: `// Java (insecure)
DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
DocumentBuilder builder = factory.newDocumentBuilder();
Document doc = builder.parse(new InputSource(xmlInput));`,
    question: 'What vulnerability exists?',
    options: [
      'XXE injection - can read files or cause DoS',
      'Missing validation',
      'XML format error',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Disable external entities: factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true). Use SAX with handlers instead of DOM.',
  },
  {
    id: 'insecure-ssl-tls',
    title: 'Insecure SSL/TLS Configuration',
    difficulty: 'beginner',
    snippet: `// Java (insecure)
HttpsURLConnection conn = (HttpsURLConnection) url.openConnection();
conn.setHostnameVerifier((hostname, session) -> true); // Disables verification`,
    question: 'What vulnerability exists?',
    options: [
      'MITM attack - hostname verification bypassed',
      'Missing certificate check',
      'TLS version too old',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Never bypass SSL verification. Use default verifiers. Pin certificates for high-security apps. Avoid TLS < 1.2. Disable weak ciphers.',
  },
  {
    id: 'dependency-vulnerability',
    title: 'Vulnerable Dependency Usage',
    difficulty: 'beginner',
    snippet: `// Node.js package.json (insecure)
{
  "dependencies": {
    "lodash": "^2.0.0"  // Very old version with known CVEs
  }
}`,
    question: 'What is the security issue?',
    options: [
      'Using outdated dependency with known vulnerabilities (CVEs)',
      'Package name is wrong',
      'Version number invalid',
      'No issue',
    ],
    answer: 0,
    explanation: 'Regularly update dependencies. Use "npm audit" or "npm outdated". Set up automated dependency updates. Subscribe to security advisories.',
  },
  {
    id: 'insecure-deserialization-java',
    title: 'Insecure Java Deserialization',
    difficulty: 'expert',
    snippet: `// Java (insecure)
ObjectInputStream ois = new ObjectInputStream(userInput);
Object obj = ois.readObject(); // Untrusted data`,
    question: 'What vulnerability exists?',
    options: [
      'Arbitrary code execution via gadget chains',
      'Missing null check',
      'Slow performance',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Never deserialize untrusted data. Use JSON instead of Java serialization. If required, use Java 9+ filters or libraries like NotSoSerial.',
  },
  {
    id: 'weak-encryption',
    title: 'Using Weak Encryption',
    difficulty: 'beginner',
    snippet: `// Python (insecure)
from Crypto.Cipher import DES
key = "12345678"  // 8-byte key
cipher = DES.new(key, DES.MODE_ECB)
encrypted = cipher.encrypt(plaintext)`,
    question: 'What are the security issues?',
    options: [
      'DES is weak, ECB mode reveals patterns, key not random',
      'Missing padding',
      'Encryption is unnecessary',
      'No issues',
    ],
    answer: 0,
    explanation: 'Use AES-256 with random keys. Use modes like GCM or CBC (never ECB). Store keys securely. Use cryptographic libraries like libsodium.',
  },
  {
    id: 'missing-input-validation',
    title: 'Missing Input Validation',
    difficulty: 'beginner',
    snippet: `// Python (insecure)
age = int(request.args.get('age'))
if age > 18:
  grant_admin_access()`,
    question: 'What vulnerability exists?',
    options: [
      'No bounds checking - negative ages accepted',
      'Type conversion error',
      'Logic error',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Validate all input: type, length, range, format. Use whitelists. Never trust input. Implement both client-side and server-side validation.',
  },
  {
    id: 'weak-password-policy',
    title: 'Weak Password Policy',
    difficulty: 'beginner',
    snippet: `// Node.js (insecure)
function validatePassword(pwd) {
  return pwd.length >= 6; // Only checks length
}`,
    question: 'What issues exist?',
    options: [
      'Too short, no complexity requirements, easy to brute force',
      'Password validation impossible',
      'Should use numbers only',
      'No issues',
    ],
    answer: 0,
    explanation: 'Require minimum 12-16 characters, uppercase, lowercase, numbers, symbols. Use password strength meters. Implement rate limiting on login.',
  },
  {
    id: 'broken-auth',
    title: 'Broken Authentication - Weak Session',
    difficulty: 'beginner',
    snippet: `// PHP (insecure)
$_SESSION['user_id'] = $userId;
// Session ID not regenerated on login`,
    question: 'What vulnerability exists?',
    options: [
      'Session fixation - attacker can force user to use attacker-controlled session',
      'Missing password check',
      'Cookie missing',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Regenerate session ID on successful login: session_regenerate_id(true). Set secure, httpOnly, sameSite flags on session cookies.',
  },
  {
    id: 'insecure-api-endpoint',
    title: 'Insecure API Endpoint',
    difficulty: 'beginner',
    snippet: `// Express.js (insecure)
app.get('/api/balance', (req, res) => {
  const balance = db.getBalance(req.query.user_id);
  res.json({ balance });
});`,
    question: 'What vulnerability exists?',
    options: [
      'No authentication - anyone can access any user balance',
      'Missing rate limiting',
      'Data not encrypted',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Always authenticate and authorize. Verify user can access only their own data. Use JWTs or session tokens. Implement rate limiting.',
  },
  {
    id: 'error-based-info-disclosure',
    title: 'Error-Based Information Disclosure',
    difficulty: 'beginner',
    snippet: `// Node.js (insecure)
app.get('/user/:id', (req, res) => {
  try {
    const user = db.getUser(req.params.id);
    res.json(user);
  } catch (error) {
    res.json({ error: error.message, stack: error.stack });
  }
});`,
    question: 'What information is exposed?',
    options: [
      'Stack traces, database paths, library versions reveal internal structure',
      'User data issue',
      'Missing password',
      'No vulnerability',
    ],
    answer: 0,
    explanation: 'Log detailed errors server-side only. Return generic messages to clients: "An error occurred". Use error IDs to correlate logs.',
  },
];

// Shuffle all options to randomize answer positions
// Then normalize lengths to prevent prediction based on text size
export const CODE_CHALLENGES = normalizeChallengeOptions(processChallenges(CODE_CHALLENGES_BASE));
