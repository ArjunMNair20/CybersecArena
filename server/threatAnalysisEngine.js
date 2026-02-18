/**
 * Cyber Health Analyzer - Threat Analysis Engine
 * Rule-based expert system for malware and cyber threat prediction
 */

// Symptom to malware type mapping with weights
const SYMPTOM_MALWARE_WEIGHTS = {
  // Ransomware indicators
  'slow': { ransomware: 0.3, rootkit: 0.2, malware: 0.15 },
  'lag': { ransomware: 0.3, rootkit: 0.2, malware: 0.15 },
  'frozen': { ransomware: 0.35, rootkit: 0.25 },
  'encrypted file': { ransomware: 0.9 },
  'lock screen': { ransomware: 0.85, trojan: 0.3 },
  'file extension change': { ransomware: 0.8, trojan: 0.2 },
  'cannot access files': { ransomware: 0.85 },
  'recovery note': { ransomware: 0.9 },

  // Spyware indicators
  'pop-up': { spyware: 0.7, adware: 0.8, malware: 0.3 },
  'advertisement': { adware: 0.8, spyware: 0.3 },
  'ads': { adware: 0.75, spyware: 0.25 },
  'random ads': { adware: 0.85 },
  'webcam activity': { spyware: 0.9, rat: 0.7 },
  'camera': { spyware: 0.85, rat: 0.65 },
  'microphone': { spyware: 0.85, rat: 0.65 },
  'stalked': { spyware: 0.8, rat: 0.6 },
  'monitored': { spyware: 0.75, rat: 0.5 },
  'privacy': { spyware: 0.6 },

  // Keylogger indicators
  'password change': { keylogger: 0.8, spyware: 0.5, account_compromise: 0.7 },
  'account access': { keylogger: 0.7, account_compromise: 0.8, trojan: 0.3 },
  'unauthorized login': { account_compromise: 0.9, keylogger: 0.6, trojan: 0.4 },
  'strange login': { account_compromise: 0.85, keylogger: 0.55 },
  'suspicious activity': { account_compromise: 0.7, trojan: 0.5, spyware: 0.3 },
  'password reset': { account_compromise: 0.75, keylogger: 0.5 },
  'email compromised': { account_compromise: 0.85, keylogger: 0.4 },

  // Trojan indicators
  'unknown file': { trojan: 0.7, malware: 0.6, adware: 0.2 },
  'file': { trojan: 0.4, malware: 0.3 },
  'download': { trojan: 0.5, malware: 0.4 },
  'suspicious file': { trojan: 0.75, malware: 0.6 },
  'exe': { trojan: 0.6, malware: 0.5 },
  'new program': { trojan: 0.5, malware: 0.4 },
  'random process': { trojan: 0.65, rootkit: 0.5, malware: 0.4 },
  'system crash': { trojan: 0.5, rootkit: 0.6, malware: 0.4 },
  'crash': { trojan: 0.4, rootkit: 0.5, malware: 0.35 },
  'blue screen': { rootkit: 0.7, trojan: 0.5, malware: 0.4 },
  'bsod': { rootkit: 0.75, malware: 0.5 },

  // Rootkit indicators
  'antivirus disabled': { rootkit: 0.85, malware: 0.5, trojan: 0.3 },
  'firewall disabled': { rootkit: 0.75, malware: 0.6, trojan: 0.4 },
  'cannot enable antivirus': { rootkit: 0.8, malware: 0.4 },
  'antivirus error': { rootkit: 0.7, malware: 0.5 },
  'system tool disabled': { rootkit: 0.8, malware: 0.5 },
  'cannot access settings': { rootkit: 0.75, trojan: 0.4 },
  'hidden file': { rootkit: 0.8, malware: 0.6, trojan: 0.3 },
  'hidden process': { rootkit: 0.85, malware: 0.6, trojan: 0.4 },
  'invisible': { rootkit: 0.8, spyware: 0.3 },

  // Botnet indicators
  'network traffic': { botnet: 0.7, cryptominer: 0.5, malware: 0.6 },
  'network activity': { botnet: 0.65, cryptominer: 0.4, malware: 0.5 },
  'bandwidth': { botnet: 0.7, cryptominer: 0.6, malware: 0.5 },
  'internet connection': { botnet: 0.6, cryptominer: 0.5, malware: 0.4 },
  'unusual network': { botnet: 0.75, malware: 0.5 },
  'network behavior': { botnet: 0.7, malware: 0.5 },

  // Cryptominer indicators
  'cpu usage': { cryptominer: 0.8, botnet: 0.3, malware: 0.5 },
  'cpu': { cryptominer: 0.75, malware: 0.4 },
  'high cpu': { cryptominer: 0.85, malware: 0.5 },
  'gpu usage': { cryptominer: 0.8, malware: 0.4 },
  'fan noise': { cryptominer: 0.7, malware: 0.3 },
  'hot': { cryptominer: 0.6, malware: 0.2 },
  'temperature': { cryptominer: 0.7, malware: 0.3 },
  'battery drain': { cryptominer: 0.65, botnet: 0.3, malware: 0.4 },
  'drain': { cryptominer: 0.5, botnet: 0.3, malware: 0.3 },
  'slow performance': { cryptominer: 0.7, malware: 0.6, rootkit: 0.3 },
  'performance': { cryptominer: 0.5, malware: 0.5, rootkit: 0.3 },

  // Phishing-related malware
  'click': { phishing_malware: 0.6, trojan: 0.4 },
  'link': { phishing_malware: 0.65, trojan: 0.35 },
  'email': { phishing_malware: 0.7, trojan: 0.3 },
  'bank': { phishing_malware: 0.8, trojan: 0.5, keylogger: 0.4 },
  'credential': { phishing_malware: 0.75, keylogger: 0.6 },
  'banking': { phishing_malware: 0.8, keylogger: 0.5 },
  'fake website': { phishing_malware: 0.85 },

  // Account compromise
  'compromised': { account_compromise: 0.8, keylogger: 0.5 },
  'hacked': { account_compromise: 0.9, keylogger: 0.4 },
  'breached': { account_compromise: 0.85, trojan: 0.3 },
};

