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
    title: 'Page Source',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'Inspect the HTML source code of a suspicious webpage to find a hidden comment containing secret information.',
    flag: 'source_code',
    hints: [
      'Right-click and select "View Page Source" or press Ctrl+U.',
      'Look for HTML comments: <!-- -->',
      'The flag is inside a comment.'
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
    title: 'Find Text',
    category: 'Forensics',
    difficulty: 'easy',
    prompt: 'A binary file contains hidden text strings. Extract all readable strings from the file to find the secret message.',
    flag: 'strings_found',
    hints: [
      'Use the strings command or open the file as text.',
      'Search for text that starts with certain keywords',
      'The flag is directly in the file.'
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
    title: 'Cookie Change',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'Modify the "access" cookie value from "user" to "admin" using browser developer tools, then check if new content is revealed.',
    flag: 'cookie_admin',
    hints: [
      'Use browser developer tools to edit cookies.',
      'Find the "access" cookie and change its value to "admin".',
      'Refresh the page to see the flag.'
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
    title: 'Hidden Text in File',
    category: 'Forensics',
    difficulty: 'easy',
    prompt: 'A text file contains the word "metadata" followed by some extra characters. Remove the extra characters and extract just "metadata".',
    flag: 'metadata',
    hints: [
      'Look for the word in the file content.',
      'The word might have extra spaces or symbols around it.',
      'Extract just the clean word without any extras.'
    ],
  },
  {
    id: 'web-header',
    title: 'HTTP Header',
    category: 'Web',
    difficulty: 'easy',
    prompt: 'Examine the HTTP response headers from a web server using developer tools to find a custom header containing secret data.',
    flag: 'header_flag',
    hints: [
      'Open browser developer tools and go to Network tab.',
      'Check response headers for any custom headers.',
      'The flag is in a custom header.'
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
    title: 'JWT Token',
    category: 'Web',
    difficulty: 'medium',
    prompt: 'You intercepted a JWT (JSON Web Token). Decode the middle section (payload) to extract user information hidden within the token.',
    flag: 'jwt_token',
    hints: [
      'JWT tokens have format: header.payload.signature',
      'The middle part (payload) is base64url encoded.',
      'Decode the payload to get JSON with the flag.'
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
    prompt: 'A value is stored in little-endian format as bytes: 7B 41 53 43. Convert to big-endian byte order and interpret as ASCII text.',
    flag: 'CSA{',
    hints: [
      'Little-endian: least significant byte first. Big-endian: most significant byte first.',
      'Little-endian "7B 41 53 43" in big-endian is "43 53 41 7B".',
      'Convert hex to ASCII: 43=C, 53=S, 41=A, 7B={'
    ],
  },

  // ==================== HARD CHALLENGES ====================
  {
    id: 'crypto-rsa-small-e',
    title: 'RSA Small Exponent (e=3)',
    category: 'Cryptography',
    difficulty: 'hard',
    prompt: 'A poorly implemented RSA system used a small exponent e=3 without proper padding. The ciphertext is a direct cube of the plaintext. Recover the original message using integer cube root extraction.',
    flag: 'rsa_cube_root',
    hints: [
      'Small public exponent attacks exist when messages are not padded correctly.',
      'If m^e < n then c = m^e (mod n) is simply m^e — take the integer cube root.',
      'Compute the integer cube root of the ciphertext to recover the original message string.',
    ],
  },
  {
    id: 'web-ssti',
    title: 'Server-Side Template Injection',
    category: 'Web',
    difficulty: 'hard',
    prompt: 'A web application uses server-side template rendering and reflects user input unsanitized into templates. Craft a payload that exploits this vulnerability to access sensitive variables.',
    flag: 'ssti_executed',
    hints: [
      'Identify the template engine in use (Jinja2, Twig, etc.) by testing expression syntax.',
      'Try payloads that access attributes, call functions, or import modules to read server variables.',
      'Carefully craft a payload that prints the secret variable containing the flag.',
    ],
  },
  {
    id: 'reverse-simple',
    title: 'Simple Reverse Engineering',
    category: 'Reverse',
    difficulty: 'easy',
    prompt: 'A simple executable prints different messages based on input. By using the strings command and analyzing the output, determine what input string produces the success message.',
    flag: 'REVERSE_ME',
    hints: [
      'Use "strings" command on the binary to find embedded text strings.',
      'Look for success messages or congratulations text.',
      'The password/input is likely stored nearby in the binary.',
      'Strings that are printed together are often close in memory.',
    ],
  },
  {
    id: 'binary-rop',
    title: 'ROP Gadget Chain',
    category: 'Binary',
    difficulty: 'hard',
    prompt: 'A 32-bit binary has NX enabled but ASLR is disabled. Use Return-Oriented Programming (ROP) techniques to chain gadgets and execute system commands or leak the flag from memory.',
    flag: 'rop_master',
    hints: [
      'Find gadgets using ROP gadget-finders (ROPgadget, rp++).',
      'Leak an address if necessary, then compute offsets and build a payload to pivot to a chain that calls system().',
      'Test locally with the same libc version to craft a working exploit.',
    ],
  },
  {
    id: 'crypto-padding-oracle',
    title: 'Padding Oracle',
    category: 'Cryptography',
    difficulty: 'hard',
    prompt: 'An application decrypts AES-CBC cookies and returns different error messages for valid vs. invalid padding. Use this information leak to conduct a padding oracle attack and decrypt the flag.',
    flag: 'padding_oracle',
    hints: [
      'Padding oracle attacks manipulate ciphertext blocks to discover plaintext one byte at a time.',
      'Automate the attack to iterate over possible byte values and observe server responses.',
      'Reconstruct the plaintext and extract the flag string.',
    ],
  },
  {
    id: 'exploit-format-string',
    title: 'Format String Vulnerability',
    category: 'Web',
    difficulty: 'hard',
    prompt: 'An application logs user input via unsafe printf-style formatting with insufficient sanitization. Exploit this to read arbitrary values from the stack memory containing the flag.',
    flag: 'fmt_vuln',
    hints: [
      'Format string specifiers like %x and %s can read stack memory when incorrectly used.',
      'Find the correct offset to the stack location containing the flag and use %s to print it.',
      'Be cautious: some servers sanitize % characters — try combinations and offsets to locate the flag.',
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
