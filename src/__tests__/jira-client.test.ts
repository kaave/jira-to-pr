import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JiraClient } from '../jira-client.js';
import { HttpClient } from '../http-client.js';
import type { JiraConfig, JiraIssue, JiraSearchResponse } from '../types.js';

// HttpClientをモック
vi.mock('../http-client.js');
const MockedHttpClient = vi.mocked(HttpClient);

describe('JiraClient', () => {
  let jiraClient: JiraClient;
  let mockHttpClient: any;
  const mockConfig: JiraConfig = {
    baseUrl: 'https://test.atlassian.net',
    email: 'test@example.com',
    apiToken: 'test-token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockHttpClient = {
      get: vi.fn(),
    };
    
    MockedHttpClient.mockImplementation(() => mockHttpClient);
    jiraClient = new JiraClient(mockConfig);
  });

  describe('constructor', () => {
    it('正しい認証ヘッダーでHttpClientを初期化する', () => {
      expect(MockedHttpClient).toHaveBeenCalledWith({
        headers: {
          'Authorization': expect.stringContaining('Basic '),
          'Accept': 'application/json',
        },
      });
    });
  });

  describe('searchIssues', () => {
    it('デフォルトのJQLで課題を検索する', async () => {
      const mockResponse: JiraSearchResponse = {
        issues: [
          {
            id: '1',
            key: 'TEST-1',
            fields: {
              summary: 'テスト課題',
              description: 'テスト説明',
              status: { name: 'In Progress' },
              assignee: { displayName: 'テストユーザー' },
              priority: { name: 'High' },
            },
          },
        ],
        total: 1,
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await jiraClient.searchIssues();

      expect(result).toEqual(mockResponse.issues);
      const callUrl = mockHttpClient.get.mock.calls[0]?.[0] as string;
      expect(callUrl).toContain('/rest/api/3/search');
      expect(callUrl).toContain('jql=assignee');
    });

    it('カスタムJQLで課題を検索する', async () => {
      const customJql = 'project = TEST AND status = "To Do"';
      const mockResponse: JiraSearchResponse = {
        issues: [],
        total: 0,
      };

      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      const result = await jiraClient.searchIssues(customJql);

      expect(result).toEqual([]);
      const callUrl = mockHttpClient.get.mock.calls[0]?.[0] as string;
      expect(callUrl).toContain('jql=project');
    });

    it('正しいフィールドとmaxResultsパラメータが設定される', async () => {
      const mockResponse: JiraSearchResponse = { issues: [], total: 0 };
      mockHttpClient.get.mockResolvedValueOnce(mockResponse);

      await jiraClient.searchIssues();

      const callUrl = mockHttpClient.get.mock.calls[0]?.[0] as string;
      expect(callUrl).toContain('fields=summary%2Cdescription%2Cstatus%2Cassignee%2Cpriority');
      expect(callUrl).toContain('maxResults=50');
    });
  });

  describe('getIssue', () => {
    it('課題キーで単一の課題を取得する', async () => {
      const mockIssue: JiraIssue = {
        id: '123',
        key: 'TEST-123',
        fields: {
          summary: '特定の課題',
          description: '課題の詳細説明',
          status: { name: 'Done' },
          assignee: { displayName: '担当者' },
          priority: { name: 'Medium' },
        },
      };

      mockHttpClient.get.mockResolvedValueOnce(mockIssue);

      const result = await jiraClient.getIssue('TEST-123');

      expect(result).toEqual(mockIssue);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/rest/api/3/issue/TEST-123')
      );
    });

    it('正しいフィールドパラメータが設定される', async () => {
      const mockIssue: JiraIssue = {
        id: '456',
        key: 'TEST-456',
        fields: {
          summary: 'テスト課題2',
          status: { name: 'To Do' },
          priority: { name: 'Low' },
        },
      };

      mockHttpClient.get.mockResolvedValueOnce(mockIssue);

      await jiraClient.getIssue('TEST-456');

      const callUrl = mockHttpClient.get.mock.calls[0]?.[0] as string;
      expect(callUrl).toContain('fields=summary%2Cdescription%2Cstatus%2Cassignee%2Cpriority');
    });
  });
});