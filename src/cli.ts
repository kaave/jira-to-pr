import inquirer from 'inquirer';
import type { JiraIssue } from './types.js';

/**
 * タスク選択の結果
 */
export interface TaskSelection {
  /** 選択された課題 */
  issue: JiraIssue;
  /** 実行するアクション */
  action: 'implement' | 'cancel';
}

/**
 * コマンドラインインターフェースを提供するクラス
 * ユーザーとの対話的な操作を管理する
 */
export class CLI {
  /**
   * 課題一覧から実装するタスクを選択する
   * @param issues - 選択可能な課題一覧
   * @returns 選択結果（nullの場合は選択可能な課題がない）
   */
  async selectTask(issues: JiraIssue[]): Promise<TaskSelection | null> {
    if (issues.length === 0) {
      console.log('📭 No issues found.');
      return null;
    }

    console.log(`\n🎯 Found ${issues.length} issue(s):\n`);
    
    const choices = issues.map((issue, index) => ({
      name: `${issue.key}: ${issue.fields.summary} [${issue.fields.status.name}]`,
      value: index,
      short: issue.key,
    }));

    choices.push({
      name: '❌ Cancel',
      value: -1,
      short: 'Cancel',
    });

    const { selectedIndex } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedIndex',
        message: 'Select a task to implement:',
        choices,
        pageSize: 15,
      },
    ]);

    if (selectedIndex === -1) {
      return {
        issue: issues[0]!,
        action: 'cancel',
      };
    }

    const selectedIssue = issues[selectedIndex]!;
    
    console.log(`\n📋 Selected: ${selectedIssue.key}`);
    console.log(`📝 Summary: ${selectedIssue.fields.summary}`);
    if (selectedIssue.fields.description) {
      console.log(`📖 Description: ${selectedIssue.fields.description.substring(0, 200)}...`);
    }
    console.log(`📊 Status: ${selectedIssue.fields.status.name}`);
    console.log(`⚡ Priority: ${selectedIssue.fields.priority.name}\n`);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Proceed with this task?',
        default: true,
      },
    ]);

    return {
      issue: selectedIssue,
      action: confirm ? 'implement' : 'cancel',
    };
  }

  /**
   * エラーメッセージを表示する
   * @param message - 表示するエラーメッセージ
   */
  displayError(message: string): void {
    console.error(`❌ Error: ${message}`);
  }

  /**
   * 成功メッセージを表示する
   * @param message - 表示する成功メッセージ
   */
  displaySuccess(message: string): void {
    console.log(`✅ ${message}`);
  }

  /**
   * 情報メッセージを表示する
   * @param message - 表示する情報メッセージ
   */
  displayInfo(message: string): void {
    console.log(`ℹ️  ${message}`);
  }
}