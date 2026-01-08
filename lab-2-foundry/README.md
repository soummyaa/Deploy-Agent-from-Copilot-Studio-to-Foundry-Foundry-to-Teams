# Lab 2: Export from Copilot Studio & Configure Azure OpenAI (15 min)

In this lab, you'll export your Copilot Studio agent's configuration and re-implement it using Azure OpenAI in GCC High (or commercial Azure).

---

## Understanding the Export Process

**Important**: You're not directly connecting Copilot Studio to Teams. Instead, you're:
1. Copying your agent's "brain" (instructions/prompts) from Copilot Studio
2. Recreating it in Azure OpenAI (which supports GCC High)
3. The Azure OpenAI model will behave like your Copilot Studio agent

**Why**: This allows deployment to GCC High Teams, where native Copilot Studio integration may not be available.

---

## Step 1: Export Your Agent from Copilot Studio

### 1.1 Access Your Copilot Studio Agent

1. Go to [Copilot Studio](https://copilotstudio.microsoft.com)
2. Sign in and open your existing agent
3. Navigate to **Settings** or the agent overview page

### 1.2 Copy Agent Instructions

1. Find your agent's **Instructions** or **System message** section
2. Copy the full instruction text - this defines your agent's behavior
3. Save it to a text file (e.g., `my-agent-instructions.txt`)

**Example instructions format:**
```
You are a helpful assistant for [your domain].
Your role is to [specific responsibilities].
When answering questions, you should [guidelines].
```

### 1.3 Export Knowledge Base (If Applicable)

If your agent uses knowledge sources:

1. Navigate to **Knowledge** or **Data sources** section
2. Note any files, websites, or documents your agent uses
3. Download files or note the URLs
4. You'll recreate this knowledge in Azure (see [KNOWLEDGE-SOURCES.md](../KNOWLEDGE-SOURCES.md) after completing this lab)

**For this lab**: We'll start with just the instructions. Knowledge sources are covered separately in the optional knowledge sources guide.

**Note**: If your Copilot Studio agent has complex topics, actions, or flows, you may need to translate these into system instructions manually. Start with the core instructions and iterate.

---

## Step 2: Choose Your Azure Environment

**For GCC High deployments**: Use [portal.azure.us](https://portal.azure.us) (Azure Government)  
**For Commercial deployments**: Use [portal.azure.com](https://portal.azure.com) (Commercial Azure)

**This lab focuses on GCC High**, but all steps work identically in commercial Azure—just use the appropriate portal and endpoint URLs.

---

## Step 3: Create Azure OpenAI Resource

1. Navigate to your Azure portal (commercial or government)
2. Click **"Create a resource"** → Search for **"Azure OpenAI"**
3. Click **"Create"**
4. Fill in the details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Region**: Choose a region with GPT-4o availability
     - **Commercial**: East US, West US, Sweden Central, etc.
     - **GCC High**: USGov Virginia, USGov Arizona
   - **Name**: e.g., `claims-bot-openai`
   - **Pricing Tier**: Standard S0
5. Click **"Review + create"** → **"Create"**
6. Wait ~2 minutes for deployment to complete

## Step 4: Deploy GPT Model

1. Go to your Azure OpenAI resource
2. Click **"Go to Azure OpenAI Studio"** (or navigate directly to studio)
   - **Commercial**: [oai.azure.com](https://oai.azure.com)
   - **GCC High**: [oai.azure.us](https://oai.azure.us)
3. In the Studio, click **"Deployments"** → **"Create new deployment"**
4. Fill in deployment details:
   - **Model**: `gpt-4o` (or `gpt-4` if 4o unavailable in your region)
   - **Deployment name**: `gpt-4o`
   - **Model version**: Latest available
   - **Deployment type**: Standard
   - **Tokens per minute rate limit**: 10K (or higher based on your quota)
5. Click **"Create"**
6. **Note the deployment name** (e.g., `gpt-4o`) - you'll need this

## Step 5: Get Your Credentials

From your Azure OpenAI resource in the portal:

1. Go to **"Keys and Endpoint"** (left sidebar)
2. Copy the following:
   - **Endpoint**: 
     - Commercial: `https://<your-resource-name>.openai.azure.com/`
     - GCC High: `https://<your-resource-name>.openai.azure.us/`
   - **API Key**: Copy **Key 1** or **Key 2**

### Alternative: Azure AD Authentication (Optional)

Instead of using API keys, you can use Azure AD:
1. Run `az login` to authenticate (use `az login --use-device-code` for government cloud)
2. Grant your account **"Cognitive Services OpenAI User"** role on the resource
3. Use `AZURE_OPENAI_API_KEY=USE_AZURE_AD_TOKEN` in your .env file

## Step 6: Configure the Bot with Your Agent's Instructions

Back in your `teams-bot` directory, you'll configure the bot with your Copilot Studio agent's behavior.

### 6.1 Update the System Instructions

Edit `teams-bot/src/handlers/claims.ts` and replace the `SYSTEM_INSTRUCTIONS` constant with your Copilot Studio agent's instructions:

```typescript
// Replace this with your actual Copilot Studio agent instructions
const SYSTEM_INSTRUCTIONS = `[Paste your Copilot Studio instructions here]`;
```

**Example**: If your Copilot Studio agent was for HR assistance:
```typescript
const SYSTEM_INSTRUCTIONS = `You are an HR assistant for Contoso Corporation.
Help employees with questions about benefits, PTO policies, and company procedures.
Be professional, accurate, and direct employees to HR for sensitive matters.`;
```

### 6.2 Create Environment Configuration

Create a `.env` file in the `teams-bot` directory:

```bash
# For Commercial Azure
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OP7NAI_API_VERSION=2024-08-01-preview
PORT=3978
```

**For GCC High**, update to government endpoints:
```bash
# For Azure Government (GCC High)
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.us
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-08-01-preview
AZURE_CLOUD=government
PORT=3978
```

Replace:
- `your-resource-name` with your actual resource name
- `your-api-key-here` with your copied API key
- `gpt-4o` with your deployment name if different

## Step 5: Test the Bot

With your bot still running (`npm run dev` from Lab 1), or restart it:

```bash
npm run dev
```

In a new terminal, test the message endpoint:

```bash
curl -X POST http://localhost:3978/message \
  -H "Content-Type: application/json" \
  -d '{"text":"[Ask a question your Copilot Studio agent would answer]"}'
```

**Example**: If you have a claims assistant:
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
    "text": "Filing a claim is straightforward... [AI response explaining the claims process]"
  }
}
```

Also verify the health endpoint now shows ready:

```bash
curl http://localhost:3978/health
```

Should return:
```json
{
  "ok": true,
  "rExported your Copilot Studio agent's instructions
- ✅ Azure OpenAI resource created (Commercial or GCC High)
- ✅ GPT-4o model deployed
- ✅ Bot configured with your agent's behavior
- ✅ API endpoint and credentials configured
- ✅ Bot successfully calling Azure OpenAI with your agent's instructions
- ✅ Local testing working

**Next Step:** Move to [Lab 3: Deploy to Teams](../lab-3-teams/README.md)

---

## Optional: Adding Knowledge Sources

If your Copilot Studio agent uses knowledge bases, you can enhance the Azure OpenAI implementation:

### Option 1: Use Azure AI Search
1. Create an Azure AI Search resource
2. Index your documents
3. Configure the bot to use search results in prompts

### Option 2: Use File Upload (for small knowledge bases)
1. Include knowledge in the system instructions
2. Or use the Assistants API with file uploads (more complex setup)

### Option 3: Embed Knowledge in Prompts
For small knowledge bases, add them directly to `SYSTEM_INSTRUCTIONS`:

```typescript
const SYSTEM_INSTRUCTIONS = `You are a helpful assistant.

Knowledge Base:
- Policy A: [details]
- Policy B: [details]

Use this knowledge when answering questions.`;
```
- ✅ Azure OpenAI resource created (Commercial or GCC High)
- ✅ GPT-4o model deployed
- ✅ API endpoint and credentials configured
- ✅ Bot successfully calling Azure OpenAI
- ✅ Local testing working

**Next Step:** Move to [Lab 3: Deploy to Teams](../lab-3-teams/README.md)
