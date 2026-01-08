# Lab 1: Set Up Your Environment (10 min)

In this lab, you'll prepare your local development environment to deploy your Copilot Studio agent to Teams.

## Prerequisites

Before starting, ensure you have:

- ✅ **Existing Copilot Studio Agent** 
  - You've already built an agent in Copilot Studio
  - You can access the agent's instructions and configuration
- ✅ **Azure Subscription** (Commercial or Government)
  - For **GCC High**: Access to Azure Government portal (portal.azure.us)
  - For **Commercial**: Access to Azure portal (portal.azure.com)
- ✅ **GitHub Account** with git CLI
- ✅ **Node.js 18+** and npm installed
- ✅ **TypeScript** knowledge (basic familiarity with async/await, REST APIs)
- ✅ **Microsoft Teams Account** (GCC High or Commercial, matching your Azure subscription)

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/Deploy-Agent-from-Copilot-Studio-to-Foundry-Foundry-to-Teams.git
cd Deploy-Agent-from-Copilot-Studio-to-Foundry-Foundry-to-Teams
```

## Step 2: Review the Repository Structure

```
teams-bot/                    # Your Teams bot
├── src/
│   ├── index.ts             # Express server with /health and /message endpoints
│   └── handlers/
│       └── claims.ts        # Azure OpenAI Chat Completions integration
├── package.json             # Node dependencies
├── tsconfig.json            # TypeScript config
├── .env.example             # Environment variable template
└── manifest.json            # Teams app configuration

corpus/
└── claims-corpus.md         # Sample agent instructions (embedded in code)
```

**Note**: The `corpus/claims-corpus.md` file shows an example. In Lab 2, you'll replace this with your actual Copilot Studio agent's instructions.

## Step 3: Install Bot Dependencies

Navigate to the bot directory and install npm packages:

```bash
cd teams-bot
npm install
```

Expected output:
```
added 84 packages in ~15s
```

## Step 4: Verify Your Setup

From the `teams-bot` directory, start the bot in development mode:

```bash
npm run dev
```

You should see:
```
Server is running on http://localhost:3978
```

The bot is now listening for messages. Open a **new terminal** and test the health endpoint:

```bash
curl http://localhost:3978/health
```

Expected response (before adding credentials):
```json
{
  "ok": true,
  "ready": false
}
```

The `ready: false` is expected—it means you haven't configured Azure OpenAI yet. Leave the bot running for Lab 3.

## ✅ Lab 1 Complete

You now have:
- ✅ Repository cloned and explored
- ✅ Bot dependencies installed
- ✅ Bot server running locally on port 3978
- ✅ Health endpoint working (ready: false until credentials added)

**Next Step:** Move to [Lab 2: Export from Copilot Studio & Configure Azure OpenAI](../lab-2-foundry/README.md)
