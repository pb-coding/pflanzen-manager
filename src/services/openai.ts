// Direct HTTP call to OpenAI's multimodal responses endpoint
const OPENAI_URL = 'https://api.openai.com/v1/responses';

/**
 * Interface for structured plant care tips returned by OpenAI
 */
export interface PlantCareTips {
  watering: string;
  fertilizing: string;
  repotting: string;
  location: string;
  health: string;
  spraying: string;
}

/**
 * Interface for the complete plant analysis result
 */
export interface PlantAnalysisResult {
  plantName: string;
  careTips: PlantCareTips;
}

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
 * Analyze a plant image and return comprehensive care information.
 * 
 * @param dataUrl Base64-encoded image data
 * @param plantInfo Optional plant information to provide context
 * @param roomInfo Optional room information to provide context
 * @param apiKey OpenAI API key
 * @returns Structured plant analysis with name and care tips
 * @throws {OpenAIError} If the API request fails or returns invalid data
 */
export async function analyzePlantImage(
  dataUrl: string,
  plantInfo: {
    name?: string;
    windowDistanceCm?: number;
    nearHeater?: boolean;
    sizeCm?: number;
    potSizeCm?: number;
  },
  roomInfo: {
    name?: string;
    lightDirection?: string;
    indoor?: boolean;
  },
  apiKey: string
): Promise<PlantAnalysisResult> {
  try {
    // Construct a detailed prompt with plant and room context
    let promptText = 'Du bist ein erfahrener Botaniker und Pflanzenexperte. ';
    promptText += 'Analysiere die Pflanze im Bild und gib detaillierte Pflegehinweise. ';
    
    // Add context information if available
    if (plantInfo.name) {
      promptText += `Die Pflanze ist vermutlich eine ${plantInfo.name}. `;
    }
    
    if (roomInfo.name || roomInfo.lightDirection || roomInfo.indoor !== undefined) {
      promptText += 'Standortinformationen: ';
      if (roomInfo.name) promptText += `Raum: ${roomInfo.name}. `;
      if (roomInfo.lightDirection) promptText += `Lichtrichtung: ${roomInfo.lightDirection}. `;
      if (roomInfo.indoor !== undefined) promptText += `${roomInfo.indoor ? 'Innenraum' : 'Außenbereich'}. `;
    }
    
    if (plantInfo.windowDistanceCm) promptText += `Abstand zum Fenster: ${plantInfo.windowDistanceCm} cm. `;
    if (plantInfo.nearHeater !== undefined) promptText += `${plantInfo.nearHeater ? 'Nahe einer Heizung' : 'Nicht nahe einer Heizung'}. `;
    if (plantInfo.sizeCm) promptText += `Pflanzengröße: ${plantInfo.sizeCm} cm. `;
    if (plantInfo.potSizeCm) promptText += `Topfdurchmesser: ${plantInfo.potSizeCm} cm. `;
    
    promptText += '\n\nBitte gib deine Antwort in folgendem JSON-Format zurück:\n';
    promptText += '{\n';
    promptText += '  "plantName": "Deutscher Pflanzenname",\n';
    promptText += '  "careTips": {\n';
    promptText += '    "watering": "Detaillierte Gießempfehlung mit Häufigkeit",\n';
    promptText += '    "fertilizing": "Detaillierte Düngeempfehlung mit Häufigkeit und Art",\n';
    promptText += '    "repotting": "Empfehlung zum Umtopfen inkl. Substrat",\n';
    promptText += '    "location": "Standortempfehlung basierend auf Licht und Temperatur",\n';
    promptText += '    "health": "Beurteilung des Gesundheitszustands und Maßnahmen",\n';
    promptText += '    "spraying": "Empfehlung zum Besprühen/Luftfeuchtigkeit"\n';
    promptText += '  }\n';
    promptText += '}';

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
                text: promptText,
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
    
    // Try to parse the JSON response
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      
      const jsonText = jsonMatch[0];
      const result = JSON.parse(jsonText) as PlantAnalysisResult;
      
      // Validate the structure
      if (!result.plantName || !result.careTips) {
        throw new Error('Invalid response structure');
      }
      
      // Ensure all care tip fields exist
      const defaultTip = 'Keine Information verfügbar.';
      const careTips: PlantCareTips = {
        watering: result.careTips.watering || defaultTip,
        fertilizing: result.careTips.fertilizing || defaultTip,
        repotting: result.careTips.repotting || defaultTip,
        location: result.careTips.location || defaultTip,
        health: result.careTips.health || defaultTip,
        spraying: result.careTips.spraying || defaultTip,
      };
      
      return {
        plantName: result.plantName,
        careTips,
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      
      // Fallback: Return just the plant name and generic tips
      return {
        plantName: await recognizePlantName(dataUrl, apiKey),
        careTips: {
          watering: 'Konnte keine spezifischen Informationen ermitteln.',
          fertilizing: 'Konnte keine spezifischen Informationen ermitteln.',
          repotting: 'Konnte keine spezifischen Informationen ermitteln.',
          location: 'Konnte keine spezifischen Informationen ermitteln.',
          health: 'Konnte keine spezifischen Informationen ermitteln.',
          spraying: 'Konnte keine spezifischen Informationen ermitteln.',
        },
      };
    }
  } catch (error) {
    // Re-throw OpenAIError instances
    if (error instanceof OpenAIError) {
      throw error;
    }
    
    // Convert other errors to OpenAIError
    throw new OpenAIError(
      error instanceof Error ? error.message : 'Unknown error during plant analysis',
      undefined,
      undefined,
      error
    );
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
