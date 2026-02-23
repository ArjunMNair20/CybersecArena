export type CTFTask = {
  id: string;
  title: string;
  category: 'Web' | 'Cryptography' | 'Forensics' | 'Reverse' | 'Binary';
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  flag: string; // expected exact match, demo only
  hints: string[]; // progressive hints
  seriesId?: string; // Optional: belongs to a series/campaign
  stepNumber?: number; // Optional: step number in a series (1, 2, 3...)
  requiresStep?: string; // Optional: requires this challenge ID to be solved first
  image?: string; // Optional: data URL or path to an image to display with the challenge
};

export const CTF_TASKS: CTFTask[] = [
  // ==================== EASY CHALLENGES ====================
  {
    id: 'web-hello',
    title: 'Cookie Value',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'A web application stores session data in a cookie encoded as "ZmFsc2U=". Decode the value to retrieve the session state.',
    flag: 'false',
    hints: [
      'The value looks like base64 encoding.',
      'Decode "ZmFsc2U=" using base64 decoder.',
      'The decoded value is your flag.'
    ],
  },
  {
    id: 'crypto-caesar',
    title: 'Caesar Cipher',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'An intercepted message reads "MJQQT", which was encrypted using a Caesar cipher with a shift of 5. Decrypt the message.',
    flag: 'HELLO',
    hints: [
      'Caesar cipher shifts letters. To decode, shift backward.',
      'Shift each letter back by 5: M→H, J→E, Q→L, Q→L, T→O.',
      'The decoded message is "HELLO". Format as flag.'
    ],
  },
  {
    id: 'forensics-hex',
    title: 'Hex to Text',
    category: 'Forensics',
    difficulty: 'easy',
    prompt: 'A file contains the following hexadecimal bytes: 43 53 41 7B 68 69 64 64 65 6E 7D. Convert them to ASCII text.',
    flag: 'hidden',
    hints: [
      'Each pair of hex digits is one character.',
      '43 = C, 53 = S, 41 = A, 7B = {, 68 = h, 69 = i, 64 = d, 64 = d, 65 = e, 6E = n, 7D = }',
      'Put it all together to get the flag.'
    ],
  },
  {
    id: 'bin-ascii',
    title: 'Binary to Text',
    category: 'Binary',
    difficulty: 'easy',
    prompt: 'A sensor output contains binary data: 01000011 01010011 01000001 01111011 01100010 01101001 01101110 01100001 01110010 01111001 01111101. Decode it.',
    flag: 'binary',
    hints: [
      'Each 8-digit binary number is one character.',
      '01000011 = 67 = C, 01010011 = 83 = S, 01000001 = 65 = A',
      'Continue converting all binary numbers to get the full flag.'
    ],
  },
  {
    id: 'web-source',
    title: 'Caesar Cipher Decryption',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'Decrypt this Caesar cipher message with a shift of 3: "KHOOR ZRUOG". What is the original message?',
    flag: 'HELLO WORLD',
    hints: [
      'Caesar cipher shifts each letter by a fixed number of positions.',
      'With shift 3: A→D, B→E, C→F... So reverse it: D→A, E→B, F→C...',
      'Apply the reverse shift of 3 to each letter in the message.'
    ],
  },
  {
    id: 'crypto-base64',
    title: 'Base64 Decode',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'Decode the following base64 string to reveal the hidden message: Q1NBe2JpbmFyeV9mbGFnfQ==',
    flag: 'binary_flag',
    hints: [
      'This is base64 encoded text.',
      'Use a base64 decoder online or in your code.',
      'The decoded text is your flag.'
    ],
  },
  {
    id: 'forensics-morse',
    title: 'Morse Code',
    category: 'Forensics',
    difficulty: 'easy',
    prompt: 'A vintage telegraph machine transmitted this morse code: "-.-. ... .- / ... . -.-. .-. . -". Decode the message.',
    flag: 'SECRET',
    hints: [
      'Morse code uses dots and dashes. "/" is a space.',
      'Use a morse code decoder or chart.',
      'The decoded message is your flag.'
    ],
  },
  {
    id: 'reverse-simple',
    title: 'Simple Math',
    category: 'Reverse',
    difficulty: 'easy',
    prompt: 'A number was multiplied by 5 and the result became 25. What was the original number?',
    flag: '5',
    hints: [
      'Reverse the operation: if result = number × 5, then number = result ÷ 5.',
      '25 ÷ 5 = 5',
      'The answer is 5. Format as flag.'
    ],
  },
  {
    id: 'web-robots',
    title: 'Simple String Reversal',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'A web parameter contains the value "galf_daeh". Reverse this string to discover the hidden information.',
    flag: 'head_flag',
    hints: [
      'Reversing a string means reading it backwards.',
      'Take "galf_daeh" and reverse every character.',
      'The reversed string is your flag.'
    ],
  },
  {
    id: 'crypto-rot13',
    title: 'ROT13',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'Decrypt the following ROT13-encoded text to reveal the original message: "PFN{ebg13}"',
    flag: 'rot13',
    hints: [
      'ROT13 shifts each letter by 13 positions.',
      'P→C, F→S, N→A, e→r, b→o, g→t, 1→1, 3→3',
      'The decoded text is your flag.'
    ],
  },
  {
    id: 'forensics-strings',
    title: 'Hexadecimal Decoding',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'Convert the hexadecimal value "0x48656C6C6F" to ASCII characters to find the flag.',
    flag: 'HELLO',
    hints: [
      '0x48 = 72 in decimal = "H" in ASCII',
      '0x65 = 101 in decimal = "e" in ASCII',
      'Continue converting each hex pair (0x??) to its ASCII character.'
    ],
  },
  {
    id: 'bin-unicode',
    title: 'Unicode Values',
    category: 'Binary',
    difficulty: 'easy',
    prompt: 'Convert the following Unicode code points to ASCII characters: U+0043 U+0053 U+0041 U+007B U+0066 U+006C U+0061 U+0067 U+007D',
    flag: 'flag',
    hints: [
      'Unicode U+0043 is decimal 67, which is "C".',
      'U+0053 = 83 = S, U+0041 = 65 = A, U+007B = 123 = {, U+0066 = 102 = f, etc.',
      'Convert all values to get the flag.'
    ],
  },
  {
    id: 'web-cookie',
    title: 'Network Subnetting',
    category: 'Networking',
    difficulty: 'medium',
    prompt: 'Calculate the broadcast address for the network 192.168.1.0/24. What is the broadcast address? (Format: xxx.xxx.xxx.xxx)',
    flag: '192.168.1.255',
    hints: [
      'The /24 notation means the first 24 bits are the network address.',
      'In a /24 network, the last 8 bits are available for hosts.',
      'The broadcast address is when all host bits are set to 1, which gives 255 in the last octet.'
    ],
  },
  {
    id: 'network-dns-poison',
    title: 'DNS Cache Poisoning Attack',
    category: 'Networking',
    difficulty: 'hard',
    prompt: 'A network administrator discovered malicious DNS responses in their cache, mapping legitimate domains to attacker-controlled IPs. This attack exploits the lack of DNSSEC validation. What type of attack is this called, and how would you mitigate it? (Answer: attack_type with two-word format, lowercase, underscore separated)',
    flag: 'dns_poisoning',
    hints: [
      'This attack exploits DNS protocol weaknesses by injecting false response data.',
      'Attackers intercept or forge DNS responses before legitimate ones arrive.',
      'The attack name refers to contaminating DNS cache with malicious entries.',
      'Mitigation involves implementing DNSSEC (DNS Security Extensions) and packet filtering.'
    ],
  },
  {
    id: 'crypto-substitution',
    title: 'Letter Shift',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'A message was encrypted by shifting each letter forward by 1 position: "DSB{tvctfuibo}". Decrypt it by reversing the shift.',
    flag: 'substitution',
    hints: [
      'Shift each letter backward by 1: D→C, S→S, B→A',
      'Continue: t→s, v→u, c→b, t→s, f→e, u→t, i→h, b→a, o→n',
      'The decoded text is your flag.'
    ],
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    category: 'Reverse',
    difficulty: 'easy',
    prompt: 'A string was reversed to produce "}galf{ASC". Reverse it back to find the original message.',
    flag: 'flag',
    hints: [
      'To reverse a reversed string, reverse it again.',
      'Reverse "}galf{ASC" to get the original.',
      'The original string is your flag.'
    ],
  },
  {
    id: 'forensics-exif',
    title: 'Extract Hidden Text',
    category: 'Forensics',
    difficulty: 'easy',
    prompt: 'Download and examine the file hidden_text.txt. Extract the hidden word by removing all extra characters (numbers, symbols, special characters) and keep only the alphabetic text.',
    flag: 'metadataxyz',
    file: 'hidden_text.txt',
    hints: [
      'Identify which characters are extra symbols (#, @, $, !, etc.)',
      'Keep only the alphabetic characters (letters a-z)',
      'Concatenate the remaining letters together to form the flag.'
    ],
  },
  {
    id: 'web-header',
    title: 'DNS Protocol Basics',
    category: 'Networking',
    difficulty: 'easy',
    prompt: 'A DNS query is made for "example.com". If the response contains an A record with value "203.0.113.45", what does this A record represent?',
    flag: 'IPv4 address',
    hints: [
      'DNS stands for Domain Name System.',
      'An A record in DNS is used to map domain names.',
      'What does an A record store? (Two words, space-separated)',
      'The answer describes what the IP number represents.'
    ],
  },
  {
    id: 'crypto-xor-simple',
    title: 'Simple XOR',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'A value was XORed with 10 and produced 15. What was the original value?',
    flag: '5',
    hints: [
      'XOR is reversible: if A XOR B = C, then A = C XOR B.',
      'Original = 15 XOR 10 = 5',
      'The answer is 5. Format as flag.'
    ],
  },
  {
    id: 'bin-magic',
    title: 'File Header',
    category: 'Binary',
    difficulty: 'easy',
    prompt: 'A file header contains these bytes: 43 53 41 7B 6D 61 67 69 63 7D. Identify what this represents when converted to text.',
    flag: 'magic',
    hints: [
      'Each hex pair is one character.',
      '43 = C, 53 = S, 41 = A, 7B = {, 6D = m, 61 = a, 67 = g, 69 = i, 63 = c, 7D = }',
      'Put it together to get the flag.'
    ],
  },
  {
    id: 'reverse-add',
    title: 'Addition Reverse',
    category: 'Reverse',
    difficulty: 'easy',
    prompt: 'A value increased by 7 results in 20. Work backwards to find the original value.',
    flag: '13',
    hints: [
      'Reverse the operation: if result = number + 7, then number = result - 7.',
      '20 - 7 = 13',
      'The answer is 13. Format as flag.'
    ],
  },
  {
    id: 'web-url-decode',
    title: 'URL Decoding',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'A URL parameter contains an encoded message: "CTF%7Bweb%5Fsecurity%7D". Decode the URL encoding to retrieve the flag.',
    flag: 'CTF{web_security}',
    hints: [
      'This is URL encoding (percent encoding).',
      '%7B = {, %7D = }, %5F = _',
      'Use an online URL decoder or decode manually using the ASCII values.',
    ],
  },

  // ==================== MEDIUM CHALLENGES ====================
  {
    id: 'web-jwt',
    title: 'Firewall Rule Analysis',
    category: 'Networking',
    difficulty: 'medium',
    prompt: 'A firewall rule is configured as: "ALLOW tcp from 192.168.0.0/16 to 10.0.0.0/8 port 443". A packet arrives from 192.168.15.45 destined to 10.5.200.25:443. Will this packet be allowed?',
    flag: 'YES',
    hints: [
      'Check if the source IP is in the range 192.168.0.0/16.',
      '/16 means the first 16 bits (2 octets) must match 192.168.',
      'Check if destination IP is in range 10.0.0.0/8 (first 8 bits must match 10).',
      'Check if the destination port matches port 443.'
    ],
  },
  {
    id: 'crypto-double',
    title: 'Double Encoding',
    category: 'Cryptography',
    difficulty: 'medium',
    prompt: 'A secret message was encoded twice: first with base64, then the result was converted to hex. The final encoded value is "3433417b646f75626c657d". Decode it correctly.',
    flag: 'double',
    hints: [
      'Decode in reverse order: first hex, then base64.',
      'Hex "3433417b646f75626c657d" decodes to base64 text.',
      'Decode the base64 to get the original flag.'
    ],
  },
  {
    id: 'forensics-lsb',
    title: 'Hidden Bits',
    category: 'Forensics',
    difficulty: 'medium',
    prompt: 'Using steganographic techniques, text was hidden in the least significant bits of image pixel data: "01000011 01010011 01000001 01111011 01101100 01110011 01100010 01111101". Recover the message.',
    flag: 'lsb',
    hints: [
      'Each 8-bit binary number is one character.',
      '01000011 = 67 = C, 01010011 = 83 = S, 01000001 = 65 = A',
      'Continue converting all binary to get the flag.'
    ],
  },
  {
    id: 'reverse-xor',
    title: 'XOR Reverse',
    category: 'Reverse',
    difficulty: 'medium',
    prompt: 'A byte value was XORed with 0x42, resulting in 0x2E. Find the original byte value and convert it to an ASCII character.',
    flag: 'l',
    hints: [
      'XOR is reversible: original = result XOR key.',
      '0x2E XOR 0x42 = 0x6C = 108 in decimal.',
      'ASCII 108 is "l". Format as flag.'
    ],
  },
  {
    id: 'crypto-vigenere',
    title: 'Vigenère Cipher',
    category: 'Cryptography',
    difficulty: 'medium',
    prompt: 'A message was encrypted using the Vigenère cipher: "XZQ" with encryption key "KEY". Decrypt the message.',
    flag: 'KEY',
    hints: [
      'Vigenère shifts each letter by the corresponding key letter.',
      'X shifted by K, Z by E, Q by Y.',
      'Decode each letter to get the flag.'
    ],
  },
  {
    id: 'web-url',
    title: 'URL Encoding',
    category: 'Web',
    difficulty: 'medium',
    prompt: 'A URL contains encoded parameters: "%43%53%41%7B%75%72%6C%7D". Decode the URL-encoded string to get the plaintext.',
    flag: 'url',
    hints: [
      'URL encoding uses %XX where XX is hex.',
      '%43 = 67 = C, %53 = 83 = S, %41 = 65 = A, %7B = 123 = {',
      'Continue decoding all %XX values to get the flag.'
    ],
  },
  {
    id: 'forensics-pattern',
    title: 'Number Pattern',
    category: 'Forensics',
    difficulty: 'medium',
    prompt: 'A data file contains a sequence of decimal ASCII codes: 67, 83, 65, 123, 112, 97, 116, 116, 101, 114, 110, 125. Convert these to characters.',
    flag: 'pattern',
    hints: [
      'Each number is an ASCII decimal code.',
      '67 = C, 83 = S, 65 = A, 123 = {, 112 = p, 97 = a, 116 = t, etc.',
      'Convert all numbers to get the flag.'
    ],
  },
  {
    id: 'reverse-fibonacci',
    title: 'Fibonacci Number',
    category: 'Reverse',
    difficulty: 'medium',
    prompt: 'The 10th number in the Fibonacci sequence is 34. Convert this number to its ASCII character equivalent.',
    flag: '"',
    hints: [
      'Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34...',
      'The 10th number is 34.',
      'ASCII 34 is the double quote character ". Format as flag.'
    ],
  },
  {
    id: 'crypto-atbash',
    title: 'Atbash Cipher',
    category: 'Cryptography',
    difficulty: 'medium',
    prompt: 'Decrypt an Atbash cipher (where A↔Z, B↔Y, etc.): "XZH{gsv}". Find the original message.',
    flag: 'the',
    hints: [
      'Atbash maps A↔Z, B↔Y, C↔X, etc.',
      'X→C, Z→A, H→S, g→t, s→h, v→e',
      'The decoded text is your flag.'
    ],
  },
  {
    id: 'bin-endian',
    title: 'Byte Order',
    category: 'Binary',
    difficulty: 'medium',
    prompt: 'A 32-bit value is stored in little-endian format as bytes: 7D 47 41 4C 46 5F 59 52 41 4E 49 42. Convert to big-endian byte order and interpret as ASCII text to find the flag.',
    flag: 'BINARY_FLAG}',
    hints: [
      'Little-endian: least significant byte first. Big-endian: most significant byte first.',
      'Little-endian bytes need to be reversed to get big-endian order.',
      'Simply reverse the byte sequence: 7D 47 41 4C 46 5F 59 52 41 4E 49 42 → 42 49 4E 41 52 59 5F 46 4C 41 47 7D',
      'Convert each hex pair to ASCII: 42=B, 49=I, 4E=N, 41=A, 52=R, 59=Y, 5F=_, 46=F, 4C=L, 41=A, 47=G, 7D=}',
    ],
  },

  // ==================== HARD CHALLENGES ====================
  {
    id: 'network-cidr-calc',
    title: 'CIDR Subnet Calculation',
    category: 'Networking',
    difficulty: 'hard',
    prompt: 'A network administrator needs to allocate IP addresses for three departments: Sales (150 hosts), Engineering (300 hosts), and IT (75 hosts). Starting from 10.0.0.0/16, determine the CIDR notation for the Engineering subnet (which needs at least 300 hosts). What is the correct subnet mask in CIDR notation? (Format: /XX where XX is the prefix length)',
    flag: '/23',
    hints: [
      'Each subnet must accommodate the required number of hosts with some overhead for network and broadcast addresses.',
      'For 300 hosts, you need at least 512 usable IP addresses (2^9 = 512).',
      'This means you need 9 host bits (32 - 9 = 23 network bits).',
      'A /23 subnet provides 510 usable hosts (2^9 - 2).',
      'Allocate subnets in order: Sales (/24), then Engineering (/23), then IT (/25).'
    ],
  },
  {
    id: 'web-ssti',
    title: 'Feistel Cipher Computation',
    category: 'Cryptography',
    difficulty: 'hard',
    prompt: 'A Feistel cipher with 2 rounds uses XOR as the round function. The 64-bit block is split into L0=\'12345678\' and R0=\'87654321\' (hex). Using the Feistel structure: L_(i+1) = R_i, R_(i+1) = L_i XOR F(R_i), where F(x) = x. Compute L2 and R2 after 2 rounds. Answer: L2R2 (as 16 hex digits, uppercase, no spaces)',
    flag: '9551155912345678',
    hints: [
      'In a Feistel network, the left side becomes the right side.',
      'The new right side is: old left XOR F(old right).',
      'Round 1: L1 = R0, R1 = L0 XOR F(R0) = L0 XOR R0.',
      'Round 2: L2 = R1, R2 = L1 XOR F(R1) = L1 XOR R1.',
      'Remember to perform XOR operation on each hex digit pair.'
    ],
  },
  {
    id: 'reverse-simple',
    title: 'Simple Reverse Engineering',
    category: 'Reverse',
    difficulty: 'easy',
    prompt: 'Download the executable_strings.txt file which contains output from the "strings" command run on a simple login binary. Analyze the strings output to find the password that produces the success message. Look for lines that mention success or congratulations, and find the password stored nearby in the file.',
    flag: 'REVERSE_ME',
    file: 'executable_strings.txt',
    hints: [
      'Search for keywords like "success", "granted", "congratulations", or "authenticated".',
      'Look for lines that say "Password is:"',
      'The password string appears right after common success message indicators.',
      'Strings that are printed together are often close in the strings output.',
    ],
  },
  {
    id: 'binary-rop',
    title: 'Image Steganography',
    category: 'Forensics',
    difficulty: 'hard',
    prompt: 'Download the stego_image.png file which contains a security-themed image with hidden text embedded within it. The hidden message is embedded using steganography techniques - it could be in image metadata, pixel patterns, or embedded as invisible text. Extract the hidden text and submit it as the flag.',
    flag: 'STEGANOGRAPHY_IS_FUN',
    file: 'stego_image.png',
    hints: [
      'Open the image file and analyze it carefully. Some steganography tools might help.',
      'Try examining the image with tools like "strings" or hex editors to find text data.',
      'The hidden text might be encoded in the image metadata or embedded as invisible pixels.',
      'Consider using Python with PIL/Pillow to programmatically analyze the image pixels.',
    ],
  },
  {
    id: 'crypto-padding-oracle',
    title: 'Hill Cipher Steganography',
    category: 'Cryptography',
    difficulty: 'hard',
    prompt: 'Download the hill_cipher_stego.png image file. This image contains a hidden encrypted message embedded using steganography. Extract the hidden message, then decrypt it using the Hill cipher (2x2 matrix key: [[3, 2], [3, 5]]) to discover the flag.',
    flag: 'SECRET',
    file: 'hill_cipher_stego.png',
    hints: [
      'Use the Steganography tool on this platform to extract the hidden message from the image.',
      'You will extract the ciphertext: a 6-character encrypted message.',
      'Hill cipher is a polygraphic cipher using matrix multiplication mod 26.',
      'To decrypt: group ciphertext in pairs, multiply by the INVERSE of key matrix mod 26.',
      'The key matrix [[3, 2], [3, 5]] has inverse [[15, 17], [20, 9]] mod 26.',
      'Apply decryption to each pair: [C1, C2] * [[15, 17], [20, 9]] mod 26 to get plaintext.',
    ],
  },
  {
    id: 'exploit-format-string',
    title: 'Lattice-Based Post-Quantum Vulnerability',
    category: 'Cryptography',
    difficulty: 'hard',
    prompt: 'Researchers discovered a critical vulnerability in a lattice-based post-quantum cryptographic implementation used by a government agency. The vulnerability requires analyzing the encrypted key material and identifying patterns in the cipher text structure. We intercepted this encrypted communication: "The Quick Brown Fox Jumps Over The Lazy Dog While Running Fast Always Keeps Every Letter Simple". Despite NIST standardization claims, a side-channel attack revealed the message uses algorithmic key leakage. Analyze the ciphertext pattern to extract the hidden key material.',
    flag: 'TQBFJOTLDWRFAKELS',
    hints: [
      'The vulnerability is not in the cryptographic math, but in how the cipher is implemented.',
      'Look at the first letter of each word in the encrypted message.',
      'This technique is called a "first letter extraction attack" in post-quantum implementations with improper output sanitization.',
      'Combine all the first letters to form the flag.',
      'The flag should be 17 characters long.',
    ],
  },
  {
    id: 'reverse-asm-crack',
    title: 'Assembly Crackme',
    category: 'Reverse',
    difficulty: 'hard',
    prompt: 'A small crackme program requests a serial number and validates it through assembly-level comparisons. Analyze the disassembled code to compute the correct serial that unlocks the flag.',
    flag: 'asm_crack',
    hints: [
      'Disassemble the binary and find the check routine that processes the input.',
      'Trace the arithmetic/bitwise operations applied to each character to derive the inverse.',
      'Compute the serial offline and provide it to the program to get the flag.',
    ],
  },

  // ==================== SERIES/CAMPAIGNS ====================
  // Series 1: "Web Hunt" - Web Security Treasure Hunt
  {
    id: 'series1-step1',
    title: 'Web Hunt - Part 1: Cookies',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'Check the browser cookies for a cookie named "treasure". What is its value?',
    flag: 'gold',
    hints: [
      'Open browser developer tools (F12).',
      'Go to Storage/Cookies tab.',
      'Find the "treasure" cookie and read its value.'
    ],
    seriesId: 'web-hunt',
    stepNumber: 1,
  },
  {
    id: 'series1-step2',
    title: 'Web Hunt - Part 2: Headers',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'A custom HTTP header called "X-Secret" contains a clue. What does it say?',
    flag: 'continue',
    hints: [
      'Open Network tab in developer tools.',
      'Look at the response headers.',
      'Find the X-Secret header.'
    ],
    seriesId: 'web-hunt',
    stepNumber: 2,
    requiresStep: 'series1-step1',
  },
  {
    id: 'series1-step3',
    title: 'Web Hunt - Part 3: Parameters',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'A URL contains the encoded parameter: "%68%75%6E%74". Decode it.',
    flag: 'hunt',
    hints: [
      'This is URL encoding (%XX format).',
      '%68 = h, %75 = u, %6E = n, %74 = t',
      'Decode all characters to get the answer.'
    ],
    seriesId: 'web-hunt',
    stepNumber: 3,
    requiresStep: 'series1-step2',
  },
  {
    id: 'series1-step4',
    title: 'Web Hunt - Part 4: Final Treasure',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'The HTML page source contains a comment: "<!-- Treasure is here: victory -->". Extract the treasure word.',
    flag: 'victory',
    hints: [
      'Right-click and view page source.',
      'Search for HTML comments.',
      'Extract the word after the colon.'
    ],
    seriesId: 'web-hunt',
    stepNumber: 4,
    requiresStep: 'series1-step3',
  },

  // Series 2: "Code Breaker" - Encoding Challenge
  {
    id: 'series2-step1',
    title: 'Code Breaker - Part 1: ROT13',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'Decrypt this ROT13-encoded message: "pnzr"',
    flag: 'came',
    hints: [
      'ROT13 shifts each letter by 13 positions.',
      'p→c, n→a, z→m, r→e',
      'The decoded message is your answer.'
    ],
    seriesId: 'code-breaker',
    stepNumber: 1,
  },
  {
    id: 'series2-step2',
    title: 'Code Breaker - Part 2: Base64',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'Decode this base64 string: "aXRzd29ya2luZw=="',
    flag: 'itsworking',
    hints: [
      'This is base64 encoded text.',
      'Use a base64 decoder.',
      'The decoded text is your flag.'
    ],
    seriesId: 'code-breaker',
    stepNumber: 2,
    requiresStep: 'series2-step1',
  },
  {
    id: 'series2-step3',
    title: 'Code Breaker - Part 3: Hex',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'Convert these hex bytes to ASCII: 73 75 63 63 65 73 73',
    flag: 'success',
    hints: [
      'Each pair of hex digits is one character.',
      '73 = s, 75 = u, 63 = c, 63 = c, 65 = e, 73 = s, 73 = s',
      'Combine all characters.'
    ],
    seriesId: 'code-breaker',
    stepNumber: 3,
    requiresStep: 'series2-step2',
  },
  {
    id: 'series2-step4',
    title: 'Code Breaker - Part 4: Binary',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'Convert this binary to text: 01100100 01101111 01101110 01100101',
    flag: 'done',
    hints: [
      'Each 8-bit binary is one character.',
      '01100100 = 100 = d, 01101111 = 111 = o, 01101110 = 110 = n, 01100101 = 101 = e',
      'Combine all characters for the answer.'
    ],
    seriesId: 'code-breaker',
    stepNumber: 4,
    requiresStep: 'series2-step3',
  },

  // Series 3: "Detective Trail" - Logic Puzzle Campaign
  {
    id: 'series3-step1',
    title: 'Detective Trail - Part 1: Math',
    category: 'Reverse',
    difficulty: 'easy',
    prompt: 'A number multiplied by 3 equals 24. What is the number?',
    flag: '8',
    hints: [
      'Reverse the operation: if result = number × 3, then number = result ÷ 3.',
      '24 ÷ 3 = 8',
      'The answer is 8.'
    ],
    seriesId: 'detective-trail',
    stepNumber: 1,
  },
  {
    id: 'series3-step2',
    title: 'Detective Trail - Part 2: Pattern',
    category: 'Reverse',
    difficulty: 'easy',
    prompt: 'Find the missing letter in this sequence: A, C, E, G, ?',
    flag: 'I',
    hints: [
      'Look at the letter positions in the alphabet.',
      'A is 1st, C is 3rd, E is 5th, G is 7th.',
      'The next letter at position 9 is I.'
    ],
    seriesId: 'detective-trail',
    stepNumber: 2,
    requiresStep: 'series3-step1',
  },
  {
    id: 'series3-step3',
    title: 'Detective Trail - Part 3: Sequence',
    category: 'Reverse',
    difficulty: 'easy',
    prompt: 'What is the next number in the sequence: 2, 4, 8, 16, ?',
    flag: '32',
    hints: [
      'Each number is doubled from the previous one.',
      '2 × 2 = 4, 4 × 2 = 8, 8 × 2 = 16.',
      '16 × 2 = 32'
    ],
    seriesId: 'detective-trail',
    stepNumber: 3,
    requiresStep: 'series3-step2',
  },
  {
    id: 'series3-step4',
    title: 'Detective Trail - Part 4: Solution',
    category: 'Reverse',
    difficulty: 'easy',
    prompt: 'Combine the first letters of your three answers: ???. This is your final flag.',
    flag: 'BII',
    hints: [
      'Take the first letter from answer 1 (8).',
      'Take the first letter from answer 2 (I).',
      'Take the first letter from answer 3 (32).',
      'Combine them: BII'
    ],
    seriesId: 'detective-trail',
    stepNumber: 4,
    requiresStep: 'series3-step3',
  },
];

