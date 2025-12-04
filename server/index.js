import express from 'express';
import cors from 'cors';
import { pipeline } from '@xenova/transformers';
import fetch from 'node-fetch'; // For web search / Node < 18

const app = express();
const PORT = process.env.PORT || 3001;

// Toggle live web search via env
const WEB_SEARCH_ENABLED = process.env.WEB_SEARCH_ENABLED === 'true';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize the model (using a small, efficient model for local use)
let generator = null;

async function initializeModel() {
  try {
    console.log('Loading AI model... This may take a minute on first run.');
    // Using a small, efficient model that runs locally
    // Try multiple model options for better compatibility
    const modelOptions = [
      'Xenova/Qwen2.5-0.5B-Instruct',
      'Xenova/TinyLlama-1.1B-Chat-v1.0',
      'Xenova/Phi-3-mini-4k-instruct',
    ];
    
    let modelLoaded = false;
    for (const modelName of modelOptions) {
      try {
        console.log(`Attempting to load model: ${modelName}`);
        generator = await pipeline('text-generation', modelName);
        console.log(`AI model (${modelName}) loaded successfully!`);
        modelLoaded = true;
        break;
      } catch (modelError) {
        console.log(`Failed to load ${modelName}, trying next model...`);
        continue;
      }
    }
    
    if (!modelLoaded) {
      throw new Error('All model loading attempts failed');
    }
  } catch (error) {
    console.error('Error loading model:', error);
    // Fallback to a simpler approach if model loading fails
    console.log('Using fallback response system...');
    generator = null;
  }
}

// Initialize model on server start
initializeModel();

// Chat history storage (in-memory, can be replaced with database)
const chatHistories = new Map();
const MAX_HISTORY_MESSAGES = 10;

/**
 * Perform a web search using Tavily (or another compatible API).
 * Returns an array of { title, content, url }.
 *
 * To enable:
 * - Sign up for Tavily (or another search API)
 * - Set env vars:
 *     TAVILY_API_KEY=your_key_here
 *     WEB_SEARCH_ENABLED=true
 */
async function webSearch(query, maxResults = 5) {
  if (!WEB_SEARCH_ENABLED || !process.env.TAVILY_API_KEY) {
    return [];
  }

  try {
    const resp = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        search_depth: 'basic',
        include_answer: false,
        max_results: maxResults,
      }),
    });

    if (!resp.ok) {
      console.error('Web search HTTP error:', resp.status, await resp.text());
      return [];
    }

    const data = await resp.json();
    const results = Array.isArray(data.results) ? data.results : [];

    return results.map((r) => ({
      title: r.title || 'Result',
      content: r.content || r.snippet || '',
      url: r.url || '',
    }));
  } catch (err) {
    console.error('Web search failed:', err);
    return [];
  }
}

function getOrCreateHistory(sessionId) {
  if (!chatHistories.has(sessionId)) {
    chatHistories.set(sessionId, []);
  }
  return chatHistories.get(sessionId);
}

function buildPrompt(messages) {
  // Try ChatML-style formatting first (works well for Qwen-style models)
  try {
    return (
      messages
        .map((msg) => {
          if (msg.role === 'system') {
            return `<|im_start|>system\n${msg.content}<|im_end|>\n`;
          } else if (msg.role === 'user') {
            return `<|im_start|>user\n${msg.content}<|im_end|>\n`;
          }
          return `<|im_start|>assistant\n${msg.content}<|im_end|>\n`;
        })
        .join('') + '<|im_start|>assistant\n'
    );
  } catch {
    // Fallback: simple role-prefixed text
    return (
      messages
        .map(
          (msg) =>
            `${msg.role === 'system' ? 'System' : msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`,
        )
        .join('\n') + '\nAssistant:'
    );
  }
}

function extractAssistantResponse(raw, prompt) {
  let response = raw || '';

  if (response.includes('<|im_start|>assistant\n')) {
    const assistantResponse = response.split('<|im_start|>assistant\n').pop()?.split('<|im_end|>')[0];
    if (assistantResponse) {
      response = assistantResponse.trim();
    }
  } else if (response.includes('Assistant:')) {
    const parts = response.split('Assistant:');
    response = parts[parts.length - 1].trim();
  } else if (prompt) {
    // Remove prompt prefix heuristically if the model echoed it
    const promptLines = prompt.split('\n').length;
    const responseLines = response.split('\n');
    response = responseLines.slice(promptLines).join('\n').trim() || response;
  }

  // Clean up ChatML markers if any remain
  return response.replace(/<\|im_start\|>/g, '').replace(/<\|im_end\|>/g, '').trim();
}

