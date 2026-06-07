import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Uses Gemini to analyze match history and generate a combat style report.
 */
export async function generateCombatStyleReport(username: string, matchHistory: any[]) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1. Prepare match data for Gemini
    const matchSummaries = matchHistory.map(m => {
      const isWinner = m.finalOutcome.winnerId.toString() === m.currentUserId;
      return `${m.gameId.title}: ${isWinner ? 'WON' : 'LOST'} via ${m.finalOutcome.method} in Round ${m.finalOutcome.round} at ${m.finalOutcome.time}`;
    }).join('\n');

    const prompt = `You are an elite combat sports analyst and scout. 
    Analyze the following match history for the player "${username}" and provide a punchy, 3-sentence "Scouting Report".
    
    MATCH HISTORY:
    ${matchSummaries}
    
    Rules:
    1. Be descriptive and use arcade/fighting terminology.
    2. Identify their strengths (e.g. "early finisher", "submission specialist").
    3. Identify a potential weakness or trend.
    4. Keep it professional but high-energy.
    5. Return ONLY the 3-sentence report.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Combat Analyst Error:', error);
    return "ANALYSIS FAILED. SYSTEM OVERLOADED. CONTINUE DOMINANCE.";
  }
}
