# Lab 1: Set Up Your Environment (15 min)

In this lab, you'll prepare your Azure resources and local development environment.

## Prerequisites

Before starting, ensure you have:

- ✅ **Azure Subscription** with an Azure AI / OpenAI resource
  - Must have a deployed **`gpt-4o`** model (or another LLM of your choice)
  - Note the **endpoint URL** and an **API key** (or use `az login` for Azure AD authentication)
- ✅ **GitHub Account** with git CLI
- ✅ **Node.js 18+** and npm installed
- ✅ **TypeScript** knowledge (basic familiarity with async/await, REST APIs)
- ✅ **Microsoft Teams Account** (optional for local testing; required for final deployment)

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/Deploy-Agent-from-Copilot-Studio-to-Foundry-Foundry-to-Teams.git
cd Deploy-Agent-from-Copilot-Studio-to-Foundry-Foundry-to-Teams
```

## Step 2: Review the Repository Structure

```
teams-bot/                    # Your Teams bot proxy
├── src/
│   ├── index.ts             # Express server with /health and /message endpoints
│   └── handlers/
│       └── claims.ts        # Azure Assistants API integration
├── package.json             # Node dependencies
├── tsconfig.json            # TypeScript config
├── .env.example             # Environment variable template
└── manifest.json            # Teams app configuration

foundry/
├── claims-assistant.agent.yaml   # Agent definition (optional, for reference)
└── search-index-schema.json      # Search config (optional)

corpus/
└── claims-corpus.md         # Sample agent instructions
```

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

The `ready: false` is expected—it means you haven't set credentials yet. Leave the bot running for Lab 3.

## ✅ Lab 1 Complete

You now have:
- ✅ Azure resources configured with a deployed LLM model
- ✅ Repository cloned and explored
- ✅ Bot dependencies installed
- ✅ Bot server running locally on port 3978
- ✅ Health endpoint working (ready: false until credentials added)

**Next Step:** Move to [Lab 2: Copilot Studio → Foundry](../lab-2-foundry/README.md)