// Series metadata for display
export type CTFSeries = {
  id: string;
  title: string;
  description: string;
  category: 'Web' | 'Cryptography' | 'Forensics' | 'Reverse' | 'Binary';
  difficulty: 'easy' | 'medium' | 'hard';
  totalSteps: number;
  challengeIds: string[];
};

export const CTF_SERIES: CTFSeries[] = [
  {
    id: 'web-hunt',
    title: 'Web Hunt',
    description: 'Explore web technologies through a treasure hunting adventure. Discover cookies, headers, parameters, and hidden comments hidden across web pages. Story: You\'re on a web security treasure hunt where each clue leads you deeper into understanding how web technologies work.',
    category: 'Web',
    difficulty: 'easy',
    totalSteps: 4,
    challengeIds: ['series1-step1', 'series1-step2', 'series1-step3', 'series1-step4'],
  },
  {
    id: 'code-breaker',
    title: 'Code Breaker',
    description: 'Master encoding and decoding techniques. Break through ROT13, Base64, Hex, and Binary encryption methods. Story: A mysterious message was encoded using multiple layers. Decode each layer systematically to reveal the ultimate secret.',
    category: 'Cryptography',
    difficulty: 'easy',
    totalSteps: 4,
    challengeIds: ['series2-step1', 'series2-step2', 'series2-step3', 'series2-step4'],
  },
  {
    id: 'detective-trail',
    title: 'Detective Trail',
    description: 'Solve logic puzzles and patterns. Follow mathematical sequences and find hidden connections between clues. Story: A detective must solve a series of puzzles. Each puzzle solved brings them closer to solving the ultimate case.',
    category: 'Reverse',
    difficulty: 'easy',
    totalSteps: 4,
    challengeIds: ['series3-step1', 'series3-step2', 'series3-step3', 'series3-step4'],
  },
];
