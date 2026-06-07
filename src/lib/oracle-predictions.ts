import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const predictionSchema = {
  description: "Pre-match prediction and analysis",
  type: SchemaType.OBJECT,
  properties: {
    predictedWinner: {
      type: SchemaType.STRING,
      description: "The name of the player predicted to win ('challenger' or 'defender')",
    },
    confidence: {
      type: SchemaType.NUMBER,
      description: "Confidence score from 0 to 1",
    },
    analysis: {
      type: SchemaType.STRING,
      description: "A short, punchy 2-sentence analysis explaining the prediction",
    },
    challengerOdds: {
      type: SchemaType.NUMBER,
      description: "Suggested multiplier odds for the challenger (e.g. 1.8)",
    },
    defenderOdds: {
      type: SchemaType.NUMBER,
      description: "Suggested multiplier odds for the defender (e.g. 2.2)",
    },
  },
  required: ["predictedWinner", "confidence", "analysis", "challengerOdds", "defenderOdds"],
};

/**
 * Uses Gemini to predict a match outcome based on player data.
 */
export async function predictMatchOutcome(matchData: {
  challenger: { username: string; elo: number; stats: any };
  defender: { username: string; elo: number; stats: any };
  gameTitle: string;
}) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: predictionSchema,
      },
    });

    const prompt = `You are the Oracle, an elite AI betting analyst for a competitive gaming arcade.
    Predict the outcome of an upcoming ${matchData.gameTitle} match.
    
    CHALLENGER: ${matchData.challenger.username} (ELO: ${matchData.challenger.elo}, Wins: ${matchData.challenger.stats.wins}, Losses: ${matchData.challenger.stats.losses})
    DEFENDER: ${matchData.defender.username} (ELO: ${matchData.defender.elo}, Wins: ${matchData.defender.stats.wins}, Losses: ${matchData.defender.stats.losses})
    
    Rules:
    1. Base prediction on ELO and Win/Loss ratio.
    2. Higher ELO usually has lower odds (favorite), lower ELO has higher odds (underdog).
    3. Payout odds should be between 1.1 and 5.0.
    4. Analysis must be in character as a mysterious arcade Oracle.
    5. Return JSON only.`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Oracle Prediction Error:', error);
    return null;
  }
}
