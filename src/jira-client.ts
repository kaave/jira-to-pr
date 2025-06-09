import { HttpClient } from './http-client.js';
import type { JiraConfig, JiraIssue, JiraSearchResponse } from './types.js';

/**
 * Jira REST APIクライアントクラス
 * 課題の検索や取得を行う
 */
export class JiraClient {
  private readonly httpClient: HttpClient;
  private readonly config: JiraConfig;

  /**
   * JiraClientを初期化する
   * @param config - Jira接続設定
   */
  constructor(config: JiraConfig) {
    this.config = config;
    
    const authHeader = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');
    
    this.httpClient = new HttpClient({
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json',
      },
    });
  }

  /**
   * JQLを使って課題を検索する
   * @param jql - JQL（Jira Query Language）クエリ
   * @returns 検索結果の課題一覧
   */
  async searchIssues(jql: string = 'assignee = currentUser() AND status != Done'): Promise<JiraIssue[]> {
    const url = new URL('/rest/api/3/search', this.config.baseUrl);
    url.searchParams.set('jql', jql);
    url.searchParams.set('fields', 'summary,description,status,assignee,priority');
    url.searchParams.set('maxResults', '50');

    const response = await this.httpClient.get<JiraSearchResponse>(url.toString());
    return response.issues;
  }

  /**
   * 課題キーを指定して課題の詳細を取得する
   * @param issueKey - 課題キー（例: PROJ-123）
   * @returns 課題の詳細情報
   */
  async getIssue(issueKey: string): Promise<JiraIssue> {
    const url = new URL(`/rest/api/3/issue/${issueKey}`, this.config.baseUrl);
    url.searchParams.set('fields', 'summary,description,status,assignee,priority');

    return this.httpClient.get<JiraIssue>(url.toString());
  }
}