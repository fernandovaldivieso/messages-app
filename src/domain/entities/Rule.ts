export type PatternType = 'text' | 'regex';
export type TargetField = 'sender' | 'body';

export interface Rule {
  id: string;
  name: string;
  targetField: TargetField;
  pattern: string;
  patternType: PatternType;
  isActive: boolean;
  createdAt: number;
}
