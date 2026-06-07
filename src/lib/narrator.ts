import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Generates 90s arcade-style commentary for a match result.
 */
export async function generateCommentary(matchData: {
  winnerName: string;
  loserName: string;
  method: string;
  round: number;
  time: string;
  isDNF: boolean;
}) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a high-energy 90s arcade game announcer (think NBA Jam, Street Fighter, or Mortal Kombat). 
    Write a short, punchy, and ALL-CAPS victory commentary for the following match result:
    
    WINNER: ${matchData.winnerName}
    LOSER: ${matchData.loserName}
    METHOD: ${matchData.method}
    ROUND: ${matchData.round}
    TIME: ${matchData.time}
    DID OPPONENT QUIT: ${matchData.isDNF ? 'YES' : 'NO'}
    
    Rules:
    1. Keep it under 20 words.
    2. Use 90s arcade slang (e.g., "BOOMSHAKALAKA", "FLAWLESS", "TOTAL DESTRUCTION").
    3. If the opponent quit (DNF), be extra mocking toward the "quitter".
    4. Return ONLY the commentary text.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim().replace(/"/g, '');
  } catch (error) {
    console.error('Narrator Error:', error);
    return "VICTORY ACHIEVED! THE SECTOR IS SECURE!";
  }
}
