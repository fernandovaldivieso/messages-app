import { Rule } from '../entities/Rule';

export interface IRuleRepository {
  getAll(): Promise<Rule[]>;
  getById(id: string): Promise<Rule | null>;
  save(rule: Rule): Promise<void>;
  delete(id: string): Promise<void>;
}
