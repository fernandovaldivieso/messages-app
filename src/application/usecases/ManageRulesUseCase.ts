import { Rule, PatternType, TargetField } from '../../domain/entities/Rule';
import { IRuleRepository } from '../../domain/repositories/IRuleRepository';

export interface CreateRuleInput {
  name: string;
  targetField: TargetField;
  pattern: string;
  patternType: PatternType;
}

export class ManageRulesUseCase {
  constructor(private readonly ruleRepo: IRuleRepository) {}

  async getAllRules(): Promise<Rule[]> {
    return this.ruleRepo.getAll();
  }

  async createRule(input: CreateRuleInput): Promise<Rule> {
    const rule: Rule = {
      id: this.generateId(),
      name: input.name,
      targetField: input.targetField,
      pattern: input.pattern,
      patternType: input.patternType,
      isActive: true,
      createdAt: Date.now(),
    };
    await this.ruleRepo.save(rule);
    return rule;
  }

  async updateRule(id: string, updates: Partial<Omit<Rule, 'id' | 'createdAt'>>): Promise<Rule> {
    const existing = await this.ruleRepo.getById(id);
    if (!existing) throw new Error(`Rule not found: ${id}`);
    const updated: Rule = { ...existing, ...updates };
    await this.ruleRepo.save(updated);
    return updated;
  }

  async toggleRule(id: string): Promise<Rule> {
    const existing = await this.ruleRepo.getById(id);
    if (!existing) throw new Error(`Rule not found: ${id}`);
    const updated: Rule = { ...existing, isActive: !existing.isActive };
    await this.ruleRepo.save(updated);
    return updated;
  }

  async deleteRule(id: string): Promise<void> {
    await this.ruleRepo.delete(id);
  }

  private generateId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}
