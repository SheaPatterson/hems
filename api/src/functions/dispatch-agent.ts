import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { authenticate } from '../middleware/auth.js';
import { query } from '../lib/db.js';
import { sendToGroup } from '../lib/signalr.js';

// Dynamic import for ESM-only @azure/openai package
async function getOpenAIClient(endpoint: string, apiKey: string) {
  const { OpenAIClient, AzureKeyCredential } = await import('@azure/openai');
  return new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
}

/**
 * POST /api/dispatch-agent
 *
 * AI-powered HEMS dispatch agent. Accepts a crew radio message,
 * fetches full mission context from Azure SQL, calls Azure OpenAI (GPT-4o)
 * for a contextual response, inserts the AI reply as a radio log entry,
 * and broadcasts via SignalR.
 *
 * Requirements: 13.1, 13.2, 13.3, 13.7, 13.8
 */

const FALLBACK_RESPONSE = 'Dispatch is experiencing high traffic. Stand by.';

const HEMS_SYSTEM_PROMPT = `You are DISPATCH, the AI radio operator for a Helicopter Emergency Medical Services (HEMS) operations center. You communicate using standard aviation radio protocol.

RADIO PROTOCOL RULES:
- Use concise, professional radio language
- Begin responses with the crew's callsign when addressing them
- Use standard aviation phraseology (Roger, Wilco, Copy, Affirm, Negative, Say Again)
- Include relevant frequencies, headings, altitudes when applicable
- Use 24-hour UTC time format (e.g., "time 1430 Zulu")
- Spell out numbers for clarity when needed (e.g., "flight level two-five-zero")
- End transmissions with "Dispatch out" or "How copy?" when expecting a reply

MISSION AWARENESS:
- You have full awareness of the current mission phase, crew composition, patient status, and waypoints
- Provide phase-appropriate guidance (pre-flight, en-route, on-scene, transport, post-mission)
- Factor in patient condition and urgency when prioritizing communications
- Reference specific waypoints, hospitals, and bases by name when relevant

RESPONSE GUIDELINES:
- Keep responses under 150 words for radio brevity
- Prioritize safety-critical information
- If asked about weather, provide what context is available
- If crew reports an emergency, acknowledge immediately and provide actionable guidance
- Maintain situational awareness across the entire mission timeline`;

function buildMissionContext(mission: any): string {
  const parts: string[] = [];

  parts.push(`MISSION ID: ${mission.mission_id}`);
  parts.push(`CALLSIGN: ${mission.callsign}`);
  parts.push(`TYPE: ${mission.mission_type}`);
  parts.push(`STATUS: ${mission.status}`);

  if (mission.crew) {
    try {
      const crew = typeof mission.crew === 'string' ? JSON.parse(mission.crew) : mission.crew;
      parts.push(`CREW: ${JSON.stringify(crew)}`);
    } catch { parts.push(`CREW: ${mission.crew}`); }
  }

  if (mission.patient_details || mission.patient_age || mission.patient_gender) {
    parts.push(`PATIENT: Age ${mission.patient_age || 'unknown'}, Gender ${mission.patient_gender || 'unknown'}, Weight ${mission.patient_weight_lbs || 'unknown'} lbs`);
    if (mission.patient_details) parts.push(`PATIENT DETAILS: ${mission.patient_details}`);
    if (mission.medical_response) parts.push(`MEDICAL RESPONSE: ${mission.medical_response}`);
  }

  if (mission.waypoints) {
    try {
      const wp = typeof mission.waypoints === 'string' ? JSON.parse(mission.waypoints) : mission.waypoints;
      parts.push(`WAYPOINTS: ${JSON.stringify(wp)}`);
    } catch { parts.push(`WAYPOINTS: ${mission.waypoints}`); }
  }

  if (mission.tracking) {
    try {
      const tracking = typeof mission.tracking === 'string' ? JSON.parse(mission.tracking) : mission.tracking;
      if (tracking.phase) parts.push(`CURRENT PHASE: ${tracking.phase}`);
    } catch { /* ignore */ }
  }

  if (mission.live_data) {
    try {
      const live = typeof mission.live_data === 'string' ? JSON.parse(mission.live_data) : mission.live_data;
      parts.push(`LIVE DATA: ${JSON.stringify(live)}`);
    } catch { /* ignore */ }
  }

  if (mission.origin) {
    try {
      const origin = typeof mission.origin === 'string' ? JSON.parse(mission.origin) : mission.origin;
      parts.push(`ORIGIN: ${JSON.stringify(origin)}`);
    } catch { /* ignore */ }
  }

  if (mission.destination) {
    try {
      const dest = typeof mission.destination === 'string' ? JSON.parse(mission.destination) : mission.destination;
      parts.push(`DESTINATION: ${JSON.stringify(dest)}`);
    } catch { /* ignore */ }
  }

  return parts.join('\n');
}


