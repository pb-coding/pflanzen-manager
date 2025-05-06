// Direct HTTP call to OpenAI's multimodal responses endpoint
const OPENAI_URL = 'https://api.openai.com/v1/responses';

/**
 * Error class for OpenAI API errors with additional details
 */
export class OpenAIError extends Error {
  status?: number;
  statusText?: string;
  details?: any;

  constructor(message: string, status?: number, statusText?: string, details?: any) {
    super(message);
    this.name = 'OpenAIError';
    this.status = status;
    this.statusText = statusText;
    this.details = details;
  }
}

/**
 * Recognize plant name from a base64-encoded image using OpenAI's multimodal responses endpoint.
 * Returns the common plant name as a string.
 * 
 * @throws {OpenAIError} If the API request fails or returns invalid data
 */
export async function recognizePlantName(
  dataUrl: string,
  apiKey: string
): Promise<string> {
  try {
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

    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      throw new OpenAIError(
        `OpenAI API error: ${response.status} ${response.statusText}`,
        response.status,
        response.statusText,
        errorText
      );
    }

    // Parse response
    const data = await response.json();
    
    // Validate response structure
    const firstMsg = Array.isArray(data.output) && data.output[0];
    const contents = firstMsg?.content;
    
    if (!Array.isArray(contents) || contents.length === 0) {
      throw new OpenAIError('Invalid response format from OpenAI', undefined, undefined, data);
    }
    
    // Find the first output_text block or default to first content
    const textBlock = contents.find((c: any) => c.type === 'output_text') || contents[0];
    const text = textBlock?.text;
    
    if (typeof text !== 'string' || text.trim() === '') {
      throw new OpenAIError('No text content returned from OpenAI', undefined, undefined, data);
    }
    
    return text.trim();
  } catch (error) {
    // Re-throw OpenAIError instances
    if (error instanceof OpenAIError) {
      throw error;
    }
    
    // Convert other errors to OpenAIError
    throw new OpenAIError(
      error instanceof Error ? error.message : 'Unknown error during plant recognition',
      undefined,
      undefined,
      error
    );
  }
}