// Malware type descriptions
const MALWARE_DESCRIPTIONS = {
  ransomware: {
    name: 'Ransomware',
    description: 'Encrypts files and demands payment for decryption. Can cause complete system lockdown.',
    severity: 'critical',
    indicators: [
      'Encrypted files with unusual extensions',
      'Ransom notes displayed on screen',
      'Inability to access personal files',
      'System performance degradation',
      'Recent system modifications'
    ]
  },
  trojan: {
    name: 'Trojan',
    description: 'Disguised malicious software that appears legitimate but enables unauthorized access.',
    severity: 'high',
    indicators: [
      'Suspicious executable files',
      'Unexpected system behavior',
      'Unknown processes in task manager',
      'Unusual network connections',
      'System crashes or freezes'
    ]
  },
  spyware: {
    name: 'Spyware',
    description: 'Software that monitors user activities without consent, collecting sensitive information.',
    severity: 'high',
    indicators: [
      'Intrusive pop-ups',
      'Webcam or microphone activity',
      'Redirected searches',
      'Slower system performance',
      'Unexpected applications installed'
    ]
  },
  adware: {
    name: 'Adware',
    description: 'Displays unwanted advertisements and modifies browser settings for profit.',
    severity: 'medium',
    indicators: [
      'Excessive pop-up advertisements',
      'Changed homepage',
      'New browser toolbars',
      'Redirected search results',
      'Sponsored links in search results'
    ]
  },
  rootkit: {
    name: 'Rootkit',
    description: 'Deep-level malware that hides system components and evades detection software.',
    severity: 'critical',
    indicators: [
      'Antivirus cannot be enabled',
      'Disabled security tools',
      'Hidden files and processes',
      'System tools not working',
      'Firewall settings changed'
    ]
  },
  botnet: {
    name: 'Botnet',
    description: 'Turns computer into bot for coordinated attacks, often used for DDoS attacks.',
    severity: 'high',
    indicators: [
      'Unusual network traffic',
      'Network bandwidth depletion',
      'High outgoing connections',
      'Unknown network processes',
      'Slow internet connection'
    ]
  },
  cryptominer: {
    name: 'Cryptominer',
    description: 'Uses system resources to mine cryptocurrency without user knowledge.',
    severity: 'medium',
    indicators: [
      'High CPU usage at idle',
      'System overheating',
      'Reduced performance',
      'High electricity consumption',
      'Loud cooling fans'
    ]
  },
  rat: {
    name: 'Remote Access Trojan (RAT)',
    description: 'Grants attackers remote control over infected computer.',
    severity: 'critical',
    indicators: [
      'Webcam/microphone activity',
      'Unauthorized screen sharing',
      'File system access from remote',
      'Keyboard/mouse control issues',
      'Unexpected screen changes'
    ]
  },
  keylogger: {
    name: 'Keylogger',
    description: 'Records all keyboard inputs to steal passwords and sensitive information.',
    severity: 'high',
    indicators: [
      'Unexpected password changes',
      'Unauthorized account access',
      'Strange login locations',
      'Account activity you didn\'t perform',
      'Banking alerts for unauthorized transactions'
    ]
  },
  phishing_malware: {
    name: 'Phishing Malware',
    description: 'Combines phishing techniques with malware to steal credentials and install malicious software.',
    severity: 'high',
    indicators: [
      'Fake login pages',
      'Credential theft',
      'Malware installed from fake links',
      'Email spoofing',
      'Credential harvesting attempts'
    ]
  },
  account_compromise: {
    name: 'Account Compromise',
    description: 'Unauthorized access to user accounts through stolen credentials or security breaches.',
    severity: 'high',
    indicators: [
      'Password changes you didn\'t make',
      'Unusual login locations',
      'Account recovery requests',
      'Two-factor authentication alerts',
      'Email forwarding rules set'
    ]
  }
};

