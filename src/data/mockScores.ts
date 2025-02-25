import { GameScore, Language } from '../types';

export const mockScores: GameScore[] = [
  {
    id: '1',
    playerName: 'Player 1',
    score: 3,
    language: 'typescript',
    level: 3,
    timestamp: '2025-03-15T10:30:00Z',
    volume: 2
  },
  {
    id: '2',
    playerName: 'CodeNinja',
    score: 5,
    language: 'rust',
    level: 2,
    timestamp: '2025-03-15T11:20:00Z',
    volume: 1
  },
  {
    id: '3',
    playerName: 'DevMaster',
    score: 3,
    language: 'javascript',
    level: 1,
    timestamp: '2025-03-15T12:15:00Z',
    volume: 1
  }
];