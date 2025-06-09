import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClaudeLauncher } from '../claude-launcher.js';
import type { JiraIssue } from '../types.js';

// child_processをモック
vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal<typeof import('child_process')>();
  return {
    ...actual,
    spawn: vi.fn(),
  };
});

// consoleメソッドをモック
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

import { spawn } from 'child_process';
const mockSpawn = vi.mocked(spawn);

describe('ClaudeLauncher', () => {
  let claudeLauncher: ClaudeLauncher;
  let mockProcess: any;

  beforeEach(() => {
    claudeLauncher = new ClaudeLauncher();
    vi.clearAllMocks();
    
    mockProcess = {
      on: vi.fn(),
    };
    mockSpawn.mockReturnValue(mockProcess as any);
  });

  afterEach(() => {
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  const mockIssue: JiraIssue = {
    id: '123',
    key: 'TEST-123',
    fields: {
      summary: 'テスト課題のタイトル',
      description: 'テスト課題の詳細説明です。この課題では新機能を実装する必要があります。',
      status: { name: 'To Do' },
      assignee: { displayName: 'テストユーザー' },
      priority: { name: 'High' },
    },
  };

  describe('launchClaudeCode (non-dry-run)', () => {
    it('非dry-runモードでは起動メッセージを表示する', async () => {
      await claudeLauncher.launchClaudeCode(mockIssue, '/test/project', false);

      expect(mockConsoleLog).toHaveBeenCalledWith('🚀 Launching Claude Code for TEST-123...');
      expect(mockConsoleLog).toHaveBeenCalledWith('📁 Project path: /test/project');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('💬 Prompt: Implement the following Jira ticket: TEST-123')
      );
    });

    it('非dry-runモードではdry-run出力は表示されない', async () => {
      await claudeLauncher.launchClaudeCode(mockIssue, '/test/project', false);

      expect(mockConsoleLog).not.toHaveBeenCalledWith(
        expect.stringContaining('🧪 DRY RUN MODE')
      );
    });
  });

  describe('launchClaudeCode with dry-run', () => {
    it('dry-runモードで実行情報を表示する', async () => {
      await claudeLauncher.launchClaudeCode(mockIssue, '/test/project', true);

      expect(mockSpawn).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith('\n🧪 DRY RUN MODE - Claude Code would be launched with:');
      expect(mockConsoleLog).toHaveBeenCalledWith('='.repeat(60));
      expect(mockConsoleLog).toHaveBeenCalledWith('Command: claude');
      expect(mockConsoleLog).toHaveBeenCalledWith('Working Directory: /test/project');
      expect(mockConsoleLog).toHaveBeenCalledWith('Issue: TEST-123');
      expect(mockConsoleLog).toHaveBeenCalledWith('Title: テスト課題のタイトル');
    });

    it('dry-runモードでプロンプト全文を表示する', async () => {
      await claudeLauncher.launchClaudeCode(mockIssue, '/test/project', true);

      expect(mockConsoleLog).toHaveBeenCalledWith('Prompt:');
      expect(mockConsoleLog).toHaveBeenCalledWith('-'.repeat(60));
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Implement the following Jira ticket: TEST-123')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('**Title:** テスト課題のタイトル')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('**Description:**')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('テスト課題の詳細説明です。')
      );
    });
  });

  describe('buildPrompt', () => {
    it('完全な課題情報でプロンプトを生成する', async () => {
      await claudeLauncher.launchClaudeCode(mockIssue, '/test/project', true);

      const promptCall = mockConsoleLog.mock.calls.find(call => 
        typeof call[0] === 'string' && call[0].includes('Implement the following Jira ticket')
      );
      
      expect(promptCall).toBeDefined();
      const prompt = promptCall?.[0] as string;
      
      expect(prompt).toContain('Implement the following Jira ticket: TEST-123');
      expect(prompt).toContain('**Title:** テスト課題のタイトル');
      expect(prompt).toContain('**Description:**');
      expect(prompt).toContain('テスト課題の詳細説明です。');
      expect(prompt).toContain('**Status:** To Do');
      expect(prompt).toContain('**Priority:** High');
      expect(prompt).toContain('**Assignee:** テストユーザー');
      expect(prompt).toContain('Please analyze the codebase and implement this feature');
    });

    it('説明がない課題でプロンプトを生成する', async () => {
      const issueWithoutDescription: JiraIssue = {
        id: mockIssue.id,
        key: mockIssue.key,
        fields: {
          summary: mockIssue.fields.summary,
          status: mockIssue.fields.status,
          assignee: mockIssue.fields.assignee,
          priority: mockIssue.fields.priority,
        },
      } as JiraIssue;

      await claudeLauncher.launchClaudeCode(issueWithoutDescription, '/test/project', true);

      const promptCall = mockConsoleLog.mock.calls.find(call => 
        typeof call[0] === 'string' && call[0].includes('Implement the following Jira ticket')
      );
      
      const prompt = promptCall?.[0] as string;
      expect(prompt).not.toContain('**Description:**');
    });

    it('担当者がない課題でプロンプトを生成する', async () => {
      const issueWithoutAssignee: JiraIssue = {
        id: mockIssue.id,
        key: mockIssue.key,
        fields: {
          summary: mockIssue.fields.summary,
          description: mockIssue.fields.description,
          status: mockIssue.fields.status,
          priority: mockIssue.fields.priority,
        },
      } as JiraIssue;

      await claudeLauncher.launchClaudeCode(issueWithoutAssignee, '/test/project', true);

      const promptCall = mockConsoleLog.mock.calls.find(call => 
        typeof call[0] === 'string' && call[0].includes('Implement the following Jira ticket')
      );
      
      const prompt = promptCall?.[0] as string;
      expect(prompt).not.toContain('**Assignee:**');
    });
  });
});