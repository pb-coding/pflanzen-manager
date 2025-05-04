/**
 * OpenAI API integration for image-based plant recognition and tip generation.
 */
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Recognize plant name from base64 image using GPT-4o.
 * Returns the plant name as string.
 */
export async function recognizePlantName(
  dataUrl: string,
  apiKey: string
): Promise<string> {
  const systemMessage: ChatMessage = {
    role: 'system',
    content: 'You are a helpful botanist. Identify the plant species in the provided image. Respond with only the common plant name.',
  };
  const userMessage: ChatMessage = {
    role: 'user',
    content: `Image (base64): ${dataUrl}`,
  };
  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [systemMessage, userMessage],
    }),
  });
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  const msg = data.choices?.[0]?.message?.content;
  if (!msg) {
    throw new Error('No content returned from OpenAI');
  }
  return msg.trim();
}