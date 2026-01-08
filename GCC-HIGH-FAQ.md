# GCC High Deployment FAQ

Frequently asked questions about deploying Copilot Studio agents to GCC High Teams.

---

## General Questions

### Q: Can I use Copilot Studio directly in GCC High Teams?

**A**: As of January 2026, native Copilot Studio integration with GCC High Teams is limited or unavailable. Microsoft is working on bringing more AI services to government clouds, but timelines vary.

This lab provides a **workaround**: migrate your agent design to Azure Government OpenAI and deploy via a custom bot.

---

### Q: Is this a native integration or a migration?

**A**: This is a **migration/export approach**, not native integration. You:
1. Design your agent in Copilot Studio (commercial)
2. Export the instructions and configuration
3. Re-implement in Azure Government OpenAI
4. Deploy to GCC High Teams via custom bot

The agent behaves the same way, but runs on GCC High infrastructure.

---

### Q: Will my agent have the exact same capabilities?

**A**: **Mostly yes**, but with some differences:

**What carries over:**
- ✅ Agent instructions and personality
- ✅ Question-answering behavior
- ✅ Conversation style
- ✅ Knowledge base (with setup - see KNOWLEDGE-SOURCES.md)
- ✅ Basic conversation flow

**What doesn't carry over automatically:**
- ❌ Copilot Studio's visual topic editor (you'll use text-based instructions)
- ❌ Power Automate flows (need to implement separately)
- ❌ Advanced actions (need custom code)
- ❌ Built-in Copilot Studio analytics (use Application Insights instead)

---

### Q: Is this approach compliant with FedRAMP High / DoD requirements?

**A**: Yes, if properly configured:

✅ **Compliant components:**
- Azure Government OpenAI (FedRAMP High authorized)
- Azure Government Bot Service (FedRAMP High authorized)
- GCC High Teams (FedRAMP High authorized)
- All data stays in Azure Government regions

⚠️ **Important compliance steps:**
1. Use Azure Government portal (portal.azure.us) for ALL resource creation
2. Never configure endpoints pointing to commercial Azure
3. Use government cloud endpoints (`.azure.us`, not `.azure.com`)
4. Follow your organization's security policies for API keys/secrets
5. Enable audit logging and monitoring

❌ **What's NOT compliant:**
- Designing in commercial Copilot Studio exposes configuration to commercial cloud
- Only the DESIGN happens there; all runtime is in GCC High

**Recommendation**: Treat Copilot Studio as a design tool only. Don't put sensitive data in it. Export generic instructions and configure sensitive details in Azure Government.

---

## Technical Questions

### Q: What Azure OpenAI models are available in GCC High?

**A**: As of 2026, Azure Government OpenAI typically supports:
- ✅ GPT-4 (various versions)
- ✅ GPT-3.5-turbo
- ⚠️ GPT-4o (check availability in your region)

**Check current availability:** https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#model-summary-table-and-region-availability

Not all models available in commercial Azure are immediately available in GCC High. Plan accordingly.

---

### Q: Do I need separate Azure subscriptions for commercial and GCC High?

**A**: Yes, typically:
- **Commercial Azure subscription**: Optional, only if you want to use commercial Copilot Studio for design
- **Azure Government subscription**: Required for GCC High deployment

They are separate tenants with separate billing.

---

### Q: Can I test in commercial Azure first, then move to GCC High?

**A**: Yes! Recommended approach:

1. **Prototype in commercial Azure:**
   - Use commercial Copilot Studio
   - Deploy to commercial Azure OpenAI
   - Test in commercial Teams
   - Iterate quickly

2. **Migrate to GCC High:**
   - Copy your `.env` configuration
   - Change endpoints to `.azure.us`
   - Set `AZURE_CLOUD=government`
   - Redeploy to Azure Government

Code is identical; only configuration changes.

---

### Q: What about knowledge sources / RAG in GCC High?

**A**: Azure AI Search is available in Azure Government and fully supports GCC High.

**To add knowledge:**
1. Create Azure AI Search in Azure Government (portal.azure.us)
2. Index your documents
3. Update bot code to query search before calling OpenAI
4. See [KNOWLEDGE-SOURCES.md](./KNOWLEDGE-SOURCES.md) for implementation

This provides the same retrieval-augmented generation (RAG) as Copilot Studio's knowledge sources.

---

### Q: Can I use Azure AD authentication instead of API keys?

