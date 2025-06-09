import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CLI } from '../cli.js';
import type { JiraIssue } from '../types.js';

// inquirerをモック
vi.mock('inquirer', () => ({
  default: {
    prompt: vi.fn(),
  },
}));

// consoleメソッドをモック
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

import inquirer from 'inquirer';
const mockInquirer = vi.mocked(inquirer);

describe('CLI', () => {
  let cli: CLI;

  beforeEach(() => {
    cli = new CLI();
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  describe('selectTask', () => {
    const mockIssues: JiraIssue[] = [
      {
        id: '1',
        key: 'TEST-1',
        fields: {
          summary: 'テスト課題1',
          description: 'テスト説明1',
          status: { name: 'To Do' },
          assignee: { displayName: 'ユーザー1' },
          priority: { name: 'High' },
        },
      },
      {
        id: '2',
        key: 'TEST-2',
        fields: {
          summary: 'テスト課題2',
          status: { name: 'In Progress' },
          priority: { name: 'Medium' },
        },
      },
    ];

    it('課題がない場合nullを返す', async () => {
      const result = await cli.selectTask([]);
      
      expect(result).toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith('📭 No issues found.');
    });

    it('課題を選択して実装を確認する', async () => {
      mockInquirer.prompt
        .mockResolvedValueOnce({ selectedIndex: 0 })
        .mockResolvedValueOnce({ confirm: true });

      const result = await cli.selectTask(mockIssues);

      expect(result).toEqual({
        issue: mockIssues[0],
        action: 'implement',
      });
      expect(mockInquirer.prompt).toHaveBeenCalledTimes(2);
    });

    it('課題を選択して実装をキャンセルする', async () => {
      mockInquirer.prompt
        .mockResolvedValueOnce({ selectedIndex: 0 })
        .mockResolvedValueOnce({ confirm: false });

      const result = await cli.selectTask(mockIssues);

      expect(result).toEqual({
        issue: mockIssues[0],
        action: 'cancel',
      });
    });

    it('キャンセルを選択する', async () => {
      mockInquirer.prompt.mockResolvedValueOnce({ selectedIndex: -1 });

      const result = await cli.selectTask(mockIssues);

      expect(result).toEqual({
        issue: mockIssues[0],
        action: 'cancel',
      });
    });

    it('課題一覧が正しく表示される', async () => {
      mockInquirer.prompt
        .mockResolvedValueOnce({ selectedIndex: 0 })
        .mockResolvedValueOnce({ confirm: true });

      await cli.selectTask(mockIssues);

      expect(mockConsoleLog).toHaveBeenCalledWith('\n🎯 Found 2 issue(s):\n');
    });

    it('選択された課題の詳細が表示される', async () => {
      mockInquirer.prompt
        .mockResolvedValueOnce({ selectedIndex: 0 })
        .mockResolvedValueOnce({ confirm: true });

      await cli.selectTask(mockIssues);

      expect(mockConsoleLog).toHaveBeenCalledWith('\n📋 Selected: TEST-1');
      expect(mockConsoleLog).toHaveBeenCalledWith('📝 Summary: テスト課題1');
      expect(mockConsoleLog).toHaveBeenCalledWith('📖 Description: テスト説明1...');
      expect(mockConsoleLog).toHaveBeenCalledWith('📊 Status: To Do');
      expect(mockConsoleLog).toHaveBeenCalledWith('⚡ Priority: High\n');
    });

    it('説明がない課題では説明が表示されない', async () => {
      mockInquirer.prompt
        .mockResolvedValueOnce({ selectedIndex: 1 })
        .mockResolvedValueOnce({ confirm: true });

      await cli.selectTask(mockIssues);

      expect(mockConsoleLog).not.toHaveBeenCalledWith(
        expect.stringContaining('📖 Description:')
      );
    });
  });

  describe('displayError', () => {
    it('エラーメッセージを表示する', () => {
      cli.displayError('テストエラー');
      
      expect(mockConsoleError).toHaveBeenCalledWith('❌ Error: テストエラー');
    });
  });

  describe('displaySuccess', () => {
    it('成功メッセージを表示する', () => {
      cli.displaySuccess('テスト成功');
      
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ テスト成功');
    });
  });

  describe('displayInfo', () => {
    it('情報メッセージを表示する', () => {
      cli.displayInfo('テスト情報');
      
      expect(mockConsoleLog).toHaveBeenCalledWith('ℹ️  テスト情報');
    });
  });
});