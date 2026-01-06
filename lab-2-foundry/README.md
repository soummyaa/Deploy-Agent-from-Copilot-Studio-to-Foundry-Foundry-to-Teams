# Lab 2: Copilot Studio → Foundry (25 min)

In this lab, you'll create an AI agent in Copilot Studio and deploy it to Azure AI Foundry so your Teams bot can call it.

## Background: Two Paths to Foundry

You can deploy an agent to Foundry using:
- **Path A (Recommended)**: Azure OpenAI Assistants API (simple, works with gpt-4o)
- **Path B (Alternative)**: YAML-based Foundry agent (more advanced)

We'll use **Path A** for this lab.

## Step 1: Draft Your Agent in Copilot Studio

1. Go to [Copilot Studio](https://copilotstudio.microsoft.com)
2. Click **"Create"** → **"Agent"** → **"From blank"**
3. Name your agent (e.g., "Claims Assistant")
4. In the **Instructions** field, paste your agent's behavior:

```
You are a helpful claims assistant for an insurance company. 
Answer questions about filing claims, coverage eligibility, required documentation, 
and claim status. Be clear, professional, and direct. If you don't know the answer, 
say so and suggest contacting support.
```

5. Click **"Publish"** and wait for confirmation.

## Step 2: Create an Azure OpenAI Assistant (Path A)

In this step, you'll create an **Assistant** in your Azure OpenAI resource that implements the agent logic. The bot will call this assistant via the Assistants API.

### Option 1: Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your **Azure OpenAI resource**
3. Go to **Assistants playground** (or use the REST API)
4. Create a new assistant:
   - **Name**: Claims Assistant
   - **Model**: gpt-4o
   - **Instructions**: (paste from Step 1 above)
   - **Tools**: Enable "File search" and "Code interpreter" if desired
5. Click **Create**
6. Note the **Assistant ID** (e.g., `asst_dds1FHvF8FhQGm7BvG8tWMBR`)

### Option 2: Using Azure AI Foundry

1. Go to [Azure AI Foundry](https://ai.azure.com)
2. Under **Agents**, click **Create**
3. Fill in the same details as above
4. Note the **Assistant ID** once created

## Step 3: Get Your Foundry Credentials

From your Azure OpenAI resource:

1. Copy the **API Endpoint** (format: `https://<resource-name>.openai.azure.com/`)
2. Copy an **API Key** from **"Keys and Endpoint"** section
   - OR use Azure AD: Run `az login` to authenticate (bot will use `az account get-access-token`)

## ✅ Lab 2 Complete

You now have:
- ✅ Agent designed and published in Copilot Studio
- ✅ Azure OpenAI Assistant created with your instructions
- ✅ Assistant ID noted (e.g., `asst_dds1FHvF8FhQGm7BvG8tWMBR`)
- ✅ API endpoint and credentials ready

**Next Step:** Move to [Lab 3: Foundry → Teams](../lab-3-teams/README.md)