**A**: Yes, and it's recommended for production:

```bash
# Login to Azure Government
az cloud set --name AzureUSGovernment
az login

# The bot will automatically get tokens
export AZURE_OPENAI_API_KEY=USE_AZURE_AD_TOKEN
```

Assign the **"Cognitive Services OpenAI User"** role to your identity or managed identity.

---

## Deployment Questions

### Q: Do I need approval to upload custom apps to GCC High Teams?

**A**: Usually yes. GCC High Teams has stricter app governance:
- Custom app uploads may be disabled by default
- IT admin must approve or whitelist your app ID
- Some organizations require security review

**Action**: Contact your Teams admin early in the process.

---

### Q: Can I use ngrok for local testing in GCC High?

**A**: Check your organization's policies:
- ✅ ngrok works technically with GCC High Teams
- ⚠️ Some organizations block external tunneling services
- Alternative: Deploy to Azure App Service with HTTPS for testing

---

### Q: How do I host the bot in production?

**A**: Recommended options for Azure Government:

1. **Azure App Service** (recommended)
   - Fully managed
   - HTTPS included
   - Easy scaling
   - FedRAMP High authorized

2. **Azure Container Instances**
   - Docker-based
   - Simple deployment
   - Good for small workloads

3. **Azure Kubernetes Service (AKS)**
   - For complex/large deployments
   - More management overhead

All are available in Azure Government and support GCC High compliance.

---

### Q: What about conversation history?

**A**: This basic implementation doesn't store conversation history. To add:

**Option 1: Client-side history**
```typescript
// Store last N messages in memory, send to GPT
const conversationHistory = [...previousMessages, newMessage];
```

**Option 2: Azure Cosmos DB**
- Store conversations in Cosmos DB (available in Azure Government)
- Retrieve on each message
- Full conversation context

**Option 3: Use Assistants API**
- Built-in thread management
- Check availability in your Azure Government region first

---

## Cost Questions

### Q: What are the costs for this solution?

**A**: Estimated monthly costs for moderate usage (1000 conversations/month):

| Component | Cost |
|-----------|------|
| Azure OpenAI (GPT-4) | ~$30-100 (depends on usage) |
| Azure Bot Service | Free (F0) or ~$0.50 per 1000 messages |
| Azure App Service | ~$55/month (B1 tier) |
| Azure AI Search (optional) | ~$75/month (Basic tier) |
| **Total** | **~$160-230/month** |

**Cost optimization:**
- Use GPT-3.5-turbo instead of GPT-4 (much cheaper)
- Use consumption-based App Service plan
- Start without AI Search, add later if needed

---

### Q: Are GCC High prices different from commercial?

**A**: Yes, Azure Government services are typically **10-20% more expensive** than commercial Azure, but pricing varies by service. Check current pricing:
- https://azure.microsoft.com/en-us/pricing/details/azure-government/

---

## Support Questions

### Q: Who do I contact for help?

**A**: Depends on the issue:

| Issue | Contact |
|-------|---------|
| Copilot Studio questions | Microsoft Copilot Studio support |
| Azure Government access | Your Azure Government account team |
| GCC High Teams | Microsoft 365 GCC High support |
| This lab/code | GitHub issues in this repo |
| FedRAMP compliance | Your organization's compliance team |

---

### Q: Is this Microsoft-supported?

**A**: Partially:
- ✅ Azure OpenAI in Azure Government: Fully supported by Microsoft
- ✅ Teams Bot Framework: Fully supported
- ⚠️ Custom bot code (this lab): Community-supported (not official Microsoft product)
- ⚠️ Copilot Studio → Azure OpenAI migration: Manual process, not official Microsoft migration path

For production deployments, consider working with a Microsoft partner experienced in government cloud AI solutions.

---

## Next Steps

After reading this FAQ:
1. Review your organization's compliance requirements
2. Confirm access to Azure Government and GCC High Teams
3. Get approval for custom Teams app deployment
4. Start with [Lab 1](./lab-1-setup/README.md)

---

## Additional Resources

- [Azure Government documentation](https://learn.microsoft.com/en-us/azure/azure-government/)
- [GCC High overview](https://learn.microsoft.com/en-us/office365/servicedescriptions/office-365-platform-service-description/office-365-us-government/gcc-high-and-dod)
- [Azure OpenAI in Government Cloud](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/use-your-data)
- [FedRAMP authorized services](https://marketplace.fedramp.gov/)