// Mitigation strategies by threat type
const MITIGATION_STRATEGIES = {
  ransomware: [
    { priority: 'critical', action: 'Disconnect from Network', details: 'Immediately disconnect infected device from network and internet to prevent spread.' },
    { priority: 'critical', action: 'Restore from Backup', details: 'Restore system from clean backup made before infection.' },
    { priority: 'critical', action: 'Full System Scan', details: 'Run comprehensive antivirus scan in safe mode.' },
    { priority: 'high', action: 'Enable System Recovery', details: 'Boot into recovery mode and restore system files.' },
    { priority: 'high', action: 'Check External Drives', details: 'Scan all connected external drives for infection.' }
  ],
  trojan: [
    { priority: 'critical', action: 'Boot in Safe Mode', details: 'Restart computer in safe mode to limit trojan execution.' },
    { priority: 'critical', action: 'Run Antivirus Scan', details: 'Execute full system antivirus scan to detect and remove.' },
    { priority: 'high', action: 'Remove Suspicious Programs', details: 'Uninstall any unfamiliar applications from Programs & Features.' },
    { priority: 'high', action: 'Reset Browser Settings', details: 'Clear browser cache, cookies, and reset default settings.' },
    { priority: 'medium', action: 'Change Passwords', details: 'Change all account passwords from a clean device.' }
  ],
  spyware: [
    { priority: 'high', action: 'Run Anti-Spyware Tool', details: 'Use dedicated anti-spyware software for thorough removal.' },
    { priority: 'high', action: 'Disable Suspicious Browser Extensions', details: 'Remove unknown extensions from browsers.' },
    { priority: 'high', action: 'Check Webcam Privacy', details: 'Review app permissions for camera/microphone access.' },
    { priority: 'medium', action: 'Clear Browser Data', details: 'Delete browsing history, cache, and temporary files.' },
    { priority: 'medium', action: 'Monitor Network Traffic', details: 'Use network monitoring tool to track unusual connections.' }
  ],
  adware: [
    { priority: 'high', action: 'Remove Suspicious Programs', details: 'Uninstall adware-related applications.' },
    { priority: 'high', action: 'Reset Browser Settings', details: 'Restore homepage and search engine to defaults.' },
    { priority: 'high', action: 'Disable Browser Extensions', details: 'Remove unfamiliar browser extensions.' },
    { priority: 'medium', action: 'Run Adware Removal Tool', details: 'Use specialized tool to scan and remove adware.' },
    { priority: 'low', action: 'Enable Ad Blocker', details: 'Install reputable ad blocker extension.' }
  ],
  rootkit: [
    { priority: 'critical', action: 'Offline Scan', details: 'Use offline antivirus to scan from boot media.' },
    { priority: 'critical', action: 'Full System Reinstall', details: 'Format drive and reinstall operating system cleanly.' },
    { priority: 'high', action: 'Recovery Partition Scan', details: 'Check and clean system recovery partition.' },
    { priority: 'high', action: 'BIOS/UEFI Check', details: 'Verify firmware hasn\'t been compromised.' },
    { priority: 'high', action: 'Secure Boot Enable', details: 'Enable Secure Boot in BIOS/UEFI if available.' }
  ],
  botnet: [
    { priority: 'critical', action: 'Isolate Network', details: 'Disconnect device from network and all devices immediately.' },
    { priority: 'critical', action: 'Full System Scan', details: 'Run comprehensive malware scan in safe mode.' },
    { priority: 'high', action: 'Check Firewall Rules', details: 'Review and reset firewall to default settings.' },
    { priority: 'high', action: 'Monitor Network Connections', details: 'Review established connections for suspicious activity.' },
    { priority: 'medium', action: 'Update Router Firmware', details: 'Check for and install latest router security updates.' }
  ],
  cryptominer: [
    { priority: 'high', action: 'Identify Mining Process', details: 'Find and kill suspicious process consuming high CPU.' },
    { priority: 'high', action: 'Run Antivirus Scan', details: 'Scan system to remove cryptomining malware.' },
    { priority: 'high', action: 'Remove Related Software', details: 'Uninstall programs that came with cryptominer.' },
    { priority: 'medium', action: 'Monitor CPU Usage', details: 'Watch Task Manager for unusual process activity.' },
    { priority: 'medium', action: 'Disable Auto-Start', details: 'Remove suspicious apps from startup programs.' }
  ],
  rat: [
    { priority: 'critical', action: 'Disconnect Immediately', details: 'Unplug network cable to stop remote control.' },
    { priority: 'critical', action: 'Full System Scan', details: 'Run antivirus in safe mode to detect RAT.' },
    { priority: 'high', action: 'Check Active Connections', details: 'Review network connections for remote control traffic.' },
    { priority: 'high', action: 'Change All Passwords', details: 'Change passwords from a clean, different device.' },
    { priority: 'high', action: 'Enable Firewall', details: 'Enable firewall and configure strict rules.' }
  ],
  keylogger: [
    { priority: 'critical', action: 'Scan for Keylogger', details: 'Run comprehensive antivirus scan to detect keylogger.' },
    { priority: 'critical', action: 'Change All Passwords', details: 'Change passwords immediately from a clean device.' },
    { priority: 'high', action: 'Enable Two-Factor Auth', details: 'Enable 2FA on all important accounts.' },
    { priority: 'high', action: 'Monitor Account Activity', details: 'Check login history and active sessions for accounts.' },
    { priority: 'medium', action: 'Use Virtual Keyboard', details: 'Use on-screen keyboard for sensitive inputs until fixed.' }
  ],
  phishing_malware: [
    { priority: 'critical', action: 'Full System Scan', details: 'Run antivirus scan to remove malware component.' },
    { priority: 'high', action: 'Change Stolen Passwords', details: 'Update credentials for all potentially compromised accounts.' },
    { priority: 'high', action: 'Monitor Accounts', details: 'Watch for unauthorized access to accounts.' },
    { priority: 'high', action: 'Place Account Holds', details: 'Contact banks/providers to freeze accounts if needed.' },
    { priority: 'medium', action: 'Report Phishing', details: 'Report phishing attempt to platform/provider.' }
  ],
  account_compromise: [
    { priority: 'critical', action: 'Change Master Password', details: 'Immediately change password for affected account.' },
    { priority: 'critical', action: 'Review Security Settings', details: 'Check and update security questions and recovery options.' },
    { priority: 'high', action: 'Review Login History', details: 'Check active sessions and remove unauthorized access.' },
    { priority: 'high', action: 'Enable Two-Factor Auth', details: 'Add 2FA to prevent future unauthorized access.' },
    { priority: 'high', action: 'Check Forwarding Rules', details: 'Verify no email forwarding rules were set by attacker.' }
  ]
};

