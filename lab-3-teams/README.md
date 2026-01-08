# Lab 3: Deploy to Teams (20 min)

In this lab, you'll register your bot in Azure, package it, and deploy to Microsoft Teams (Commercial or GCC High).

## Choose Your Environment

**Commercial Teams**: Use standard Azure portal (portal.azure.com) and Teams  
**GCC High Teams**: Use Azure Government portal (portal.azure.us) and GCC High Teams

All steps work in both—just use the appropriate portals.

---

## Step 1: Register Bot in Azure

### 1.1 Create Bot Channel Registration

Navigate to your Azure portal:
- **Commercial**: [portal.azure.com](https://portal.azure.com)
- **GCC High**: [portal.azure.us](https://portal.azure.us)

Then:

1. Click **"Create a resource"** → Search for **"Azure Bot"**
2. Click **"Create"**
3. Fill in the details:
   - **Bot handle**: `claims-assistant-bot` (must be globally unique)
   - **Subscription**: Your Azure subscription
   - **Resource group**: Same as your OpenAI resource
   - **Pricing tier**: F0 (free) or S1
   - **Microsoft App ID**: Click **"Create new"** → **"Multi-tenant"**
4. Click **"Review + create"** → **"Create"**
5. Wait for deployment to complete

### 1.2 Get Application ID and Create Secret

1. Go to your new Azure Bot resource
2. Click **"Configuration"** (left sidebar)
3. **Copy the Microsoft App ID** (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
4. Click on **"Manage"** next to the Microsoft App ID
5. In the App Registration page, click **"Certificates & secrets"** (left sidebar)
6. Click **"New client secret"**
   - **Description**: `teams-bot-secret`
   - **Expires**: 24 months
7. Click **"Add"**
8. **Copy the secret Value** immediately (it won't show again!)

### 1.3 Configure Bot Endpoint

1. Go back to your Azure Bot resource → **"Configuration"**
2. Set **Messaging endpoint**:
   - For local testing: `https://your-ngrok-url.ngrok.io/api/messages`
   - For production: `https://your-app-service.azurewebsites.net/api/messages`
   - (We'll use ngrok for local testing in next steps)
3. Click **"Apply"**

## Step 2: Set Up Local Testing with ngrok

To test Teams locally, you need a public HTTPS endpoint. Use ngrok:

### 2.1 Install ngrok

**Commercial**: [ngrok.com](https://ngrok.com)  
**GCC High**: May need to use alternatives if ngrok blocked

```bash
# Download and install ngrok
# Visit https://ngrok.com/download and follow instructions
# Or use: brew install ngrok (macOS), choco install ngrok (Windows)
```

### 2.2 Start ngrok Tunnel

With your bot running (`npm run dev` from `teams-bot/`), open a new terminal:

```bash
ngrok http 3978
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3978
```

Copy the **https://abc123.ngrok.io** URL.

### 2.3 Update Bot Messaging Endpoint

1. Go to your Azure Bot → **"Configuration"**
2. Set **Messaging endpoint** to: `https://abc123.ngrok.io/api/messages`
   - **Note**: Our bot uses `/message`, not `/api/messages`
   - **Update to**: `https://abc123.ngrok.io/message`
3. Click **"Apply"**

## Step 3: Create Teams App Package

### 3.1 Update manifest.json

Edit `teams-bot/manifest.json` and update:

```json
{
  "id": "your-app-id-here",
  "bots": [
    {
      "botId": "your-microsoft-app-id-from-step-1",
      "scopes": ["personal"]
    }
  ]
}
```

Replace:
- `your-app-id-here` with your Microsoft App ID (same as botId)
- `your-microsoft-app-id-from-step-1` with the App ID you copied

### 3.2 Create Icon Files

Create simple placeholder icons (or use custom icons):

```bash
cd teams-bot
mkdir -p icons

# Use any 192x192 PNG as color.png and 32x32 PNG as outline.png
# Or download from internet
```

### 3.3 Package for Teams

```bash
cd teams-bot
zip -r ClaimsAssistant.zip manifest.json icons/
```

This creates `teams-bot/ClaimsAssistant.zip`.

## Step 4: Deploy to Microsoft Teams

### For Commercial Teams:

1. Open **Microsoft Teams** (desktop or web)
2. Click **"Apps"** (bottom left)
3. Click **"Manage your apps"** → **"Upload a custom app"** → **"Upload for me or my teams"**
4. Select your `ClaimsAssistant.zip` file
5. Click **"Add"** when prompted
6. The Claims Assistant will appear in your Teams sidebar

### For GCC High Teams:

1. Open **Microsoft Teams GCC High** (teams.microsoft.us)
2. Click **"Apps"** (bottom left)
3. Click **"Manage your apps"** → **"Upload a custom app"**
4. Select your `ClaimsAssistant.zip` file
5. Click **"Add"** when prompted
6. The Claims Assistant will appear in your Teams sidebar

**Note**: GCC High may require admin approval for custom apps. Contact your Teams admin if you see approval requirements.

## Step 5: Test in Teams

1. Open the Claims Assistant bot in Teams
2. Type: **"What should I know about filing a claim?"**
3. Wait for the AI response (should take 2-5 seconds)
4. Verify you get a helpful response about claims filing

## ✅ Lab 3 Complete

You now have:
- ✅ Azure Bot registered (Commercial or GCC High)
- ✅ Bot credentials configured
- ✅ Local testing endpoint with ngrok
- ✅ Teams app package created
- ✅ Bot successfully deployed to Teams
- ✅ Tested the bot with real questions

---
---

## Troubleshooting

### Bot returns `ready: false`

**Cause**: Azure OpenAI credentials not set in `.env`

**Fix**: 
```bash
cat teams-bot/.env
# Verify AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY are present
```

### Message endpoint returns error

**Cause**: Invalid endpoint or API key

**Fix**:
```bash
# Test Azure OpenAI directly
curl -X POST "https://your-resource.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-08-01-preview" \
  -H "api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

If this fails, verify:
- Endpoint URL is correct (`.azure.com` for commercial, `.azure.us` for GCC High)
- API key is valid
- GPT model deployment exists

### Teams says "Bot is unavailable"

**Cause**: Messaging endpoint not reachable

**Fix**:
- Verify ngrok is running: `curl https://your-ngrok-url.ngrok.io/health`
- Check Azure Bot messaging endpoint matches ngrok URL
- Ensure bot process is running (`npm run dev`)

### Teams app won't upload

**Cause**: Invalid manifest.json format

**Fix**:
```bash
# Validate manifest JSON syntax
cat teams-bot/manifest.json | python3 -m json.tool
```

### GCC High specific: App blocked

**Cause**: GCC High requires admin approval for custom apps

**Fix**: Contact your Teams administrator to approve the custom app or add your App ID to the allowed list.

---

## Production Deployment

For production (not using ngrok):

1. **Deploy bot to Azure App Service** or **Container Instances**
2. **Update messaging endpoint** to production URL
3. **Add authentication** for Teams messages (verify bot framework tokens)
4. **Monitor and scale** based on usage

See [Azure Bot Service documentation](https://learn.microsoft.com/en-us/azure/bot-service/) for production deployment guidance.

---

## Next Steps

Congratulations! You've successfully deployed an AI-powered assistant to Teams. From here, you can:

1. **Enhance the assistant** — Modify system instructions in [claims.ts](../teams-bot/src/handlers/claims.ts)
2. **Add conversation history** — Store previous messages for context-aware responses
3. **Integrate data sources** — Connect to databases, SharePoint, or APIs
4. **Add authentication** — Require user sign-in for personalized responses
5. **Scale to production** — Deploy to Azure App Service with proper monitoring

---

## Resources

- [Azure OpenAI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
- [Azure Bot Service](https://learn.microsoft.com/en-us/azure/bot-service/)
- [Teams Bot Development](https://learn.microsoft.com/en-us/microsoftteams/platform/bots/what-are-bots)
- [Azure Government Documentation](https://learn.microsoft.com/en-us/azure/azure-government/)
- [GCC High Teams](https://learn.microsoft.com/en-us/microsoftteams/plan-for-government-gcc-high)
