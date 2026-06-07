/**
 * Simple ELO Rating calculation.
 * @param winnerElo The current ELO of the winner.
 * @param loserElo The current ELO of the loser.
 * @param isDraw Whether the match was a draw.
 */
export function calculateElo(winnerElo: number, loserElo: number, isDraw = false) {
  const K = 32;
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

  let winnerNewElo, loserNewElo;

  if (isDraw) {
    winnerNewElo = Math.round(winnerElo + K * (0.5 - expectedWinner));
    loserNewElo = Math.round(loserElo + K * (0.5 - expectedLoser));
  } else {
    winnerNewElo = Math.round(winnerElo + K * (1 - expectedWinner));
    loserNewElo = Math.round(loserElo + K * (0 - expectedLoser));
  }

  return { winnerNewElo, loserNewElo };
}
