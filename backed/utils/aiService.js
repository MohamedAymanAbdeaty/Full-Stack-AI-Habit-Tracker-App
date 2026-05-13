import { GoogleGenerativeAI } from '@google/generative-ai';

let client;
const getClient = () => {
  if (client) return client;
  if (!process.env.GEMINI_API_KEY) return null;
  
  client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return client;
};

const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const extractJson = (str) => {
  const fenced = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1];

  const first = str.search(/[\[{]/);
  if (first === -1) return null;
  const lastBrace = str.lastIndexOf('}');
  const lastBracket = str.lastIndexOf(']');
  const last = Math.max(lastBrace, lastBracket);
  if (last <= first) return null;
  return str.slice(first, last + 1);
};

const sanitizeJson = (str) =>
  str
    .replace(/,\s*([}\]])/g, '$1')
    .trim();

const parseJSON = (str) => {
  if (typeof str !== 'string') {
    throw new Error('AI response is not a string');
  }
  try {
    return JSON.parse(str);
  } catch {
    const extracted = extractJson(str);
    if (extracted) {
      try {
        return JSON.parse(extracted);
      } catch {
        return JSON.parse(sanitizeJson(extracted));
      }
    }
    throw new Error('Failed to parse AI JSON response');
  }
};

export const chatCompletion = async (systemPrompt, userMessage, temperature = 0.7) => {
  const ai = getClient();
  
  if (!ai) return 'AI features are currently disabled. Please add a GEMINI_API_KEY to your .env file.';

  const genModel = ai.getGenerativeModel({ 
    model, 
    systemInstruction: systemPrompt 
  });

  const result = await genModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: { temperature }
  });

  const response = await result.response;
  return response.text().trim();
};

export const parseAIJSON = parseJSON;



export const WEEKLY_PROMPT = `You are an encouraging habit coach. Write a personalized weekly review based on the user's habit data.
Rules:
- 120 to 180 words.
- Cover wins, struggles, patterns, and encouragement.
- Mention the user's actual habit names.
- No markdown headers. Plain prose with line breaks only.`;

export const SUGGESTION_PROMPT = `You are a habit-building expert. Suggest 3 personalized habits based on the user's goals, productive times, and past struggles.
Rules:
- Return VALID JSON ONLY. No markdown, no extra text.
- The JSON must be an array of 3 objects.
- Each object must have exactly this shape: { "name": string, "description": string, "frequency": "daily" | "weekly", "category": string, "icon": string (a single emoji), "reason": string (why this fits them) }
- Valid categories are: "Health", "Fitness", "Learning", "Mindfulness", "Productivity", "Social", "Finance", "Creative", "Other". Do not invent new categories.`;

export const RECOVERY_PROMPT = `You are an empathetic habit coach helping a user get back on track after breaking a streak.
Rules:
- Start with an empathetic opening acknowledging the difficulty.
- Provide a 3-day recovery plan.
- Use the format: Day 1: [Action], Day 2: [Action], Day 3: [Action].
- Each day should have one concrete, small action.
- End with a closing line of encouragement.
- Mention the habit name specifically.`;

export const CHAT_PROMPT = `You are a data-driven habit analyst. Answer the user's question using ONLY the provided habit data context.
Rules:
- Cite actual habit names, days, and percentages from the data.
- If the data doesn't contain the answer, say so honestly.
- Keep answers concise (2-4 sentences).
- Do not give generic advice; give data-backed insights.`;

export const MORNING_PROMPT = `You are an energetic morning habit coach. Write a short, personalized motivational message for the user.
Rules:
- 30 to 60 words.
- Mention specific habits and current streaks.
- Be warm but not cheesy.
- Limit emojis to a maximum of one.
- End with an encouraging push for today.`;