// System prompt for cybersecurity context
const SYSTEM_PROMPT = `You are an AI cybersecurity assistant in the CyberSec Arena platform. 
Your role is to help users learn cybersecurity concepts, answer questions about:
- Capture The Flag (CTF) challenges
- Phishing detection and email security
- Secure coding practices
- Network security and firewalls
- General cybersecurity best practices
- Explaining security vulnerabilities
- Providing learning resources and guidance

Be helpful, clear, and educational. If you don't know something, admit it and suggest resources to learn more.
Always prioritize security best practices and ethical hacking principles.`;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create chat history for this session
    const history = getOrCreateHistory(sessionId);

    // Add user message to history
    history.push({ role: 'user', content: message });

    let response;

    if (generator) {
      try {
        // 1) Optional: fetch live web search results to ground the answer
        const searchResults = await webSearch(message, 5);

        let searchContext = '';
        if (searchResults.length > 0) {
          searchContext =
            'You have the following live internet search results. Base your answer ONLY on these results plus solid cybersecurity knowledge. ' +
            'If you are not sure, clearly say you are not sure. Always prefer correctness over guessing. Cite sources (URLs) when relevant.\n\n' +
            searchResults
              .map(
                (r, i) =>
                  `${i + 1}. ${r.title}\n${r.content}\nSource: ${r.url}\n`,
              )
              .join('\n');
        }

        // 2) Format messages for the model
        let messages = [
          {
            role: 'system',
            content:
              SYSTEM_PROMPT +
              '\n\nYou also have access to web search results when provided. Use them to verify facts and avoid hallucinations.',
          },
        ];

        if (searchContext) {
          messages.push({
            role: 'system',
            content: searchContext,
          });
        }

        messages = messages.concat(
          history.slice(-MAX_HISTORY_MESSAGES), // Keep last N messages for context
        );

        const prompt = buildPrompt(messages);

        // Generate response
        const result = await generator(prompt, {
          max_new_tokens: 512,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
        });

        response = extractAssistantResponse(
          result[0]?.generated_text || 'I apologize, but I encountered an error generating a response.',
          prompt,
        );
        
        // If response is empty or too short, use fallback
        if (!response || response.length < 10) {
          response = generateFallbackResponse(message);
        }
      } catch (error) {
        console.error('Error generating response:', error);
        response = generateFallbackResponse(message);
      }
    } else {
      // Fallback response system
      response = generateFallbackResponse(message);
    }

    // Add assistant response to history
    history.push({ role: 'assistant', content: response });

    res.json({ response, sessionId });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your message',
      response: generateFallbackResponse(req.body.message || '')
    });
  }
});

// Fallback response system (keyword-based)
function generateFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Cybersecurity-related responses
  if (lowerMessage.includes('ctf') || lowerMessage.includes('capture the flag')) {
    return 'CTF (Capture The Flag) challenges are cybersecurity competitions where you solve security puzzles. Start with easy challenges, read hints carefully, and use tools like Burp Suite, Wireshark, or command-line utilities. Look for format hints like CSA{...} in the challenge description.';
  }
  
  if (lowerMessage.includes('phish') || lowerMessage.includes('phishing')) {
    return 'Phishing is a social engineering attack where attackers trick users into revealing sensitive information. Always verify sender domains, check for urgency tactics, hover over links before clicking, and never share credentials via email. When in doubt, contact the organization directly through official channels.';
  }
  
  if (lowerMessage.includes('sql injection') || lowerMessage.includes('sqli')) {
    return 'SQL Injection occurs when untrusted input is inserted into SQL queries. Prevent it by using parameterized queries/prepared statements, input validation, and least privilege database access. Never concatenate user input directly into SQL queries.';
  }
  
  if (lowerMessage.includes('xss') || lowerMessage.includes('cross-site scripting')) {
    return 'XSS (Cross-Site Scripting) allows attackers to inject malicious scripts into web pages. Prevent it by sanitizing user input, using Content Security Policy (CSP), escaping output, and avoiding dangerouslySetInnerHTML in React. Always validate and sanitize data before rendering.';
  }
  
  if (lowerMessage.includes('firewall') || lowerMessage.includes('network security')) {
    return 'Firewalls control network traffic based on security rules. Use defense-in-depth strategies: multiple layers of security, least privilege access, regular rule reviews, and monitoring. Prioritize blocking high-risk traffic first, and keep firewall rules updated.';
  }
  
  if (lowerMessage.includes('password') || lowerMessage.includes('authentication')) {
    return 'Use strong, unique passwords for each account. Consider password managers. For applications, hash passwords with salt using strong algorithms like Argon2, bcrypt, or PBKDF2. Never store plaintext passwords. Enable multi-factor authentication (MFA) when possible.';
  }
  
  if (lowerMessage.includes('encryption')) {
    return 'Encryption protects data confidentiality. Use strong algorithms like AES-256 for symmetric encryption and RSA/ECDSA for asymmetric encryption. Always use TLS/SSL for data in transit. For data at rest, use full disk encryption and encrypt sensitive database fields.';
  }
  
  if (lowerMessage.includes('vulnerability') || lowerMessage.includes('exploit')) {
    return 'Vulnerabilities are weaknesses that can be exploited. Common types include: injection flaws, broken authentication, sensitive data exposure, XML external entities, broken access control, security misconfiguration, and more. Regular security audits and penetration testing help identify vulnerabilities.';
  }
  
  // General responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return 'Hello! I\'m your AI cybersecurity assistant. I can help you with CTF challenges, security concepts, secure coding practices, and general cybersecurity questions. What would you like to learn about today?';
  }
  
  if (lowerMessage.includes('help')) {
    return 'I can help you with:\n- Understanding cybersecurity concepts\n- CTF challenge guidance\n- Secure coding practices\n- Network security and firewalls\n- Phishing detection\n- Security vulnerabilities and exploits\n- Best practices and learning resources\n\nWhat specific topic would you like help with?';
  }
  
  // Default response
  return 'I understand you\'re asking about cybersecurity. While I\'m still loading my full capabilities, I can help with topics like CTF challenges, secure coding, network security, phishing detection, and general security best practices. Could you rephrase your question or ask about a specific cybersecurity topic?';
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    modelLoaded: generator !== null,
    timestamp: new Date().toISOString()
  });
});

