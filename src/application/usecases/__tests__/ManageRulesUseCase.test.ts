import { ManageRulesUseCase } from '../ManageRulesUseCase';
import { IRuleRepository } from '../../../domain/repositories/IRuleRepository';
import { Rule } from '../../../domain/entities/Rule';

function makeRepo(initial: Rule[] = []): jest.Mocked<IRuleRepository> {
  const store: Rule[] = [...initial];
  return {
    getAll: jest.fn(async () => [...store]),
    getById: jest.fn(async (id) => store.find(r => r.id === id) ?? null),
    save: jest.fn(async (rule) => {
      const idx = store.findIndex(r => r.id === rule.id);
      if (idx >= 0) store[idx] = rule; else store.push(rule);
    }),
    delete: jest.fn(async (id) => {
      const idx = store.findIndex(r => r.id === id);
      if (idx >= 0) store.splice(idx, 1);
    }),
  };
}

describe('ManageRulesUseCase', () => {
  it('creates a rule with defaults', async () => {
    const repo = makeRepo();
    const uc = new ManageRulesUseCase(repo);
    const rule = await uc.createRule({ name: 'Test', targetField: 'body', pattern: 'OTP', patternType: 'text' });
    expect(rule.name).toBe('Test');
    expect(rule.isActive).toBe(true);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('returns all rules', async () => {
    const existing: Rule = { id: '1', name: 'R1', targetField: 'sender', pattern: 'bank', patternType: 'text', isActive: true, createdAt: 0 };
    const repo = makeRepo([existing]);
    const uc = new ManageRulesUseCase(repo);
    const rules = await uc.getAllRules();
    expect(rules).toHaveLength(1);
  });

  it('updates a rule', async () => {
    const existing: Rule = { id: '1', name: 'R1', targetField: 'sender', pattern: 'bank', patternType: 'text', isActive: true, createdAt: 0 };
    const repo = makeRepo([existing]);
    const uc = new ManageRulesUseCase(repo);
    const updated = await uc.updateRule('1', { name: 'Updated' });
    expect(updated.name).toBe('Updated');
  });

  it('throws when updating non-existent rule', async () => {
    const repo = makeRepo();
    const uc = new ManageRulesUseCase(repo);
    await expect(uc.updateRule('nonexistent', {})).rejects.toThrow('Rule not found');
  });

  it('toggles a rule active/inactive', async () => {
    const existing: Rule = { id: '1', name: 'R1', targetField: 'body', pattern: 'x', patternType: 'text', isActive: true, createdAt: 0 };
    const repo = makeRepo([existing]);
    const uc = new ManageRulesUseCase(repo);
    const result = await uc.toggleRule('1');
    expect(result.isActive).toBe(false);
  });

  it('throws when toggling non-existent rule', async () => {
    const repo = makeRepo();
    const uc = new ManageRulesUseCase(repo);
    await expect(uc.toggleRule('missing')).rejects.toThrow('Rule not found');
  });

  it('deletes a rule', async () => {
    const existing: Rule = { id: '1', name: 'R1', targetField: 'body', pattern: 'x', patternType: 'text', isActive: true, createdAt: 0 };
    const repo = makeRepo([existing]);
    const uc = new ManageRulesUseCase(repo);
    await uc.deleteRule('1');
    expect(repo.delete).toHaveBeenCalledWith('1');
  });
});