/**
 * Extract symptoms from user input text
 */
export function extractSymptoms(userInput) {
  const lowerInput = userInput.toLowerCase();
  const symptoms = [];
  
  // Extract keywords/symptoms from weight mapping
  for (const keyword of Object.keys(SYMPTOM_MALWARE_WEIGHTS)) {
    if (lowerInput.includes(keyword)) {
      symptoms.push(keyword);
    }
  }
  
  // Remove duplicates
  return [...new Set(symptoms)];
}

/**
 * Calculate threat probabilities based on detected symptoms
 */
export function calculateThreatProbabilities(symptoms) {
  const threatScores = {};
  const threatCounts = {};

  // Initialize scores for all malware types
  for (const malwareType of Object.keys(MALWARE_DESCRIPTIONS)) {
    threatScores[malwareType] = 0;
    threatCounts[malwareType] = 0;
  }

  // Accumulate scores based on symptoms
  for (const symptom of symptoms) {
    const weights = SYMPTOM_MALWARE_WEIGHTS[symptom] || {};
    
    for (const [malwareType, weight] of Object.entries(weights)) {
      threatScores[malwareType] += weight;
      threatCounts[malwareType] += 1;
    }
  }

  // Convert to probabilities (average and scale to 0-100)
  const probabilities = {};
  
  for (const malwareType of Object.keys(threatScores)) {
    if (threatCounts[malwareType] > 0) {
      const average = threatScores[malwareType] / threatCounts[malwareType];
      // Apply symptoms count as multiplier (more symptoms = higher confidence)
      const boost = Math.min(threatCounts[malwareType] * 0.15, 0.5);
      probabilities[malwareType] = Math.round(Math.min((average + boost) * 100, 100));
    } else {
      probabilities[malwareType] = 0;
    }
  }

  return probabilities;
}

