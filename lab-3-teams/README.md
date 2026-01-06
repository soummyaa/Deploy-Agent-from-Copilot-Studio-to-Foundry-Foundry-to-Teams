# Lab 3: Foundry → Teams (20 min)

In this lab, you'll configure the bot to call your Foundry agent, test it locally, and deploy to Microsoft Teams.

## Step 1: Configure the Bot

Back in your `teams-bot` directory, create a `.env` file with your Foundry credentials:

```bash
# .env
FOUNDRY_AGENT_URL=https://your-resource.openai.azure.com/openai/assistants/asst_YOUR_ASSISTANT_ID
FOUNDRY_AGENT_TOKEN=your-api-key-here
PORT=3978
```

**Note on authentication:**
- **API Key method** (above): Set `FOUNDRY_AGENT_TOKEN` to your API key
- **Azure AD method**: Set `FOUNDRY_AGENT_TOKEN=USE_AZURE_AD_TOKEN` (requires `az login`)

## Step 2: Test the Bot Locally

With your bot still running (`npm run dev`), open a new terminal and test the message endpoint:

```bash
curl -X POST http://localhost:3978/message \
  -H "Content-Type: application/json" \
  -d '{"text":"What should I know about filing a claim?"}'
```

Expected response:
```json
{
  "ok": true,
  "data": {
    "text": "Filing a claim is a straightforward process... [agent response]"
  }
}
```

Also verify the health endpoint:

```bash
curl http://localhost:3978/health
```

Should now return `"ready": true`.

## Step 3: Create Teams App Package

To deploy to Teams, you need a ZIP file containing:
1. **manifest.json** (already in repo)
2. **Icon images** (color: 192×192, outline: 32×32)

### Update manifest.json

Edit `teams-bot/manifest.json` and replace the placeholder:

```json
"botId": "00000000-0000-0000-0000-000000000000"
```

with a real **Application ID**. To get one:

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for **App registrations** → **New registration**
3. Name: "Claims Bot"
4. Click **Register**
5. Copy the **Application (client) ID** from the Overview page
6. Paste it into `manifest.json`

### Create Icon Files (Optional)

If you don't have custom icons, create simple placeholder PNGs:

```bash
# Create icon directory
mkdir -p teams-bot/icons

# Create placeholder PNGs (or use your own icons)
# For now, you can use any 192x192 and 32x32 PNG files
```

Alternatively, find free icons online and save them as `color.png` and `outline.png` in the `teams-bot/icons/` directory.

### Package for Teams

```bash
cd teams-bot
zip -r ClaimsAssistant.zip manifest.json icons/
```

This creates `teams-bot/ClaimsAssistant.zip` with your Teams app package.

## Step 4: Deploy to Teams

1. Open **Microsoft Teams**
2. Click **"Apps"** (bottom left) → **"Manage your apps"** → **"Upload a custom app"**
3. Select your `ClaimsAssistant.zip` file
4. Click **"Add"** when prompted
5. The Claims Assistant will now appear in your Teams sidebar
6. Open it and test: Type "How do I file a claim?"

## ✅ Lab 3 Complete

You now have:
- ✅ Bot configured with Foundry credentials (environment variables set)
- ✅ Tested the `/message` endpoint locally with real agent responses
- ✅ Created a Teams app package (manifest + icons)
- ✅ Deployed the bot to Microsoft Teams
- ✅ Successfully tested the bot in Teams

---

## Troubleshooting

### Bot returns `ready: false`

**Cause**: `FOUNDRY_AGENT_URL` or `FOUNDRY_AGENT_TOKEN` not set in `.env`

**Fix**: 
```bash
cat teams-bot/.env
# Verify both variables are present and not empty
```

### Message endpoint returns error

**Cause**: Invalid agent URL or expired token

**Fix**:
```bash
# Test the URL directly
curl -X POST "https://your-resource.openai.azure.com/openai/assistants/asst_ID/threads" \
  -H "api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

If this fails, verify:
- Endpoint URL is correct
- API key or `az login` is valid
- Gpt-4o model is deployed in your resource

### Teams app won't upload

**Cause**: Invalid manifest.json or botId format

**Fix**:
```bash
# Validate manifest
python3 -m json.tool teams-bot/manifest.json
# Check botId is a valid UUID format
```

### Port 3978 already in use

**Cause**: Another process is using port 3978

**Fix**:
```bash
# Kill the existing process
lsof -t -i:3978 | xargs kill -9
# Or change PORT in .env to a different port (e.g., 4000)
```

---

## Next Steps

Congratulations! You've successfully deployed an AI agent from Copilot Studio through Foundry to Teams. From here, you can:

1. **Enhance the agent** — Add file search, improve instructions, train with custom data
2. **Add more skills** — Deploy multiple agents or create specialized bots
3. **Scale to production** — Deploy the bot to Azure Container Instances or App Service, add authentication, monitor usage
4. **Integrate with other services** — Connect to databases, CRM systems, or email for richer automation

---

## Resources

- [Copilot Studio Documentation](https://learn.microsoft.com/en-us/microsoft-cloud/copilot/copilot-studio-overview)
- [Azure OpenAI Assistants API](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/assistant)
- [Azure AI Foundry](https://ai.azure.com)
- [Teams Bot Development](https://learn.microsoft.com/en-us/microsoftteams/platform/bots/what-are-bots)
- [Teams App Manifest Schema](https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema)
