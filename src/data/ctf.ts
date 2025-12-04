export type CTFTask = {
  id: string;
  title: string;
  category: 'Web' | 'Cryptography' | 'Forensics' | 'Reverse' | 'Binary';
  difficulty: 'easy' | 'medium';
  prompt: string;
  flag: string; // expected exact match, demo only
  hints: string[]; // progressive hints
};

export const CTF_TASKS: CTFTask[] = [
  {
    id: 'web-hello',
    title: 'Cookie Crumbs',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'A website sets a cookie named "admin" with value "ZmFsc2U=". Decode it and reverse the boolean. What would the flag be if admin was true? Flag format: CSA{...}',
    flag: 'CSA{true}',
    hints: [
      'The value "ZmFsc2U=" looks like base64 encoding. Try decoding it first.',
      'After decoding, you should get "false". The challenge asks what the flag would be if admin was true.',
      'Simply reverse the boolean value: if it was false, what would true be?'
    ],
  },
  {
    id: 'crypto-caesar',
    title: 'Double Shift',
    category: 'Cryptography',
    difficulty: 'easy',
    prompt: 'The message "MJQQT" was encrypted twice with Caesar cipher. First shift was 5, then 3. Decrypt to find the flag. Flag format: CSA{plaintext}',
    flag: 'CSA{HELLO}',
    hints: [
      'To decrypt, you need to reverse the encryption process. Since it was shifted forward twice, shift backward twice.',
      'First, shift "MJQQT" backward by 3 positions, then shift the result backward by 5 positions.',
      'M-3=J, J-3=G, Q-3=N, Q-3=N, T-3=Q. Then shift each letter back by 5 more positions.'
    ],
  },
  {
    id: 'forensics-hex',
    title: 'Steganographic Hex',
    category: 'Forensics',
    difficulty: 'easy',
    prompt: 'Extract the flag from this hex: 43 53 41 7B 68 69 64 64 65 6E 5F 69 6E 5F 68 65 78 7D. Convert each byte to ASCII. Flag format: CSA{...}',
    flag: 'CSA{hidden_in_hex}',
    hints: [
      'Each pair of hex digits represents one byte. Convert each hex byte to its decimal value, then to ASCII.',
      'For example, 43 in hex = 67 in decimal = "C" in ASCII. 53 = 83 = "S". 41 = 65 = "A".',
      'Continue converting all hex pairs: 7B = 123 = "{", 68 = 104 = "h", and so on...'
    ],
  },
  {
    id: 'reverse-func',
    title: 'XOR Mystery',
    category: 'Reverse',
    difficulty: 'medium',
    prompt: 'A function XORs input with key 0x42. Given output 0x2E, what was the input? Convert to ASCII. Flag format: CSA{character}',
    flag: 'CSA{l}',
    hints: [
      'XOR is reversible: if output = input XOR key, then input = output XOR key.',
      'To find the original input, XOR the output (0x2E) with the key (0x42): 0x2E XOR 0x42 = ?',
      '0x2E = 46, 0x42 = 66. 46 XOR 66 = 108. Convert 108 to ASCII to get the character.'
    ],
  },
  {
    id: 'bin-endian',
    title: 'Base64 Binary',
    category: 'Binary',
    difficulty: 'medium',
    prompt: 'Decode this base64: Q1NBe2JpbmFyeV9mbGFnfQ==. The result is your flag. Flag format: CSA{...}',
    flag: 'CSA{binary_flag}',
    hints: [
      'Base64 is a common encoding scheme. Use an online decoder or Python\'s base64.b64decode() function.',
      'The string "Q1NBe2JpbmFyeV9mbGFnfQ==" is a base64-encoded string. Decode it directly.',
      'After decoding, you should get a readable ASCII string that matches the flag format.'
    ],
  },
  {
    id: 'web-rot13',
    title: 'ROT13 URL',
    category: 'Web',
    difficulty: 'medium',
    prompt: 'A URL parameter contains: "pynff=PFN7ebg13_va_hey}". Decode the ROT13 part (letters only, ignore numbers and special chars). Flag format: CSA{...}',
    flag: 'CSA{rot13_in_url}',
    hints: [
      'ROT13 shifts each letter by 13 positions in the alphabet. The part after "=" is the encoded flag.',
      'Focus on "PFN7ebg13_va_hey}". Apply ROT13 to letters only: P→C, F→S, N→A, e→r, b→o, g→t, etc.',
      'After ROT13: P→C, F→S, N→A, e→r, b→o, g→t, v→i, a→n, h→u, e→r, y→l. Keep numbers and special chars as-is.'
    ],
  },
  {
    id: 'crypto-xor',
    title: 'XOR Cipher',
    category: 'Cryptography',
    difficulty: 'medium',
    prompt: 'Ciphertext: "52 45 58". Each byte is XORed with key 0x0A. Decrypt to get the flag. Flag format: CSA{...}',
    flag: 'CSA{XOR}',
    hints: [
      'Convert each hex byte to decimal, then XOR with the key (0x0A = 10), then convert back to ASCII.',
      '52 (hex) = 82 (dec), 82 XOR 10 = 88 = "X". 45 (hex) = 69 (dec), 69 XOR 10 = 79 = "O".',
      '58 (hex) = 88 (dec), 88 XOR 10 = 82 = "R". So the decrypted text is "XOR".'
    ],
  },
  {
    id: 'forensics-morse',
    title: 'Morse Code Hidden',
    category: 'Forensics',
    difficulty: 'medium',
    prompt: 'Decode this morse code: "-.-. ... .- / ... . -.-. .-. . -". The slash represents a space. Flag format: CSA{...}',
    flag: 'CSA{SECRET}',
    hints: [
      'Use a morse code decoder. Each group of dots and dashes represents a letter. The "/" is a word separator.',
      '"-.-." = C, "..." = S, ".-" = A, "/" = space, then "..." = S, "." = E, "-.-." = C, ".-." = R, "." = E, "-" = T.',
      'The decoded message is "CSA SECRET". Format it as a flag: CSA{SECRET}.'
    ],
  },
  {
    id: 'reverse-pattern',
    title: 'Pattern Recognition',
    category: 'Reverse',
    difficulty: 'medium',
    prompt: 'Sequence: 67, 83, 65, 123, 112, 97, 116, 116, 101, 114, 110, 125. Each number represents an ASCII character. Decode to get the flag. Flag format: CSA{...}',
    flag: 'CSA{pattern}',
    hints: [
      'Each number is an ASCII decimal code. Convert each number to its corresponding character.',
      '67 = "C", 83 = "S", 65 = "A", 123 = "{", 112 = "p", 97 = "a", 116 = "t", etc.',
      'The full sequence decodes to: C(67) S(83) A(65) {(123) p(112) a(97) t(116) t(116) e(101) r(114) n(110) }(125)'
    ],
  },
  {
    id: 'bin-ascii',
    title: 'Binary to Text',
    category: 'Binary',
    difficulty: 'easy',
    prompt: 'Convert this binary to ASCII: 01000011 01010011 01000001 01111011 01100010 01101001 01101110 01100001 01110010 01111001 01111101. Flag format: CSA{...}',
    flag: 'CSA{binary}',
    hints: [
      'Each 8-bit binary number represents one ASCII character. Convert each binary byte to decimal, then to ASCII.',
      '01000011 (binary) = 67 (decimal) = "C". 01010011 = 83 = "S". 01000001 = 65 = "A".',
      'Continue: 01111011 = 123 = "{", 01100010 = 98 = "b", 01101001 = 105 = "i", etc. Convert all bytes to get the full flag.'
    ],
  },
];