/**
 * Calculate overall risk level and percentage
 */
export function calculateOverallRisk(threats) {
  if (threats.length === 0) {
    return { level: 'low', percentage: 0 };
  }

  // Calculate weighted average based on severity
  let weightedScore = 0;
  const severityWeights = {
    critical: 1.0,
    high: 0.75,
    medium: 0.5,
    low: 0.25
  };

  for (const threat of threats) {
    const threatInfo = MALWARE_DESCRIPTIONS[threat.threat] || { severity: 'medium' };
    const weight = severityWeights[threatInfo.severity] || 0.5;
    weightedScore += (threat.probability / 100) * weight;
  }

  // Normalize to 0-100
  const percentage = Math.round((weightedScore / threats.length) * 100);

  let level = 'low';
  if (percentage >= 80) {
    level = 'critical';
  } else if (percentage >= 60) {
    level = 'high';
  } else if (percentage >= 40) {
    level = 'medium';
  }

  return { level, percentage };
}

/**
 * Generate contextual mitigation strategies based on specific threats and user symptoms
 */
function generateContextualStrategies(symptoms, threats, userInput) {
  const contextualStrategies = [];
  const lowerInput = userInput.toLowerCase();
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  // For EACH threat (not just top 3), generate specific strategies
  for (let i = 0; i < threats.length; i++) {
    const threat = threats[i];
    const threatType = threat.threat_type;
    const threatName = threat.threat;
    
    // Start with base strategies for this threat type
    const baseStrategies = MITIGATION_STRATEGIES[threatType] || [];

    // Generate contextual strategies based on detected symptoms
    const additionalStrategies = [];

    // Ransomware-specific strategies
    if (threatType === 'ransomware' && lowerInput.includes('encrypt')) {
      additionalStrategies.push({
        priority: 'critical',
        action: 'Check File Encryption Status',
        details: `Since you mentioned file encryption issues, verify which files are encrypted. Check for unusual file extensions like .locked, .encrypted, or random strings. List encrypted files to determine ransom scope.`,
      });
      additionalStrategies.push({
        priority: 'high',
        action: 'Locate Ransom Note',
        details: `Search for ransom note files (usually named DECRYPT_ME.txt, HELPME.txt, etc.) on desktop and document folders to understand attacker demands and contact information.`,
      });
    }

    // Spyware/Keylogger specifics
    if ((threatType === 'spyware' || threatType === 'keylogger') && 
        (lowerInput.includes('slow') || lowerInput.includes('lag') || lowerInput.includes('freeze'))) {
      additionalStrategies.push({
        priority: 'high',
        action: 'Monitor CPU/Memory Usage',
        details: `Your system is experiencing performance issues. Open Task Manager, go to Performance tab, and identify processes consuming high CPU/memory. Look for unknown processes using unusual resources.`,
      });
    }

    if ((threatType === 'keylogger' || threatType === 'rat') && 
        (lowerInput.includes('password') || lowerInput.includes('account') || lowerInput.includes('login'))) {
      additionalStrategies.push({
        priority: 'critical',
        action: 'Secure Password Reset',
        details: `Given potential keylogger or RAT, immediately change ALL passwords from a different clean device. Use unique, complex passwords (16+ characters with mixed case, numbers, symbols). Enable 2FA on all critical accounts.`,
      });
      additionalStrategies.push({
        priority: 'high',
        action: 'Monitor Account Activity',
        details: `Check recent login history on email, banking, and social media accounts. Look for unfamiliar login locations, devices, or times. Revoke old sessions and enable suspicious login alerts.`,
      });
    }

    // Network/Botnet specifics
    if (threatType === 'botnet' && (lowerInput.includes('network') || lowerInput.includes('connection'))) {
      additionalStrategies.push({
        priority: 'critical',
        action: 'Analyze Network Connections',
        details: `Check active network connections using 'netstat -an' (Windows) or 'ss -an' (Linux). Identify and block suspicious IP addresses and ports. Look for connections to known botnet C&C servers.`,
      });
    }

    // Browser/Adware specifics
    if ((threatType === 'adware' || threatType === 'trojan') && 
        (lowerInput.includes('popup') || lowerInput.includes('ads') || lowerInput.includes('redirect') || lowerInput.includes('homepage'))) {
      additionalStrategies.push({
        priority: 'high',
        action: 'Reset Browser Completely',
        details: `Since you're experiencing ads/popups/redirects: Reset browser to defaults, clear all cache/cookies/history, remove all extensions, and check startup pages. Reset homepage and search engine settings.`,
      });
      additionalStrategies.push({
        priority: 'high',
        action: 'Check Hosts File',
        details: `Malware may have modified your hosts file to redirect domains. Check C:\\Windows\\System32\\drivers\\etc\\hosts (Windows) for unusual entries. Remove any suspicious domain redirections.`,
      });
    }

    // Combine base and contextual strategies
    const allStrategies = [...baseStrategies, ...additionalStrategies];
    
    // Deduplicate
    const uniqueStrategies = new Map();
    for (const strategy of allStrategies) {
      if (!uniqueStrategies.has(strategy.action)) {
        uniqueStrategies.set(strategy.action, strategy);
      }
    }

    // Add threat-specific context to each strategy
    for (const [action, strategy] of uniqueStrategies) {
      contextualStrategies.push({
        action: strategy.action,
        priority: strategy.priority,
        details: `[To protect against ${threatName}] ${strategy.details}`,
        threat_context: threatName
      });
    }
  }

  // Deduplicate across all threats and prioritize
  const finalStrategies = new Map();
  for (const strategy of contextualStrategies) {
    const existing = finalStrategies.get(strategy.action);
    if (!existing || priorityOrder[strategy.priority] < priorityOrder[existing.priority]) {
      finalStrategies.set(strategy.action, strategy);
    }
  }

  // Convert to numbered steps (keep all relevant recommendations, don't limit)
  const sortedStrategies = Array.from(finalStrategies.values()).sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return sortedStrategies.map((strategy, idx) => ({
    step: idx + 1,
    action: strategy.action,
    priority: strategy.priority,
    details: strategy.details
  }));
}

