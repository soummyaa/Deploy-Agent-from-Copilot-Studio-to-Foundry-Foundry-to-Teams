import axios from "axios";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function getAzureToken(): Promise<string> {
  const configuredToken = process.env.FOUNDRY_AGENT_TOKEN || "";
  if (configuredToken && configuredToken !== "USE_AZURE_AD_TOKEN") {
    return configuredToken;
  }
  try {
    const { stdout } = await execAsync(
      "az account get-access-token --resource https://cognitiveservices.azure.com --query accessToken -o tsv"
    );
    return stdout.trim();
  } catch (error) {
    throw new Error("Failed to get Azure AD token. Make sure you're logged in with 'az login'");
  }
}

export async function handleClaimsQuestion(text: string): Promise<string> {
  if (!text || typeof text !== "string") {
    throw new Error("text is required");
  }
  const foundryUrl = process.env.FOUNDRY_AGENT_URL || "";
  if (!foundryUrl) {
    throw new Error("FOUNDRY_AGENT_URL is missing");
  }

  // Get assistant ID and base OpenAI URL from configured Foundry URL
  const url = new URL(foundryUrl);
  const segments = url.pathname.split("/").filter(Boolean);
  const assistantId = segments[segments.length - 1];
  const baseUrl = `${url.origin}/openai`;
  
  const token = await getAzureToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Step 1: Create a thread
  const threadResp = await axios.post(
    `${baseUrl}/threads?api-version=2024-05-01-preview`,
    {},
    { headers }
  );
  const threadId = threadResp.data.id;

  // Step 2: Add message to thread
  await axios.post(
    `${baseUrl}/threads/${threadId}/messages?api-version=2024-05-01-preview`,
    {
      role: "user",
      content: text,
    },
    { headers }
  );

  // Step 3: Run the assistant
  const runResp = await axios.post(
    `${baseUrl}/threads/${threadId}/runs?api-version=2024-05-01-preview`,
    {
      assistant_id: assistantId,
    },
    { headers }
  );
  const runId = runResp.data.id;

  // Step 4: Poll for completion
  let runStatus = "queued";
  let attempts = 0;
  while (runStatus !== "completed" && attempts < 30) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const statusResp = await axios.get(
      `${baseUrl}/threads/${threadId}/runs/${runId}?api-version=2024-05-01-preview`,
      { headers }
    );
    runStatus = statusResp.data.status;
    attempts++;

    if (runStatus === "failed" || runStatus === "cancelled") {
      throw new Error(`Assistant run ${runStatus}`);
    }
  }

  if (runStatus !== "completed") {
    throw new Error("Assistant run timed out");
  }

  // Step 5: Get messages
  const messagesResp = await axios.get(
    `${baseUrl}/threads/${threadId}/messages?api-version=2024-05-01-preview`,
    { headers }
  );

  const assistantMessages = messagesResp.data.data.filter((msg: any) => msg.role === "assistant");
  if (assistantMessages.length > 0) {
    const content = assistantMessages[0].content[0];
    return content.text?.value || JSON.stringify(content);
  }

  throw new Error("No response from assistant");
}
