import { config } from 'dotenv';
import type { JiraConfig } from './types.js';

config();

/**
 * 環境変数からJira設定を読み込む
 * @returns Jira接続設定
 * @throws 必要な環境変数が設定されていない場合
 */
export function loadJiraConfig(): JiraConfig {
  const baseUrl = process.env['JIRA_BASE_URL'];
  const email = process.env['JIRA_EMAIL'];
  const apiToken = process.env['JIRA_API_TOKEN'];

  if (!baseUrl || !email || !apiToken) {
    throw new Error(
      'Missing required environment variables. Please set:\n' +
      '- JIRA_BASE_URL (e.g., https://yourcompany.atlassian.net)\n' +
      '- JIRA_EMAIL (your Jira email)\n' +
      '- JIRA_API_TOKEN (your Jira API token)'
    );
  }

  return {
    baseUrl,
    email,
    apiToken,
  };
}