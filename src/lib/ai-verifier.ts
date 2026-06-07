import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Common Schema for Match Verification (Genre-agnostic)
 */
const genericSchema = {
  description: "Extracted match data from an end-of-game screenshot",
  type: SchemaType.OBJECT,
  properties: {
    winnerTag: {
      type: SchemaType.STRING,
      description: "The gamer tag or name of the player who won the match",
    },
    loserTag: {
      type: SchemaType.STRING,
      description: "The gamer tag or name of the player who lost the match",
    },
    score: {
      type: SchemaType.STRING,
      description: "Final score or result summary (e.g. '3-1', 'KO', 'Lap 1st')",
    },
    opponentQuit: {
      type: SchemaType.BOOLEAN,
      description: "Whether the screen indicates a disconnection, quit, or forfeit (DNF)",
    },
    extraDetails: {
      type: SchemaType.STRING,
      description: "Any other relevant data (e.g. Round number, time, map)",
    },
  },
  required: ["winnerTag", "loserTag", "opponentQuit"],
};

/**
 * Specialized Schema for Fighting Games
 */
const fightingSchema = {
  description: "Extracted match data from a fighting game screenshot",
  type: SchemaType.OBJECT,
  properties: {
    winnerTag: { type: SchemaType.STRING },
    loserTag: { type: SchemaType.STRING },
    method: { type: SchemaType.STRING, description: "KO, TKO, SUB, DEC, etc." },
    round: { type: SchemaType.NUMBER },
    time: { type: SchemaType.STRING },
    opponentQuit: { type: SchemaType.BOOLEAN },
  },
  required: ["winnerTag", "loserTag", "method", "opponentQuit"],
};

/**
 * Uses Gemini to extract match data from a screenshot.
 */
export async function extractMatchData(imageUrl: string, customPrompt?: string, gameType: string = 'FIGHTING') {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    // Select schema based on game type
    const schema = gameType === 'FIGHTING' ? fightingSchema : genericSchema;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const defaultPrompt = `Analyze this end-of-game screenshot. 
    Identify the winner and loser by their gamer tags. 
    Check if the screen indicates a disconnection or "Connection Lost" state.
    Provide the data in the requested JSON format.`;

    const prompt = customPrompt || defaultPrompt;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg",
        },
      },
    ]);

    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('AI Extraction Error:', error);
    return null;
  }
}

/**
 * Compares results from two players to find a consensus.
 */
export function verifyConsensus(res1: any, res2: any) {
  if (!res1 || !res2) return { consensus: false, conflict: true };

  const normalize = (tag: string) => tag?.trim().toLowerCase();

  const winnerMatches = normalize(res1.winnerTag) === normalize(res2.winnerTag);
  const dnfMatches = res1.opponentQuit === res2.opponentQuit;

  // Consensus requires winner and DNF status to match
  if (winnerMatches && dnfMatches) {
    return {
      consensus: true,
      conflict: false,
      data: {
        winnerTag: res1.winnerTag,
        method: res1.method || res1.score || 'Victory',
        round: res1.round || 0,
        time: res1.time || res1.extraDetails || 'N/A',
        isDNF: res1.opponentQuit,
      }
    };
  }

  return { consensus: false, conflict: true };
}
