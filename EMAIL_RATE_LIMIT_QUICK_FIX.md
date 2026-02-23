# Quick Fix Guide - Email Rate Limit Error

## If you see "email rate limit exceeded" during signup:

### ✅ Solution Applied
The code now automatically retries with exponential backoff when rate limiting occurs. **No action needed from you!**

### What's happening:
1. User signs up → Email sending triggered
2. Supabase rate limit hit → Automatic retry starts
3. System waits and retries automatically
4. Either succeeds ✅ or shows friendly error after 3 retries

### If it still fails after automatic retries:

#### **Quick Fixes** (Do in this order):

**1. Wait and Try Again (1-2 minutes)**
- Rate limits are temporary and reset quickly
- Wait a minute, then try signing up again
- Use a different email if testing

**2. Check Your Email**
- Sometimes the email WAS sent despite the error message
- Check spam folder, promotions, etc.
- The confirmation link may still work

**3. Check Supabase Status**
- Visit Supabase Dashboard → Auth Settings
- Verify email service is configured
- Check if email quota is exhausted (free tier has limits)

**4. Try a Different Email**
- Some emails might be rate limited individually
- Try a different email address
- This isolates whether it's a general or email-specific issue

#### **Detailed Troubleshooting:**

**Problem:** Keeps getting rate limit error
```
Solution:
  1. Wait 5 minutes and try again
  2. If using free Supabase tier:
     → Upgrade to paid plan for higher rate limits
     → OR use custom email service (SendGrid, etc.)
```

**Problem:** Email never arrives
```
Solution:
  1. Check spam/promotions folder
  2. Check if account was created (try logging in with username)
  3. Request resend via login page
  4. Contact Supabase support if issue persists
```

**Problem:** Multiple signup attempts failing
```
Solution:
  1. Each attempt uses new rate limit tokens
  2. Space out attempts 1-2 minutes apart
  3. If testing: use different emails each time
  4. Contact admin if systemic issue
```

### 🔧 Technical Details (For Developers)

**What the fix does:**
- Detects rate limit errors from Supabase
- Automatically retries up to 3 times
- Uses exponential backoff: 1s, 2s, 4s delays
- Falls back gracefully with user-friendly error

**Configuration:**
```typescript
// In src/services/authService.ts
this.retryWithBackoff(fn, 3, 1000);
// Parameters: (function, maxRetries, baseDelay)
```

**To increase retries (if needed):**
- Edit `authService.ts` 
- Change `maxRetries` from 3 to 5 (or higher)
- Delays will be: 1s, 2s, 4s, 8s, 16s

### 📊 Monitoring

**To see if rate limiting is happening:**
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Look for messages like:
   ```
   Rate limited. Retrying in 1000ms... (attempt 1/3)
   ```
   This means the system is auto-retrying

### 🆘 If Problem Persists

**Check these:**
- [ ] Supabase project is active
- [ ] Email service is enabled in Supabase settings
- [ ] Email quota not exceeded (Supabase Dashboard → Auth)
- [ ] No duplicate user profiles with same email (check database)
- [ ] No firewall/VPN blocking email service

**Resources:**
- Supabase Docs: https://supabase.com/docs
- Auth Issues: https://supabase.com/docs/guides/auth
- Rate Limit Info: https://supabase.com/docs/guides/auth/rate-limits

**Still stuck?**
Contact Supabase support or check their status page for service issues
