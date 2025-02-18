import { GameScore, Language } from '../types';

export const mockScores: GameScore[] = [
  {
    id: '1',
    playerName: 'CodeNinja',
    score: 10,
    language: 'typescript',
    level: 3,
    timestamp: '2025-03-15T10:30:00Z',
    volume: 2
  },
  {
    id: '2',
    playerName: 'BugHunter',
    score: 9,
    language: 'rust',
    level: 3,
    timestamp: '2025-03-15T11:20:00Z',
    volume: 1
  },
  {
    id: '3',
    playerName: 'DevMaster',
    score: 9,
    language: 'javascript',
    level: 2,
    timestamp: '2025-03-15T12:15:00Z',
    volume: 1
  }
];