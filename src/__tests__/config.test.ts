import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadJiraConfig } from '../config.js';

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadJiraConfig', () => {
    it('正しい環境変数が設定されている場合、設定を返す', () => {
      process.env['JIRA_BASE_URL'] = 'https://test.atlassian.net';
      process.env['JIRA_EMAIL'] = 'test@example.com';
      process.env['JIRA_API_TOKEN'] = 'test-api-token';

      const config = loadJiraConfig();

      expect(config).toEqual({
        baseUrl: 'https://test.atlassian.net',
        email: 'test@example.com',
        apiToken: 'test-api-token',
      });
    });

    it('JIRA_BASE_URLが設定されていない場合、エラーを投げる', () => {
      process.env['JIRA_EMAIL'] = 'test@example.com';
      process.env['JIRA_API_TOKEN'] = 'test-api-token';
      delete process.env['JIRA_BASE_URL'];

      expect(() => loadJiraConfig()).toThrow(/Missing required environment variables/);
    });

    it('JIRA_EMAILが設定されていない場合、エラーを投げる', () => {
      process.env['JIRA_BASE_URL'] = 'https://test.atlassian.net';
      process.env['JIRA_API_TOKEN'] = 'test-api-token';
      delete process.env['JIRA_EMAIL'];

      expect(() => loadJiraConfig()).toThrow(/Missing required environment variables/);
    });

    it('JIRA_API_TOKENが設定されていない場合、エラーを投げる', () => {
      process.env['JIRA_BASE_URL'] = 'https://test.atlassian.net';
      process.env['JIRA_EMAIL'] = 'test@example.com';
      delete process.env['JIRA_API_TOKEN'];

      expect(() => loadJiraConfig()).toThrow(/Missing required environment variables/);
    });

    it('すべての環境変数が設定されていない場合、詳細なエラーメッセージを表示する', () => {
      delete process.env['JIRA_BASE_URL'];
      delete process.env['JIRA_EMAIL'];
      delete process.env['JIRA_API_TOKEN'];

      expect(() => loadJiraConfig()).toThrow(/JIRA_BASE_URL/);
      expect(() => loadJiraConfig()).toThrow(/JIRA_EMAIL/);
      expect(() => loadJiraConfig()).toThrow(/JIRA_API_TOKEN/);
    });

    it('空文字列の環境変数はエラーとして扱われる', () => {
      process.env['JIRA_BASE_URL'] = '';
      process.env['JIRA_EMAIL'] = 'test@example.com';
      process.env['JIRA_API_TOKEN'] = 'test-api-token';

      expect(() => loadJiraConfig()).toThrow(/Missing required environment variables/);
    });
  });
});