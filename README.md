# Deploy an AI Agent from Copilot Studio → Foundry → Teams

Welcome! This lab guides you through deploying an AI-powered claims assistant from **Copilot Studio** to **Azure AI Foundry** to **Microsoft Teams** in three manageable steps. By the end, you'll have a working bot in Teams that calls an AI agent hosted in Azure.

**Total time: ~60 minutes**

---

## Architecture Overview

Your deployment journey spans three stages:

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Copilot Studio  │  →   │  Azure AI Foundry│  →   │ Microsoft Teams  │
│  (Draft Agent)   │      │  (Host Agent)    │      │  (User Interface)│
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

1. **Copilot Studio**: Where you design the agent's behavior and instructions
2. **Azure AI Foundry**: Where the agent runs (using Azure OpenAI Assistants API)
3. **Teams**: Where end-users interact with the agent

Your Teams bot is a lightweight **proxy** (Node.js + Express) that:
- Receives messages from Teams users
- Forwards them to your Foundry-hosted agent
- Returns the agent's response back to Teams

---

## Start Your Labs

Follow the three labs in order. Each lab is contained in its own folder with step-by-step instructions:

### 1. [Lab 1: Set Up Your Environment](./lab-1-setup/README.md) (15 min)
   - Clone repository
   - Install dependencies
   - Verify bot setup locally
   
### 2. [Lab 2: Copilot Studio → Foundry](./lab-2-foundry/README.md) (25 min)
   - Draft agent in Copilot Studio
   - Deploy to Azure OpenAI Assistants
   - Get credentials
   
### 3. [Lab 3: Foundry → Teams](./lab-3-teams/README.md) (20 min)
   - Configure bot with Foundry credentials
   - Test locally
   - Package and deploy to Microsoft Teams

---

## Quick Reference

### Repository Structure

```
lab-1-setup/                  # Lab 1 folder with setup instructions
lab-2-foundry/                # Lab 2 folder with Foundry agent instructions
lab-3-teams/                  # Lab 3 folder with Teams deployment instructions

teams-bot/                    # Your Teams bot proxy code
├── src/
│   ├── index.ts             # Express server
│   └── handlers/claims.ts   # Assistants API integration
├── package.json             # Dependencies
└── manifest.json            # Teams app configuration

foundry/
├── claims-assistant.agent.yaml   # Agent definition example
└── search-index-schema.json      # Search index schema

corpus/
└── claims-corpus.md         # Sample instructions
```

### Key Commands

```bash
# Lab 1: Setup
cd teams-bot && npm install && npm run dev

# Lab 3: Test locally
curl -X POST http://localhost:3978/message \
  -H "Content-Type: application/json" \
  -d '{"text":"What should I know about filing a claim?"}'
```

---

## Troubleshooting & Resources

Common issues are covered in each lab's README. For additional help:

- [Copilot Studio Documentation](https://learn.microsoft.com/en-us/microsoft-cloud/copilot/copilot-studio-overview)
- [Azure OpenAI Assistants API](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/assistant)
- [Teams Bot Development](https://learn.microsoft.com/en-us/microsoftteams/platform/bots/what-are-bots)
- [Teams App Manifest Schema](https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema)

---

## Ready to Start?

Begin with **[Lab 1: Set Up Your Environment](./lab-1-setup/README.md)** →
