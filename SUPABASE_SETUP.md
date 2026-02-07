# Supabase Setup Guide - Simple Steps

Follow these steps to get your Supabase Edge Function working for local development.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. An OpenAI API key (get one at https://platform.openai.com/api-keys)
3. Supabase CLI installed

## Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

Or on macOS:
```bash
brew install supabase/tap/supabase
```

## Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate.

## Step 3: Link Your Project

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (or create a new one)
3. Go to Project Settings → General
4. Copy your "Reference ID" (it's in the URL or settings page)

Then run:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Replace `YOUR_PROJECT_REF` with your actual project reference ID.

## Step 4: Set Your OpenAI API Key

Set the OpenAI API key as a secret in Supabase:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

## Step 5: Deploy the Edge Function

Deploy the chat function:

```bash
supabase functions deploy chat
```

## Step 6: Verify Your .env File

Your `.env` file should have your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** Use the **"anon" key** (JWT token starting with `eyJ...`), NOT the "publishable" key. 

To find it:
1. Go to Supabase Dashboard → Project Settings → API
2. Look for the **"anon"** or **"public"** key (it's a long JWT token)
3. Copy that value to your `.env` file

The anon key is required for Edge Functions authentication. The publishable key (`sb_publishable_...`) won't work for Edge Functions.

**Note:** The `OPENAI_API_KEY` in your `.env` file won't be used - it needs to be set as a Supabase secret (Step 4).

## Step 7: Test It!

1. Start your dev server:
   ```bash
   yarn dev
   ```

2. Try sending a message in the chat interface!

## Troubleshooting

### "Function not found" error
- Make sure you deployed: `supabase functions deploy chat`
- Check that the function exists in your Supabase dashboard → Edge Functions

### "OPENAI_API_KEY not set" error
- Verify the secret is set: `supabase secrets list`
- Make sure you set it correctly: `supabase secrets set OPENAI_API_KEY=sk-...`

### CORS errors
- Supabase Edge Functions handle CORS automatically
- If you see CORS issues, check the function logs in Supabase dashboard

### Local development
For local development, you can also run Supabase locally:
```bash
supabase start
supabase functions serve chat
```

But for simplicity, just deploy to Supabase cloud - it's free and works great!

## Quick Reference

```bash
# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Set secret
supabase secrets set OPENAI_API_KEY=sk-...

# Deploy function
supabase functions deploy chat

# Check secrets
supabase secrets list

# View function logs
supabase functions logs chat
```

That's it! Once deployed, your chat will work both locally and in production.
