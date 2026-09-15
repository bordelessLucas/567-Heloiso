import { listRankingBoards } from '@/src/services/funds.service';

export async function listRankings() {
  const boards = await listRankingBoards();
  return boards.flatMap((board) => board.entries);
}

export { listRankingBoards };
