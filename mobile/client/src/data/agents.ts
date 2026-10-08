import type { ImageSourcePropType } from 'react-native';
export interface Teammate { id: string; name: string; role: string; tagline: string; art: ImageSourcePropType }
export const agents: Teammate[] = [
  { id: 'modeer', name: 'Leo', role: 'Personal assistant', tagline: 'Knows you. Knows who can help.', art: require('../../assets/portraits/leo.png') },
  { id: 'study', name: 'Nova', role: 'Study', tagline: 'Learn, prepare, understand', art: require('../../assets/portraits/study.webp') },
  { id: 'career', name: 'Harvey', role: 'Career', tagline: 'Jobs, CVs, interviews', art: require('../../assets/portraits/harvey.png') },
  { id: 'research', name: 'Clara', role: 'Research', tagline: 'Analyze and investigate', art: require('../../assets/portraits/research.webp') },
  { id: 'writing', name: 'Alex', role: 'Writing', tagline: 'Draft, edit, refine', art: require('../../assets/portraits/writing.webp') },
  { id: 'travel', name: 'Tessa', role: 'Travel', tagline: 'Plan trips that fit you', art: require('../../assets/portraits/travel.webp') },
  { id: 'shopping', name: 'Nate', role: 'Shopping', tagline: 'Compare, decide, buy well', art: require('../../assets/portraits/shopping.webp') },
  { id: 'finance', name: 'Emma', role: 'Finance', tagline: 'Budgets, trade-offs, planning', art: require('../../assets/portraits/finance.webp') },
  { id: 'fitness', name: 'Maddie', role: 'Fitness', tagline: 'Train with a real plan', art: require('../../assets/portraits/fitness.webp') },
  { id: 'email', name: 'Nora', role: 'Email', tagline: 'Write email that lands', art: require('../../assets/portraits/email.png') },
];