app.http('dispatch-agent', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'dispatch-agent',
  handler: async (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    // Authenticate via Bearer token or API key
    const authResult = await authenticate(req, context);
    if ('error' in authResult) return authResult.error;

    try {
      const body = (await req.json()) as any;
      const { mission_id, crew_message } = body;

      if (!mission_id || !crew_message) {
        return {
          status: 400,
          jsonBody: { error: 'mission_id and crew_message are required' },
        };
      }

      if (typeof crew_message !== 'string' || crew_message.length > 2000) {
        return {
          status: 400,
          jsonBody: { error: 'crew_message must be a string of max 2000 characters' },
        };
      }

      // Fetch full mission context from Azure SQL
      const missionResult = await query(
        'SELECT * FROM missions WHERE mission_id = @mission_id',
        { mission_id }
      );

      if (missionResult.recordset.length === 0) {
        return { status: 404, jsonBody: { error: 'Mission not found' } };
      }

      const mission = missionResult.recordset[0];
      const missionContext = buildMissionContext(mission);

      // Call Azure OpenAI for chat completion
      let responseText: string;
      try {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
        const apiKey = process.env.AZURE_OPENAI_API_KEY || '';
        const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

        const openaiClient = await getOpenAIClient(endpoint, apiKey);

        const messages = [
          { role: 'system' as const, content: HEMS_SYSTEM_PROMPT },
          { role: 'system' as const, content: `CURRENT MISSION CONTEXT:\n${missionContext}` },
          { role: 'user' as const, content: crew_message },
        ];

        const completion = await openaiClient.getChatCompletions(deployment, messages, {
          maxTokens: 300,
          temperature: 0.7,
        });

        responseText = completion.choices?.[0]?.message?.content || FALLBACK_RESPONSE;
      } catch (aiErr: any) {
        context.warn('Azure OpenAI call failed:', aiErr.message);
        responseText = FALLBACK_RESPONSE;
      }

      // Insert the AI response as a radio log entry
      const insertResult = await query(
        `INSERT INTO mission_radio_logs (mission_id, sender, message, callsign, user_id)
         OUTPUT INSERTED.*
         VALUES (@mission_id, @sender, @message, @callsign, @user_id)`,
        {
          mission_id,
          sender: 'dispatch-ai',
          message: responseText,
          callsign: mission.callsign || null,
          user_id: authResult.user.id,
        }
      );

      const inserted = insertResult.recordset[0];

      // Broadcast via SignalR to mission-radio:{missionId}
      try {
        await sendToGroup(
          `mission-radio:${mission_id}`,
          'newRadioLog',
          inserted
        );
      } catch (signalrErr: any) {
        context.warn('SignalR broadcast failed:', signalrErr.message);
      }

      return {
        status: 200,
        jsonBody: {
          response_text: responseText,
          radio_log: inserted,
        },
      };
    } catch (err: any) {
      context.error('dispatch-agent error:', err);
      return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
  },
});