/**
 * Generate detailed threat analysis
 */
export function analyzeThreatProfile(symptoms, userInput = '') {
  // Extract and deduplicate symptoms
  const detectedSymptoms = [...new Set(symptoms)];

  // Calculate threat probabilities
  const probabilities = calculateThreatProbabilities(detectedSymptoms);

  // Filter threats with probability > 0 and create threat objects (show ALL threats)
  const threats = Object.entries(probabilities)
    .filter(([_, prob]) => prob > 0)
    .map(([threatType, probability]) => {
      const threatInfo = MALWARE_DESCRIPTIONS[threatType];
      if (!threatInfo) {
        console.warn(`Warning: No description found for threat type: ${threatType}`);
        return null;
      }
      return {
        threat: threatInfo.name,
        threat_type: threatType,
        probability,
        severity: threatInfo.severity,
        description: threatInfo.description,
        indicators: threatInfo.indicators
      };
    })
    .filter(t => t !== null)
    .sort((a, b) => b.probability - a.probability); // Sort by probability, show all detected threats

  // Calculate overall risk
  const { level: riskLevel, percentage: riskPercentage } = calculateOverallRisk(threats);

  // Generate explanation
  const topThreat = threats[0];
  const threatCount = threats.length;
  let explanation = '';

  if (threatCount === 0) {
    explanation = `LOW RISK: No specific threats detected based on your description. Continue monitoring system performance and keep security software updated.`;
  } else if (riskPercentage >= 80) {
    explanation = `CRITICAL RISK: Your system exhibits ${threatCount} potential threats with ${topThreat.threat} being the most likely (${topThreat.probability}% probability). Immediate action required.`;
  } else if (riskPercentage >= 60) {
    explanation = `HIGH RISK: Detected ${threatCount} probable threats. ${topThreat.threat} is the primary concern at ${topThreat.probability}% likelihood. Take action today.`;
  } else if (riskPercentage >= 40) {
    explanation = `MEDIUM RISK: ${threatCount} potential threats detected. ${topThreat.threat} has ${topThreat.probability}% probability. Recommended actions should be taken.`;
  } else {
    explanation = `LOW RISK: Minor threat indicators detected. Continue monitoring system performance and keep security software updated.`;
  }

  // Generate contextual mitigation strategies based on threats and user input
  const mitigationStrategies = generateContextualStrategies(detectedSymptoms, threats, userInput);

  return {
    detected_symptoms: detectedSymptoms,
    threats: threats.map(t => ({
      threat: t.threat,
      probability: t.probability,
      severity: t.severity,
      description: t.description,
      indicators: t.indicators
    })),
    overall_risk_level: riskLevel,
    risk_percentage: riskPercentage,
    explanation,
    mitigation_strategies: mitigationStrategies,
    timestamp: new Date().toISOString()
  };
}
