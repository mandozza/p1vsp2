export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  FIRST_CATCH: {
    id: 'FIRST_CATCH',
    name: 'First Catch',
    description: 'Caught your very first prize in the arcade!',
    icon: '🏆',
  },
  TEN_WINS: {
    id: 'TEN_WINS',
    name: 'Master Clawer',
    description: 'Successfully caught 10 prizes.',
    icon: '👑',
  },
  HIGH_ROLLER: {
    id: 'HIGH_ROLLER',
    name: 'High Roller',
    description: 'Purchased a High Roller credit pack.',
    icon: '💰',
  },
  NIGHT_OWL: {
    id: 'NIGHT_OWL',
    name: 'Night Owl',
    description: 'Caught a prize between 12 AM and 5 AM.',
    icon: '🦉',
  },
};
