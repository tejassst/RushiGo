# 📧 Mailgun Setup Guide for RushiGo

## 🚨 Current Issue: Invalid API Key

Your current configuration has an **invalid API key** (401 Unauthorized). Let's fix this step by step.

## 🔧 Step-by-Step Fix

### 1. **Get Your Correct API Key**

1. Go to [Mailgun Dashboard](https://app.mailgun.com/app/dashboard)
2. Click on **"API Keys"** in the left sidebar (or go to [API Keys](https://app.mailgun.com/app/account/security/api_keys))
3. Look for your **"Private API key"** - it should start with `key-` followed by a long string
4. **Copy the ENTIRE key** (it's longer than what you currently have)

### 2. **Get Your Domain Information**

1. Go to [Sending > Domains](https://app.mailgun.com/app/sending/domains)
2. Click on your domain (the sandbox one)
3. Copy the **exact domain name** (should be something like `sandbox[random].mailgun.org`)

### 3. **Update Your .env File**

Replace the values in `/home/tejast/Documents/Projects/rushiGo/backend/.env`:

```env
# Replace these with your ACTUAL values from Mailgun dashboard:
MAILGUN_DOMAIN=sandbox920c0c8a6b6d49f493bc00545ef37db7.mailgun.org
MAILGUN_API_KEY=key-[YOUR_FULL_PRIVATE_API_KEY_HERE]
FROM_EMAIL=RushiGo <mailgun@sandbox920c0c8a6b6d49f493bc00545ef37db7.mailgun.org>
```

### 4. **Add Authorized Recipients (IMPORTANT for Sandbox)**

Since you're using a **sandbox domain**, Mailgun will ONLY send emails to authorized recipients:

1. Go to your domain settings: [Domains](https://app.mailgun.com/app/sending/domains)
2. Click on your sandbox domain
3. Go to **"Settings"** tab
4. Scroll to **"Authorized Recipients"**
5. Add these emails:
   - `tejast4256@gmail.com` (your email for testing)
   - Any other emails you want to send notifications to

### 5. **Alternative: Use a Custom Domain (Optional)**

If you want to send to any email without restrictions:

1. Add your own domain (like `yourdomain.com`) to Mailgun
2. Add DNS records as instructed by Mailgun
3. Use your custom domain instead of sandbox

## 🧪 Testing After Fix

After updating your `.env` file, run:

```bash
cd /home/tejast/Documents/Projects/rushiGo/backend
/home/tejast/Documents/Projects/rushiGo/backend/.venv/bin/python scripts/debug_mailgun.py
```

## 🎯 Expected Results After Fix

✅ Domain access: 200 OK  
✅ API key works  
✅ Test email sent successfully

## 🔍 Finding Your Correct Values

### API Key Format:

- ✅ Correct: `key-1234567890abcdef1234567890abcdef-12345678-90123456`
- ❌ Wrong: `key-04df61d1b5d08ebc838d5345d68ffb0f-e1076420-0842efb7` (too short/different format)

### Domain Format:

- ✅ Correct: `sandbox[random].mailgun.org`
- ✅ Custom: `mg.yourdomain.com`

## 📱 Quick Actions

1. **[Open Mailgun API Keys](https://app.mailgun.com/app/account/security/api_keys)** - Get your Private API key
2. **[Open Mailgun Domains](https://app.mailgun.com/app/sending/domains)** - Verify your domain and add authorized recipients
3. **Update your .env file** with correct values
4. **Run the test script** to verify everything works

## 💡 Pro Tips

- **Sandbox domains** are free but limited to authorized recipients
- **Custom domains** allow sending to anyone but require DNS setup
- Keep your API key secret (don't commit it to version control)
- Test with the debug script before using in production

---

Once you update your credentials, your notification system will work perfectly! 🚀
