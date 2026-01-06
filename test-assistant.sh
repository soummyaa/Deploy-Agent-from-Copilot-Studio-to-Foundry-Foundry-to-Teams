#!/bin/bash
# Test script for the Claims Assistant

TOKEN=$(az account get-access-token --resource https://cognitiveservices.azure.com --query accessToken -o tsv)
ASSISTANT_ID="asst_dds1FHvF8FhQGm7BvG8tWMBR"
BASE_URL="https://admin-0416-resource.openai.azure.com/openai"

echo "1. Creating thread..."
THREAD_JSON=$(curl -s -X POST "${BASE_URL}/threads?api-version=2024-05-01-preview" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json")
THREAD_ID=$(echo $THREAD_JSON | jq -r '.id')
echo "Thread ID: $THREAD_ID"

echo "2. Adding message..."
curl -s -X POST "${BASE_URL}/threads/${THREAD_ID}/messages?api-version=2024-05-01-preview" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"role":"user","content":"Hello, what can you help me with?"}' | jq '.id'

echo "3. Starting run..."
RUN_JSON=$(curl -s -X POST "${BASE_URL}/threads/${THREAD_ID}/runs?api-version=2024-05-01-preview" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"assistant_id\":\"${ASSISTANT_ID}\"}")
echo "$RUN_JSON" | jq '{id, status}'