// Clear chat history endpoint
app.post('/api/chat/clear', (req, res) => {
  const { sessionId = 'default' } = req.body;
  chatHistories.delete(sessionId);
  res.json({ success: true, message: 'Chat history cleared' });
});

// News endpoints
// Fetch cybersecurity news from RSS feeds and news APIs
app.get('/api/news', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const articles = await fetchCybersecurityNews(limit);
    res.json({ articles, totalResults: articles.length });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news', articles: [] });
  }
});

app.get('/api/news/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const articles = await fetchCybersecurityNews(50);
    // Simple search filter
    const filtered = articles.filter(article => 
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.description.toLowerCase().includes(query.toLowerCase())
    );
    res.json({ articles: filtered, totalResults: filtered.length });
  } catch (error) {
    console.error('Error searching news:', error);
    res.status(500).json({ error: 'Failed to search news', articles: [] });
  }
});

// Function to fetch cybersecurity news
async function fetchCybersecurityNews(limit = 20) {
  // Curated cybersecurity news sources
  const newsSources = [
    {
      id: '1',
      title: 'New OWASP Top 10 Update Released',
      description: 'The Open Web Application Security Project has released an updated Top 10 list of the most critical web application security risks, reflecting the evolving threat landscape and emerging vulnerabilities.',
      source: 'OWASP',
      author: 'OWASP Foundation',
      url: 'https://owasp.org/www-project-top-ten/',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Web Security',
      tags: ['OWASP', 'Web Security', 'Vulnerabilities', 'Top 10'],
    },
    {
      id: '2',
      title: 'Supply Chain Attack Trends in 2025',
      description: 'Security researchers report a significant increase in supply chain attacks targeting software dependencies and third-party vendors. Organizations are urged to implement stricter vendor security assessments and dependency scanning.',
      source: 'Security Weekly',
      author: 'Security Research Team',
      url: '#',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Threat Intelligence',
      tags: ['Supply Chain', 'Threats', 'Risk Management', 'Vendors'],
    },
    {
      id: '3',
      title: 'Phishing Techniques Evolve with AI',
      description: 'Cybercriminals are leveraging AI tools to create more convincing phishing emails and social engineering attacks. Security awareness training becomes more critical than ever as attackers use generative AI to craft personalized attacks.',
      source: 'CISA',
      author: 'Cybersecurity and Infrastructure Security Agency',
      url: 'https://www.cisa.gov/news-events/cybersecurity-advisories',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Social Engineering',
      tags: ['Phishing', 'AI', 'Social Engineering', 'Threats'],
    },
    {
      id: '4',
      title: 'Zero-Day Vulnerability Found in Popular Web Framework',
      description: 'Security researchers have discovered a critical zero-day vulnerability affecting millions of websites using a popular web framework. Immediate patching is recommended for affected systems. The vulnerability allows remote code execution.',
      source: 'Security Research',
      author: 'Security Research Labs',
      url: '#',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Vulnerabilities',
      tags: ['Zero-Day', 'Critical', 'Patch', 'RCE'],
    },
    {
      id: '5',
      title: 'Ransomware Attacks Target Healthcare Sector',
      description: 'A new ransomware campaign specifically targets healthcare organizations, encrypting patient data and disrupting critical services. Healthcare providers are advised to review their backup and recovery procedures and implement network segmentation.',
      source: 'Healthcare IT News',
      author: 'Healthcare Security Team',
      url: '#',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Ransomware',
      tags: ['Ransomware', 'Healthcare', 'Critical Infrastructure', 'Data Protection'],
    },
    {
      id: '6',
      title: 'New NIST Cybersecurity Framework Updates',
      description: 'The National Institute of Standards and Technology has released updates to its Cybersecurity Framework, providing new guidance for organizations to manage cybersecurity risk. The update includes enhanced guidance on supply chain risk management.',
      source: 'NIST',
      author: 'National Institute of Standards and Technology',
      url: 'https://www.nist.gov/cyberframework',
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Standards',
      tags: ['NIST', 'Framework', 'Compliance', 'Risk Management'],
    },
    {
      id: '7',
      title: 'Critical Security Update for Major Cloud Provider',
      description: 'A major cloud service provider has released a critical security update addressing a vulnerability that could allow unauthorized access to customer data. All users are strongly advised to apply the update immediately.',
      source: 'Cloud Security News',
      author: 'Cloud Security Team',
      url: '#',
      publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Cloud Security',
      tags: ['Cloud', 'Critical', 'Update', 'Data Breach'],
    },
    {
      id: '8',
      title: 'IoT Security Standards Updated',
      description: 'New security standards for Internet of Things devices have been published, requiring manufacturers to implement stronger authentication and encryption. This aims to reduce the attack surface of connected devices.',
      source: 'IoT Security Alliance',
      author: 'IoT Standards Committee',
      url: '#',
      publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'IoT Security',
      tags: ['IoT', 'Standards', 'Encryption', 'Authentication'],
    },
    {
      id: '9',
      title: 'Multi-Factor Authentication Becomes Mandatory',
      description: 'Regulatory bodies are requiring organizations to implement multi-factor authentication for all user accounts. This move comes after a series of credential-based attacks on critical infrastructure.',
      source: 'Security Compliance News',
      author: 'Compliance Team',
      url: '#',
      publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Authentication',
      tags: ['MFA', 'Compliance', 'Authentication', 'Regulations'],
    },
    {
      id: '10',
      title: 'New Malware Campaign Uses Legitimate Software',
      description: 'Security researchers have identified a new malware campaign that disguises malicious payloads within legitimate software installers. Users are advised to download software only from official sources and verify digital signatures.',
      source: 'Malware Research Lab',
      author: 'Threat Intelligence Team',
      url: '#',
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Malware',
      tags: ['Malware', 'Threats', 'Social Engineering', 'Detection'],
    },
    {
      id: '11',
      title: 'API Security Best Practices Published',
      description: 'A comprehensive guide on API security best practices has been released, covering authentication, rate limiting, input validation, and error handling. The guide addresses the growing number of API-related security incidents.',
      source: 'API Security Council',
      author: 'API Security Working Group',
      url: '#',
      publishedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'API Security',
      tags: ['API', 'Best Practices', 'Security', 'Development'],
    },
    {
      id: '12',
      title: 'Quantum Computing Threat to Encryption',
      description: 'As quantum computing advances, security experts warn about the potential threat to current encryption methods. Organizations are encouraged to begin planning for post-quantum cryptography migration.',
      source: 'Quantum Security Initiative',
      author: 'Quantum Security Research',
      url: '#',
      publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Cryptography',
      tags: ['Quantum', 'Encryption', 'Future Threats', 'Cryptography'],
    },
    {
      id: '13',
      title: 'Security Awareness Training Shows Results',
      description: 'Organizations that implemented comprehensive security awareness training programs report a 40% reduction in successful phishing attacks. The training focuses on recognizing social engineering tactics.',
      source: 'Security Education News',
      author: 'Security Training Institute',
      url: '#',
      publishedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Security Awareness',
      tags: ['Training', 'Phishing', 'Social Engineering', 'Education'],
    },
    {
      id: '14',
      title: 'Container Security Best Practices',
      description: 'New guidelines for securing containerized applications have been published, covering image scanning, runtime security, and network policies. Container security is critical as more organizations adopt microservices architectures.',
      source: 'Container Security Alliance',
      author: 'Container Security Team',
      url: '#',
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Container Security',
      tags: ['Containers', 'Docker', 'Kubernetes', 'DevSecOps'],
    },
    {
      id: '15',
      title: 'Bug Bounty Programs Reach New Heights',
      description: 'Major technology companies are increasing bug bounty rewards, with some programs now offering over $1 million for critical vulnerabilities. This incentivizes ethical hackers to find and report security issues.',
      source: 'Bug Bounty News',
      author: 'Bug Bounty Platform',
      url: '#',
      publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Bug Bounties',
      tags: ['Bug Bounty', 'Ethical Hacking', 'Vulnerabilities', 'Rewards'],
    },
  ];

  // Sort by date (newest first) and limit results
  return newsSources
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, limit);
}

app.listen(PORT, () => {
  console.log(`AI Chatbot server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

