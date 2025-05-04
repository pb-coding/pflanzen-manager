// Direct HTTP call to OpenAI's multimodal responses endpoint
const OPENAI_URL = 'https://api.openai.com/v1/responses';

/**
 * Recognize plant name from a base64-encoded image using OpenAI's multimodal responses endpoint.
 * Returns the common plant name as a string.
 */
export async function recognizePlantName(
  dataUrl: string,
  apiKey: string
): Promise<string> {
  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'You are a helpful botanist. Identify the plant species in the provided image. Respond with only the common plant name in german language.',
            },
            {
              type: 'input_image',
              image_url: dataUrl,
            },
          ],
        },
      ],
    }),
  });
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }
  // Parse multimodal response: data.output is an array of messages
  const data = await response.json();
  const firstMsg = Array.isArray(data.output) && data.output[0];
  const contents = firstMsg?.content;
  if (!Array.isArray(contents) || contents.length === 0) {
    throw new Error('No content returned from OpenAI');
  }
  // Find the first output_text block or default to first content
  const textBlock = contents.find((c: any) => c.type === 'output_text') || contents[0];
  const text = textBlock?.text;
  if (typeof text !== 'string' || text.trim() === '') {
    throw new Error('No content returned from OpenAI');
  }
  return text.trim();
}