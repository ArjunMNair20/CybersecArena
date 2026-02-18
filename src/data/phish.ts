export type PhishEmail = {
  id: string;
  from: string;
  subject: string;
  body: string;
  isPhish: boolean;
  hint: string;
  industry?: 'banking' | 'healthcare' | 'tech' | 'retail' | 'government' | 'social-media' | 'general';
  seasonalCampaign?: 'holiday' | 'tax-season' | 'back-to-school' | 'general' | 'black-friday';
  redFlagExplanations?: {
    indicatorId: string;
    explanation: string;
  }[];
  expertTip?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
};

export const PHISH_EMAILS: PhishEmail[] = [
  {
    id: 'p1',
    from: 'IT Support <it-support@micr0soft.com>',
    subject: 'URGENT: Password Expiring',
    body: 'Your password expires today. Click this link to renew: http://micr0soft-reset.com',
    isPhish: true,
    hint: 'Misspelled domain (micr0soft instead of microsoft) and urgency are red flags.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    redFlagExplanations: [
      { indicatorId: 'urgent', explanation: 'Creating artificial urgency is a classic phishing tactic to pressure you into clicking without thinking.' },
      { indicatorId: 'domain', explanation: 'The domain uses "0" (zero) instead of "o" - typosquatting technique to impersonate Microsoft.' },
      { indicatorId: 'http', explanation: 'Legitimate password reset should NEVER use HTTP - always HTTP**S** for sensitive data.' }
    ],
    expertTip: '💡 Expert Tip: Companies never ask you to reset passwords via email links. Always go directly to their official website by typing the URL yourself.'
  },
  {
    id: 'p2',
    from: 'HR <hr@company.com>',
    subject: 'Updated Employee Handbook',
    body: 'Please review the updated policies by Friday. Document attached via company SharePoint.',
    isPhish: false,
    hint: 'Legitimate internal sender and known process.',
    industry: 'general',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    expertTip: '💡 Expert Tip: Internal company emails from known departments using proper company domains are typically safe.'
  },
  {
    id: 'p3',
    from: 'Security Team <security@company.com>',
    subject: 'Multi-Factor Authentication Required',
    body: 'Enroll in MFA using this official portal: https://secure.company.com/mfa',
    isPhish: false,
    hint: 'HTTPS, correct internal domain, and standard policy.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    expertTip: '💡 Expert Tip: HTTPS in the URL and matching internal domain are signs of legitimacy.'
  },
  {
    id: 'p4',
    from: 'Payments <billing@streamflix.com>',
    subject: 'Payment Failed - Update Now',
    body: 'We could not process your payment. Update card here: http://stream-flix-bill.com',
    isPhish: true,
    hint: 'Non-HTTPS and domain not matching brand.',
    industry: 'retail',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    redFlagExplanations: [
      { indicatorId: 'http', explanation: 'Payment updates should NEVER be via HTTP - legitimate companies always use HTTPS for financial transactions.' },
      { indicatorId: 'domain', explanation: 'Domain "stream-flix-bill.com" doesn\'t match Netflix\'s actual domain - attacker trying to impersonate.' }
    ],
    expertTip: '💡 Expert Tip: Payment companies never send clickable links for payment updates. Always go to the official app/website directly.'
  },
  {
    id: 'p5',
    from: 'Amazon Security <noreply@amaz0n-security.com>',
    subject: '⚠️ Suspicious Activity Detected on Your Account',
    body: 'We detected unusual login activity from a new device. Verify your account immediately: https://amaz0n-security-verify.com/account?token=xyz123',
    isPhish: true,
    hint: 'Domain has "0" instead of "o" (amaz0n vs amazon) - classic typosquatting.',
    industry: 'retail',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'Typosquatting: Using "amaz0n" (zero) instead of "amazon" (letter o) is a common phishing technique.' },
      { indicatorId: 'urgent', explanation: 'Urgency about suspicious activity is designed to scare users into immediate action without verification.' }
    ],
    expertTip: '💡 Expert Tip: Legitimate companies use hyphens sparingly in domains. Always verify the exact domain letter-by-letter.'
  },
  {
    id: 'p6',
    from: 'Banking Services <alerts@yourbank.com>',
    subject: 'Account Statement Available',
    body: 'Your monthly statement is ready. Log in to your account at https://secure.yourbank.com/statements to view it.',
    isPhish: false,
    hint: 'Proper HTTPS domain, standard banking communication, no urgency.',
    industry: 'banking',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    expertTip: '💡 Expert Tip: Legitimate banking emails use HTTPS, proper company domains, and avoid artificial urgency.'
  },
  {
    id: 'p7',
    from: 'PayPal <service@paypal-security.net>',
    subject: 'Your Account Will Be Suspended in 24 Hours',
    body: 'URGENT ACTION REQUIRED! Your account has been flagged. Click here to verify: http://paypal-security.net/verify-now',
    isPhish: true,
    hint: 'Wrong domain (.net instead of .com), HTTP not HTTPS, extreme urgency.',
    industry: 'retail',
    seasonalCampaign: 'black-friday',
    difficulty: 'easy',
    redFlagExplanations: [
      { indicatorId: 'urgent', explanation: 'Suspension threats within 24 hours are designed to bypass your critical thinking - phishing 101.' },
      { indicatorId: 'domain', explanation: 'PayPal uses .com, not .net. This is a red flag that the sender isn\'t PayPal.' },
      { indicatorId: 'http', explanation: 'Account verification should NEVER happen via HTTP - only HTTPS is secure enough.' }
    ],
    expertTip: '💡 Expert Tip: Real account suspensions come through your account dashboard, not via email with links.'
  },
  {
    id: 'p8',
    from: 'LinkedIn <notifications@linkedin.com>',
    subject: 'You have 3 new connection requests',
    body: 'View your pending connection requests: https://www.linkedin.com/feed/',
    isPhish: false,
    hint: 'Correct LinkedIn domain, standard notification format.',
    industry: 'social-media',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    expertTip: '💡 Expert Tip: LinkedIn emails from linkedin.com with HTTPS links are typically legitimate.'
  },
  {
    id: 'p9',
    from: 'Apple Support <support@app1e.com>',
    subject: 'iCloud Storage Full - Upgrade Required',
    body: 'Your iCloud storage is full. Upgrade now to avoid data loss: http://app1e.com/icloud-upgrade',
    isPhish: true,
    hint: 'Domain uses "1" instead of "l" (app1e vs apple) - character substitution attack.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'medium',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'Character substitution: "1" (one) replacing "l" (lowercase L) - very subtle but it\'s not apple.com.' },
      { indicatorId: 'http', explanation: 'Apple always uses HTTPS for account-related communications, never HTTP.' },
      { indicatorId: 'urgent', explanation: 'Data loss threats create fear-based urgency to bypass security thinking.' }
    ],
    expertTip: '💡 Expert Tip: Apple ID upgrades should always happen through the official Apple app or website, never via email links.'
  },
  {
    id: 'p10',
    from: 'FedEx <tracking@fedex.com>',
    subject: 'Package Delivery Notification',
    body: 'Your package #123456789 is out for delivery. Track it here: https://www.fedex.com/tracking',
    isPhish: false,
    hint: 'Official FedEx domain, standard tracking notification.',
    industry: 'retail',
    seasonalCampaign: 'holiday',
    difficulty: 'easy',
    expertTip: '💡 Expert Tip: Correct domain (fedex.com), HTTPS, and standard tracking notification format = legitimate.'
  },
  {
    id: 'p11',
    from: 'IRS Tax Department <irs@irs-gov.com>',
    subject: 'Tax Refund Available - Claim Now',
    body: 'You are eligible for a $1,247 tax refund. Claim immediately: http://irs-gov.com/refund-claim',
    isPhish: true,
    hint: 'IRS never emails about refunds, wrong domain format, HTTP not HTTPS.',
    industry: 'government',
    seasonalCampaign: 'tax-season',
    difficulty: 'medium',
    redFlagExplanations: [
      { indicatorId: 'urgent', explanation: 'IRS never initiates contact about refunds - they wait for you to file. This is a major red flag.' },
      { indicatorId: 'domain', explanation: 'The IRS website is irs.gov, not irs-gov.com. Hyphens in government domains are suspicious.' },
      { indicatorId: 'request', explanation: 'Asking you to claim a refund immediately is designed to bypass verification.' },
      { indicatorId: 'http', explanation: 'Government financial services should ALWAYS use HTTPS.' }
    ],
    expertTip: '💡 Expert Tip: The IRS NEVER initiates contact about tax refunds via email. If you expect a refund, check your account directly at irs.gov.'
  },
  {
    id: 'p12',
    from: 'Netflix <billing@netflix.com>',
    subject: 'Payment Method Update Required',
    body: 'We couldn\'t charge your card. Update your payment method: https://www.netflix.com/YourAccount',
    isPhish: false,
    hint: 'Correct Netflix domain, standard account management link.',
    industry: 'retail',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    expertTip: '💡 Expert Tip: Official Netflix domain (.com), HTTPS, and standard account management requests are typically safe.'
  },
  {
    id: 'p13',
    from: 'Microsoft Security <security@microsoft-verify.com>',
    subject: 'Account Compromised - Immediate Action Required',
    body: 'We detected unauthorized access. Secure your account now: http://microsoft-verify.com/secure-account?user=you',
    isPhish: true,
    hint: 'Wrong domain (microsoft-verify.com vs microsoft.com), HTTP not HTTPS.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'medium',
    redFlagExplanations: [
      { indicatorId: 'urgent', explanation: 'Account compromise notifications use fear to trigger hasty action.' },
      { indicatorId: 'domain', explanation: 'microsoft-verify.com is not Microsoft\'s domain - the subdomain "verify" is a giveaway.' },
      { indicatorId: 'http', explanation: 'Account security should be over HTTPS only, never HTTP.' }
    ],
    expertTip: '💡 Expert Tip: Microsoft never sends clickable links for account security. Always go to account.microsoft.com directly.'
  },
  {
    id: 'p14',
    from: 'GitHub <noreply@github.com>',
    subject: 'New login from Chrome on Windows',
    body: 'We noticed a new sign-in to your GitHub account. If this was you, no action needed. If not, secure your account: https://github.com/settings/security',
    isPhish: false,
    hint: 'Official GitHub domain, standard security notification format.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    expertTip: '💡 Expert Tip: GitHub provides context about the login (device, browser) and uses their official domain with HTTPS.'
  },
  {
    id: 'p15',
    from: 'eBay <messages@ebay.com>',
    subject: 'Your item sold! Payment received',
    body: 'Congratulations! Your item has been sold. View details: https://www.ebay.com/mys/ebay',
    isPhish: false,
    hint: 'Official eBay domain, standard seller notification.',
    industry: 'retail',
    seasonalCampaign: 'black-friday',
    difficulty: 'easy',
    expertTip: '💡 Expert Tip: Official eBay domain with HTTPS and standard transaction notifications are safe.'
  },
  {
    id: 'p16',
    from: 'Wells Fargo <alerts@wellsfargo-security.com>',
    subject: '🔒 Security Alert: Unusual Transaction Detected',
    body: 'A transaction of $2,847.50 was attempted. Confirm if this was you: http://wellsfargo-security.com/verify-transaction',
    isPhish: true,
    hint: 'Wrong domain (wellsfargo-security.com vs wellsfargo.com), HTTP not HTTPS.',
    industry: 'banking',
    seasonalCampaign: 'general',
    difficulty: 'medium',
    redFlagExplanations: [
      { indicatorId: 'urgent', explanation: 'High-value transaction alerts are designed to get you to click quickly.' },
      { indicatorId: 'domain', explanation: 'Banks use simple domains like wellsfargo.com, not wellsfargo-security.com.' },
      { indicatorId: 'http', explanation: 'Banks NEVER use HTTP for financial information - always HTTPS.' }
    ],
    expertTip: '💡 Expert Tip: Banks never ask you to verify transactions via email. Call your bank directly using the number on your card.'
  },
  {
    id: 'p17',
    from: 'Dropbox <notifications@dropbox.com>',
    subject: 'Shared folder invitation',
    body: 'You\'ve been invited to collaborate on a shared folder. Accept invitation: https://www.dropbox.com/shared',
    isPhish: false,
    hint: 'Official Dropbox domain, standard sharing notification.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    expertTip: '💡 Expert Tip: Dropbox emails from dropbox.com with HTTPS are typically legitimate sharing invitations.'
  },
  {
    id: 'p18',
    from: 'Facebook Security <security@facebook.com>',
    subject: 'New login from unknown device',
    body: 'We noticed a new login. If this wasn\'t you, secure your account: https://www.facebook.com/security',
    isPhish: false,
    hint: 'Official Facebook domain, standard security notification.',
    industry: 'social-media',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    expertTip: '💡 Expert Tip: Facebook notifications from facebook.com with HTTPS and device details are typically legitimate.'
  },
  {
    id: 'p19',
    from: 'DHL Express <tracking@dhl-express.net>',
    subject: 'Package Delivery Failed - Action Required',
    body: 'Your package couldn\'t be delivered. Reschedule delivery: http://dhl-express.net/reschedule?track=ABC123',
    isPhish: true,
    hint: 'Wrong domain (.net instead of .com), HTTP not HTTPS, suspicious tracking link.',
    industry: 'retail',
    seasonalCampaign: 'holiday',
    difficulty: 'medium',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'DHL uses .com, not .net. Unusual domain extensions are red flags.' },
      { indicatorId: 'http', explanation: 'Shipment tracking should use HTTPS for security.' },
      { indicatorId: 'urgent', explanation: 'Failed delivery creates urgency to click the rescheduling link.' }
    ],
    expertTip: '💡 Expert Tip: Always track packages by going directly to the carrier\'s official website, never by clicking email links.'
  },
  {
    id: 'p20',
    from: 'Google <no-reply@accounts.google.com>',
    subject: 'Security alert: New sign-in',
    body: 'A new sign-in was detected on your Google account. Review activity: https://myaccount.google.com/security',
    isPhish: false,
    hint: 'Official Google domain, standard security alert format.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    expertTip: '💡 Expert Tip: Google alerts from accounts.google.com with detailed sign-in information are typically legitimate.'
  },
  {
    id: 'p21',
    from: 'Chase Bank <alerts@chase-bank.com>',
    subject: '⚠️ CRITICAL: Account Locked Due to Suspicious Activity',
    body: 'Your account has been temporarily locked. Unlock immediately: http://chase-bank.com/unlock-account?ref=urgent',
    isPhish: true,
    hint: 'Wrong domain format (chase-bank.com vs chase.com), HTTP not HTTPS, extreme urgency.',
    industry: 'banking',
    seasonalCampaign: 'general',
    difficulty: 'hard',
    redFlagExplanations: [
      { indicatorId: 'urgent', explanation: 'Account lockout notifications with immediate action requirements are classic phishing fear tactics.' },
      { indicatorId: 'domain', explanation: 'Chase uses chase.com, not chase-bank.com. Hyphens in bank domains are suspicious.' },
      { indicatorId: 'http', explanation: 'Bank account access should NEVER be via HTTP - always HTTPS only.' },
      { indicatorId: 'request', explanation: 'Banks never ask you to unlock accounts via email links - they guide you through the app.' }
    ],
    expertTip: '💡 Expert Tip: If your bank account is locked, use your banking app or call the number on your card. Don\'t click email links.'
  },
  {
    id: 'p22',
    from: 'Spotify <hello@spotify.com>',
    subject: 'Your Premium subscription is ending',
    body: 'Your Premium subscription expires in 3 days. Renew to keep listening: https://www.spotify.com/premium',
    isPhish: false,
    hint: 'Official Spotify domain, standard subscription reminder.',
    industry: 'retail',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    expertTip: '💡 Expert Tip: Spotify renewal notifications from spotify.com with HTTPS are typically legitimate.'
  },
  {
    id: 'p23',
    from: 'USPS <tracking@usps-gov.com>',
    subject: 'Package Delivery Attempt Failed',
    body: 'We attempted delivery but no one was available. Reschedule: http://usps-gov.com/reschedule-delivery',
    isPhish: true,
    hint: 'Wrong domain (usps-gov.com vs usps.com), HTTP not HTTPS, suspicious format.',
    industry: 'government',
    seasonalCampaign: 'holiday',
    difficulty: 'medium',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'USPS uses usps.com, not usps-gov.com. Government doesn\'t typically use hyphens that way.' },
      { indicatorId: 'http', explanation: 'Postal tracking should use HTTPS, not HTTP.' },
      { indicatorId: 'urgent', explanation: 'Failed delivery creates pressure to rescheduling without verification.' }
    ],
    expertTip: '💡 Expert Tip: Track USPS packages at usps.com directly - never click delivery notification links in emails.'
  },
  {
    id: 'p24',
    from: 'Twitter <info@twitter.com>',
    subject: 'Your account verification is pending',
    body: 'Complete your account verification to unlock all features: https://twitter.com/i/flow/verify',
    isPhish: false,
    hint: 'Official Twitter domain, standard verification process.',
    industry: 'social-media',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    expertTip: '💡 Expert Tip: Twitter verification from twitter.com with HTTPS and proper URL structure are typically legitimate.'
  },
  {
    id: 'p25',
    from: 'Mayo Clinic <security@mayo-clinic-security.com>',
    subject: '🏥 Update Your Healthcare Information',
    body: 'We need to update your patient records. Verify your information: http://mayo-clinic-security.com/patient-portal',
    isPhish: true,
    hint: 'Wrong domain for Mayo Clinic, HTTP not HTTPS, healthcare information request.',
    industry: 'healthcare',
    seasonalCampaign: 'general',
    difficulty: 'hard',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'Mayo Clinic does not use "mayo-clinic-security.com" - their domain is mayoclinic.org.' },
      { indicatorId: 'http', explanation: 'Healthcare information must ALWAYS be over HTTPS - never HTTP.' },
      { indicatorId: 'request', explanation: 'Hospitals never ask for sensitive health information via email links.' }
    ],
    expertTip: '💡 Expert Tip: Healthcare providers never ask for sensitive information via email. Always call or log in through their official app/website.'
  },
  {
    id: 'p26',
    from: 'Blue Cross Blue Shield <benefits@bcbs-verify.com>',
    subject: '⚠️ Insurance Claim Pending - Action Required',
    body: 'Your claim needs verification. Confirm your information: http://bcbs-verify.com/claim-verify',
    isPhish: true,
    hint: 'Suspicious domain, HTTP not HTTPS, healthcare/financial hybrid.',
    industry: 'healthcare',
    seasonalCampaign: 'general',
    difficulty: 'hard',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'Insurance companies use official domains like bcbs.com, not bcbs-verify.com.' },
      { indicatorId: 'http', explanation: 'Insurance information should NEVER be over HTTP - always HTTPS.' },
      { indicatorId: 'urgent', explanation: 'Claim verification urgency is designed to bypass verification thinking.' }
    ],
    expertTip: '💡 Expert Tip: Insurance claims should be managed through your insurance app or by calling the number on your insurance card.'
  },
  {
    id: 'p27',
    from: 'LinkedIn Security <security@linkedin-security.com>',
    subject: 'Suspicious login attempt detected',
    body: 'Someone tried to access your LinkedIn account from China. Secure now: http://linkedin-security.com/verify-account',
    isPhish: true,
    hint: 'Wrong domain (linkedin-security.com), HTTP not HTTPS, geographic scare tactic.',
    industry: 'social-media',
    seasonalCampaign: 'general',
    difficulty: 'medium',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'LinkedIn uses linkedin.com, not linkedin-security.com. Be wary of compound domains.' },
      { indicatorId: 'http', explanation: 'LinkedIn security alerts always use HTTPS at linkedin.com, never HTTP.' },
      { indicatorId: 'urgent', explanation: 'Geographic location threats create urgency to click without thinking.' }
    ],
    expertTip: '💡 Expert Tip: LinkedIn will never ask you to verify through email links. Log in through your browser directly at linkedin.com.'
  },
  {
    id: 'p28',
    from: 'Apple ID Support <support@apple-id-verify.com>',
    subject: 'Your Apple ID will be disabled in 24 hours',
    body: 'Unusual activity detected. Verify your identity to keep your account active: http://apple-id-verify.com/security',
    isPhish: true,
    hint: 'Wrong domain, HTTP, account disable threat, time pressure.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'hard',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'Apple ID verification happens at appleid.apple.com, not apple-id-verify.com.' },
      { indicatorId: 'http', explanation: 'Apple security always uses HTTPS on official Apple domains.' },
      { indicatorId: 'urgent', explanation: '24-hour deadline is a scare tactic to bypass rational decision-making.' }
    ],
    expertTip: '💡 Expert Tip: Apple will never ask you to verify Apple ID through email. Go to Settings > [Your Name] directly on your device.'
  },
  {
    id: 'p29',
    from: 'Slack Workspace <alerts@slack-workspace-verify.com>',
    subject: 'Action Required: Verify Workspace Identity',
    body: 'Your workspace requires identity verification. Click here: https://slack-workspace-verify.com/verify-workspace',
    isPhish: true,
    hint: 'Suspicious domain with extra words, creates false urgency.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'medium',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'Slack uses slack.com and workspace-specific domains, not slack-workspace-verify.com.' },
      { indicatorId: 'urgent', explanation: 'Workspace verification urgency is a common Slack phishing tactic.' }
    ],
    expertTip: '💡 Expert Tip: Slack verification always happens within the Slack app itself, never via external links in emails.'
  },
  {
    id: 'p30',
    from: 'Coinbase Security <security@coinbase-alert.com>',
    subject: '⚠️ URGENT: Verify Your Wallet Address Now',
    body: 'Your cryptocurrency funds are at risk. Verify wallet: http://coinbase-alert.com/wallet-verify?token=xyz',
    isPhish: true,
    hint: 'Cryptocurrency phishing, urgent wallet threat, wrong domain.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'hard',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'Coinbase uses coinbase.com, not coinbase-alert.com. Never verify crypto wallets via email.' },
      { indicatorId: 'http', explanation: 'Cryptocurrency platforms must ALWAYS use HTTPS for security.' },
      { indicatorId: 'urgent', explanation: 'Wallet security threats are designed to panick users into clicking.' }
    ],
    expertTip: '💡 Expert Tip: NEVER verify cryptocurrency wallets or seed phrases via email. This is 100% guaranteed to be a phishing attempt.'
  },
  {
    id: 'p31',
    from: 'United Airlines <reservations@united-airlines-secure.com>',
    subject: 'Flight Status Update Required',
    body: 'Your upcoming flight requires additional information. Verify here: http://united-airlines-secure.com/flight-check',
    isPhish: true,
    hint: 'Airline phishing, wrong domain, HTTP instead of HTTPS.',
    industry: 'retail',
    seasonalCampaign: 'holiday',
    difficulty: 'medium',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'United uses united.com, not united-airlines-secure.com.' },
      { indicatorId: 'http', explanation: 'Airlines use HTTPS for all passenger information.' },
      { indicatorId: 'urgent', explanation: 'Flight status urgency pressures quick action.' }
    ],
    expertTip: '💡 Expert Tip: Check flight status at the airline\'s official website directly or through your booking confirmation email.'
  },
  {
    id: 'p32',
    from: 'PayPal Account <accountservices@paypal-secure.com>',
    subject: 'Your account will be limited in 48 hours',
    body: 'Unusual activity requires verification. Confirm payment method: http://paypal-secure.com/account-confirm',
    isPhish: true,
    hint: 'PayPal phishing, wrong domain, account limitation threat.',
    industry: 'banking',
    seasonalCampaign: 'general',
    difficulty: 'hard',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'PayPal uses paypal.com, not paypal-secure.com.' },
      { indicatorId: 'http', explanation: 'PayPal always uses HTTPS for account access.' },
      { indicatorId: 'urgent', explanation: '48-hour limitation threat is a classic phishing fear tactic.' }
    ],
    expertTip: '💡 Expert Tip: PayPal will NEVER ask you to verify payment methods via email. Always log in at paypal.com directly.'
  },
  {
    id: 'p33',
    from: 'Google Drive Support <noreply@drive-support-google.com>',
    subject: 'Your Google Drive storage is full',
    body: 'Upgrade your storage plan to continue using Drive: https://drive-support-google.com/storage-upgrade',
    isPhish: true,
    hint: 'Wrong domain order, Google Drive phishing, storage pressure.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'medium',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'Google Drive uses drive.google.com or google.com, not drive-support-google.com.' },
      { indicatorId: 'urgent', explanation: 'Storage full warning creates pressure to upgrade immediately.' }
    ],
    expertTip: '💡 Expert Tip: Google Drive storage notifications come from google.com domains. Upgrade through your Google One dashboard directly.'
  },
  {
    id: 'p34',
    from: 'Microsoft 365 <security-alert@microsoft365-verify.com>',
    subject: 'Your Microsoft 365 subscription needs renewal',
    body: 'Renew your subscription to avoid losing access: http://microsoft365-verify.com/renew-subscription',
    isPhish: true,
    hint: 'Microsoft phishing, wrong domain, subscription renewal pressure.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'medium',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'Microsoft uses microsoft.com or outlook.com, not microsoft365-verify.com.' },
      { indicatorId: 'http', explanation: 'Microsoft always uses HTTPS for account management.' },
      { indicatorId: 'urgent', explanation: 'Subscription expiration creates pressure to renew quickly.' }
    ],
    expertTip: '💡 Expert Tip: Manage Microsoft 365 subscriptions at account.microsoft.com directly, never through email links.'
  },
  {
    id: 'p35',
    from: 'Canva Design <support@canva-studio.com>',
    subject: 'Your Canva Pro trial is expiring tomorrow',
    body: 'Upgrade to Pro before your trial ends: https://canva-studio.com/upgrade-pro?ref=trial',
    isPhish: true,
    hint: 'Design software phishing, trial expiration urgency, slightly suspicious domain.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'Canva uses canva.com, not canva-studio.com.' },
      { indicatorId: 'urgent', explanation: 'Trial expiration creates artificial urgency.' }
    ],
    expertTip: '💡 Expert Tip: Canva trial upgrades happen in your Canva dashboard, not via email links.'
  },
  {
    id: 'p36',
    from: 'GitHub Account Support <support@github-security.com>',
    subject: 'Suspicious authentication attempt on your GitHub account',
    body: 'Someone tried to access your account. Secure it now: http://github-security.com/secure-account',
    isPhish: true,
    hint: 'GitHub phishing, wrong domain, suspicious login threat.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'medium',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'GitHub uses github.com, not github-security.com.' },
      { indicatorId: 'http', explanation: 'GitHub uses HTTPS for all security-related actions.' },
      { indicatorId: 'urgent', explanation: 'Suspicious authentication attempts create urgency to act.' }
    ],
    expertTip: '💡 Expert Tip: GitHub security alerts direct you to github.com settings. Never click authentication links in emails.'
  },
  {
    id: 'p37',
    from: 'Bank of America <alerts@bofa-secure.com>',
    subject: 'Verify Account to Prevent Temporary Freeze',
    body: 'Your account requires immediate verification. Confirm details: http://bofa-secure.com/account-verify',
    isPhish: true,
    hint: 'Banking phishing, wrong domain abbreviation, account freeze threat.',
    industry: 'banking',
    seasonalCampaign: 'general',
    difficulty: 'hard',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'Bank of America uses bankofamerica.com or accounts.bankofamerica.com, not bofa-secure.com.' },
      { indicatorId: 'http', explanation: 'Banking platforms always require HTTPS encryption.' },
      { indicatorId: 'request', explanation: 'Banks never ask you to verify account information via email.' }
    ],
    expertTip: '💡 Expert Tip: Bank of America account verification happens in your secure banking portal or through their official app, never email links.'
  },
  {
    id: 'p38',
    from: 'Adobe Cloud <subscriptions@adobe-cloud-verify.com>',
    subject: 'Your Adobe subscription is suspended',
    body: 'Payment failed. Restore access: https://adobe-cloud-verify.com/restore-access',
    isPhish: true,
    hint: 'Adobe phishing, subscription suspension, wrong domain.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'medium',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'Adobe uses adobe.com, not adobe-cloud-verify.com.' },
      { indicatorId: 'urgent', explanation: 'Subscription suspension creates urgency to restore immediately.' }
    ],
    expertTip: '💡 Expert Tip: Adobe subscription management happens at account.adobe.com directly, never external verification links.'
  },
  {
    id: 'p39',
    from: 'Steam Account Support <no-reply@steam-verify-account.com>',
    subject: '⚠️ Payment issue on your Steam account',
    body: 'Your recent purchase failed. Update payment: http://steam-verify-account.com/update-payment',
    isPhish: true,
    hint: 'Gaming platform phishing, payment failure scare, wrong domain.',
    industry: 'retail',
    seasonalCampaign: 'general',
    difficulty: 'medium',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'Steam uses steampowered.com, not steam-verify-account.com.' },
      { indicatorId: 'http', explanation: 'Steam payment updates always use HTTPS.' },
      { indicatorId: 'urgent', explanation: 'Payment failure creates pressure to update immediately.' }
    ],
    expertTip: '💡 Expert Tip: Steam payment issues are shown in your Steam client and account settings, never via email links.'
  },
  {
    id: 'p40',
    from: 'Zoom Meetings <noreply@zoom-security-verify.com>',
    subject: 'Confirm your meeting host credentials',
    body: 'We need to verify your hosting credentials for security. Verify now: https://zoom-security-verify.com/verify-host',
    isPhish: true,
    hint: 'Video conferencing phishing, host credential request, suspicious domain.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'medium',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'Zoom uses zoom.us, not zoom-security-verify.com.' },
      { indicatorId: 'request', explanation: 'Zoom never asks for host credentials via email.' }
    ],
    expertTip: '💡 Expert Tip: Zoom host settings are managed in your Zoom account portal, never through email verification links.'
  },
  {
    id: 'p41',
    from: 'Twitch Community <alerts@twitch-verify-account.com>',
    subject: 'Your channel has suspicious activity - Action Required',
    body: 'Verify your channel ownership: http://twitch-verify-account.com/channel-verify',
    isPhish: true,
    hint: 'Streaming platform phishing, channel verification, wrong domain.',
    industry: 'social-media',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'Twitch uses twitch.tv, not twitch-verify-account.com.' },
      { indicatorId: 'http', explanation: 'Twitch uses HTTPS for all account operations.' }
    ],
    expertTip: '💡 Expert Tip: Twitch channel settings and verification happen in your Creator Dashboard, not via email links.'
  },
  {
    id: 'p42',
    from: 'eBay Account <accountsecurity@ebay-verify.com>',
    subject: 'Confirm Your eBay Account Access',
    body: 'For security, confirm your account: http://ebay-verify.com/confirm-access',
    isPhish: true,
    hint: 'eBay phishing, account confirmation, HTTP instead of HTTPS.',
    industry: 'retail',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'eBay uses ebay.com, not ebay-verify.com.' },
      { indicatorId: 'http', explanation: 'eBay always uses HTTPS for account security.' }
    ],
    expertTip: '💡 Expert Tip: eBay account verification happens at ebay.com, never through email links asking for confirmation.'
  },
  {
    id: 'p43',
    from: 'Bank Transfer Service <transfers@wire-transfer-verify.com>',
    subject: 'International Transfer Verification Required',
    body: 'Verify your wire transfer: http://wire-transfer-verify.com/confirm-transfer?ref=0192847',
    isPhish: true,
    hint: 'Financial wire transfer phishing, verification request, dangerous link.',
    industry: 'banking',
    seasonalCampaign: 'general',
    difficulty: 'hard',
    redFlagExplanations: [
      { indicatorId: 'domain', explanation: 'No legitimate bank uses "wire-transfer-verify.com" - this is entirely fabricated.' },
      { indicatorId: 'http', explanation: 'Wire transfers MUST use HTTPS with proper banking infrastructure.' },
      { indicatorId: 'request', explanation: 'Banks never ask to verify wire transfers via email - this is a major red flag for fraud.' }
    ],
    expertTip: '💡 Expert Tip: Wire transfer verification happens inside your bank\'s secure portal or via phone. Never email verification.'
  },
  {
    id: 'p44',
    from: 'Protonmail Support <support@protonmail.com>',
    subject: 'Your ProtonMail Plus trial expires in 3 days',
    body: 'Your encrypted email Plus plan expires soon. Renew at the link below to keep your custom domain: https://mail.protonmail.com/dashboard/subscription',
    isPhish: false,
    hint: 'Official ProtonMail domain with HTTPS, standard renewal notification.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    expertTip: '💡 Expert Tip: ProtonMail subscription emails from protonmail.com with HTTPS are legitimate.'
  },
  {
    id: 'p45',
    from: 'Notion Team <hello@notion.so>',
    subject: 'You have been invited to a workspace',
    body: 'Join the team\'s collaborative workspace: https://www.notion.so/workspace-invite',
    isPhish: false,
    hint: 'Official Notion domain, standard workspace invitation.',
    industry: 'tech',
    seasonalCampaign: 'general',
    difficulty: 'easy',
    expertTip: '💡 Expert Tip: Notion invitations from notion.so are legitimate collaboration requests.'
  },
];

