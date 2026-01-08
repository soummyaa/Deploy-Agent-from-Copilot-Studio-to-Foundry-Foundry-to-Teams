# Adding Knowledge Sources from Copilot Studio

If your Copilot Studio agent uses knowledge sources (documents, websites, or files), you can recreate this functionality in your Azure OpenAI deployment. Here are three approaches, from simplest to most sophisticated.

---

## Option 1: Embed Knowledge in System Instructions (Simplest)

**Best for**: Small knowledge bases (< 1000 words), static information

**How it works**: Copy your knowledge content directly into the system instructions.

### Steps:

1. Export your knowledge from Copilot Studio (copy/paste from the UI)
2. Edit `teams-bot/src/handlers/claims.ts`
3. Add knowledge to the `SYSTEM_INSTRUCTIONS` constant:

```typescript
const SYSTEM_INSTRUCTIONS = `You are a helpful assistant.

Your Knowledge Base:
===================
Policy A: Employees can take up to 15 days PTO per year...
Policy B: Health insurance covers dental and vision...
Policy C: Remote work requires manager approval...

Instructions:
=============
When answering questions, refer to the knowledge base above.
If information isn't in the knowledge base, say so clearly.`;
```

**Pros**: 
- No additional Azure resources needed
- Works with both commercial and GCC High
- Fast and simple

**Cons**:
- Limited to ~4,000 tokens (around 3,000 words)
- Knowledge is static (requires code deployment to update)
- Not suitable for large documents

---

## Option 2: Use Azure AI Search (RAG Pattern - Recommended)

**Best for**: Large knowledge bases, multiple documents, dynamic content

**How it works**: Documents are indexed in Azure AI Search. When a user asks a question, relevant chunks are retrieved and sent to the LLM.

### Architecture:

```
User Question → Search for relevant docs → Include in prompt → GPT generates answer
```

### Steps:

#### 2.1 Create Azure AI Search Resource

1. Go to Azure Portal (portal.azure.com or portal.azure.us for GCC High)
2. Create **Azure AI Search** resource
3. Choose same region as your OpenAI resource
4. Pricing tier: Free or Basic (for testing)

#### 2.2 Index Your Documents

**Option A: Use Azure Portal**
1. Go to your Search resource → **Import data**
2. Choose data source (Azure Blob, Azure SQL, or upload files)
3. Configure index with fields: `id`, `content`, `title`, `metadata`
4. Enable **semantic search** if available in your tier

**Option B: Use Python Script**

```python
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.core.credentials import AzureKeyCredential

# Create search index
index_client = SearchIndexClient(
    endpoint="https://your-search.search.windows.net",
    credential=AzureKeyCredential("your-search-key")
)

# Define index schema
from azure.search.documents.indexes.models import SearchIndex, SimpleField, SearchableField

index = SearchIndex(
    name="copilot-knowledge",
    fields=[
        SimpleField(name="id", type="Edm.String", key=True),
        SearchableField(name="content", type="Edm.String"),
        SearchableField(name="title", type="Edm.String"),
    ]
)
index_client.create_index(index)

# Upload documents
search_client = SearchClient(
    endpoint="https://your-search.search.windows.net",
    index_name="copilot-knowledge",
    credential=AzureKeyCredential("your-search-key")
)

documents = [
    {"id": "1", "content": "Policy A content...", "title": "Policy A"},
    {"id": "2", "content": "Policy B content...", "title": "Policy B"},
]
search_client.upload_documents(documents)
```

#### 2.3 Update Bot to Use Search

Edit `teams-bot/src/handlers/claims.ts`:

```typescript
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";

const searchClient = new SearchClient(
  process.env.AZURE_SEARCH_ENDPOINT!,
  process.env.AZURE_SEARCH_INDEX!,
  new AzureKeyCredential(process.env.AZURE_SEARCH_KEY!)
);

export async function handleClaimsQuestion(text: string): Promise<string> {
  // ... existing code ...
  
  // Search for relevant documents
  const searchResults = await searchClient.search(text, {
    top: 3,
    select: ["content", "title"]
  });
  
  let knowledgeContext = "";
  for await (const result of searchResults.results) {
    knowledgeContext += `\n\n${result.document.title}:\n${result.document.content}`;
  }
  
  // Build enhanced prompt with retrieved knowledge
  const enhancedInstructions = `${SYSTEM_INSTRUCTIONS}

Relevant Knowledge:
${knowledgeContext}

Use the knowledge above to answer the user's question.`;

  const response = await axios.post(
    `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
    {
      messages: [
        { role: "system", content: enhancedInstructions },
        { role: "user", content: text }
      ],
      temperature: 0.7,
      max_tokens: 800
    },
    { headers: { "api-key": token, "Content-Type": "application/json" } }
  );

  return response.data.choices[0].message.content;
}
```

#### 2.4 Add Environment Variables

```bash
# .env
AZURE_SEARCH_ENDPOINT=https://your-search.search.windows.net
AZURE_SEARCH_INDEX=copilot-knowledge
AZURE_SEARCH_KEY=your-search-admin-key
```

#### 2.5 Install Dependencies

```bash
npm install @azure/search-documents
```

**Pros**:
- Handles large knowledge bases (GBs of documents)
- Semantic search finds most relevant content
- Easy to update knowledge without redeploying code
- Works in GCC High with Azure Government Search

**Cons**:
- Additional Azure resource (costs ~$75/month for Basic tier)
- More complex setup

---

## Option 3: Use Azure OpenAI Assistants API with File Upload

**Best for**: Medium-sized knowledge bases, conversation memory needed

**How it works**: Upload files to Azure OpenAI Assistants, which handles retrieval automatically.

### Steps:

#### 3.1 Switch to Assistants API

Follow the original lab approach (see git history for `claims.ts` with Assistants API implementation).

#### 3.2 Upload Knowledge Files

```bash
# Upload file to Assistants API
curl https://your-resource.openai.azure.com/openai/files \
  -H "api-key: YOUR_KEY" \
  -F purpose="assistants" \
  -F file="@/path/to/knowledge.txt"

# Get file ID from response
# Then create assistant with file search enabled
```

**Pros**:
- Built-in retrieval
- Conversation memory across threads
- No separate search resource needed

**Cons**:
- More complex code (polling, thread management)
- File size limits (512MB per file)
- May not be available in all GCC High regions

---

## Comparison Table

| Feature | Embed in Instructions | Azure AI Search (RAG) | Assistants API |
|---------|----------------------|----------------------|----------------|
| Setup Complexity | ⭐ Easy | ⭐⭐ Moderate | ⭐⭐⭐ Complex |
| Knowledge Size | Small (< 3KB) | Large (GBs) | Medium (< 512MB) |
| Update Frequency | Rare | Frequent | Moderate |
| GCC High Support | ✅ Yes | ✅ Yes | ⚠️ Limited |
| Additional Cost | None | ~$75/month | None |
| API Calls per Query | 1 | 2 (search + completion) | 5+ (threads/polling) |
| **Recommended For** | Quick demos | Production systems | Conversational agents |

---

## Recommendation for GCC High

For deploying a Copilot Studio agent to GCC High Teams:

1. **Start with Option 1** (embed knowledge) for proof of concept
2. **Move to Option 2** (Azure AI Search) for production with larger knowledge bases
3. **Avoid Option 3** (Assistants API) until confirmed available in your GCC High region

---

## Need Help?

- Azure AI Search docs: https://learn.microsoft.com/en-us/azure/search/
- RAG pattern guidance: https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-solution-design-and-evaluation-guide
- Azure Government services: https://learn.microsoft.com/en-us/azure/azure-government/
