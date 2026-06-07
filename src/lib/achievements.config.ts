export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  color: 'pink' | 'cyan' | 'purple' | 'green' | 'yellow';
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  FIRST_BLOOD: {
    id: 'FIRST_BLOOD',
    name: 'First Blood',
    description: 'Secured your first verified victory.',
    icon: 'Swords',
    color: 'pink',
  },
  THE_FAIR_FIGHTER: {
    id: 'THE_FAIR_FIGHTER',
    name: 'The Fair Fighter',
    description: 'Completed 10 matches without a DNF.',
    icon: 'ShieldCheck',
    color: 'green',
  },
  TRIBUNAL_JUDGE: {
    id: 'TRIBUNAL_JUDGE',
    name: 'Tribunal Judge',
    description: 'Cast 10 votes in the Community Tribunal.',
    icon: 'Gavel',
    color: 'purple',
  },
  THE_UNBREAKABLE: {
    id: 'THE_UNBREAKABLE',
    name: 'The Unbreakable',
    description: 'Reached an ELO rating of 1500.',
    icon: 'Trophy',
    color: 'cyan',
  },
  ELITE_OPERATOR: {
    id: 'ELITE_OPERATOR',
    name: 'Elite Operator',
    description: 'Reached an ELO rating of 2000.',
    icon: 'Zap',
    color: 'yellow',
  },
};