//==================== EXPERT TIPS DATABASE ====================
export const EXPERT_TIPS = [
  { id: 1, tip: 'Never click links in unexpected emails. Always go directly to the official website by typing the URL yourself.', category: 'general' },
  { id: 2, tip: 'Hover over links to see the actual URL before clicking. Many phishing emails hide malicious URLs behind legitimate-looking text.', category: 'general' },
  { id: 3, tip: 'Check the sender email address carefully. Even display names can be spoofed - look at the actual email address.', category: 'general' },
  { id: 4, tip: 'HTTPS is essential but not sufficient. Always verify you\'re on the CORRECT domain, not just any HTTPS site.', category: 'security' },
  { id: 5, tip: 'Banks, PayPal, and other financial services NEVER ask you to verify information via email links. Ever. Call them instead.', category: 'banking' },
  { id: 6, tip: 'Government agencies (IRS, USPS, etc.) rarely initiate contact via email. Be extremely skeptical of urgent government emails.', category: 'government' },
  { id: 7, tip: 'Account suspension threats are rarely real. Legitimate companies suspend accounts through your user dashboard, not email.', category: 'general' },
  { id: 8, tip: 'Phishers exploit urgency and fear. Take a breath - if it\'s real, you can verify it through official channels.', category: 'psychology' },
  { id: 9, tip: 'Enable two-factor authentication (2FA) on all important accounts. This protects you even if your password is compromised.', category: 'security' },
  { id: 10, tip: 'Use unique passwords for each account. Password managers like Bitwarden or 1Password can help manage them securely.', category: 'security' },
  { id: 11, tip: 'Healthcare providers never ask for sensitive information via email. Always verify through their official app or call the provider.', category: 'healthcare' },
  { id: 12, tip: 'During holidays and shopping seasons, phishing increases. Be extra cautious with package delivery and shopping emails.', category: 'seasonal' },
  { id: 13, tip: 'Typosquatting (using "0" instead of "o", "1" instead of "l") is a common phishing technique. Check domains character by character.', category: 'domains' },
  { id: 14, tip: 'Legitimate companies have professional human writers. Grammar and spelling errors are strong phishing indicators.', category: 'content' },
  { id: 15, tip: 'Report phishing emails to your email provider and the company being impersonated. You\'re helping stop future attacks.', category: 'reporting' },
];

//==================== RED FLAG DATABASE ====================
export const RED_FLAG_DATABASE = {
  urgent: {
    title: 'Extreme Urgency or Threats',
    explanation: 'Phishers create artificial urgency and fear to bypass your critical thinking. Real companies give you time to respond properly.'
  },
  domain: {
    title: 'Suspicious or Misspelled Domain',
    explanation: 'Check the domain carefully letter-by-letter. Phishers use typosquatting (0 instead of O, 1 instead of L) and domain variations.'
  },
  http: {
    title: 'HTTP Instead of HTTPS',
    explanation: 'Sensitive information requires HTTPS encryption. HTTP is never appropriate for accounts, payments, or personal data.'
  },
  grammar: {
    title: 'Poor Grammar or Spelling',
    explanation: 'Legitimate companies employ professional writers. Errors indicate the email may not be from who it claims.'
  },
  request: {
    title: 'Requests Sensitive Information',
    explanation: 'Companies never ask for passwords, credit cards, or SSNs via email. That\'s a guaranteed phishing attempt.'
  },
  sender: {
    title: 'Sender Email Doesn\'t Match Company',
    explanation: 'Even if the display name looks right, check the actual email address. Spoofed display names fool many people.'
  }
};
