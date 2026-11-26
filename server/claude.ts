// Server-side only. The Anthropic API key never reaches the browser.
import Anthropic from '@anthropic-ai/sdk';

const LANGUAGES: Record<string, string> = {
  en: 'English',
  sw: 'Swahili',
  rw: 'Kinyarwanda',
  fr: 'French',
};

const DIAGNOSIS_MODEL = process.env.CLAUDE_DIAGNOSIS_MODEL || 'claude-sonnet-5-5';
const CHAT_MODEL = process.env.CLAUDE_CHAT_MODEL || 'claude-haiku-5-5';

function client() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new HttpError(500, 'AI service is not configured. Set ANTHROPIC_API_KEY on the server.');
  return new Anthropic({ apiKey });
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const AGRONOMIST_PERSONA = (lang: string) => `You are CropGenius, an experienced agronomist who works with smallholder farmers in East Africa (Rwanda, Uganda, Kenya, Tanzania, DRC, Burundi).

How you help:
- Farmers often have little money and limited access to agro-dealers. Always give at least one low-cost or organic option using things a farmer can find locally (wood ash, neem, chili/garlic sprays, crop rotation, removing infected plants), alongside any chemical option.
- When you name a chemical, name the active ingredient (e.g. mancozeb, copper oxychloride), give a dose per 15-litre knapsack sprayer, and remind the farmer about gloves and pre-harvest waiting periods.
- Be honest about uncertainty. If a photo is unclear or the symptoms fit several diseases, say so and tell the farmer what to check or when to call a local extension officer (e.g. RAB in Rwanda).
- Use short, plain sentences that a farmer with basic schooling can follow.
- Write every piece of text for the farmer strictly in ${lang}.`;

// Forcing a tool call gives us reliably-shaped JSON back from Claude.
const DIAGNOSIS_TOOL: Anthropic.Tool = {
  name: 'report_diagnosis',
  description: 'Report the crop diagnosis to the farmer, or an error if the input cannot be analysed.',
  input_schema: {
    type: 'object',
    properties: {
      error: { type: 'string', description: 'Only set if the image is not a plant, is too blurry, or the text is unrelated to farming. Explain briefly what the farmer should do instead.' },
      disease: { type: 'string', description: 'Common name of the disease, pest or deficiency (include the scientific name in brackets if useful).' },
      cause: { type: 'string' },
      symptoms: { type: 'string', description: 'What the farmer should look for in the field.' },
      treatment: {
        type: 'object',
        properties: {
          chemical: { type: 'string', description: 'Active ingredients and product types.' },
          organic: { type: 'string', description: 'Low-cost, locally available or organic options.' },
          dosage: { type: 'string', description: 'How much and how often, e.g. per 15 L knapsack sprayer.' },
          timeline: { type: 'string', description: 'What to do today, this week, and over the coming weeks.' },
        },
        required: ['chemical', 'organic', 'dosage', 'timeline'],
      },
      prevention: { type: 'string' },
      confidenceScore: { type: 'number', description: 'Honest confidence 0-100.' },
      severity: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'], description: 'Always in English (used by the app for colours and stats).' },
      reasoning: { type: 'string', description: 'Which visible cues or described symptoms led to this diagnosis.' },
      boundingBox: {
        type: 'object',
        description: 'Only when an image is given: normalised 0-1 coordinates roughly framing the main affected area.',
        properties: {
          ymin: { type: 'number' }, xmin: { type: 'number' },
          ymax: { type: 'number' }, xmax: { type: 'number' },
        },
        required: ['ymin', 'xmin', 'ymax', 'xmax'],
      },
    },
  },
};

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
type ImageType = (typeof IMAGE_TYPES)[number];

export async function diagnose(body: any) {
  const language = LANGUAGES[body?.language] || 'English';
  const description: string = typeof body?.description === 'string' ? body.description.slice(0, 4000) : '';
  const image: string | null = typeof body?.imageBase64 === 'string' ? body.imageBase64 : null;

  const content: Anthropic.ContentBlockParam[] = [];
  if (image) {
    const match = image.match(/^data:([^;]+);base64,(.+)$/);
    if (!match || !IMAGE_TYPES.includes(match[1] as ImageType)) throw new HttpError(400, 'Unsupported image format.');
    content.push({ type: 'image', source: { type: 'base64', media_type: match[1] as ImageType, data: match[2] } });
  }
  content.push({
    type: 'text',
    text: description.trim()
      ? `The farmer says: "${description.trim()}"\n\nDiagnose the problem.`
      : 'Diagnose the problem shown in this photo.',
  });
  if (!image && !description.trim()) throw new HttpError(400, 'Send a photo or a description.');

  const response = await client().messages.create({
    model: DIAGNOSIS_MODEL,
    max_tokens: 2000,
    system: AGRONOMIST_PERSONA(language),
    tools: [DIAGNOSIS_TOOL],
    tool_choice: { type: 'tool', name: DIAGNOSIS_TOOL.name },
    messages: [{ role: 'user', content }],
  });

  const toolUse = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
  if (!toolUse) throw new HttpError(502, 'Received an invalid response format from the AI.');
  return toolUse.input;
}

export async function chat(body: any) {
  const language = LANGUAGES[body?.language] || 'English';
  const ctx = body?.context || {};
  const question: string = String(body?.question || '').slice(0, 2000);
  if (!question.trim()) throw new HttpError(400, 'Empty question.');

  const history: Anthropic.MessageParam[] = (Array.isArray(body?.history) ? body.history : [])
    .slice(-12)
    .map((m: any) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.text || '') }))
    .filter((m: Anthropic.MessageParam) => m.content);
  // The Messages API needs the conversation to start with a user turn.
  while (history.length && history[0].role !== 'user') history.shift();

  const system = `${AGRONOMIST_PERSONA(language)}

The farmer is looking at this diagnosis and asking follow-up questions:
Disease: ${ctx.disease ?? 'unknown'}
Cause: ${ctx.cause ?? ''}
Symptoms: ${ctx.symptoms ?? ''}
Treatment: ${JSON.stringify(ctx.treatment ?? {})}

Answer conversationally in a few short paragraphs or a short list. No JSON.`;

  const response = await client().messages.create({
    model: CHAT_MODEL,
    max_tokens: 1000,
    system,
    messages: [...history, { role: 'user', content: question }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim();
  return { reply: text || "I'm sorry, I couldn't generate a response." };
}

export function toHttpError(err: unknown): HttpError {
  if (err instanceof HttpError) return err;
  if (err instanceof Anthropic.APIError) {
    if (err.status === 401 || err.status === 403) return new HttpError(500, 'The server API key was rejected.');
    if (err.status === 429) return new HttpError(429, 'Too many requests. Please try again in a minute.');
    if (err.status === 529 || (err.status ?? 0) >= 500) return new HttpError(503, 'The AI service is busy. Please try again.');
  }
  console.error(err);
  return new HttpError(500, 'Diagnosis failed. Please try again.');
}
