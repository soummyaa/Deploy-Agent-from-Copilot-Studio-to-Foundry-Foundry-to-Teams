# Testing Without GCC High Access

Don't have access to a GCC High environment? No problem! You can test this entire lab using **commercial Azure and Teams**. The code is identical—only the configuration changes.

---

## Quick Start: Testing in Commercial Azure

### Step 1: Use Commercial Azure Portal

Instead of `portal.azure.us`, use `portal.azure.com`

### Step 2: Create Azure OpenAI Resource (Commercial)

1. Go to [portal.azure.com](https://portal.azure.com)
2. Create **Azure OpenAI** resource
3. Deploy **gpt-4o** or **gpt-4** model
4. Get your endpoint and API key

### Step 3: Configure for Commercial Azure

Create `teams-bot/.env`:

```bash
# Commercial Azure Configuration
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-08-01-preview
PORT=3978

# Note: No AZURE_CLOUD variable needed for commercial
```

**Key difference from GCC High:**
- Endpoint uses `.azure.com` instead of `.azure.us`
- No `AZURE_CLOUD=government` variable needed

### Step 4: Export Your Copilot Studio Agent

1. Go to [copilotstudio.microsoft.com](https://copilotstudio.microsoft.com)
2. Open your agent
3. Copy the system instructions
4. Edit `teams-bot/src/handlers/claims.ts` and replace `SYSTEM_INSTRUCTIONS`

### Step 5: Test Locally

```bash
cd teams-bot
npm install
npm run dev
```

In another terminal:
```bash
# Test health endpoint
curl http://localhost:3978/health

# Test with a question
curl -X POST http://localhost:3978/message \
  -H "Content-Type: application/json" \
  -d '{"text":"What can you help me with?"}'
```

You should get a real AI response!

### Step 6: Deploy to Commercial Teams

1. Create Azure Bot in commercial Azure portal
2. Use [teams.microsoft.com](https://teams.microsoft.com) instead of teams.microsoft.us
3. Follow Lab 3 instructions using commercial portal URLs

---

## Testing Strategy: Commercial → GCC High

**Recommended approach for GCC High customers:**

### Phase 1: Prototype in Commercial (You Are Here)
- ✅ Faster to set up (no government approvals needed)
- ✅ Test and iterate quickly
- ✅ Verify your Copilot Studio agent export works
- ✅ Debug issues in a familiar environment

### Phase 2: Migrate to GCC High (Production)
Once your prototype works in commercial Azure:

1. **Request GCC High Access**
   - Azure Government subscription
   - GCC High Teams environment

2. **Recreate Resources in Azure Government**
   - Portal: portal.azure.us
   - Create same resources (Azure OpenAI, Bot Service)

3. **Update Configuration Only**
   ```bash
   # Change from:
   AZURE_OPENAI_ENDPOINT=https://resource.openai.azure.com
   
   # To:
   AZURE_OPENAI_ENDPOINT=https://resource.openai.azure.us
   AZURE_CLOUD=government
   ```

4. **Redeploy to GCC High Teams**
   - Use teams.microsoft.us
   - Upload same app package
   - Test with GCC High users

**Code is 100% identical** - only configuration changes!

---

## Side-by-Side Comparison

| Component | Commercial Azure | GCC High (Azure Government) |
|-----------|-----------------|------------------------------|
| **Azure Portal** | portal.azure.com | portal.azure.us |
| **Copilot Studio** | copilotstudio.microsoft.com | Limited/Not Available |
| **OpenAI Studio** | oai.azure.com | oai.azure.us |
| **OpenAI Endpoint** | `*.openai.azure.com` | `*.openai.azure.us` |
| **Teams** | teams.microsoft.com | teams.microsoft.us |
| **Bot Code** | Identical | Identical |
| **Environment Variable** | (none) | `AZURE_CLOUD=government` |
| **Approval Requirements** | Minimal | May require admin approval |
| **Available Models** | All latest | Subset (check availability) |

---

## Cost Comparison

Testing in commercial Azure first is also **cheaper**:

| Resource | Commercial | GCC High |
|----------|-----------|----------|
| Azure OpenAI | Standard pricing | 10-20% premium |
| Bot Service | Free tier available | Same |
| App Service | Standard pricing | 10-20% premium |

**Recommendation**: Do all development and testing in commercial, then deploy to GCC High for production.

---

## Complete Testing Workflow

```bash
# 1. Clone the repo
git clone <repo-url>
cd Deploy-Agent-from-Copilot-Studio-to-Foundry-Foundry-to-Teams

# 2. Export your Copilot Studio agent
# (Copy instructions from Copilot Studio)

# 3. Create commercial Azure OpenAI resource
# (Use portal.azure.com)

# 4. Configure the bot
cd teams-bot
cp .env.example .env
# Edit .env with your commercial Azure credentials

# 5. Install and test
npm install
npm run dev

# 6. In another terminal, test it
curl -X POST http://localhost:3978/message \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, can you help me?"}'

# 7. Deploy to commercial Teams (optional)
# Follow Lab 3 using portal.azure.com

# 8. Once working, migrate to GCC High
# Update .env with GCC High endpoints
# Redeploy to Azure Government
```

---

## Common Questions

### Q: Will testing in commercial Azure give me the same results as GCC High?

**A**: Yes! The AI models, API behavior, and code are identical. Only the infrastructure location changes.

### Q: Can I use the same Copilot Studio agent for both?

**A**: Yes! Export once from Copilot Studio, use in both environments.

### Q: Do I need two separate codebases?

**A**: No! Same code, just different `.env` configuration files.

### Q: What if I don't have a Copilot Studio agent yet?

**A**: The repo includes sample instructions for a claims assistant. You can test with those, then replace with your own agent later.

---

## Sample Test Commands

Once your bot is running with commercial Azure OpenAI:

```bash
# Test 1: Health check
curl http://localhost:3978/health
# Expected: {"ok":true,"ready":true}

# Test 2: Simple question
curl -X POST http://localhost:3978/message \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, who are you?"}'

# Test 3: Domain-specific question (if using claims assistant example)
curl -X POST http://localhost:3978/message \
  -H "Content-Type: application/json" \
  -d '{"text":"How do I file a claim?"}'

# Test 4: Knowledge question (tests if your instructions are working)
curl -X POST http://localhost:3978/message \
  -H "Content-Type: application/json" \
  -d '{"text":"What services do you provide?"}'
```

---

## Ready to Start?

1. **If you have commercial Azure**: Start with [Lab 1](./lab-1-setup/README.md) and use commercial portal URLs
2. **If you have GCC High**: Follow labs as written
3. **If you have neither**: Create a free Azure account at [azure.microsoft.com/free](https://azure.microsoft.com/free)

The lab works in both environments—test where it's easiest for you! 🚀
