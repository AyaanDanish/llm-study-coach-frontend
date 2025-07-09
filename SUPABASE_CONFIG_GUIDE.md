# Supabase Configuration for Password Reset

## The Problem

The password reset link is automatically logging you into the app instead of taking you to the password reset form. This is because Supabase needs to be configured properly to handle password reset flows.

## Required Supabase Configuration

### 1. Authentication Settings

1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication → Settings**
3. **Configure the following:**

#### Site URL

- **Development:** `http://localhost:3000`
- **Production:** Your actual domain (e.g., `https://yourdomain.com`)

#### Redirect URLs

Add these URLs to your redirect URLs list:

- `http://localhost:3000/auth/reset-password`
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/**` (wildcard for all auth routes)

### 2. Email Templates Configuration

This is the most important part that's likely missing:

1. **Go to Authentication → Email Templates**
2. **Select "Reset Password" template**
3. **Update the email template:**

The default template might look like this:

```html
<h2>Reset Your Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p>
  <a href="{{ .SiteURL }}/auth/reset-password?token={{ .Token }}&type=recovery"
    >Reset Password</a
  >
</p>
```

**Change it to:**

```html
<h2>Reset Your Password</h2>
<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .SiteURL }}/auth/reset-password">Reset Password</a></p>
```

### 3. Check Your Environment Variables

Make sure your `.env.local` file has:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Test the Configuration

1. **Clear your browser cache and cookies**
2. **Request a new password reset**
3. **Check the email you receive**
4. **The link should now take you to the password reset form**

## Alternative Solution: Custom Email Template

If the above doesn't work, you can create a custom email template:

1. **Go to Authentication → Email Templates**
2. **Select "Reset Password"**
3. **Use this template:**

```html
<h2>Reset Your Password</h2>
<p>Hello,</p>
<p>You requested a password reset for your Study Coach account.</p>
<p>Click the link below to reset your password:</p>
<p>
  <a
    href="{{ .SiteURL }}/auth/reset-password?token={{ .Token }}&type=recovery&access_token={{ .Token }}"
    >Reset Password</a
  >
</p>
<p>If you didn't request this, please ignore this email.</p>
<p>This link will expire in 24 hours.</p>
```

## Debugging Steps

If it still doesn't work:

1. **Check the browser console** when you click the reset link
2. **Look at the URL** when you click the reset link - it should contain `type=recovery`
3. **Check the Network tab** in developer tools to see what requests are being made
4. **Try in an incognito/private browsing window**

## Common Issues and Solutions

### Issue 1: "Invalid redirect URL"

**Solution:** Make sure `http://localhost:3000/auth/reset-password` is added to your Supabase redirect URLs.

### Issue 2: Still auto-logging in

**Solution:** Check that your email template is pointing to the correct URL with the right parameters.

### Issue 3: "Session not found"

**Solution:** The reset link might be expired. Try requesting a new one.

## Testing Process

1. **Request password reset** from your app
2. **Check email** - the link should look like: `http://localhost:3000/auth/reset-password?token=...&type=recovery`
3. **Click the link** - should take you to password reset form, not auto-login
4. **Set new password** - should work and redirect to login
5. **Login with new password** - should work

If you're still having issues after checking these configurations, please share:

1. The URL you see when you click the reset link
2. Any errors in the browser console
3. Your current Supabase auth settings (screenshots are helpful)
