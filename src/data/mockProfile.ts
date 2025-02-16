import { UserProfile, Language } from '../types';

export const mockProfile: UserProfile = {
  id: '1',
  username: 'CodeNinja',
  firstName: 'Alex',
  profileUrl: 'alex',
  isPrivate: false,
  joinedDate: '2025-01-15T00:00:00Z',
  totalGames: 45,
  averageScore: 8.2,
  earnedBadges: [
    'hello_world',
    'code_explorer',
    'syntax_warrior',
    'bug_hunter',
    'merge_commander'
  ],
  stats: [
    {
      language: 'typescript',
      gamesPlayed: 15,
      averageScore: 8.5,
      highestScore: 10,
      lastPlayed: '2025-03-15T10:30:00Z',
      volumes: [1, 2]
    },
    {
      language: 'javascript',
      gamesPlayed: 12,
      averageScore: 8.1,
      highestScore: 9,
      lastPlayed: '2025-03-14T15:45:00Z',
      volumes: [1]
    },
    {
      language: 'python',
      gamesPlayed: 8,
      averageScore: 7.8,
      highestScore: 9,
      lastPlayed: '2025-03-13T09:20:00Z',
      volumes: [1]
    },
    {
      language: 'rust',
      gamesPlayed: 5,
      averageScore: 8.4,
      highestScore: 9,
      lastPlayed: '2025-03-12T14:15:00Z',
      volumes: [1]
    },
    {
      language: 'go',
      gamesPlayed: 3,
      averageScore: 7.6,
      highestScore: 8,
      lastPlayed: '2025-03-11T11:30:00Z',
      volumes: [1]
    },
    {
      language: 'sql',
      gamesPlayed: 2,
      averageScore: 8.0,
      highestScore: 8,
      lastPlayed: '2025-03-10T16:45:00Z',
      volumes: [1]
    }
  ]
};