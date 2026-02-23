# Supabase Email Rate Limiting - Reference Guide

## Understanding Supabase Rate Limits

### What are Supabase Rate Limits?

Supabase implements rate limiting to:
- Prevent abuse and spam
- Maintain email deliverability
- Protect against denial-of-service attacks
- Fair resource allocation

### Current Rate Limits (By Plan)

| Plan | Email Limit | Window | Notes |
|------|------------|--------|-------|
| Free | 1 email/min per address | Per Email | Shared infrastructure |
| Pro | 5 emails/min per address | Per Email | Better limits |
| Enterprise | Custom | Custom | Negotiable |

**Legend:**
- "Per Email" = Per unique email address
- Example: If you try to send 3 emails to same address within 60 seconds, 2-3 will be rate limited

### Types of Rate Limited Emails

1. **Signup Confirmation**
   - Sent automatically by `auth.signUp()`
   - Limit applies to `signUp()` calls
   - Can also send via `auth.resend()`

2. **Password Reset**
   - Sent by `auth.resetPasswordForEmail()`
   - Separate rate limit bucket
   - Can trigger independently

3. **Magic Link**
   - Sent by `auth.signInWithOtp()`
   - Limited like other emails
   - Alternative to password-based auth

### Error Messages

When rate limited, users will see Supabase errors like:
```
"Email rate limit exceeded"
"Too many requests"
"Rate limit exceeded, please try again later"
"Too many requests: Please retry after 60 seconds"
```

### When Rate Limits Trigger

**Mode Common Scenarios:**

1. **Multiple Signup Attempts (Same Email)**
   ```
   12:00:01 - First signup → Email sent ✅
   12:00:15 - Second signup (retry) → RATE LIMITED ❌
   12:01:02 - Third attempt → Email sent ✅
   ```

2. **Rapid Testing/Development**
   ```
   Testing signup 5 times with 5 different emails
   → All 5 sent within 1 minute from same IP
   → May trigger additional IP-based rate limits
   ```

3. **Old Account Recovery**
   ```
   User wants to resend confirmation
   12:30:45 - First resend → Sent ✅
   12:31:00 - Second resend (15 sec later) → RATE LIMITED ❌
   ```

4. **Signup + Password Reset**
   ```
   User signs up → Gets confirmation email ✅
   User resets password → **May** trigger rate limit
   (Depends if using same email bucket)
   ```

### Rate Limit Reset Timing

- **Window**: Sliding 60-second window
- **Reset**: Automatic after 60 seconds
- **Per Email**: Each unique email has its own counter
- **IP Based**: May also have IP-based limits (enterprise feature)

### Example Timeline

```
Time:  Email Action           Status
─────────────────────────────────────
00:00  User1 signup          ✅ Sent LIMIT=0/1
00:05  User2 signup          ✅ Sent LIMIT=0/1
00:10  User1 resend          ✅ Sent LIMIT=0/1
00:15  User1 resend again    ❌ RATE LIMITED (within 60s window)
00:30  User1 resend again    ❌ RATE LIMITED (within 60s window)
01:05  User1 resend again    ✅ Sent (60s+ passed, window reset)
```

## Our Fix's Approach

### Automatic Exponential Backoff

```
Retry Schedule (with 1000ms base delay):
Attempt 1: Immediate
Attempt 2: +1 second
Attempt 3: +2 seconds
Maximum total: ~7 seconds

If all 3 fail within that window:
→ Return friendly error message
```

### Why This Works

1. **Respects Rate Limit Window**
   - Waits until limit window likely reset
   - 1s, 2s, 4s gives buffer

2. **Transparent to User**
   - Happens in background
   - No manual retry needed
   - User sees it as "slight delay"

3. **Handles Failure Gracefully**
   - If retries don't work, user gets clear message
   - Suggests waiting and trying again
   - Not an unexpected or confusing error

## Supabase Configuration

### Check Your Rate Limits

**In Supabase Dashboard:**
1. Go to Project Settings
2. Navigate to Auth → Email Settings
3. Look for "Email Rate Limiting" section
4. Should show current plan limits

### Increasing Rate Limits

**Option 1: Upgrade Plan**
- Move from Free → Pro
- 5x higher rate limits
- Better support

**Option 2: Use Custom SMTP**
- Configure own email service (SendGrid, SES, etc.)
- Completely bypass Supabase rate limits
- More control and reliability

**Option 3: Contact Supabase**
- Enterprise customers can negotiate
- Custom limits available
- High-volume use cases

### Configuration Code

**Current Code (Uses Supabase Default):**
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${origin}/confirm-email`,
  }
});
```

