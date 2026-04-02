import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';

// Dynamic import for ESM-only @azure/openai package
async function getOpenAIClient(endpoint: string, apiKey: string) {
  const { OpenAIClient, AzureKeyCredential } = await import('@azure/openai');
  return new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
}

/**
 * POST /api/tactical-analyst
 *
 * AI-powered tactical analyst for HEMS operations.
 * Supports two modes:
 *   - GENERATE_SCENARIO: Creates realistic HEMS training scenarios
 *   - REVIEW_FLIGHT: Analyzes completed flight data and provides feedback
 *
 * Uses Azure OpenAI (GPT-4o) for generation and analysis.
 *
 * Requirement: 13.6
 */

const SCENARIO_SYSTEM_PROMPT = `You are a HEMS (Helicopter Emergency Medical Services) tactical training analyst. Your role is to generate realistic emergency medical helicopter scenarios for pilot training.

When generating scenarios, include:
- Incident type and severity (trauma, cardiac, stroke, pediatric, etc.)
- Patient details (age, gender, condition, vitals)
- Location with coordinates (latitude/longitude)
- Weather conditions affecting the mission
- Time of day and lighting conditions
- Crew composition recommendations
- Potential complications or hazards
- Hospital destination with rationale
- Estimated flight time and fuel considerations

Format the scenario as a structured briefing that a dispatch operator would relay to a HEMS crew. Be realistic and medically accurate.`;

const REVIEW_SYSTEM_PROMPT = `You are a HEMS (Helicopter Emergency Medical Services) flight review analyst. Your role is to analyze completed flight data and provide constructive feedback to pilots.

When reviewing flights, evaluate:
- Route efficiency and navigation decisions
- Fuel management and reserves
- Response time and phase transitions
- Weather decision-making
- Communication protocol adherence
- Patient care timeline considerations
- Safety margins and risk management
- Areas for improvement and commendations

Provide a structured debrief with specific, actionable feedback. Use a professional but supportive tone. Reference specific data points from the flight when available.`;

app.http('tactical-analyst', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'tactical-analyst',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const body = (await req.json()) as any;
      const { mode, context: userContext } = body;

      if (!mode || !['GENERATE_SCENARIO', 'REVIEW_FLIGHT'].includes(mode)) {
        return {
          status: 400,
          jsonBody: { error: "mode is required and must be 'GENERATE_SCENARIO' or 'REVIEW_FLIGHT'" },
        };
      }

      const endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
      const apiKey = process.env.AZURE_OPENAI_API_KEY || '';
      const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

      if (!endpoint || !apiKey) {
        context.error('Azure OpenAI not configured');
        return { status: 500, jsonBody: { error: 'AI service not configured' } };
      }

      const systemPrompt = mode === 'GENERATE_SCENARIO'
        ? SCENARIO_SYSTEM_PROMPT
        : REVIEW_SYSTEM_PROMPT;

      const userMessage = mode === 'GENERATE_SCENARIO'
        ? `Generate a realistic HEMS training scenario.${userContext ? ` Additional context: ${JSON.stringify(userContext)}` : ''}`
        : `Review the following flight data and provide a debrief:\n${JSON.stringify(userContext || {})}`;

      const openaiClient = await getOpenAIClient(endpoint, apiKey);

      const completion = await openaiClient.getChatCompletions(deployment, [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userMessage },
      ], {
        maxTokens: 1000,
        temperature: mode === 'GENERATE_SCENARIO' ? 0.8 : 0.5,
      });

      const responseText = completion.choices?.[0]?.message?.content;

      if (!responseText) {
        return {
          status: 200,
          jsonBody: { result: null, error: 'AI returned an empty response' },
        };
      }

      return {
        status: 200,
        jsonBody: { result: responseText },
      };
    } catch (err: any) {
      context.error('tactical-analyst error:', err);
      return { status: 500, jsonBody: { error: 'AI analysis failed' } };
    }
  },
});
