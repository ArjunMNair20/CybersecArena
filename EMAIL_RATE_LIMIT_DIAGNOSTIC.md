# Diagnostic Guide - Email Rate Limit Issue

## Immediate Action: Check if Account Was Created

Even though you see the error, **your account MIGHT have been created**. Here's how to check:

### Method 1: Try Logging In
1. Go to **Login page**
2. Enter the email you just used to sign up
3. Enter the password
4. Click Login

**Results:**
- ✅ Login works? → Account WAS created, email just delayed
- ❌ Login fails? → Account NOT created, email service blocked completely

### Method 2: Check Console for Retry Details
1. Press **F12** (DevTools)
2. Go to **Console** tab
3. Try signing up again
4. **Watch for these messages:**

```
⏳ Rate limited detected. Retrying in 1000ms... (attempt 1/5)
   Error: [COPY THIS ERROR MESSAGE]
⏳ Rate limited detected. Retrying in 2000ms... (attempt 2/5)
...
❌ Rate limit still active after 5 retries
```

**Action: Copy the error message and send it**

### Method 3: Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Try signing up
4. Look for a request to Supabase that fails
5. Click on it, go to **Response** tab
6. Copy the error response body

---

## Why This Is Happening

### Scenario 1: Account Created, Email Sending Delayed
- ✅ Account exists in database
- ❌ Confirmation email not sent yet
- **Solution:** Wait 5-10 minutes, then login and request resend

### Scenario 2: Supabase Auth Completely Blocked
- ❌ Account NOT created
- ❌ Email service rate limited
- **Solution:** Wait longer or use different email

### Scenario 3: Free Tier Quota Exhausted
- ❌ Account NOT created
- ❌ Daily email limit reached
- **Solution:** Contact Supabase support or upgrade plan

---

## Workaround: Frontend-Only Diagnosis

Paste this code into **Browser Console** and run it:

```javascript
// Check Supabase connection
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

console.log('=== Supabase Configuration ===');
console.log('URL Set:', !!supabaseUrl);
console.log('Key Set:', !!supabaseKey);

// Try to test auth status
const checkAuth = async () => {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.0.0/+esm');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase.auth.getSession();
    console.log('=== Auth Status ===');
    console.log('Session exists:', !!data.session);
    console.log('Session user:', data.session?.user?.email);
    if (error) console.error('Error:', error);
  } catch (e) {
    console.error('Could not check auth:', e.message);
  }
};

checkAuth();
```

---

## Next Steps Based on Your Findings

### If Account Works (Can Login)
1. ✅ You're signed up successfully
2. Go to Login page
3. Click "Resend Confirmation Email"
4. Wait for email (check spam folder)
5. Click confirmation link

### If Account Doesn't Exist
1. ❌ Signup completely failed
2. Wait 5-10 minutes
3. Try again with same email
4. If still fails, try different email
5. If multiple emails fail, contact support

### If Getting Same Error Again
1. The rate limit is persistent
2. Either:
   - Supabase is down (rare)
   - Free tier quota exhausted (check dashboard)
   - IP-based rate limiting (use VPN to test)
   - Try after several hours

---

## Quick Solutions

### Solution 1: Wait and Retry (Fastest)
1. Note down your email and password
2. Wait **10 minutes**
3. Try signing up again
4. If it works, proceed to confirm email

### Solution 2: Use Different Email
If email-specific rate limit:
1. Sign up with different email address
2. This bypasses the per-email rate limit
3. Both accounts will be created
4. Use whichever gets email first

### Solution 3: Check Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Auth → Users
4. Check if your email is listed
5. If yes, confirm creation worked
6. If no, creation was blocked

---

## Advanced Debug: Check Email Service Status

The rate limit could be from:

### Supabase Email Service
- Free tier: **1 email/minute per address**
- Pro tier: **5 emails/minute per address**
- Enterprise: Custom limits

### Possible Issues
1. **Multiple signup attempts** (resets rate limit)
2. **Resending confirmation** (uses same bucket)
3. **Reset password request** (might share limit)
4. **Power user on free tier** (daily limits exist)

---

## Detailed Error Message Reference

If you see these specific messages:

```
"Email sending is temporarily busy"
→ Our retry logic detected rate limit
→ All 5 retries failed
→ Wait 2-5 minutes and retry

"Email rate limit exceeded"
→ Supabase returned this directly
→ Per-email limit hit
→ Try different email OR wait longer

"Too many requests"
→ General rate limiting (not email-specific)
→ IP-based or account-based
→ Wait 10+ minutes

"429"
→ HTTP status code for rate limit
→ Standard web rate limiting
→ Automatic retry should handle this
```

---

## Console Debug Output

When you try to sign up, you should see console messages. Here are examples:

### ✅ Success (No Retry Needed)
```
✅ Signup successful! Check your email.
```

### ⏳ Success with Retry
```
⏳ Rate limited detected. Retrying in 1000ms... (attempt 1/5)
   Error: Email sending is temporarily busy
(Wait 1-2 seconds)
⏳ Rate limited detected. Retrying in 2000ms... (attempt 2/5)
   Error: Email sending is temporarily busy
(Wait 2-4 seconds)
✅ Signup successful! Check your email.
```

### ❌ Failure After All Retries
```
⏳ Rate limited detected. Retrying in 1000ms... (attempt 1/5)
❌ Rate limit still active after 5 retries
Email service is temporarily busy. Please wait 2-3 minutes and try again.
```

---

## What You Should Do RIGHT NOW

### Priority 1: Determine Account Status
1. **Can you login with your email?**
   - YES → Account created ✅ (just wait for email)  
   - NO → Account not created ❌ (wait and retry)

### Priority 2: Check Email
1. **Did you receive confirmation email?**
   - YES → Click link to confirm
   - NO → Check spam folder
   - Still NO → Use resend on login page

### Priority 3: Report Issue
If none of the above work:
1. Take screenshot of console error
2. Note email address (can be partial like "test@...")
3. Note time when you tried
4. Share with support or create issue

---

## Temporary Workaround

While we fix the rate limit issue, you can:

1. ✅ Keep trying to sign up (the system is auto-retrying)
2. ✅ Space out attempts by 5+ minutes  
3. ✅ Try different email addresses
4. ✅ Check if account was created by trying to login
5. ✅ Use resend option on login page if account exists

---

## FAQ

**Q: Why is Supabase rate limiting my emails?**
A: To prevent abuse and maintain email deliverability. Standard practice.

**Q: Will my account be created even if email fails?**
A: Check by trying to login. If you can login, yes - email will arrive eventually.

**Q: How long should I wait?**
A: Try again after 5-10 minutes. If still failing, wait longer (up to 1 hour).

**Q: Can I use a different email?**
A: Yes! This creates a separate account. The original email will work later too.

**Q: Is my data safe if account creation fails?**
A: Nothing is saved if signup fails. You can safely retry with same email.

**Q: What if this keeps happening?**
A: Contact Supabase support. May be account-level issue with your project.

---

## Next Step

**Please provide:**
1. What happens when you try to Login?
2. What error messages appear in Console (F12)?
3. Approximately when did you try to signup?

This will help us determine if it's:
- Per-email rate limit (use different email)
- Account-level quota (contact Supabase)
- Transient issue (wait and retry)