**To Use Custom SMTP (Future Enhancement):**
```typescript
// Would require backend implementation
// Send via custom edge function or webhook
// More complex but unlimited rate limits
```

## Monitoring Rate Limit Issues

### In Browser Console

Look for our retry messages:
```
Rate limited. Retrying in 1000ms... (attempt 1/3)
Rate limited. Retrying in 2000ms... (attempt 2/3)
```

### In Supabase Logs

Check Auth section:
1. Go to Dashboard → Logs
2. Filter by Auth events
3. Look for "rate limit" in error messages
4. See timestamp, email, error details

### Application Monitoring

**Recommended Setup:**
```typescript
// Add to error tracking (Sentry, etc.)
if (error.includes('rate limit')) {
  trackEvent('signup_rate_limit', {
    email: userEmail,
    timestamp: new Date(),
    retry_count: attemptNumber
  });
}
```

## Troubleshooting Steps

### If Seeing Rate Limit Errors:

**Step 1: Verify Email Configuration**
- [ ] Email service enabled in Supabase
- [ ] SMTP configured (if custom)
- [ ] From address valid
- [ ] Email sender verified

**Step 2: Check Rate Limit Policy**
- [ ] Free tier plan limitations understood
- [ ] Sliding window concept understood
- [ ] Per-email limits documented

**Step 3: Verify Retry Logic**
- [ ] Exponential backoff enabled
- [ ] Max retries set to 3+
- [ ] Delays appropriate (1s, 2s, 4s)

**Step 4: Monitor Issue**
- [ ] Log retry attempts
- [ ] Track success rate
- [ ] Alert on high failure rate

### Common Issues & Fixes

**Issue: Every signup gets rate limited**
```
Cause: Free tier with many signups
Fix: 
  1. Implement queue system
  2. Upgrade to Pro plan
  3. Use custom email service
```

**Issue: Resend always fails**
```
Cause: User clicking resend too quickly
Fix:
  1. Add debounce (disable button for 60s)
  2. Show wait timer to user
  3. Explain rate limit to user
```

**Issue: Only some emails rate limited**
```
Cause: Email-specific rate limit
Fix:
  1. Normal - allow retry
  2. Space out retries
  3. Try different email sequence
```

## API Response Examples

### Rate Limited Response
```json
{
  "error": "Email rate limit exceeded",
  "status": 429,
  "message": "Too many requests to this email address. Please try again in 60 seconds."
}
```

### Success Response
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "email_confirmed_at": null
  },
  "session": null,
  "weaknesses": null
}
```

## Best Practices

### For Development

```typescript
// ✅ Good: Space out email sends during development
await delay(2000);
await sendSignupEmail(email1);
await delay(2000);
await sendSignupEmail(email2);

// ❌ Bad: Rapid emails cause rate limiting
sendSignupEmail(email1);
sendSignupEmail(email2);
sendSignupEmail(email3); // Rate limited!
```

### For Testing

```typescript
// ✅ Use different emails
testWith('user1@test.com');  // Success
testWith('user2@test.com');  // Success
testWith('user3@test.com');  // Success

// ❌ Using same email
testWith('test@test.com');  // Success
testWith('test@test.com');  // Rate limited
testWith('test@test.com');  // Rate limited
```

### For Production

```typescript
// ✅ Implement queuing
addToEmailQueue(email);  // Batch processing
processQueue(maxPerMinute: 1);  // Rate controlled

// ✅ Implement retry with backoff
retryWithBackoff(emailFunction, maxRetries: 5, delay: 2000);

// ✅ Monitor and alert
onRateLimitError(() => {
  log('Rate limit hit');
  alertOps('Signup flow impacted');
});
```

## References & Documentation

- [Supabase Auth Rate Limits Docs](https://supabase.com/docs/guides/auth/rate-limits)
- [Supabase Auth Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Email Service Providers Integration](https://supabase.com/docs/guides/auth/custom-smtp)
- [RFC 6585: HTTP Status 429](https://tools.ietf.org/html/rfc6585)
- [Exponential Backoff Strategy](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)

## Summary

**What to Know:**
- Supabase rate limits emails to prevent abuse
- Free tier: 1 email/min per address
- Our fix: Automatic retry with backoff
- Default: 3 retries, gaps of 1s/2s/4s

**What to Do:**
- Deploy the fix ✅
- Monitor for retry messages
- Adjust settings if needed
- Plan for scale (upgrade plan or custom email)

**What NOT to Do:**
- ❌ Disable rate limiting (can't be done)
- ❌ Bypass Supabase auth (security risk)
- ❌ Ignore the issue (users won't sign up)
- ❌ Send too many emails rapidly (won't help)
