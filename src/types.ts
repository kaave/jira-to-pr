/**
 * Jiraの課題情報を表すインターフェース
 */
export interface JiraIssue {
  /** 課題のID */
  id: string;
  /** 課題のキー（例: PROJ-123） */
  key: string;
  /** 課題のフィールド情報 */
  fields: {
    /** 課題のタイトル */
    summary: string;
    /** 課題の説明（オプション） */
    description?: string;
    /** 課題のステータス情報 */
    status: {
      /** ステータス名 */
      name: string;
    };
    /** 担当者情報（オプション） */
    assignee?: {
      /** 担当者の表示名 */
      displayName: string;
    };
    /** 優先度情報 */
    priority: {
      /** 優先度名 */
      name: string;
    };
  };
}

/**
 * Jira検索APIのレスポンス形式
 */
export interface JiraSearchResponse {
  /** 検索結果の課題一覧 */
  issues: JiraIssue[];
  /** 総件数 */
  total: number;
}

/**
 * Jira接続のための設定情報
 */
export interface JiraConfig {
  /** JiraのベースURL（例: https://yourcompany.atlassian.net） */
  baseUrl: string;
  /** Jiraログイン用のメールアドレス */
  email: string;
  /** JiraのAPIトークン */
  apiToken: string;
}