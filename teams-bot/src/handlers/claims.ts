import axios from "axios";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// System instructions for the assistant
// TODO: Replace this with your Copilot Studio agent's instructions
const SYSTEM_INSTRUCTIONS = process.env.AGENT_INSTRUCTIONS || `You are a helpful claims assistant for an insurance company. 
Answer questions about filing claims, coverage eligibility, required documentation, 
and claim status. Be clear, professional, and direct. If you don't know the answer, 
say so and suggest contacting support.`;

async function getAzureToken(): Promise<string> {
  const configuredToken = process.env.AZURE_OPENAI_API_KEY || "";
  if (configuredToken && configuredToken !== "USE_AZURE_AD_TOKEN") {
    return configuredToken;
  }
  
  // Determine resource endpoint based on cloud environment
  const cloudType = process.env.AZURE_CLOUD || "commercial";
  const resource = cloudType === "government" 
    ? "https://cognitiveservices.azure.us"
    : "https://cognitiveservices.azure.com";
  
  try {
    const { stdout } = await execAsync(
      `az account get-access-token --resource ${resource} --query accessToken -o tsv`
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
  
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview";
  
  if (!endpoint) {
    throw new Error("AZURE_OPENAI_ENDPOINT is missing");
  }

  const token = await getAzureToken();
  
  // Simple single API call to Chat Completions
  const response = await axios.post(
    `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
    {
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTIONS },
        { role: "user", content: text }
      ],
      temperature: 0.7,
      max_tokens: 800
    },
    {
      headers: {
        "api-key": token,
        "Content-Type": "application/json",
      }
    }
  );

  return response.data.choices[0].message.content;
}
