import { useState, useEffect, useMemo } from 'react';
import { useProgress, useSyncProgressToLeaderboard } from '../lib/progress';
import { useAuth } from '../contexts/AuthContext';
import { PHISH_EMAILS, PhishEmail } from '../data/phish';
import { Mail, Shield, AlertTriangle, CheckCircle, XCircle, Eye, Search, Link as LinkIcon, Clock, User, Lock, AlertCircle, FileText, X } from 'lucide-react';

interface AnalysisState {
  [key: string]: {
    checkedIndicators: string[];
    analyzed: boolean;
    suspiciousScore: number;
  };
}

// Fisher-Yates shuffle algorithm for randomizing array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Select a random subset of emails (always shows mix of solved and unsolved)
function getRandomizedEmails(allEmails: PhishEmail[], solvedIds: string[], count: number = 12): PhishEmail[] {
  const shuffled = shuffleArray(allEmails);
  
  // Always show a mix of solved and unsolved for variety
  const unsolved = shuffled.filter(email => !solvedIds.includes(email.id));
  const solved = shuffled.filter(email => solvedIds.includes(email.id));
  
  // Prioritize unsolved emails, but include some solved ones for variety
  const unsolvedCount = Math.min(unsolved.length, Math.ceil(count * 0.7));
  const solvedCount = Math.min(solved.length, count - unsolvedCount);
  
  const selected = [
    ...shuffleArray(unsolved).slice(0, unsolvedCount),
    ...shuffleArray(solved).slice(0, solvedCount)
  ];
  
  // Fill remaining slots with any emails if needed
  if (selected.length < count) {
    const remaining = shuffled.filter(email => !selected.find(e => e.id === email.id));
    selected.push(...shuffleArray(remaining).slice(0, count - selected.length));
  }
  
  return shuffleArray(selected).slice(0, count);
}

