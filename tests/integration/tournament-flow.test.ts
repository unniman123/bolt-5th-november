import { TournamentService } from '../../app/services/tournament-service';
import { MatchService } from '../../app/services/match-service';
import { WalletService } from '../../app/services/wallet-service';

describe('Tournament Flow Integration', () => {
  let tournamentId: string;
  const players = ['player1', 'player2', 'player3', 'player4'];

  beforeAll(async () => {
    // Setup test data
    for (const playerId of players) {
      await WalletService.createTransaction({
        userId: playerId,
        amount: 1000,
        type: 'deposit'
      });
    }
  });

  it('should create and complete a tournament successfully', async () => {
    // Create tournament
    const tournament = await TournamentService.createTournament({
      title: 'Test Tournament',
      gameType: 'Fortnite',
      entryFee: 100,
      maxParticipants: 4
    });
    tournamentId = tournament.id;

    // Join players
    for (const playerId of players) {
      await TournamentService.joinTournament(tournamentId, playerId);
    }

    // Verify tournament started
    const updatedTournament = await TournamentService.getTournamentDetails(tournamentId);
    expect(updatedTournament.status).toBe('in_progress');

    // Complete matches
    const matches = await MatchService.getMatchesByTournament(tournamentId);
    for (const match of matches) {
      await MatchService.submitMatchResult({
        matchId: match.id,
        player1Score: 10,
        player2Score: 5,
        winnerId: match.player1_id
      });
    }

    // Verify tournament completed
    const finalTournament = await TournamentService.getTournamentDetails(tournamentId);
    expect(finalTournament.status).toBe('completed');
  });
});