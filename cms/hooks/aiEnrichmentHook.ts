/**
 * INFUSIO STUDIO CMS - AUTOMATED AI ENRICHMENT LIFECYCLE HOOK
 *
 * Automatically inspects incoming collection documents for empty SEO & accessibility fields.
 * If fields are missing, asynchronously calls the generative AI platform using PROCESS_AI_SECRET_KEY
 * to generate optimized titles, meta descriptions, and image alt text before committing to storage.
 */

export interface ArticleDocument {
  id?: string;
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  imageAltText?: string;
  featuredImageUrl?: string;
  [key: string]: unknown;
}

export interface BeforeChangeHookArgs<T = ArticleDocument> {
  data: T;
  req?: unknown;
  operation?: 'create' | 'update';
  originalDoc?: T;
}

export interface AIGenerationResponse {
  metaTitle?: string;
  metaDescription?: string;
  imageAltText?: string;
}

/**
 * Invokes external Generative AI endpoint to synthesize metadata
 */
async function requestAIMetadataGeneration(
  doc: ArticleDocument,
  missingFields: string[],
  apiKey: string
): Promise<AIGenerationResponse> {
  const prompt = `
You are an expert SEO specialist and technical content editor.
Generate clean, highly-engaging SEO and accessibility metadata for the following article:

Article Title: "${doc.title || 'Untitled'}"
Article Excerpt: "${doc.excerpt || ''}"
Article Content Sample: "${(doc.content || '').substring(0, 1000)}"
Image Context: "${doc.featuredImageUrl || 'Hero illustration for the article'}"

Missing Fields required to generate: ${missingFields.join(', ')}

Return ONLY a valid JSON object matching this TypeScript structure:
{
  ${missingFields.includes('metaTitle') ? '"metaTitle": "Compelling Title under 60 characters",' : ''}
  ${missingFields.includes('metaDescription') ? '"metaDescription": "Concise summary under 155 characters",' : ''}
  ${missingFields.includes('imageAltText') ? '"imageAltText": "Clear descriptive accessibility alt text"' : ''}
}
Do not wrap in markdown quotes if possible, or return raw json.
`.trim();

  try {
    // Generative AI API Call using the secure environment variable
    const response = await fetch(
      process.env.AI_ENDPOINT_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL_NAME || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an automated headless CMS assistant. Respond with strict JSON only.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 300,
        }),
      }
    );

    if (!response.ok) {
      console.warn(
        `[Infusio AI Hook] External AI API returned HTTP ${response.status}: ${await response.text()}`
      );
      // Fallback heuristic generator if API returns non-200
      return generateFallbackMetadata(doc, missingFields);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    
    // Clean potential markdown triple-backticks
    const cleanedJson = rawContent.replace(/^```json\s*|\s*```$/g, '').trim();
    const parsed: AIGenerationResponse = JSON.parse(cleanedJson);
    return parsed;
  } catch (err) {
    console.warn('[Infusio AI Hook] Failed to call external AI service, using fallback heuristic:', err);
    return generateFallbackMetadata(doc, missingFields);
  }
}

/**
 * Fallback heuristic generator when API is unreachable or during local tests without API key
 */
function generateFallbackMetadata(doc: ArticleDocument, missingFields: string[]): AIGenerationResponse {
  const result: AIGenerationResponse = {};

  if (missingFields.includes('metaTitle')) {
    result.metaTitle = `${doc.title || 'Untitled Article'} | Infusio Studio`.substring(0, 60);
  }

  if (missingFields.includes('metaDescription')) {
    const rawDesc = doc.excerpt || doc.content || doc.title || 'Read the latest insights from Infusio Studio.';
    result.metaDescription = rawDesc.replace(/<[^>]*>?/gm, '').substring(0, 150).trim();
  }

  if (missingFields.includes('imageAltText')) {
    result.imageAltText = `Visual illustration for ${doc.title || 'featured article'}`;
  }

  return result;
}

/**
 * Asynchronous beforeChange Lifecycle Hook for Collections
 */
export async function aiEnrichmentHook({
  data,
  operation,
}: BeforeChangeHookArgs<ArticleDocument>): Promise<ArticleDocument> {
  // Only execute on create or update mutations
  if (operation !== 'create' && operation !== 'update') {
    return data;
  }

  // 1. Identify missing or empty SEO / accessibility fields
  const missingFields: string[] = [];

  const isEmpty = (val: unknown): boolean =>
    val === undefined || val === null || (typeof val === 'string' && val.trim() === '');

  if (isEmpty(data.metaTitle)) missingFields.push('metaTitle');
  if (isEmpty(data.metaDescription)) missingFields.push('metaDescription');
  if (isEmpty(data.imageAltText)) missingFields.push('imageAltText');

  // If all fields are already populated by author, proceed without triggering AI
  if (missingFields.length === 0) {
    return data;
  }

  const apiKey = process.env.PROCESS_AI_SECRET_KEY;

  if (!apiKey) {
    console.info(
      `[Infusio AI Hook] Missing PROCESS_AI_SECRET_KEY environment variable. Generating fallback heuristic metadata for [${missingFields.join(', ')}].`
    );
    const fallbacks = generateFallbackMetadata(data, missingFields);
    return {
      ...data,
      ...fallbacks,
    };
  }

  console.info(
    `[Infusio AI Hook] Missing fields detected [${missingFields.join(', ')}]. Calling Generative AI service...`
  );

  // 2. Securely call Generative AI API
  const aiGenerated = await requestAIMetadataGeneration(data, missingFields, apiKey);

  // 3. Cleanly map returned values back into CMS fields
  if (missingFields.includes('metaTitle') && aiGenerated.metaTitle) {
    data.metaTitle = aiGenerated.metaTitle.slice(0, 70);
  }

  if (missingFields.includes('metaDescription') && aiGenerated.metaDescription) {
    data.metaDescription = aiGenerated.metaDescription.slice(0, 160);
  }

  if (missingFields.includes('imageAltText') && aiGenerated.imageAltText) {
    data.imageAltText = aiGenerated.imageAltText.slice(0, 125);
  }

  console.info('[Infusio AI Hook] Metadata successfully enriched prior to persistence.');
  return data;
}

export default aiEnrichmentHook;