export default function PhishHunt() {
  const { state, markPhishSolved } = useProgress();
  const syncToLeaderboard = useSyncProgressToLeaderboard();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({});
  const [showAnalysis, setShowAnalysis] = useState<Record<string, boolean>>({});
  const [randomizedEmails, setRandomizedEmails] = useState<PhishEmail[]>([]);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedEmail, setPastedEmail] = useState('');
  const [pastedEmailAnalysis, setPastedEmailAnalysis] = useState<{
    from: string;
    subject: string;
    body: string;
    suspiciousIndicators: string[];
    suspiciousScore: number;
    isPhish: boolean;
  } | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [urlAnalysis, setUrlAnalysis] = useState<{ hostname: string; indicators: string[]; score: number; isPhish: boolean; details: Record<string,string> } | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);

  // Randomize emails once when the component mounts so solved questions don't disappear
  useEffect(() => {
    const count = PHISH_EMAILS.length; // Show all email challenges
    setRandomizedEmails(getRandomizedEmails(PHISH_EMAILS, state.phish.solvedIds, count));
    // We intentionally don't re-run this when solvedIds change, to avoid emails disappearing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const solvedCount = state.phish.solvedIds.length;
  const totalCount = PHISH_EMAILS.length;
  const progress = Math.round((solvedCount / totalCount) * 100);
  
  // Reset analysis and feedback when emails change
  useEffect(() => {
    setAnalysis({});
    setFeedback({});
    setSelectedEmail(null);
    setShowAnalysis({});
  }, [randomizedEmails.map(e => e.id).join(',')]);

  // Suspicious indicators to check
  const suspiciousIndicators = [
    { id: 'urgent', label: 'Extreme urgency or threats', icon: Clock },
    { id: 'domain', label: 'Suspicious or misspelled domain', icon: LinkIcon },
    { id: 'http', label: 'HTTP instead of HTTPS link', icon: Lock },
    { id: 'grammar', label: 'Poor grammar or spelling errors', icon: AlertCircle },
    { id: 'request', label: 'Requests sensitive information', icon: User },
    { id: 'sender', label: 'Sender email doesn\'t match company', icon: Mail },
  ];

  const getSuspiciousIndicators = (email: any): string[] => {
    const indicators: string[] = [];
    const domain = extractDomain(email.from);
    const body = email.body.toLowerCase();
    const subject = email.subject.toLowerCase();

    // Check for urgency
    if (subject.includes('urgent') || subject.includes('immediate') || subject.includes('critical') || 
        subject.includes('⚠️') || subject.includes('action required')) {
      indicators.push('urgent');
    }

    // Check domain
    if (domain.includes('0') || domain.includes('1') || domain.includes('-security') || 
        domain.includes('-verify') || domain.includes('-bank') || 
        !domain.match(/^[a-z0-9.-]+\.[a-z]{2,}$/i)) {
      indicators.push('domain');
    }

    // Check HTTP
    if (body.includes('http://') && !body.includes('https://')) {
      indicators.push('http');
    }

    // Check grammar (simple check)
    if (body.includes('click here') || body.includes('verify now') || 
        body.includes('update immediately')) {
      indicators.push('grammar');
    }

    // Check for sensitive info requests
    if (body.includes('password') || body.includes('credit card') || 
        body.includes('ssn') || body.includes('social security')) {
      indicators.push('request');
    }

    // Check sender mismatch
    const companyDomains: { [key: string]: string[] } = {
      'microsoft': ['microsoft.com'],
      'amazon': ['amazon.com', 'amazon.co.uk'],
      'apple': ['apple.com'],
      'paypal': ['paypal.com'],
      'netflix': ['netflix.com'],
      'google': ['google.com', 'gmail.com'],
    };
    
    for (const [company, validDomains] of Object.entries(companyDomains)) {
      if (subject.toLowerCase().includes(company) || body.includes(company)) {
        const isValid = validDomains.some(valid => domain.includes(valid));
        if (!isValid) {
          indicators.push('sender');
        }
      }
    }

    return indicators;
  };

  const toggleIndicator = (emailId: string, indicatorId: string) => {
    setAnalysis(prev => {
      const current = prev[emailId] || { checkedIndicators: [], analyzed: false, suspiciousScore: 0 };
      const checked = current.checkedIndicators.includes(indicatorId)
        ? current.checkedIndicators.filter(id => id !== indicatorId)
        : [...current.checkedIndicators, indicatorId];
      
      return {
        ...prev,
        [emailId]: {
          ...current,
          checkedIndicators: checked,
          suspiciousScore: checked.length,
        }
      };
    });
  };

  const analyzeEmail = (emailId: string, email: any) => {
    const actualIndicators = getSuspiciousIndicators(email);
    setAnalysis(prev => ({
      ...prev,
      [emailId]: {
        checkedIndicators: [],
        analyzed: true,
        suspiciousScore: 0,
      }
    }));
    setShowAnalysis(prev => ({ ...prev, [emailId]: true }));
  };

  const answer = (id: string, guessPhish: boolean, actual: boolean, hint: string, email: any) => {
    const emailAnalysis = analysis[id];
    const hasAnalyzed = emailAnalysis?.analyzed;
    const suspiciousScore = emailAnalysis?.suspiciousScore || 0;

    if (!hasAnalyzed) {
      setFeedback((f) => ({ ...f, [id]: '⚠️ Please analyze the email first by checking suspicious indicators!' }));
      return;
    }

    if (guessPhish === actual) {
      setFeedback((f) => ({ 
        ...f, 
        [id]: `✓ Correct! Well done! ${actual ? 'This was indeed a phishing attempt.' : 'This email was legitimate.'}` 
      }));
      markPhishSolved(id);
      try {
        syncToLeaderboard(user || null);
      } catch (_) {
        // ignore sync errors
      }
    } else {
      const analysisHint = suspiciousScore > 0 
        ? `You found ${suspiciousScore} suspicious indicator(s). ${hint}`
        : hint;
      setFeedback((f) => ({ ...f, [id]: `✗ Not quite. ${analysisHint}` }));
    }
  };

  const extractDomain = (email: string): string => {
    const match = email.match(/@([^\s>]+)/);
    return match ? match[1] : '';
  };

  const isSuspiciousDomain = (domain: string): boolean => {
    return domain.includes('0') || domain.includes('1') || domain.includes('-security') ||
           domain.includes('-verify') || domain.includes('-bank');
  };

  // ========== WHITELIST OF TRUSTED DOMAINS ==========
  const TRUSTED_DOMAINS = new Set([
    // Major Tech Companies
    'google.com', 'gmail.com', 'youtube.com', 'googleusercontent.com',
    'microsoft.com', 'outlook.com', 'office.com', 'outlook.live.com',
    'apple.com', 'icloud.com', 'me.com',
    'amazon.com', 'amazon.co.uk', 'aws.amazon.com',
    'facebook.com', 'meta.com', 'instagram.com', 'whatsapp.com',
    'twitter.com', 'x.com', 't.co',
    'linkedin.com', 'netflix.com', 'github.com',
    'slack.com', 'discord.com', 'telegram.org',
    
    // Financial & Payment
    'paypal.com', 'stripe.com', 'square.com',
    'chase.com', 'bankofamerica.com', 'wellsfargo.com',
    'visa.com', 'mastercard.com',
    
    // Popular Services
    'dropbox.com', 'box.com', 'onedrive.live.com',
    'zoom.us', 'skype.com', 'teams.microsoft.com',
    'okta.com', 'salesforce.com',
    'github.com', 'gitlab.com', 'bitbucket.org',
    'stackoverflow.com', 'reddit.com',
    'wikipedia.org', 'stackexchange.com'
  ]);

  const isWhitelistedDomain = (hostname: string): boolean => {
    const cleanHostname = hostname.toLowerCase();
    
    // Exact match
    if (TRUSTED_DOMAINS.has(cleanHostname)) {
      return true;
    }
    
    // Check if subdomain of trusted domain
    for (const trusted of TRUSTED_DOMAINS) {
      if (cleanHostname.endsWith('.' + trusted)) {
        return true;
      }
    }
    
    return false;
  };

  const getRiskCategory = (score: number, hostname: string): { category: 'low' | 'medium' | 'high'; label: string; color: string } => {
    // Whitelisted domains are always low risk
    if (isWhitelistedDomain(hostname)) {
      return { category: 'low', label: 'Verified Safe (Whitelisted)', color: 'green' };
    }

    if (score <= 2) {
      return { category: 'low', label: 'Low Risk (Likely Safe)', color: 'green' };
    } else if (score <= 4) {
      return { category: 'medium', label: 'Medium Risk (Suspicious)', color: 'yellow' };
    } else {
      return { category: 'high', label: 'High Risk (Likely Phishing)', color: 'red' };
    }
  };

  const getRiskReasons = (urlAnalysis: any): string[] => {
    const reasons: string[] = [];

    if (isWhitelistedDomain(urlAnalysis.hostname)) {
      reasons.push('✅ Domain is whitelisted as trusted');
      return reasons;
    }

    // Domain Validation
    if (urlAnalysis.details?.domain_validation) {
      const validation = urlAnalysis.details.domain_validation;
      if (validation.includes('IP address')) {
        reasons.push('🚨 Using IP address instead of domain name - HIGH RISK');
      } else if (validation.includes('Local') || validation.includes('localhost')) {
        reasons.push('🚨 Local/localhost domain - NOT a legitimate internet domain');
      } else if (validation.includes('Invalid format')) {
        reasons.push('🚨 Invalid domain name format - not a proper domain');
      } else if (validation.includes('random')) {
        reasons.push('⚠️ Domain name appears random or encoded');
      } else if (validation.includes('pattern')) {
        reasons.push('⚠️ Domain has suspicious naming pattern');
      } else if (validation.includes('short')) {
        reasons.push('ℹ️ Domain name is unusually short');
      }
    }

    // SSL Status
    if (urlAnalysis.details?.ssl_status?.includes('HTTPS')) {
      reasons.push('✅ HTTPS enabled (encrypts data)');
    } else if (!urlAnalysis.details?.ssl_status?.includes('Invalid') && !urlAnalysis.details?.ssl_status?.includes('N/A')) {
      reasons.push('⚠️ No HTTPS - data transmitted unencrypted');
    }

    // Domain Age
    const domainAge = urlAnalysis.details?.domain_age;
    if (domainAge && !domainAge.includes('Invalid')) {
      if (domainAge.includes('Established')) {
        reasons.push('✅ Domain appears established');
      } else if (domainAge.includes('Brand new') || domainAge.includes('Temporary')) {
        reasons.push('⚠️ Domain recently registered or appears temporary');
      } else if (domainAge.includes('Suspicious')) {
        reasons.push('⚠️ Domain has suspicious pattern');
      }
    }

    // Check for critical indicators
    if (urlAnalysis.indicators?.includes('ip-host')) {
      reasons.push('🚨 Using IP address instead of domain name (high risk)');
    }
    if (urlAnalysis.indicators?.includes('punycode')) {
      reasons.push('🚨 Using punycode/internationalized domain (lookalike risk)');
    }
    if (urlAnalysis.indicators?.includes('contains-at')) {
      reasons.push('🚨 Contains @ symbol to hide real domain');
    }
    if (urlAnalysis.indicators?.includes('shortener')) {
      reasons.push('⚠️ Using URL shortener - destination hidden');
    }

    // Excessive subdomains
    if (urlAnalysis.indicators?.includes('many-subdomains')) {
      reasons.push('⚠️ Excessive number of subdomains');
    }

    // Suspicious keywords (weak indicator, only if no HTTPS)
    if (urlAnalysis.details?.suspicious_keywords && urlAnalysis.details.suspicious_keywords !== 'None') {
      if (!urlAnalysis.details?.ssl_status?.includes('HTTPS')) {
        reasons.push('⚠️ Contains suspicious keywords without HTTPS protection');
      } else {
        reasons.push('ℹ️ Contains common keywords (minor concern with HTTPS)');
      }
    }

    // Suspicious TLD
    if (urlAnalysis.indicators?.includes('suspicious-tld')) {
      reasons.push('⚠️ Using suspicious domain extension (.tk, .ml, etc)');
    }

    if (reasons.length === 0) {
      reasons.push('ℹ️ No major red flags detected');
    }

    return reasons;
  };

  const calculateDomainAge = (hostname: string): { age: string; isNew: boolean; score: number } => {
    // Simulate domain age check (in real app, use WHOIS data)
    // For demo, we'll check common patterns and give scoring
    const domainAgeSuspiciousPatterns = [
      { regex: /\d{4}-\d{2}-\d{2}/, age: 'Brand new (registered today)' },
      { regex: /^temp-|^test-|^demo-/, age: 'Temporary/Test domain' }
    ];

    let isNew = false;
    let score = 0;
    let age = 'Established domain';

    // Check for temporary patterns
    for (const pattern of domainAgeSuspiciousPatterns) {
      if (pattern.regex.test(hostname)) {
        isNew = true;
        age = pattern.age;
        score = 2; // Reduced from 3
        break;
      }
    }

    // Heuristic: domains with excessive numbers or dashes are often suspicious
    // But legitimate companies use hyphens in domains too, so be less aggressive
    if (!isNew) {
      const numCount = (hostname.match(/\d/g) || []).length;
      const dashCount = (hostname.match(/-/g) || []).length;
      
      if (numCount > 4 && dashCount > 2) {
        isNew = true;
        age = 'Suspicious pattern detected';
        score = 1.5; // Reduced from 2
      }
    }

    return { age, isNew, score };
  };

  const checkSSLSecurity = (protocol: string, hostname: string): { hasSSL: boolean; cert: string; score: number } => {
    const hasSSL = protocol === 'https:';
    let score = 0;
    let cert = 'No SSL/TLS Certificate (HTTP)';

    if (hasSSL) {
      cert = `SSL/TLS Certificate Present (HTTPS)`;
      score = -3; // Significantly reduces risk (legit indicator)
    } else {
      score = 4; // HTTP is a significant red flag
    }

    return { hasSSL, cert, score };
  };

  const checkSuspiciousKeywords = (url: string, hasSSL: boolean): { keywords: string[]; score: number } => {
    const suspiciousKeywords = [
      'verify', 'confirm', 'validate', 'login', 'signin', 'account', 
      'secure', 'update', 'urgent', 'action', 'click', 'bank', 'paypal',
      'amazon', 'apple', 'microsoft', 'google', 'security', 'alert',
      'password', 'credit', 'card', 'payment', 'billing', 'admin',
      'auth', 'authenticate', 'unusual', 'activity', 'suspended',
      'limited', 'restricted', 'locked', 'confirm-identity', 'verify-account'
    ];

    const foundKeywords: string[] = [];
    const urlLower = url.toLowerCase();

    for (const keyword of suspiciousKeywords) {
      if (urlLower.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    }

    // Keywords are less suspicious if URL has HTTPS
    // Many legitimate sites have "login" in the URL
    let score = 0;
    if (hasSSL) {
      // With HTTPS, keywords are very minor concern (0.2 points each)
      score = foundKeywords.length * 0.2;
    } else {
      // Without HTTPS, keywords are more concerning (0.4 points each)
      score = foundKeywords.length * 0.4;
    }

    return { keywords: foundKeywords, score };
  };

  const validateDomainName = (hostname: string): { isValid: boolean; score: number; reason: string } => {
    // Check if hostname is IP address (INVALID)
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      return { isValid: false, score: 5, reason: 'IP address used instead of domain name' };
    }

    // Check if hostname contains localhost (INVALID)
    if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
      return { isValid: false, score: 5, reason: 'Local/localhost domain detected' };
    }

    // Check if hostname is valid format (must have at least one dot and valid characters)
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(hostname)) {
      return { isValid: false, score: 4, reason: 'Invalid domain name format' };
    }

    // Check for excessive hyphens or strange patterns (weak indicator)
    const dashCount = (hostname.match(/-/g) || []).length;
    const numCount = (hostname.match(/\d/g) || []).length;
    
    if (dashCount > 3 || (dashCount > 0 && numCount > 3)) {
      return { isValid: true, score: 1.5, reason: 'Suspicious domain naming pattern' };
    }

    // Check if domain name is too short or looks random (weak indicator)
    const mainDomain = hostname.split('.')[0];
    if (mainDomain.length < 3) {
      return { isValid: true, score: 0.5, reason: 'Very short domain name' };
    }

    // Check if domain looks like random characters (weak indicator)
    if (!/[aeiou]/i.test(mainDomain)) {
      return { isValid: true, score: 1, reason: 'Domain name appears random or encoded' };
    }

    // Valid legitimate-looking domain
    return { isValid: true, score: 0, reason: 'Proper domain name format' };
  };

  const analyzeUrl = (rawUrl: string) => {
    if (!rawUrl || !rawUrl.trim()) return;
    let urlStr = rawUrl.trim();
    try {
      // Ensure URL has protocol for parsing
      if (!/^https?:\/\//i.test(urlStr)) urlStr = 'http://' + urlStr;
      const u = new URL(urlStr);
      const hostname = u.hostname.toLowerCase();
      
      // ========== DOMAIN NAME VALIDATION (EARLY CHECK) ==========
      const domainValidation = validateDomainName(hostname);
      if (!domainValidation.isValid) {
        // Invalid domain - mark as high risk phishing
        setUrlAnalysis({
          hostname,
          indicators: ['invalid-domain', 'no-valid-domain-name'],
          score: 9,
          isPhish: true,
          details: {
            ssl_status: 'N/A - Invalid Domain',
            domain_age: 'Invalid Domain Format',
            suspicious_keywords: 'None'
          }
        });
        setShowUrlModal(true);
        return;
      }
      
      // ========== WHITELIST CHECK (EARLY EXIT) ==========
      if (isWhitelistedDomain(hostname)) {
        setUrlAnalysis({
          hostname,
          indicators: ['whitelisted-domain'],
          score: 0,
          isPhish: false,
          details: {
            ssl_status: 'Whitelisted Domain',
            domain_age: 'Verified Trusted Source',
            suspicious_keywords: 'None'
          }
        });
        setShowUrlModal(true);
        return;
      }

      const indicators: string[] = [];
      const details: Record<string,string> = { 
        protocol: u.protocol, 
        pathname: u.pathname, 
        search: u.search 
      };

      let riskScore = 0;

      // ========== DOMAIN NAME VALIDATION SCORE ==========
      // Add domain validation risk if pattern is suspicious
      if (domainValidation.score > 0) {
        riskScore += domainValidation.score;
        if (domainValidation.score > 0) {
          indicators.push(`invalid-domain-pattern-${domainValidation.reason.toLowerCase().replace(/\s+/g, '-')}`);
        }
      }
      details['domain_validation'] = domainValidation.reason;

      // ========== SSL/TLS CHECK (PRIMARY INDICATOR) ===========
      const sslCheck = checkSSLSecurity(u.protocol, hostname);
      details['ssl_status'] = sslCheck.cert;
      riskScore += sslCheck.score;
      
      if (!sslCheck.hasSSL) {
        indicators.push('no-https');
      } else {
        indicators.push('has-ssl');
      }

      // ========== SUSPICIOUS KEYWORDS CHECK ==========
      // Must check after SSL to provide context
      const keywordCheck = checkSuspiciousKeywords(urlStr, sslCheck.hasSSL);
      details['suspicious_keywords'] = keywordCheck.keywords.join(', ') || 'None';
      riskScore += keywordCheck.score;
      
      if (keywordCheck.keywords.length > 0) {
        indicators.push(`suspicious-keywords (${keywordCheck.keywords.length})`);
      }

      // ========== DOMAIN AGE CHECK ==========
      const domainAgeCheck = calculateDomainAge(hostname);
      details['domain_age'] = domainAgeCheck.age;
      // Only add domain age risk if no HTTPS (HTTPS makes this less relevant)
      if (!sslCheck.hasSSL) {
        riskScore += domainAgeCheck.score;
      } else {
        // Even if HTTPS, new domains still count for 20% of their score
        riskScore += domainAgeCheck.score * 0.2;
      }
      
      if (domainAgeCheck.isNew) {
        indicators.push('new-domain');
      }

      // ========== OTHER TECHNICAL INDICATORS ==========
      
      // punycode / IDN lookalike (CRITICAL - strong indicator) - Weight: 3
      if (hostname.includes('xn--')) {
        indicators.push('punycode');
        riskScore += 3;
      }

      // IP address as host (CRITICAL - strong indicator) - Weight: 3
      if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':')) {
        indicators.push('ip-host');
        riskScore += 3;
      }

      // suspicious TLDs commonly abused - Weight: 1.5
      if (hostname.match(/\.(tk|ml|cf|ga|gq)$/)) {
        indicators.push('suspicious-tld');
        riskScore += 1.5;
      }

      // presence of @ in original string (CRITICAL - trick to hide domain) - Weight: 2.5
      if (rawUrl.includes('@')) {
        indicators.push('contains-at');
        riskScore += 2.5;
      }

      // many subdomains (slight concern) - Weight: 0.5
      const parts = hostname.split('.');
      if (parts.length > 4) {
        indicators.push('many-subdomains');
        riskScore += 0.5;
      }

      // hyphens or numeric substitutions (weak indicator) - Weight: 0.3
      if (hostname.includes('-') || /\d/.test(hostname)) {
        indicators.push('weird-domain');
        riskScore += 0.3;
      }

      // shortener services (red flag - hidden destination) - Weight: 2
      const shorteners = ['bit.ly','tinyurl.com','t.co','ow.ly','goo.gl','is.gd','buff.ly'];
      if (shorteners.some(s => hostname.endsWith(s))) {
        indicators.push('shortener');
        riskScore += 2;
      }

      // suspicious path keywords (weak indicator) - Weight: 0.3
      if (u.pathname.match(/(login|signin|verify|secure|account|update|bank|confirm|admin)/i)) {
        indicators.push('suspicious-path');
        riskScore += 0.3;
      }

      // long URL (minor concern) - Weight: 0.2
      if (urlStr.length > 120) {
        indicators.push('long-url');
        riskScore += 0.2;
      }

      // IMPORTANT: Normalize risk score to 0-10 scale
      let normalizedScore = Math.min(Math.round(riskScore * 10) / 10, 10);
      
      // Determine if phishing based on new thresholds
      // Low Risk: 0-2
      // Medium Risk: 2-4
      // High Risk: 4+
      const isPhish = normalizedScore >= 4;

      setUrlAnalysis({ hostname, indicators, score: normalizedScore, isPhish, details });
      setShowUrlModal(true);
    } catch (e) {
      setUrlAnalysis({ 
        hostname: rawUrl, 
        indicators: ['invalid-url'], 
        score: 10, 
        isPhish: true, 
        details: { error: 'Invalid URL format' } 
      });
      setShowUrlModal(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-purple-400 mb-2 flex items-center gap-2">
          <Shield className="text-purple-400" size={32} />
          Phish Hunt
        </h1>
        <p className="text-slate-400 mb-4">
          Analyze emails, detect phishing attempts, and learn to spot social engineering tactics.
        </p>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm font-semibold text-purple-400">{solvedCount} / {totalCount} solved ({progress}%)</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-2 rounded-full progress-smooth"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Paste Email Analysis Section */}
        <div className="mb-4">
        <button
          onClick={() => setShowPasteModal(true)}
          className="px-4 py-2 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 hover:bg-fuchsia-500/30 transition-colors flex items-center gap-2 interactive btn-press focus-ring"
          aria-label="Open paste email analyzer"
        >
          <FileText size={18} />
          Analyze Pasted Email
        </button>
      </div>

      {/* URL Analyzer Section */}
      <div className="mb-6">
        <div className="flex gap-2 items-center mb-4">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                analyzeUrl(urlInput);
              }
            }}
            placeholder="Paste URL to analyze (e.g http://example.com/login)"
            className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 focus:outline-none focus:border-[#FF6F61]/50 focus-ring"
          />
          <button
            onClick={() => analyzeUrl(urlInput)}
            className="px-4 py-2 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 hover:bg-fuchsia-500/30 transition-colors flex items-center gap-2 interactive btn-press focus-ring"
            aria-label="Analyze URL"
          >
            <Search size={18} /> Analyze URL
          </button>
        </div>

        {urlAnalysis && !showUrlModal && (
          <div className={`p-4 rounded-lg border ${
            urlAnalysis.isPhish 
              ? 'bg-red-500/10 border-red-400/30' 
              : urlAnalysis.score >= 4 
              ? 'bg-yellow-500/10 border-yellow-400/30'
              : 'bg-green-500/10 border-green-400/30'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {urlAnalysis.isPhish ? (
                  <AlertTriangle className="text-red-400" size={20} />
                ) : urlAnalysis.score >= 4 ? (
                  <AlertCircle className="text-yellow-400" size={20} />
                ) : (
                  <CheckCircle className="text-green-400" size={20} />
                )}
                <div className={`font-semibold ${
                  urlAnalysis.isPhish 
                    ? 'text-red-300' 
                    : urlAnalysis.score >= 4 
                    ? 'text-yellow-300'
                    : 'text-green-300'
                }`}>
                  {urlAnalysis.isPhish 
                    ? '⚠️ Likely Phishing URL' 
                    : urlAnalysis.score >= 4 
                    ? '⚠️ Suspicious URL'
                    : '✅ Likely Legitimate URL'}
                </div>
              </div>
              <div className="text-sm font-semibold text-slate-300">Risk Score: {urlAnalysis.score}/10</div>
            </div>
            <div className="text-sm text-slate-300 mb-2">Host: <span className="font-mono text-slate-200">{urlAnalysis.hostname}</span></div>
            
            {/* Quick Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="flex items-center gap-2 text-slate-400">
                <span className={urlAnalysis.details?.ssl_status?.includes('HTTPS') ? 'text-green-400' : 'text-red-400'}>
                  🔒 SSL: {urlAnalysis.details?.ssl_status?.includes('HTTPS') ? 'Present' : 'Missing'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span>📅 Domain: {urlAnalysis.details?.domain_age || 'Unknown'}</span>
              </div>
            </div>

            {urlAnalysis.indicators.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-slate-400 mb-2">Detected Indicators ({urlAnalysis.indicators.length}):</div>
                <div className="grid gap-1">
                  {urlAnalysis.indicators.slice(0, 3).map((ind, idx) => (
                    <div key={idx} className="text-xs text-yellow-300 bg-yellow-500/10 p-1.5 rounded border border-yellow-400/20">
                      {ind}
                    </div>
                  ))}
                  {urlAnalysis.indicators.length > 3 && (
                    <div className="text-xs text-slate-400 p-1.5">+{urlAnalysis.indicators.length - 3} more indicators</div>
                  )}
                </div>
              </div>
            )}
            
            <button
              onClick={() => setShowUrlModal(true)}
              className="w-full mt-2 px-3 py-1.5 text-xs rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-purple-500/30 transition-colors"
            >
              View Detailed Analysis →
            </button>
          </div>
        )}
      </div>

      {/* URL Analysis Modal (matches pasted-email modal style) */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#8B5CF6]">🔍 Advanced URL Analysis</h2>
                <button
                  onClick={() => { setShowUrlModal(false); setUrlAnalysis(null); }}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X size={24} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">URL to analyze</label>
                <div className="flex gap-2">
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        analyzeUrl(urlInput);
                      }
                    }}
                    placeholder="https://example.com/login"
                    className="flex-1 px-4 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 focus:outline-none focus:border-[#FF6F61]/50"
                  />
                  <button
                    onClick={() => analyzeUrl(urlInput)}
                    className="px-4 py-2 rounded-lg bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 hover:bg-fuchsia-500/30 transition-colors flex items-center gap-2"
                  ><Search size={18} /> Analyze URL</button>
                </div>
              </div>

              {urlAnalysis && (
                <div className="space-y-4 border-t border-slate-700 pt-4">
                  {/* Determine Risk Category and Display */}
                  {(() => {
                    const riskInfo = getRiskCategory(urlAnalysis.score, urlAnalysis.hostname);
                    const reasons = getRiskReasons(urlAnalysis);
                    const bgColor = riskInfo.color === 'red' ? 'bg-red-500/10 border-red-400/30' 
                                  : riskInfo.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-400/30'
                                  : 'bg-green-500/10 border-green-400/30';
                    const textColor = riskInfo.color === 'red' ? 'text-red-300' 
                                    : riskInfo.color === 'yellow' ? 'text-yellow-300'
                                    : 'text-green-300';
                    const Icon = riskInfo.color === 'red' ? AlertTriangle 
                               : riskInfo.color === 'yellow' ? AlertCircle
                               : CheckCircle;

                    return (
                      <>
                        {/* Risk Score Display */}
                        <div className={`p-4 rounded-lg border ${bgColor}`}>
                          <div className="flex items-center gap-3 mb-3">
                            <Icon className={riskInfo.color === 'red' ? 'text-red-400' : riskInfo.color === 'yellow' ? 'text-yellow-400' : 'text-green-400'} size={24} />
                            <div>
                              <div className={`font-semibold text-lg ${textColor}`}>
                                {riskInfo.label}
                              </div>
                              <div className="text-sm text-slate-400 mt-1">Risk Score: {urlAnalysis.score}/10</div>
                            </div>
                          </div>

                          {/* Risk Score Bar */}
                          <div className="mt-2">
                            <div className="w-full bg-slate-800 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  riskInfo.color === 'red' 
                                    ? 'bg-red-500' 
                                    : riskInfo.color === 'yellow' 
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${(urlAnalysis.score / 10) * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                              <span>Low (0-2)</span>
                              <span>Medium (2-4)</span>
                              <span>High (4+)</span>
                            </div>
                          </div>
                        </div>

                        {/* Risk Reasons */}
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-slate-300 mb-3">📋 Analysis Reasons:</h3>
                          <div className="space-y-2">
                            {reasons.map((reason, idx) => (
                              <div key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="flex-shrink-0">{reason.split(' ')[0]}</span>
                                <span>{reason.substring(reason.indexOf(' ') + 1)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Host Information */}
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-slate-300 mb-3">📍 Hostname Information</h3>
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <span className="text-sm text-slate-400">Hostname:</span>
                              <span className="text-sm font-mono text-slate-200 text-right break-all">{urlAnalysis.hostname}</span>
                            </div>
                          </div>
                        </div>

                        {/* SSL/TLS Certificate Check */}
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-slate-300 mb-3">🔒 SSL/TLS Security</h3>
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <span className="text-sm text-slate-400">Certificate Status:</span>
                              <div className="flex items-center gap-2">
                                {urlAnalysis.details?.ssl_status?.includes('HTTPS') || urlAnalysis.details?.ssl_status?.includes('Whitelisted') ? (
                                  <>
                                    <CheckCircle size={16} className="text-green-400" />
                                    <span className="text-sm text-green-300">{urlAnalysis.details.ssl_status}</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle size={16} className="text-red-400" />
                                    <span className="text-sm text-red-300">{urlAnalysis.details?.ssl_status || 'No SSL'}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              {urlAnalysis.details?.ssl_status?.includes('HTTPS') || urlAnalysis.details?.ssl_status?.includes('Whitelisted')
                                ? 'HTTPS encrypts data in transit. This is a good security indicator.'
                                : 'HTTP does not encrypt data. Phishers often use HTTP to avoid SSL warnings.'}
                            </p>
                          </div>
                        </div>

                        {/* Domain Age Check */}
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-slate-300 mb-3">📅 Domain Age Analysis</h3>
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <span className="text-sm text-slate-400">Domain Status:</span>
                              <span className="text-sm text-slate-200 text-right">{urlAnalysis.details?.domain_age || 'Unknown'}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              New domains registered recently are often used for phishing. Well-established domains are generally safer.
                            </p>
                          </div>
                        </div>

                        {/* Suspicious Keywords */}
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-slate-300 mb-3">🔑 Suspicious Keywords (Weak Indicator)</h3>
                          {urlAnalysis.details?.suspicious_keywords && urlAnalysis.details.suspicious_keywords !== 'None' ? (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                {urlAnalysis.details.suspicious_keywords.split(', ').map((keyword, idx) => (
                                  <span 
                                    key={idx}
                                    className="px-2 py-1 bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 rounded text-xs font-medium"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs text-slate-500 mt-2">
                                Keywords alone are weak indicators. Legitimate sites often use words like "login" and "verify". Combined with HTTPS, they are less concerning.
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400">No suspicious keywords detected in URL.</p>
                          )}
                        </div>

                        {/* All Indicators */}
                        {urlAnalysis.indicators.length > 0 && !urlAnalysis.indicators.includes('whitelisted-domain') && (
                          <div className="bg-slate-800/50 p-4 rounded-lg">
                            <h3 className="text-sm font-semibold text-slate-300 mb-3">⚡ Technical Indicators</h3>
                            <div className="grid gap-2">
                              {urlAnalysis.indicators.map((ind, idx) => (
                                <div 
                                  key={idx} 
                                  className="text-xs text-yellow-300 bg-yellow-500/10 p-2 rounded border border-yellow-400/20 flex items-center gap-2"
                                >
                                  <AlertCircle size={14} />
                                  <span>{ind}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Risk Scale Reference */}
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-slate-300 mb-3">📊 Risk Scale Reference</h3>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded"></div>
                              <span className="text-slate-300"><span className="font-semibold">0-2:</span> Low Risk - Safe to visit</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                              <span className="text-slate-300"><span className="font-semibold">2-4:</span> Medium Risk - Proceed with caution</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded"></div>
                              <span className="text-slate-300"><span className="font-semibold">4+:</span> High Risk - Likely phishing</span>
                            </div>
                          </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-500/10 border border-blue-400/30 p-4 rounded-lg">
                          <h3 className="text-sm font-semibold text-blue-300 mb-2">💡 Safety Tips:</h3>
                          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                            <li>Whitelisted domains are pre-verified as trusted</li>
                            <li>HTTPS significantly reduces phishing risk</li>
                            <li>Suspicious keywords alone don't prove phishing</li>
                            <li>IP addresses and punycode are major red flags</li>
                            <li>Hover over links in emails to see the actual URL</li>
                            <li>When in doubt, navigate directly to the official website</li>
                          </ul>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Paste Email Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#8B5CF6]">Analyze Pasted Email</h2>
                <button
                  onClick={() => {
                    setShowPasteModal(false);
                    setPastedEmail('');
                    setPastedEmailAnalysis(null);
                  }}
                  className="text-slate-400 hover:text-slate-200 interactive btn-press focus-ring"
                  aria-label="Close paste email modal"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Paste the full email content here (headers, subject, body):
                </label>
                <textarea
                  value={pastedEmail}
                  onChange={(e) => setPastedEmail(e.target.value)}
                  placeholder="From: sender@example.com&#10;Subject: Email Subject&#10;&#10;Email body content..."
                  rows={10}
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-slate-800 text-slate-200 focus:outline-none focus:border-[#FF6F61]/50 focus:ring-1 focus:ring-purple-400/30 font-mono text-sm focus-ring"
                />
              </div>

              <button
                onClick={() => {
                  if (!pastedEmail.trim()) return;
                  
                  // Parse email
                  const fromMatch = pastedEmail.match(/From:\s*(.+)/i) || pastedEmail.match(/From\s*[<:]\s*(.+)/i);
                  const subjectMatch = pastedEmail.match(/Subject:\s*(.+)/i);
                  const bodyMatch = pastedEmail.split(/\n\s*\n/).slice(1).join('\n\n') || pastedEmail;
                  
                  const from = fromMatch ? fromMatch[1].trim() : 'unknown@unknown.com';
                  const subject = subjectMatch ? subjectMatch[1].trim() : 'No Subject';
                  const body = bodyMatch.trim();
                  
                  // Analyze
                  const indicators = getSuspiciousIndicators({ from, subject, body });
                  const suspiciousScore = indicators.length;
                  const isPhish = suspiciousScore >= 2;
                  
                  setPastedEmailAnalysis({
                    from,
                    subject,
                    body,
                    suspiciousIndicators: indicators,
                    suspiciousScore,
                    isPhish,
                  });
                }}
                disabled={!pastedEmail.trim()}
                className="w-full px-4 py-2 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-[#8B5CF6] hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed interactive btn-press focus-ring"
                aria-label="Analyze pasted email"
              >
                Analyze Email
              </button>

              {pastedEmailAnalysis && (
                <div className="mt-4 space-y-4 border-t border-slate-800 pt-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#8B5CF6] mb-2">Analysis Results</h3>
                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="text-slate-400">From:</span> <span className="text-slate-200">{pastedEmailAnalysis.from}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-400">Subject:</span> <span className="text-slate-200">{pastedEmailAnalysis.subject}</span>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${
                      pastedEmailAnalysis.isPhish
                        ? 'bg-red-500/10 border-red-400/30'
                        : 'bg-green-500/10 border-green-400/30'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {pastedEmailAnalysis.isPhish ? (
                          <AlertTriangle className="text-red-400" size={20} />
                        ) : (
                          <CheckCircle className="text-green-400" size={20} />
                        )}
                        <span className={`font-semibold ${
                          pastedEmailAnalysis.isPhish ? 'text-red-300' : 'text-green-300'
                        }`}>
                          {pastedEmailAnalysis.isPhish ? '⚠️ Likely Phishing' : '✅ Likely Legitimate'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mb-3">
                        Suspicious Score: {pastedEmailAnalysis.suspiciousScore} / 6 indicators found
                      </p>
                      
                      {pastedEmailAnalysis.suspiciousIndicators.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-400 mb-2">Found Indicators:</p>
                          <div className="space-y-1">
                            {pastedEmailAnalysis.suspiciousIndicators.map((indicator, idx) => {
                              const indicatorData = suspiciousIndicators.find(i => i.id === indicator);
                              const Icon = indicatorData?.icon || AlertCircle;
                              return (
                                <div key={idx} className="flex items-center gap-2 text-xs text-yellow-300 bg-yellow-500/10 p-2 rounded border border-yellow-400/20">
                                  <Icon size={14} />
                                  <span>{indicatorData?.label || indicator}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/30">
        <div className="flex items-start gap-3">
          <Eye className="text-blue-400 mt-0.5" size={20} />
          <div>
            <h3 className="text-blue-300 font-semibold mb-1">What to Look For:</h3>
            <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
              <li>Check the sender's domain for misspellings (e.g., micr0soft, amaz0n)</li>
              <li>Look for HTTP instead of HTTPS in links</li>
              <li>Watch for extreme urgency or threats</li>
              <li>Verify the domain matches the company's official website</li>
              <li>Legitimate companies rarely ask for sensitive info via email</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Email Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {randomizedEmails.map((m) => {
          const solved = state.phish.solvedIds.includes(m.id);
          const domain = extractDomain(m.from);
          const suspicious = isSuspiciousDomain(domain);
          
          return (
            <div 
              key={m.id} 
              className={`border rounded-lg p-5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] space-y-3 transition-all ${
                solved 
                  ? 'border-[#FF6F61]/30 bg-purple-500/5' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Industry & Campaign Tags */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {m.industry && m.industry !== 'general' && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    m.industry === 'banking' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                    m.industry === 'healthcare' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                    m.industry === 'tech' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
                    m.industry === 'retail' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                    m.industry === 'government' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                    m.industry === 'social-media' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' :
                    'bg-slate-500/20 text-slate-300 border border-slate-400/30'
                  }`}>
                    💼 {m.industry.toUpperCase()}
                  </span>
                )}
                {m.seasonalCampaign && m.seasonalCampaign !== 'general' && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    m.seasonalCampaign === 'holiday' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                    m.seasonalCampaign === 'tax-season' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                    m.seasonalCampaign === 'back-to-school' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30' :
                    m.seasonalCampaign === 'black-friday' ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30' :
                    'bg-slate-500/20 text-slate-300'
                  }`}>
                    {m.seasonalCampaign === 'holiday' && '🎄'}
                    {m.seasonalCampaign === 'tax-season' && '📋'}
                    {m.seasonalCampaign === 'back-to-school' && '📚'}
                    {m.seasonalCampaign === 'black-friday' && '🛍️'}
                    {' '}{m.seasonalCampaign.replace('-', ' ').toUpperCase()}
                  </span>
                )}
                {m.difficulty && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                    m.difficulty === 'easy' ? 'bg-green-500/10 text-green-300 border-green-400/30' :
                    m.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-300 border-yellow-400/30' :
                    'bg-red-500/10 text-red-300 border-red-400/30'
                  }`}>
                    {m.difficulty === 'easy' && '⭐'}
                    {m.difficulty === 'medium' && '⭐⭐'}
                    {m.difficulty === 'hard' && '⭐⭐⭐'}
                  </span>
                )}
              </div>

              {/* Email Header */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="text-slate-400" size={16} />
                    <div className="text-xs text-slate-400 break-all">From: {m.from}</div>
                  </div>
                  {solved && (
                    <CheckCircle className="text-[#8B5CF6] flex-shrink-0" size={18} />
                  )}
                </div>
                
                <div className={`font-semibold ${m.isPhish ? 'text-fuchsia-300' : 'text-[#8B5CF6]'}`}>
                  {m.subject}
                </div>
              </div>

              {/* Email Body */}
              <div 
                className="text-sm text-slate-300 leading-relaxed cursor-pointer interactive btn-press focus-ring"
                onClick={() => setSelectedEmail(selectedEmail === m.id ? null : m.id)}
                tabIndex={0}
                role="button"
                aria-pressed={selectedEmail === m.id}
              >
                {selectedEmail === m.id ? (
                  <div className="space-y-2">
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <div className="pt-2 border-t border-slate-800">
                      <p className="text-xs text-slate-500">Click to collapse</p>
                    </div>
                  </div>
                ) : (
                  <p className="line-clamp-3">{m.body}</p>
                )}
              </div>

              {/* Expert Tip - Show when solved correctly */}
              {solved && m.expertTip && (
                <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-400/30">
                  <p className="text-xs text-blue-300">{m.expertTip}</p>
                </div>
              )}

              {/* Analysis Section */}
              {!solved && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  {!analysis[m.id]?.analyzed ? (
                    <button
                      onClick={() => analyzeEmail(m.id, m)}
                      className="w-full px-4 py-2 text-sm rounded-lg bg-blue-500/10 text-blue-300 border border-blue-400/30 hover:bg-blue-500/20 transition-colors font-medium flex items-center justify-center gap-2 interactive btn-press focus-ring"
                      aria-label={`Analyze email ${m.id}`}
                    >
                      <Search size={16} />
                      Analyze Email for Suspicious Indicators
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Check suspicious indicators:</span>
                        {analysis[m.id]?.suspiciousScore > 0 && (
                          <span className="text-xs font-bold text-yellow-400">
                            {analysis[m.id].suspiciousScore} indicator(s) found
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {suspiciousIndicators.map((indicator) => {
                          const Icon = indicator.icon;
                          const isChecked = analysis[m.id]?.checkedIndicators.includes(indicator.id) || false;
                          const actualIndicators = getSuspiciousIndicators(m);
                          const isActual = actualIndicators.includes(indicator.id);
                          const redFlagExplanation = m.redFlagExplanations?.find(rf => rf.indicatorId === indicator.id);
                          
                          return (
                            <div key={indicator.id}>
                              <button
                                onClick={() => toggleIndicator(m.id, indicator.id)}
                                className={`w-full p-2 rounded-lg border text-xs text-left transition-all interactive btn-press focus-ring ${
                                  isChecked
                                    ? isActual
                                      ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300'
                                      : 'bg-red-500/10 border-red-400/30 text-red-300'
                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-3 h-3 rounded border flex items-center justify-center flex-shrink-0 ${
                                    isChecked ? 'bg-purple-400 border-[#FF6F61]' : 'border-slate-600'
                                  }`}>
                                    {isChecked && <CheckCircle size={10} className="text-slate-900" />}
                                  </div>
                                  <Icon size={12} />
                                  <span className="truncate">{indicator.label}</span>
                                </div>
                              </button>
                              {/* Red Flag Explanation - Show when hovering or checked */}
                              {isChecked && redFlagExplanation && (
                                <div className="mt-1 p-2 rounded bg-slate-800/50 border border-slate-700/50">
                                  <p className="text-xs text-slate-300">{redFlagExplanation.explanation}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 space-y-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => answer(m.id, true, m.isPhish, m.hint, m)}
                            className={`flex-1 px-4 py-2.5 text-sm rounded-lg border transition-all font-semibold interactive btn-press focus-ring ${
                              analysis[m.id]?.suspiciousScore >= 2
                                ? 'bg-red-500/20 text-red-300 border-red-400/50 hover:bg-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                                : 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-400/30 hover:bg-fuchsia-500/20'
                            }`}
                          >
                            🚨 This is PHISHING
                          </button>
                          <button
                            onClick={() => answer(m.id, false, m.isPhish, m.hint, m)}
                            className={`flex-1 px-4 py-2.5 text-sm rounded-lg border transition-all font-semibold interactive btn-press focus-ring ${
                              analysis[m.id]?.suspiciousScore === 0
                                ? 'bg-green-500/20 text-green-300 border-green-400/50 hover:bg-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                                : 'bg-cyan-500/10 text-[#8B5CF6] border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/20'
                            }`}
                          >
                            ✅ This is LEGITIMATE
                          </button>
                        </div>
                        
                        {analysis[m.id]?.suspiciousScore > 0 && analysis[m.id]?.suspiciousScore < 2 && (
                          <p className="text-xs text-yellow-400 text-center">
                            ⚠️ You found {analysis[m.id].suspiciousScore} suspicious indicator(s). Review carefully before deciding.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback */}
              {feedback[m.id] && (
                <div className={`text-sm p-3 rounded-lg ${
                  feedback[m.id].startsWith('✓')
                    ? 'bg-green-500/10 border border-green-400/30 text-green-300'
                    : 'bg-red-500/10 border border-red-400/30 text-red-300'
                }`}>
                  {feedback[m.id]}
                </div>
              )}

              {/* Solved Badge */}
              {solved && (
                <div className="flex items-center gap-2 text-xs text-[#8B5CF6] pt-2 border-t border-slate-800">
                  <CheckCircle size={14} />
                  <span>Solved! {m.isPhish ? 'This was a phishing attempt.' : 'This email was legitimate.'}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {solvedCount === totalCount && (
        <div className="p-6 rounded-lg bg-gradient-to-r from-[#FF6F61]-500/10 to-[#6A0572]-500/10 border border-[#FF6F61]/30 text-center">
          <CheckCircle className="text-[#8B5CF6] mx-auto mb-2" size={32} />
          <h3 className="text-xl font-bold text-[#8B5CF6] mb-2">Congratulations!</h3>
          <p className="text-slate-300">
            You've completed all phishing detection challenges. You're now better equipped to spot phishing attempts in real emails!
          </p>
        </div>
      )}
    </div>
  );
}
