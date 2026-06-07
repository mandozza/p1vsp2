import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Extraction Schema for UFC 6 Screenshots
 */
const ufcSchema = {
  description: "Extracted match data from a UFC 6 end-of-game screenshot",
  type: SchemaType.OBJECT,
  properties: {
    winnerTag: {
      type: SchemaType.STRING,
      description: "The gamer tag of the player who won the match",
    },
    loserTag: {
      type: SchemaType.STRING,
      description: "The gamer tag of the player who lost the match",
    },
    method: {
      type: SchemaType.STRING,
      description: "Method of victory: KO, TKO, SUB, DEC",
    },
    round: {
      type: SchemaType.NUMBER,
      description: "The round number the match ended in",
    },
    time: {
      type: SchemaType.STRING,
      description: "The clock time the match ended (e.g., 2:45)",
    },
    opponentQuit: {
      type: SchemaType.BOOLEAN,
      description: "Whether the opponent disconnected or quit prematurely (DNF)",
    },
  },
  required: ["winnerTag", "loserTag", "method", "round", "time", "opponentQuit"],
};

/**
 * Uses Gemini to extract match data from a screenshot.
 */
export async function extractMatchData(imageUrl: string) {
  try {
    // 1. Fetch the image
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    // 2. Initialize Gemini 1.5 Flash (optimized for vision tasks)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ufcSchema,
      },
    });

    const prompt = `Analyze this UFC 6 end-of-game screenshot. 
    Identify the winner and loser by their gamer tags. 
    Determine the method of victory, the round, and the time. 
    Check if the screen indicates a disconnection, forfeit, or "Connection Lost" state.
    Provide the data in the requested JSON format.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg", // S3 uploads are mostly jpeg/png
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

  // Helper to normalize tags for comparison
  const normalize = (tag: string) => tag?.trim().toLowerCase();

  const winnerMatches = normalize(res1.winnerTag) === normalize(res2.winnerTag);
  const methodMatches = res1.method === res2.method;
  const roundMatches = res1.round === res2.round;
  const dnfMatches = res1.opponentQuit === res2.opponentQuit;

  // We require at least the winner and DNF status to match for an automatic pass
  if (winnerMatches && dnfMatches) {
    return {
      consensus: true,
      conflict: false,
      data: {
        winnerTag: res1.winnerTag,
        method: res1.method,
        round: res1.round,
        time: res1.time,
        isDNF: res1.opponentQuit,
      }
    };
  }

  return { consensus: false, conflict: true };
}
